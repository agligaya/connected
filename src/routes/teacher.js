const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/auth');
const { schoolYear } = require('../config');
const db = require('../../db');
const {
  attachReplies,
  attachConcernReadState,
  markConcernRead,
  markConcernReadForParticipants,
  addConcernReply
} = require('../utils/concernReplies');
const { announcementTargets, ensureAnnouncementAudience } = require('../utils/announcements');
const { isQuarterUnlocked, getCurrentQuarter, normalizeQuarter } = require('../utils/schoolSettings');
const { logActivity, logActivityThrottled } = require('../utils/activityLog');
const {
  ensureAttendanceSchema,
  manilaISODate,
  sqlDateToISO,
  weekStartMonday,
  weekdaysMonFri,
  isSubjectGrade,
  normalizeSession,
  statusLetter
} = require('../utils/attendanceSchema');
const { enqueueSms, pickParentPhone, processSmsQueue } = require('../utils/sms');
const {
  ensureAiRecommendationsSchema,
  generateRecommendationsForLesson,
  safeParseJsonContent,
  pickDraftPart,
  isAiDryRun,
  isAiConfigured
} = require('../utils/aiRecommendations');
const {
  ensureQuestionBankSchema,
  saveDraftPartsToBank,
  formatBankRow,
  normalizeChoices,
  parseChoicesColumn,
  groupItemsByType,
  groupItemsByCategory,
  migrateOrphanBankItems
} = require('../utils/questionBank');
const {
  ensureQuizAttendanceSchema,
  parseMakeupIds,
  attendanceSlotForAssessment,
  getAttendanceCompletion,
  getMakeupCandidates,
  getSubmittedStudentIds,
  isMakeupStatus,
  VALID_STATUSES
} = require('../utils/quizAttendance');

/** Returns assigned class rows for the teacher (current school year). */
async function getTeacherAssignmentRows(teacherId) {
  const [rows] = await db.query(
    `SELECT grade_level, section, subject_id
     FROM teacher_assignments
     WHERE teacher_id = ? AND school_year = ?`,
    [teacherId, schoolYear]
  );
  return rows;
}

function normalizeSectionKey(section) {
  return String(section || '').trim().toUpperCase();
}

/** Unique grade+section pairs the teacher is assigned to. */
function assignmentClassPairs(rows) {
  const map = new Map();
  for (const row of rows || []) {
    const grade = Number(row.grade_level);
    const section = String(row.section || '').trim();
    if (!grade || !section) continue;
    const key = `${grade}|${normalizeSectionKey(section)}`;
    if (!map.has(key)) map.set(key, { grade_level: grade, section });
  }
  return [...map.values()];
}

function teacherHasClassAssignment(rows, gradeLevel, section) {
  const grade = Number(gradeLevel);
  const want = normalizeSectionKey(section);
  if (!grade || !want) return false;
  return (rows || []).some(
    (r) => Number(r.grade_level) === grade && normalizeSectionKey(r.section) === want
  );
}

async function assertTeacherClassAssignment(teacherId, gradeLevel, section) {
  const rows = await getTeacherAssignmentRows(teacherId);
  if (!teacherHasClassAssignment(rows, gradeLevel, section)) {
    const err = new Error(
      `You are not assigned to Grade ${gradeLevel}-${String(section || '').trim()}. Choose one of your classes.`
    );
    err.status = 403;
    throw err;
  }
  return rows;
}

// ========== CLASSES ==========
router.get('/classes', verifyToken, async (req, res) => {
  try {
    const teacherId = req.user?.id || req.user?.userId;
    const [rows] = await db.query(
      `SELECT ta.grade_level, ta.section, ta.subject_id,
        s.NAME as subject_name
       FROM teacher_assignments ta
       LEFT JOIN subjects s ON ta.subject_id = s.id
       WHERE ta.teacher_id = ? AND ta.school_year = '${schoolYear}'
       ORDER BY ta.grade_level, ta.section, s.NAME`,
      [teacherId]
    );

    const byClass = new Map();
    for (const row of rows) {
      const key = `${row.grade_level}|${String(row.section).trim().toUpperCase()}`;
      if (!byClass.has(key)) {
        byClass.set(key, {
          grade_level: row.grade_level,
          section: row.section,
          is_class_adviser: false,
          subjects: []
        });
      }
      const entry = byClass.get(key);
      if (row.subject_id == null) {
        entry.is_class_adviser = true;
      } else if (row.subject_name) {
        const already = entry.subjects.some(s => Number(s.id) === Number(row.subject_id));
        if (!already) {
          entry.subjects.push({
            id: row.subject_id,
            name: row.subject_name
          });
        }
      }
    }

    res.json([...byClass.values()]);
  } catch (error) {
    console.error('Get classes error:', error);
    res.status(500).json({ error: 'Server error fetching classes', details: error.message });
  }
});

// ========== ROSTER ==========
router.get('/roster/:grade/:section', verifyToken, async (req, res) => {
  try {
    await ensureAttendanceSchema();
    const { grade, section } = req.params;
    const today = manilaISODate();
    const subjectMode = isSubjectGrade(grade);
    const subjectIdRaw = req.query.subject_id;
    const subjectId = subjectIdRaw != null && String(subjectIdRaw).trim() !== ''
      ? Number(subjectIdRaw)
      : null;
    const session = normalizeSession(req.query.session, { subjectMode: subjectMode && !!subjectId });

    if (subjectMode && subjectId) {
      const [students] = await db.query(
        `SELECT s.id, s.lrn, s.first_name, s.last_name, s.gender,
          a.\`STATUS\` as attendance_status
         FROM students s
         LEFT JOIN attendance a
           ON s.id = a.student_id AND a.\`DATE\` = ? AND a.session = 'AM'
           AND a.subject_key = ?
         WHERE s.grade_level = ? AND TRIM(s.section) = ? AND s.\`STATUS\` = 'active'
         ORDER BY s.gender DESC, s.last_name, s.first_name`,
        [today, subjectId, grade, String(section).trim()]
      );
      return res.json(students);
    }

    const [students] = await db.query(
      `SELECT s.id, s.lrn, s.first_name, s.last_name, s.gender,
        a.\`STATUS\` as attendance_status
       FROM students s
       LEFT JOIN attendance a
         ON s.id = a.student_id AND a.\`DATE\` = ? AND a.session = ?
         AND a.subject_key = 0
       WHERE s.grade_level = ? AND TRIM(s.section) = ? AND s.\`STATUS\` = 'active'
       ORDER BY s.gender DESC, s.last_name, s.first_name`,
      [today, session, grade, String(section).trim()]
    );
    res.json(students);
  } catch (error) {
    console.error('Get roster error:', error);
    res.status(500).json({ error: 'Server error fetching roster', details: error.message });
  }
});

// ========== ATTENDANCE ==========

async function loadWeeklySheet({ grade, section, weekStart, subjectId }) {
  await ensureAttendanceSchema();
  const sectionNorm = String(section || '').trim();
  const start = weekStartMonday(weekStart || manilaISODate());
  const dates = weekdaysMonFri(start);
  const weekEnd = dates[dates.length - 1];
  const subjectMode = isSubjectGrade(grade) && subjectId;

  let subjectName = null;
  if (subjectMode) {
    const [[subj]] = await db.query('SELECT NAME as name FROM subjects WHERE id = ?', [subjectId]);
    subjectName = subj?.name || null;
  }

  const [students] = await db.query(
    `SELECT s.id, s.lrn, s.first_name, s.last_name, s.gender
     FROM students s
     WHERE s.grade_level = ? AND TRIM(s.section) = ? AND s.\`STATUS\` = 'active'
     ORDER BY CASE WHEN s.gender = 'M' THEN 0 WHEN s.gender = 'F' THEN 1 ELSE 2 END,
              s.last_name, s.first_name`,
    [grade, sectionNorm]
  );

  let records;
  if (subjectMode) {
    [records] = await db.query(
      `SELECT a.student_id, a.\`DATE\` as att_date, a.session, a.\`STATUS\` as status
       FROM attendance a
       JOIN students s ON s.id = a.student_id
       WHERE s.grade_level = ? AND TRIM(s.section) = ? AND s.\`STATUS\` = 'active'
         AND a.\`DATE\` BETWEEN ? AND ?
         AND a.subject_key = ?`,
      [grade, sectionNorm, start, weekEnd, subjectId]
    );
  } else {
    [records] = await db.query(
      `SELECT a.student_id, a.\`DATE\` as att_date, a.session, a.\`STATUS\` as status
       FROM attendance a
       JOIN students s ON s.id = a.student_id
       WHERE s.grade_level = ? AND TRIM(s.section) = ? AND s.\`STATUS\` = 'active'
         AND a.\`DATE\` BETWEEN ? AND ?
         AND a.subject_key = 0`,
      [grade, sectionNorm, start, weekEnd]
    );
  }

  const byStudent = new Map();
  for (const s of students) {
    const marks = {};
    for (const d of dates) {
      marks[d] = subjectMode ? { status: null } : { AM: null, PM: null };
    }
    byStudent.set(s.id, {
      id: s.id,
      lrn: s.lrn,
      first_name: s.first_name,
      last_name: s.last_name,
      gender: s.gender,
      marks
    });
  }

  for (const r of records) {
    const row = byStudent.get(r.student_id);
    if (!row) continue;
    const d = sqlDateToISO(r.att_date);
    if (!row.marks[d]) continue;
    if (subjectMode) {
      row.marks[d].status = r.status;
    } else if (r.session === 'PM') {
      row.marks[d].PM = r.status;
    } else {
      row.marks[d].AM = r.status;
    }
  }

  return {
    weekStart: start,
    weekEnd,
    dates,
    mode: subjectMode ? 'subject' : 'class',
    subject_id: subjectMode ? subjectId : null,
    subject_name: subjectName,
    grade: Number(grade),
    section: sectionNorm,
    students: [...byStudent.values()]
  };
}

function formatAttendanceShortDate(isoDate) {
  const [y, m, d] = String(isoDate).split('-').map(Number);
  if (!y || !m || !d) return String(isoDate || '');
  const yy = String(y).slice(-2);
  return `${String(m).padStart(2, '0')}/${String(d).padStart(2, '0')}/${yy}`;
}

async function weeklySheetToXlsx(sheet) {
  const ExcelJS = require('exceljs');
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'Connected';
  const ws = workbook.addWorksheet('Attendance', {
    views: [{ state: 'frozen', xSplit: 2, ySplit: sheet.mode === 'subject' ? 1 : 2 }]
  });

  const subjectMode = sheet.mode === 'subject';
  const markCols = subjectMode ? sheet.dates.length : sheet.dates.length * 2;
  const totalCols = 2 + markCols;
  const thin = { style: 'thin', color: { argb: 'FF666666' } };
  const border = { top: thin, left: thin, bottom: thin, right: thin };
  const headerFill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF5C1A1A' } };
  const headerFill2 = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF6E2A2A' } };
  const groupFill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF0E6E6' } };
  const headerFont = { bold: true, color: { argb: 'FFFFFFFF' }, size: 10 };
  const center = { vertical: 'middle', horizontal: 'center', wrapText: true };
  const left = { vertical: 'middle', horizontal: 'left' };

  const title = subjectMode
    ? `Attendance Sheet — Grade ${sheet.grade}-${sheet.section} · ${sheet.subject_name || 'Subject'}`
    : `Attendance Sheet — Grade ${sheet.grade}-${sheet.section}`;
  const weekLabel = `${formatAttendanceShortDate(sheet.weekStart)} – ${formatAttendanceShortDate(sheet.weekEnd)}`;

  ws.mergeCells(1, 1, 1, totalCols);
  ws.getCell(1, 1).value = title;
  ws.getCell(1, 1).font = { bold: true, size: 13, color: { argb: 'FF5C1A1A' } };
  ws.getCell(1, 1).alignment = left;

  ws.mergeCells(2, 1, 2, totalCols);
  ws.getCell(2, 1).value = `Students ${sheet.students.length}  ·  Week ${weekLabel} (weekdays only)`;
  ws.getCell(2, 1).font = { size: 10, color: { argb: 'FF555555' } };

  ws.mergeCells(3, 1, 3, totalCols);
  ws.getCell(3, 1).value = 'P – Present    A – Absent    L – Late    E – Excused';
  ws.getCell(3, 1).font = { size: 10, color: { argb: 'FF555555' } };

  const headerRow = 5;
  const sessionRow = subjectMode ? null : 6;
  const dataStart = subjectMode ? 6 : 7;

  ws.getColumn(1).width = 16;
  ws.getColumn(2).width = 28;
  for (let c = 3; c <= totalCols; c += 1) {
    ws.getColumn(c).width = subjectMode ? 12 : 8;
  }

  // Header row: LRN, Name, dates
  const r1 = ws.getRow(headerRow);
  r1.getCell(1).value = 'LRN';
  r1.getCell(2).value = 'Student Name';
  if (subjectMode) {
    sheet.dates.forEach((d, i) => {
      r1.getCell(3 + i).value = formatAttendanceShortDate(d);
    });
  } else {
    sheet.dates.forEach((d, i) => {
      const start = 3 + i * 2;
      ws.mergeCells(headerRow, start, headerRow, start + 1);
      r1.getCell(start).value = formatAttendanceShortDate(d);
    });
  }

  for (let c = 1; c <= totalCols; c += 1) {
    const cell = r1.getCell(c);
    cell.fill = headerFill;
    cell.font = headerFont;
    cell.border = border;
    cell.alignment = c <= 2 ? left : center;
  }

  if (!subjectMode) {
    ws.mergeCells(headerRow, 1, sessionRow, 1);
    ws.mergeCells(headerRow, 2, sessionRow, 2);
    const r2 = ws.getRow(sessionRow);
    sheet.dates.forEach((_, i) => {
      r2.getCell(3 + i * 2).value = 'AM';
      r2.getCell(4 + i * 2).value = 'PM';
    });
    for (let c = 1; c <= totalCols; c += 1) {
      const cell = r2.getCell(c);
      cell.fill = c <= 2 ? headerFill : headerFill2;
      cell.font = headerFont;
      cell.border = border;
      cell.alignment = c <= 2 ? left : center;
    }
    // Re-apply LRN/Name after merge
    r1.getCell(1).value = 'LRN';
    r1.getCell(2).value = 'Student Name';
  }

  const letterColor = (letter) => {
    if (letter === 'P') return { argb: 'FF1B5E20' };
    if (letter === 'A') return { argb: 'FFB71C1C' };
    if (letter === 'L') return { argb: 'FFE67E22' };
    return { argb: 'FF222222' };
  };

  let rowIdx = dataStart;
  const groups = [
    { label: 'Boys', list: sheet.students.filter((s) => s.gender === 'M') },
    { label: 'Girls', list: sheet.students.filter((s) => s.gender === 'F') },
    { label: 'Other', list: sheet.students.filter((s) => s.gender !== 'M' && s.gender !== 'F') }
  ];

  for (const group of groups) {
    if (!group.list.length) continue;
    const gRow = ws.getRow(rowIdx);
    ws.mergeCells(rowIdx, 1, rowIdx, totalCols);
    gRow.getCell(1).value = group.label;
    for (let c = 1; c <= totalCols; c += 1) {
      const cell = gRow.getCell(c);
      cell.fill = groupFill;
      cell.font = { bold: true, color: { argb: 'FF5C1A1A' } };
      cell.border = border;
      cell.alignment = left;
    }
    rowIdx += 1;

    for (const s of group.list) {
      const row = ws.getRow(rowIdx);
      row.getCell(1).value = s.lrn || '';
      row.getCell(2).value = `${s.last_name}, ${s.first_name}`;
      row.getCell(1).alignment = left;
      row.getCell(2).alignment = left;
      row.getCell(1).border = border;
      row.getCell(2).border = border;

      sheet.dates.forEach((d, i) => {
        if (subjectMode) {
          const letter = statusLetter(s.marks[d]?.status);
          const cell = row.getCell(3 + i);
          cell.value = letter || '';
          cell.alignment = center;
          cell.border = border;
          cell.font = { bold: true, color: letterColor(letter) };
        } else {
          const am = statusLetter(s.marks[d]?.AM);
          const pm = statusLetter(s.marks[d]?.PM);
          const cAm = row.getCell(3 + i * 2);
          const cPm = row.getCell(4 + i * 2);
          cAm.value = am || '';
          cPm.value = pm || '';
          cAm.alignment = center;
          cPm.alignment = center;
          cAm.border = border;
          cPm.border = border;
          cAm.font = { bold: true, color: letterColor(am) };
          cPm.font = { bold: true, color: letterColor(pm) };
        }
      });
      rowIdx += 1;
    }
  }

  const buffer = await workbook.xlsx.writeBuffer();
  return Buffer.from(buffer);
}

function weeklySheetToPrintHtml(sheet) {
  const title = sheet.mode === 'subject'
    ? `Attendance Sheet — Grade ${sheet.grade}-${sheet.section} · ${sheet.subject_name || 'Subject'}`
    : `Attendance Sheet — Grade ${sheet.grade}-${sheet.section}`;
  const weekLabel = `${formatAttendanceShortDate(sheet.weekStart)} – ${formatAttendanceShortDate(sheet.weekEnd)}`;
  const markCols = sheet.mode === 'subject' ? sheet.dates.length : sheet.dates.length * 2;
  const colgroup =
    '<colgroup><col style="width:9rem"><col style="width:14rem">' +
    Array.from({ length: markCols }, () => '<col>').join('') +
    '</colgroup>';

  const dateHeadsTop = sheet.dates.map((d) => {
    const label = formatAttendanceShortDate(d);
    if (sheet.mode === 'subject') return `<th rowspan="2">${label}</th>`;
    return `<th colspan="2">${label}</th>`;
  }).join('');

  const dateHeadsSub = sheet.mode === 'subject'
    ? ''
    : `<tr>${sheet.dates.map(() => '<th>AM</th><th>PM</th>').join('')}</tr>`;

  const renderGroup = (list, label) => {
    if (!list.length) return '';
    const colSpan = 2 + markCols;
    const rows = list.map((s) => {
      const cells = sheet.dates.map((d) => {
        if (sheet.mode === 'subject') {
          return `<td class="mark">${statusLetter(s.marks[d]?.status) || ''}</td>`;
        }
        return `<td class="mark">${statusLetter(s.marks[d]?.AM) || ''}</td><td class="mark">${statusLetter(s.marks[d]?.PM) || ''}</td>`;
      }).join('');
      return `<tr><td>${s.lrn || '-'}</td><td>${s.last_name}, ${s.first_name}</td>${cells}</tr>`;
    }).join('');
    return `<tr class="group"><td colspan="${colSpan}">${label}</td></tr>${rows}`;
  };

  const boys = sheet.students.filter((s) => s.gender === 'M');
  const girls = sheet.students.filter((s) => s.gender === 'F');
  const other = sheet.students.filter((s) => s.gender !== 'M' && s.gender !== 'F');
  const headerRows = sheet.mode === 'subject' ? 1 : 2;

  return `<!DOCTYPE html><html><head><meta charset="utf-8"><title>${title}</title>
<style>
  body{font-family:Arial,sans-serif;font-size:11px;color:#222;margin:24px}
  h1{font-size:16px;margin:0 0 4px}
  .meta{color:#555;margin:0 0 4px}
  .legend{color:#555;margin:0 0 14px;display:flex;gap:18px}
  table{border-collapse:collapse;width:100%;table-layout:fixed;border:1px solid #666}
  th,td{border:1px solid #666;padding:4px 6px;text-align:center;overflow:hidden;text-overflow:ellipsis}
  th{background:#5c1a1a;color:#fff}
  td:nth-child(1),td:nth-child(2),th:nth-child(1),th:nth-child(2){text-align:left}
  tr.group td{background:#f0e6e6;font-weight:700;text-align:left}
  .mark{font-weight:700}
  @media print{body{margin:12px} button{display:none}}
</style></head><body>
<button onclick="window.print()">Print / Save as PDF</button>
<h1>${title}</h1>
<p class="meta">Students ${sheet.students.length} · Week ${weekLabel} (weekdays only)</p>
<p class="legend"><span><strong>P</strong> – Present</span><span><strong>A</strong> – Absent</span><span><strong>L</strong> – Late</span><span><strong>E</strong> – Excused</span></p>
<table>
${colgroup}
<thead>
  <tr>
    <th rowspan="${headerRows}">LRN</th>
    <th rowspan="${headerRows}">Student Name</th>
    ${dateHeadsTop}
  </tr>
  ${dateHeadsSub}
</thead>
<tbody>
${renderGroup(boys, 'Boys')}
${renderGroup(girls, 'Girls')}
${renderGroup(other, 'Other')}
</tbody></table>
<script>window.onload=function(){setTimeout(function(){window.print()},300)}</script>
</body></html>`;
}

// Weekly matrix (Mon–Fri). More specific routes first.
router.get('/attendance/:grade/:section/week/export', verifyToken, async (req, res) => {
  try {
    const { grade, section } = req.params;
    const weekParam = String(req.query.week || req.query.weekStart || '').trim();
    const weekStart = /^\d{4}-\d{2}-\d{2}$/.test(weekParam) ? weekParam : manilaISODate();
    const subjectId = req.query.subject_id ? Number(req.query.subject_id) : null;
    const format = String(req.query.format || 'xlsx').toLowerCase();

    if (isSubjectGrade(grade) && !subjectId) {
      return res.status(400).json({ error: 'subject_id is required for Grades 4–6' });
    }

    const sheet = await loadWeeklySheet({ grade, section, weekStart, subjectId });
    const base = `attendance_G${sheet.grade}-${sheet.section}_${sheet.weekStart}`;

    if (format === 'pdf' || format === 'html') {
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      return res.send(weeklySheetToPrintHtml(sheet));
    }

    const buffer = await weeklySheetToXlsx(sheet);
    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );
    res.setHeader('Content-Disposition', `attachment; filename="${base}.xlsx"`);
    res.send(buffer);
  } catch (error) {
    console.error('Export weekly attendance error:', error);
    res.status(500).json({ error: 'Server error exporting attendance', details: error.message });
  }
});

router.get('/attendance/:grade/:section/week', verifyToken, async (req, res) => {
  try {
    const { grade, section } = req.params;
    const weekParam = String(req.query.week || req.query.weekStart || '').trim();
    const weekStart = /^\d{4}-\d{2}-\d{2}$/.test(weekParam) ? weekParam : manilaISODate();
    const subjectId = req.query.subject_id ? Number(req.query.subject_id) : null;

    if (isSubjectGrade(grade) && !subjectId) {
      return res.status(400).json({
        error: 'Select a subject to view Grades 4–6 attendance (taken per subject before class).'
      });
    }

    const sheet = await loadWeeklySheet({ grade, section, weekStart, subjectId });
    res.json(sheet);
  } catch (error) {
    console.error('Get weekly attendance error:', error);
    res.status(500).json({ error: 'Server error fetching weekly attendance', details: error.message });
  }
});

// Single-day register (legacy / summary helpers)
router.get('/attendance/:grade/:section', verifyToken, async (req, res) => {
  try {
    await ensureAttendanceSchema();
    const { grade, section } = req.params;
    const dateParam = String(req.query.date || '').trim();
    const date = /^\d{4}-\d{2}-\d{2}$/.test(dateParam) ? dateParam : manilaISODate();
    const sectionNorm = String(section || '').trim();
    const subjectMode = isSubjectGrade(grade);
    const subjectId = req.query.subject_id ? Number(req.query.subject_id) : null;
    const session = normalizeSession(req.query.session, { subjectMode: subjectMode && !!subjectId });

    let students;
    if (subjectMode && subjectId) {
      [students] = await db.query(
        `SELECT s.id, s.lrn, s.first_name, s.last_name, s.gender,
          a.\`STATUS\` as attendance_status
         FROM students s
         LEFT JOIN attendance a
           ON s.id = a.student_id AND a.\`DATE\` = ? AND a.session = 'AM' AND a.subject_key = ?
         WHERE s.grade_level = ? AND TRIM(s.section) = ? AND s.\`STATUS\` = 'active'
         ORDER BY s.last_name, s.first_name`,
        [date, subjectId, grade, sectionNorm]
      );
    } else {
      [students] = await db.query(
        `SELECT s.id, s.lrn, s.first_name, s.last_name, s.gender,
          a.\`STATUS\` as attendance_status
         FROM students s
         LEFT JOIN attendance a
           ON s.id = a.student_id AND a.\`DATE\` = ? AND a.session = ? AND a.subject_key = 0
         WHERE s.grade_level = ? AND TRIM(s.section) = ? AND s.\`STATUS\` = 'active'
         ORDER BY s.last_name, s.first_name`,
        [date, session, grade, sectionNorm]
      );
    }

    let present = 0;
    let absent = 0;
    let late = 0;
    let unrecorded = 0;
    for (const s of students) {
      const st = String(s.attendance_status || '').toLowerCase();
      if (st === 'present') present += 1;
      else if (st === 'absent') absent += 1;
      else if (st === 'late') late += 1;
      else unrecorded += 1;
    }

    res.json({
      date,
      session: subjectMode && subjectId ? 'AM' : session,
      subject_id: subjectId,
      summary: { total: students.length, present, absent, late, unrecorded },
      students
    });
  } catch (error) {
    console.error('Get attendance sheet error:', error);
    res.status(500).json({ error: 'Server error fetching attendance sheet', details: error.message });
  }
});

router.post('/attendance', verifyToken, async (req, res) => {
  try {
    await ensureAttendanceSchema();
    await ensureQuizAttendanceSchema();
    const { student_id, status, date: dateBody, session: sessionBody, subject_id: subjectBody } = req.body;
    const teacherId = req.user?.id || req.user?.userId;
    const dateParam = String(dateBody || '').trim();
    const today = /^\d{4}-\d{2}-\d{2}$/.test(dateParam) ? dateParam : manilaISODate();

    if (!VALID_STATUSES.includes(status)) {
      return res.status(400).json({ error: 'Status must be Present, Absent, Late, or Excused' });
    }

    const [[student]] = await db.query(
      'SELECT first_name, last_name, grade_level, section FROM students WHERE id = ?',
      [student_id]
    );
    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }

    const subjectMode = isSubjectGrade(student.grade_level);
    let subjectId = subjectBody != null && String(subjectBody).trim() !== ''
      ? Number(subjectBody)
      : null;

    if (subjectMode) {
      if (!subjectId) {
        return res.status(400).json({
          error: 'subject_id is required for Grades 4–6 (attendance is taken per subject).'
        });
      }
    } else {
      subjectId = null;
    }

    const session = normalizeSession(sessionBody, { subjectMode });

    await db.query(
      `INSERT INTO attendance (student_id, \`DATE\`, session, subject_id, \`STATUS\`, recorded_by)
       VALUES (?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE \`STATUS\` = VALUES(\`STATUS\`), recorded_by = VALUES(recorded_by)`,
      [student_id, today, session, subjectId, status, teacherId]
    );

    const sessionLabel = subjectMode ? '' : ` (${session})`;
    const classLabel = `Grade ${student.grade_level}-${student.section}`;
    await logActivityThrottled(
      db,
      teacherId,
      'Marked attendance',
      'class',
      classLabel,
      `${student.first_name} ${student.last_name}: ${status}${sessionLabel}`
    );

    res.json({ message: 'Attendance recorded', date: today, session, subject_id: subjectId });
  } catch (error) {
    console.error('Save attendance error:', error);
    res.status(500).json({ error: 'Server error saving attendance', details: error.message });
  }
});

router.get('/attendance/:grade/:section/completion', verifyToken, async (req, res) => {
  try {
    await ensureQuizAttendanceSchema();
    const { grade, section } = req.params;
    const today = manilaISODate();
    const subjectMode = isSubjectGrade(grade);
    const subjectIdRaw = req.query.subject_id;
    const subjectId = subjectIdRaw != null && String(subjectIdRaw).trim() !== ''
      ? Number(subjectIdRaw)
      : null;
    const session = normalizeSession(req.query.session, { subjectMode: subjectMode && !!subjectId });
    const slot = {
      date: today,
      session: subjectMode ? 'AM' : session,
      subjectKey: subjectMode && subjectId ? subjectId : 0,
      subjectMode,
      subjectId
    };
    const completion = await getAttendanceCompletion(grade, section, slot);
    res.json({
      date: today,
      session: slot.session,
      subject_id: subjectId,
      complete: completion.complete,
      total: completion.total,
      unmarked: completion.unmarked
    });
  } catch (error) {
    console.error('Attendance completion error:', error);
    res.status(500).json({ error: 'Server error checking attendance', details: error.message });
  }
});

async function notifyAttendance(req, res) {
  try {
    await ensureAttendanceSchema();
    const teacherId = req.user?.id || req.user?.userId;
    const { grade, section, statuses, session: sessionBody, subject_id: subjectBody } = req.body;
    if (!grade || !section) {
      return res.status(400).json({ error: 'grade and section are required' });
    }

    const allowed = ['Present', 'Late', 'Absent'];
    let wanted = Array.isArray(statuses) && statuses.length
      ? statuses.filter((s) => allowed.includes(s))
      : ['Absent'];
    if (!wanted.length) wanted = ['Absent'];

    const today = manilaISODate();
    const subjectMode = isSubjectGrade(grade);
    const subjectId = subjectBody ? Number(subjectBody) : null;
    const session = normalizeSession(sessionBody, { subjectMode: subjectMode && !!subjectId });

    let rows;
    if (subjectMode && subjectId) {
      [rows] = await db.query(
        `SELECT s.id, s.first_name, s.last_name, a.\`STATUS\` as attendance_status, a.session
         FROM students s
         JOIN attendance a ON a.student_id = s.id AND a.\`DATE\` = ?
           AND a.session = 'AM' AND a.subject_key = ?
         WHERE s.grade_level = ? AND TRIM(s.section) = ? AND s.\`STATUS\` = 'active'
           AND a.\`STATUS\` IN (${wanted.map(() => '?').join(',')})`,
        [today, subjectId, grade, String(section).trim(), ...wanted]
      );
    } else {
      [rows] = await db.query(
        `SELECT s.id, s.first_name, s.last_name, a.\`STATUS\` as attendance_status, a.session
         FROM students s
         JOIN attendance a ON a.student_id = s.id AND a.\`DATE\` = ?
           AND a.session = ? AND a.subject_key = 0
         WHERE s.grade_level = ? AND TRIM(s.section) = ? AND s.\`STATUS\` = 'active'
           AND a.\`STATUS\` IN (${wanted.map(() => '?').join(',')})`,
        [today, session, grade, String(section).trim(), ...wanted]
      );
    }

    if (!rows.length) {
      return res.json({ sent: 0, skipped: 0, message: 'No matching attendance records to notify today' });
    }

    let subjectName = '';
    if (subjectId) {
      const [[subj]] = await db.query('SELECT NAME as name FROM subjects WHERE id = ?', [subjectId]);
      subjectName = subj?.name || '';
    }

    let sent = 0;
    let skipped = 0;
    let smsQueued = 0;
    let smsSkippedNoPhone = 0;

    for (const student of rows) {
      const status = student.attendance_status;
      const [parents] = await db.query(
        `SELECT psl.parent_id, u.phone, pp.emergency_contact
         FROM parent_student_links psl
         JOIN users u ON u.id = psl.parent_id
         LEFT JOIN parent_profiles pp ON pp.user_id = u.id
         WHERE psl.student_id = ? AND u.role = 'parent' AND COALESCE(u.STATUS, u.status, 'active') != 'inactive'`,
        [student.id]
      );
      if (!parents.length) {
        skipped += 1;
        continue;
      }

      const subject = `Attendance update for ${student.first_name} ${student.last_name}`;
      const when = subjectMode && subjectId
        ? `${subjectName || 'subject'} class`
        : `${student.session || session} session`;
      const body = `${student.first_name} ${student.last_name} was marked ${status} (${when}) in Grade ${grade}-${section} on ${today}.`;
      const smsBody = `ConnectED: ${student.first_name} ${student.last_name} — ${status} (${when}), Grade ${grade}-${section}, ${today}.`;

      for (const parent of parents) {
        const [existing] = await db.query(
          `SELECT id FROM messages
           WHERE receiver_id = ? AND student_id = ? AND DATE(created_at) = ?
             AND category = 'announcement' AND SUBJECT = ? AND message = ?`,
          [parent.parent_id, student.id, today, subject, body]
        );
        if (existing.length) {
          skipped += 1;
          continue;
        }

        await db.query(
          `INSERT INTO messages (sender_id, receiver_id, student_id, SUBJECT, message, category, is_read)
           VALUES (?, ?, ?, ?, ?, 'announcement', 0)`,
          [teacherId, parent.parent_id, student.id, subject, body]
        );
        sent += 1;

        const phone = pickParentPhone(parent.phone, parent.emergency_contact);
        if (!phone) {
          smsSkippedNoPhone += 1;
          continue;
        }
        const smsResult = await enqueueSms({
          parentId: parent.parent_id,
          studentId: student.id,
          phone,
          body: smsBody
        });
        if (smsResult.queued) smsQueued += 1;
      }
    }

    if (sent > 0) {
      await logActivity(
        db,
        teacherId,
        'Sent attendance update',
        'class',
        `Grade ${grade}-${section}`,
        `${sent} parent notice${sent === 1 ? '' : 's'} · SMS queued ${smsQueued} · ${wanted.join('/')}`
      );
    }

    // Try to flush a few SMS immediately (non-blocking for failures)
    let smsSentNow = 0;
    try {
      const flush = await processSmsQueue({ limit: Math.max(smsQueued, 5) });
      smsSentNow = flush.sent || 0;
    } catch (e) {
      console.error('[notify] sms flush:', e.message);
    }

    const parts = [];
    if (sent) parts.push(`${sent} in-app notice${sent === 1 ? '' : 's'}`);
    if (smsQueued) parts.push(`${smsQueued} SMS queued`);
    if (smsSentNow) parts.push(`${smsSentNow} SMS sent/processed`);
    if (smsSkippedNoPhone) parts.push(`${smsSkippedNoPhone} parent${smsSkippedNoPhone === 1 ? '' : 's'} missing phone`);

    res.json({
      sent,
      skipped,
      smsQueued,
      smsSentNow,
      smsSkippedNoPhone,
      message: parts.length
        ? `Notified parents: ${parts.join(' · ')}.`
        : 'No new notices sent (already notified today, or no linked parents).'
    });
  } catch (error) {
    console.error('Notify attendance error:', error);
    res.status(500).json({ error: 'Server error notifying parents', details: error.message });
  }
}

router.post('/notify-attendance', verifyToken, notifyAttendance);
router.post('/notify-absent', verifyToken, (req, res) => {
  req.body = { ...(req.body || {}), statuses: ['Absent'] };
  return notifyAttendance(req, res);
});

router.post('/announcements', verifyToken, async (req, res) => {
  try {
    const teacherId = req.user?.id || req.user?.userId;
    const { title, body, grade, section } = req.body;
    if (!title || !body || !grade || !section) {
      return res.status(400).json({ error: 'Title, message, grade, and section are required' });
    }

    const [owned] = await db.query(
      `SELECT id FROM teacher_assignments
       WHERE teacher_id = ? AND grade_level = ? AND section = ? AND school_year = '${schoolYear}'
       LIMIT 1`,
      [teacherId, grade, section]
    );
    const [homeroom] = owned.length ? [[]] : await db.query(
      `SELECT id FROM teacher_profiles
       WHERE user_id = ? AND homeroom_grade = ? AND homeroom_section = ?`,
      [teacherId, grade, section]
    );
    if (!owned.length && !homeroom.length) {
      return res.status(403).json({ error: 'You can only announce to classes you handle' });
    }

    await ensureAnnouncementAudience();
    const targets = announcementTargets({
      scope: 'class_specific',
      target_grade: grade,
      target_section: section
    });

    const [result] = await db.query(
      `INSERT INTO announcements (sender_id, title, body, scope, target_grade, target_section, priority, audience)
       VALUES (?, ?, ?, 'class_specific', ?, ?, 'normal', 'everyone')`,
      [teacherId, String(title).trim(), String(body).trim(), targets.target_grade, targets.target_section]
    );
    await logActivity(
      db,
      teacherId,
      'Sent class notice',
      'announcement',
      String(title).trim(),
      `Grade ${grade}-${section}`
    );
    res.status(201).json({ id: result.insertId, message: 'Announcement sent to parents of this class' });
  } catch (error) {
    console.error('Teacher announcement error:', error);
    const status = error.status || 500;
    res.status(status).json({
      error: error.status ? error.message : 'Server error sending announcement',
      details: error.message
    });
  }
});

// ========== STATS ==========
router.get('/stats/:grade/:section', verifyToken, async (req, res) => {
  try {
    await ensureAttendanceSchema();
    const { grade, section } = req.params;
    const today = manilaISODate();
    const sectionNorm = String(section || '').trim();
    const subjectMode = isSubjectGrade(grade);
    const subjectId = req.query.subject_id ? Number(req.query.subject_id) : null;
    const session = normalizeSession(req.query.session, { subjectMode: subjectMode && !!subjectId });

    const [[total]] = await db.query(
      `SELECT COUNT(*) as count FROM students WHERE grade_level = ? AND TRIM(section) = ? AND \`STATUS\` = 'active'`,
      [grade, sectionNorm]
    );

    const subjectKey = subjectMode && subjectId ? subjectId : 0;
    const useSession = subjectMode && subjectId ? 'AM' : session;

    const [[present]] = await db.query(
      `SELECT COUNT(*) as count FROM attendance a
       JOIN students s ON a.student_id = s.id
       WHERE s.grade_level = ? AND TRIM(s.section) = ? AND a.\`DATE\` = ?
         AND a.session = ? AND a.subject_key = ? AND a.\`STATUS\` = 'Present'`,
      [grade, sectionNorm, today, useSession, subjectKey]
    );
    const [[absent]] = await db.query(
      `SELECT COUNT(*) as count FROM attendance a
       JOIN students s ON a.student_id = s.id
       WHERE s.grade_level = ? AND TRIM(s.section) = ? AND a.\`DATE\` = ?
         AND a.session = ? AND a.subject_key = ? AND a.\`STATUS\` = 'Absent'`,
      [grade, sectionNorm, today, useSession, subjectKey]
    );
    const [[late]] = await db.query(
      `SELECT COUNT(*) as count FROM attendance a
       JOIN students s ON a.student_id = s.id
       WHERE s.grade_level = ? AND TRIM(s.section) = ? AND a.\`DATE\` = ?
         AND a.session = ? AND a.subject_key = ? AND a.\`STATUS\` = 'Late'`,
      [grade, sectionNorm, today, useSession, subjectKey]
    );

    res.json({
      total: total.count,
      present: present.count,
      absent: absent.count,
      late: late.count,
      date: today,
      session: useSession,
      subject_id: subjectId
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ error: 'Server error fetching stats', details: error.message });
  }
});

// ========== INBOX ==========
router.get('/inbox', verifyToken, async (req, res) => {
  try {
    const teacherId = req.user?.id || req.user?.userId;

    // Get teacher's assignments
    let assignmentRows = [];
    try {
      [assignmentRows] = await db.query(
        `SELECT grade_level, section FROM teacher_assignments WHERE teacher_id = ? AND school_year = '${schoolYear}'`,
        [teacherId]
      );
    } catch (e) { console.log('[Inbox] assignments error:', e.message); }

    // Also check teacher_profiles for homeroom
    let profileRows = [];
    try {
      [profileRows] = await db.query(
        `SELECT homeroom_grade, homeroom_section FROM teacher_profiles WHERE user_id = ?`, [teacherId]
      );
    } catch (e) { /* */ }

    const teacherGrades = new Set();
    const teacherClasses = new Set();

    if (profileRows.length > 0) {
      if (profileRows[0].homeroom_grade) teacherGrades.add(String(profileRows[0].homeroom_grade));
      if (profileRows[0].homeroom_grade && profileRows[0].homeroom_section) {
        teacherClasses.add(`${profileRows[0].homeroom_grade}-${profileRows[0].homeroom_section}`);
      }
    }

    assignmentRows.forEach(a => {
      if (a.grade_level) teacherGrades.add(String(a.grade_level));
      if (a.grade_level && a.section) teacherClasses.add(`${a.grade_level}-${a.section}`);
    });

    const gradeList = Array.from(teacherGrades);
    const classList = Array.from(teacherClasses);

    // Fetch announcements
    let announcements = [];
    try {
      let sql = `SELECT a.*, CONCAT(u.first_name, ' ', u.last_name) as sender_name,
            ar.read_at IS NOT NULL as is_read
           FROM announcements a 
           JOIN users u ON a.sender_id = u.id
           LEFT JOIN announcement_reads ar ON a.id = ar.announcement_id AND ar.user_id = ?
           WHERE (a.scope = 'school_wide'`;
      const params = [teacherId];
      if (gradeList.length > 0) {
        sql += ` OR (a.scope = 'grade_wide' AND a.target_grade IN (${gradeList.map(() => '?').join(',')}))`;
        params.push(...gradeList);
      }
      if (classList.length > 0) {
        const conds = classList.map(() => '(a.target_grade = ? AND a.target_section = ?)');
        sql += ` OR (a.scope = 'class_specific' AND (${conds.join(' OR ')}))`;
        classList.forEach(cls => { const [g, sec] = cls.split('-'); params.push(g, sec); });
      }
      sql += `) ORDER BY a.created_at DESC`;
      [announcements] = await db.query(sql, params);
    } catch (e) { console.error('[Inbox] announcements error:', e.message); }

    // Fetch concerns assigned to this teacher or in their classes
    let concerns = [];
    try {
      const conditions = ['c.teacher_id = ?'];
      const params = [teacherId];

      assignmentRows.forEach(a => {
        conditions.push('(s.grade_level = ? AND s.section = ?)');
        params.push(a.grade_level, a.section);
      });

      if (profileRows.length > 0 && profileRows[0].homeroom_grade && profileRows[0].homeroom_section) {
        conditions.push('(s.grade_level = ? AND s.section = ?)');
        params.push(profileRows[0].homeroom_grade, profileRows[0].homeroom_section);
      }

      const sql = `SELECT c.id, c.parent_id, c.teacher_id, c.student_id,
                     c.SUBJECT as subject, c.message, c.STATUS as status, c.priority,
                     c.created_at, c.updated_at, c.teacher_reply, c.replied_at,
                     CONCAT(p.first_name, ' ', p.last_name) as parent_name,
                     CONCAT(s.first_name, ' ', s.last_name) as student_name,
                     s.grade_level, s.section
                   FROM concerns c
                   LEFT JOIN users p ON c.parent_id = p.id
                   LEFT JOIN students s ON c.student_id = s.id
                   WHERE (${conditions.join(' OR ')})
                   ORDER BY c.created_at DESC`;
      [concerns] = await db.query(sql, params);
      concerns = await attachReplies(concerns);
      concerns = await attachConcernReadState(concerns, teacherId);
    } catch (e) {
      console.error('[Inbox] concerns error:', e.message);
    }

    res.json({ announcements, concerns });
  } catch (error) {
    console.error('Get teacher inbox error:', error);
    res.status(500).json({ error: 'Server error fetching inbox', details: error.message });
  }
});

router.get('/subjects', verifyToken, async (req, res) => {
  try {
    const teacherId = req.user?.id || req.user?.userId;
    const [assignmentRows] = await db.query(
      `SELECT ta.grade_level, ta.subject_id, s.NAME as subject_name
       FROM teacher_assignments ta
       LEFT JOIN subjects s ON s.id = ta.subject_id
       WHERE ta.teacher_id = ? AND ta.school_year = '${schoolYear}'`,
      [teacherId]
    );

    // id -> { id, name, grade_levels: Set }
    const byId = new Map();

    const addSubjectGrade = (id, name, grade) => {
      const sid = Number(id);
      const g = Number(grade);
      if (!sid || !name || !g) return;
      if (!byId.has(sid)) {
        byId.set(sid, { id: sid, name, grade_levels: new Set() });
      }
      byId.get(sid).grade_levels.add(g);
    };

    // Explicit subject-teacher rows (any grade, including G4–6)
    for (const row of assignmentRows) {
      if (row.subject_id != null && row.subject_name) {
        addSubjectGrade(row.subject_id, row.subject_name, row.grade_level);
      }
    }

    // Class adviser rows (subject_id NULL) for Grades 1–3 only →
    // subjects that apply to those adviser grades (homeroom teaches all subjects)
    const adviserGrades = [
      ...new Set(
        assignmentRows
          .filter((r) => r.subject_id == null && Number(r.grade_level) >= 1 && Number(r.grade_level) <= 3)
          .map((r) => Number(r.grade_level))
      )
    ];

    if (adviserGrades.length) {
      const [allSubjects] = await db.query(
        'SELECT id, NAME as name, applicable_grades FROM subjects ORDER BY NAME'
      );
      const gradeMatches = (gradeLevel, applicableGrades) => {
        if (!applicableGrades) return false;
        const grade = parseInt(gradeLevel, 10);
        if (Number.isNaN(grade)) return false;
        const str = String(applicableGrades).trim();
        const rangeMatch = str.match(/^(\d+)\s*-\s*(\d+)$/);
        if (rangeMatch) {
          const start = parseInt(rangeMatch[1], 10);
          const end = parseInt(rangeMatch[2], 10);
          return grade >= start && grade <= end;
        }
        if (str.includes(',')) {
          return str.split(',').map((x) => parseInt(x.trim(), 10)).includes(grade);
        }
        return parseInt(str, 10) === grade;
      };

      for (const s of allSubjects) {
        for (const g of adviserGrades) {
          if (gradeMatches(g, s.applicable_grades)) {
            addSubjectGrade(s.id, s.name, g);
          }
        }
      }
    }

    const rows = [...byId.values()]
      .map((s) => ({
        id: s.id,
        name: s.name,
        grade_levels: [...s.grade_levels].sort((a, b) => a - b)
      }))
      .sort((a, b) =>
        String(a.name).localeCompare(String(b.name), undefined, { sensitivity: 'base' })
      );
    res.json(rows);
  } catch (error) {
    console.error('Get teacher subjects error:', error);
    res.status(500).json({ error: 'Server error fetching subjects', details: error.message });
  }
});

// ========== LESSON PLANS ==========
const fs = require('fs');
const path = require('path');
const multer = require('multer');

const lessonPlanDir = path.join(__dirname, '../../public/assets/lesson-plans');
if (!fs.existsSync(lessonPlanDir)) {
  fs.mkdirSync(lessonPlanDir, { recursive: true });
}

const lessonPlanUpload = multer({
  storage: multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, lessonPlanDir),
    filename: (req, file, cb) => {
      const ext = path.extname(file.originalname || '').toLowerCase();
      cb(null, `lp_${req.user.id}_${Date.now()}${ext}`);
    }
  }),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const allowed = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];
    if (allowed.includes(file.mimetype)) cb(null, true);
    else cb(new Error('Only PDF, DOC, or DOCX files are allowed'));
  }
});

router.get('/lesson-plans', verifyToken, async (req, res) => {
  try {
    const teacherId = req.user?.id || req.user?.userId;
    const [rows] = await db.query(
      `SELECT lp.id, lp.title, lp.grade_level, lp.objectives, lp.file_path, lp.created_at,
              lp.subject_id, s.NAME as subject_name
       FROM lesson_plans lp
       LEFT JOIN subjects s ON lp.subject_id = s.id
       WHERE lp.uploaded_by = ?
       ORDER BY lp.created_at DESC`,
      [teacherId]
    );
    res.json(rows);
  } catch (error) {
    console.error('Get lesson plans error:', error);
    res.status(500).json({ error: 'Server error fetching lesson plans', details: error.message });
  }
});

router.post('/lesson-plans', verifyToken, (req, res) => {
  lessonPlanUpload.single('file')(req, res, async (err) => {
    if (err) {
      return res.status(400).json({ error: err.message || 'File upload failed' });
    }

    try {
      const teacherId = req.user?.id || req.user?.userId;
      const { title, subject_id, grade_level, objectives } = req.body;

      if (!title || !String(title).trim()) {
        return res.status(400).json({ error: 'Lesson title is required' });
      }
      if (!grade_level) {
        return res.status(400).json({ error: 'Grade level is required' });
      }

      const filePath = req.file ? `/assets/lesson-plans/${req.file.filename}` : null;
      const subjectId = subject_id ? Number(subject_id) : null;

      const [result] = await db.query(
        `INSERT INTO lesson_plans (title, subject_id, grade_level, objectives, file_path, uploaded_by)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [String(title).trim(), subjectId || null, Number(grade_level), objectives || null, filePath, teacherId]
      );

      res.status(201).json({
        message: 'Lesson plan uploaded',
        id: result.insertId,
        file_path: filePath
      });
    } catch (error) {
      console.error('Upload lesson plan error:', error);
      res.status(500).json({ error: 'Server error uploading lesson plan', details: error.message });
    }
  });
});

router.delete('/lesson-plans/:id', verifyToken, async (req, res) => {
  try {
    const teacherId = req.user?.id || req.user?.userId;
    const { id } = req.params;

    const [rows] = await db.query(
      'SELECT id, file_path FROM lesson_plans WHERE id = ? AND uploaded_by = ?',
      [id, teacherId]
    );
    if (!rows.length) {
      return res.status(404).json({ error: 'Lesson plan not found' });
    }

    if (rows[0].file_path) {
      const diskPath = path.join(__dirname, '../../public', rows[0].file_path);
      if (fs.existsSync(diskPath)) fs.unlinkSync(diskPath);
    }

    await ensureAiRecommendationsSchema();
    await db.query('DELETE FROM ai_recommendations WHERE lesson_plan_id = ? AND teacher_id = ?', [
      id,
      teacherId
    ]);
    await db.query('DELETE FROM lesson_plans WHERE id = ? AND uploaded_by = ?', [id, teacherId]);
    res.json({ message: 'Lesson plan deleted' });
  } catch (error) {
    console.error('Delete lesson plan error:', error);
    res.status(500).json({ error: 'Server error deleting lesson plan', details: error.message });
  }
});

// ========== AI RECOMMENDATIONS (lesson plans → quiz/activity/exam drafts) ==========
ensureAiRecommendationsSchema().catch((e) => {
  console.error('[ai] schema ensure failed:', e.message);
});

router.get('/ai/status', verifyToken, async (_req, res) => {
  res.json({
    dry_run: isAiDryRun(),
    configured: isAiConfigured(),
    mode: isAiDryRun() || !isAiConfigured() ? 'mock' : 'openai'
  });
});

router.get('/ai/recommendations', verifyToken, async (req, res) => {
  try {
    await ensureAiRecommendationsSchema();
    const teacherId = req.user?.id || req.user?.userId;
    const status = req.query.status ? String(req.query.status) : null;

    let sql = `SELECT r.id, r.lesson_plan_id, r.subject_id, r.grade_level, r.status, r.provider,
                      r.source_excerpt, r.content, r.assessment_id, r.approved_type,
                      r.created_at, r.updated_at,
                      lp.title as lesson_title, s.NAME as subject_name
               FROM ai_recommendations r
               LEFT JOIN lesson_plans lp ON lp.id = r.lesson_plan_id
               LEFT JOIN subjects s ON s.id = r.subject_id
               WHERE r.teacher_id = ?`;
    const params = [teacherId];
    if (status && ['pending', 'approved', 'rejected'].includes(status)) {
      sql += ` AND r.status = ?`;
      params.push(status);
    }
    sql += ` ORDER BY r.created_at DESC LIMIT 50`;

    const [rows] = await db.query(sql, params);
    res.json(
      rows.map((row) => ({
        ...row,
        content: safeParseJsonContent(row.content)
      }))
    );
  } catch (error) {
    console.error('List AI recommendations error:', error);
    res.status(500).json({ error: 'Server error fetching AI drafts', details: error.message });
  }
});

router.get('/ai/recommendations/:id', verifyToken, async (req, res) => {
  try {
    await ensureAiRecommendationsSchema();
    const teacherId = req.user?.id || req.user?.userId;
    const [[row]] = await db.query(
      `SELECT r.*, lp.title as lesson_title, s.NAME as subject_name
       FROM ai_recommendations r
       LEFT JOIN lesson_plans lp ON lp.id = r.lesson_plan_id
       LEFT JOIN subjects s ON s.id = r.subject_id
       WHERE r.id = ? AND r.teacher_id = ?`,
      [req.params.id, teacherId]
    );
    if (!row) return res.status(404).json({ error: 'AI draft not found' });
    row.content = safeParseJsonContent(row.content);
    res.json(row);
  } catch (error) {
    console.error('Get AI recommendation error:', error);
    res.status(500).json({ error: 'Server error fetching AI draft', details: error.message });
  }
});

router.post('/lesson-plans/:id/generate', verifyToken, async (req, res) => {
  try {
    await ensureAiRecommendationsSchema();
    const teacherId = req.user?.id || req.user?.userId;
    const { id } = req.params;

    const [[plan]] = await db.query(
      `SELECT lp.id, lp.title, lp.grade_level, lp.objectives, lp.file_path, lp.subject_id,
              s.NAME as subject_name
       FROM lesson_plans lp
       LEFT JOIN subjects s ON s.id = lp.subject_id
       WHERE lp.id = ? AND lp.uploaded_by = ?`,
      [id, teacherId]
    );
    if (!plan) return res.status(404).json({ error: 'Lesson plan not found' });

    const generated = await generateRecommendationsForLesson({
      lessonPlan: plan,
      subjectName: plan.subject_name
    });

    const [result] = await db.query(
      `INSERT INTO ai_recommendations
        (lesson_plan_id, teacher_id, subject_id, grade_level, status, provider, source_excerpt, content)
       VALUES (?, ?, ?, ?, 'pending', ?, ?, ?)`,
      [
        plan.id,
        teacherId,
        plan.subject_id || null,
        plan.grade_level,
        generated.provider,
        generated.sourceExcerpt,
        JSON.stringify(generated.content)
      ]
    );

    await logActivity(
      db,
      teacherId,
      'Generated AI lesson resources',
      'lesson_plan',
      plan.title,
      `provider=${generated.provider}`
    );

    res.status(201).json({
      id: result.insertId,
      provider: generated.provider,
      mode: generated.provider,
      message:
        generated.provider === 'mock'
          ? 'Mock AI draft created (set OPENAI_API_KEY and AI_DRY_RUN=false for live generation).'
          : 'AI draft created. Review quiz/activity, save to Classwork, or approve into Progress.',
      content: generated.content
    });
  } catch (error) {
    console.error('Generate AI resources error:', error);
    const status = error.status || 500;
    res.status(status).json({
      error: error.status ? error.message : 'Server error generating AI resources',
      details: error.message
    });
  }
});

router.put('/ai/recommendations/:id', verifyToken, async (req, res) => {
  try {
    await ensureAiRecommendationsSchema();
    const teacherId = req.user?.id || req.user?.userId;
    const { content } = req.body || {};
    if (!content || typeof content !== 'object') {
      return res.status(400).json({ error: 'content object is required' });
    }

    const [[row]] = await db.query(
      'SELECT id, status FROM ai_recommendations WHERE id = ? AND teacher_id = ?',
      [req.params.id, teacherId]
    );
    if (!row) return res.status(404).json({ error: 'AI draft not found' });
    if (row.status !== 'pending') {
      return res.status(400).json({ error: 'Only pending drafts can be edited' });
    }

    await db.query('UPDATE ai_recommendations SET content = ? WHERE id = ?', [
      JSON.stringify(content),
      req.params.id
    ]);
    res.json({ message: 'Draft updated', content });
  } catch (error) {
    console.error('Update AI recommendation error:', error);
    res.status(500).json({ error: 'Server error updating AI draft', details: error.message });
  }
});

router.post('/ai/recommendations/:id/reject', verifyToken, async (req, res) => {
  try {
    await ensureAiRecommendationsSchema();
    const teacherId = req.user?.id || req.user?.userId;
    const [[row]] = await db.query(
      'SELECT id, status FROM ai_recommendations WHERE id = ? AND teacher_id = ?',
      [req.params.id, teacherId]
    );
    if (!row) return res.status(404).json({ error: 'AI draft not found' });
    if (row.status !== 'pending') {
      return res.status(400).json({ error: 'Only pending drafts can be rejected' });
    }

    await db.query(
      `UPDATE ai_recommendations SET status = 'rejected' WHERE id = ? AND teacher_id = ?`,
      [req.params.id, teacherId]
    );
    res.json({ message: 'AI draft rejected' });
  } catch (error) {
    console.error('Reject AI recommendation error:', error);
    res.status(500).json({ error: 'Server error rejecting AI draft', details: error.message });
  }
});

router.delete('/ai/recommendations/:id', verifyToken, async (req, res) => {
  try {
    await ensureAiRecommendationsSchema();
    const teacherId = req.user?.id || req.user?.userId;
    const [result] = await db.query(
      'DELETE FROM ai_recommendations WHERE id = ? AND teacher_id = ?',
      [req.params.id, teacherId]
    );
    if (!result.affectedRows) {
      return res.status(404).json({ error: 'AI draft not found' });
    }
    res.json({ message: 'AI draft deleted' });
  } catch (error) {
    console.error('Delete AI recommendation error:', error);
    res.status(500).json({ error: 'Server error deleting AI draft', details: error.message });
  }
});

router.post('/ai/recommendations/:id/regenerate', verifyToken, async (req, res) => {
  try {
    await ensureAiRecommendationsSchema();
    const teacherId = req.user?.id || req.user?.userId;

    const [[row]] = await db.query(
      `SELECT r.*, lp.title, lp.objectives, lp.file_path, lp.subject_id as plan_subject_id,
              s.NAME as subject_name
       FROM ai_recommendations r
       JOIN lesson_plans lp ON lp.id = r.lesson_plan_id
       LEFT JOIN subjects s ON s.id = COALESCE(r.subject_id, lp.subject_id)
       WHERE r.id = ? AND r.teacher_id = ?`,
      [req.params.id, teacherId]
    );
    if (!row) return res.status(404).json({ error: 'AI draft not found' });
    if (row.status !== 'pending') {
      return res.status(400).json({ error: 'Only pending drafts can be regenerated' });
    }

    const generated = await generateRecommendationsForLesson({
      lessonPlan: {
        title: row.title,
        objectives: row.objectives,
        file_path: row.file_path,
        grade_level: row.grade_level,
        subject_id: row.plan_subject_id || row.subject_id
      },
      subjectName: row.subject_name
    });

    await db.query(
      `UPDATE ai_recommendations
       SET provider = ?, source_excerpt = ?, content = ?, updated_at = CURRENT_TIMESTAMP
       WHERE id = ? AND teacher_id = ?`,
      [
        generated.provider,
        generated.sourceExcerpt,
        JSON.stringify(generated.content),
        req.params.id,
        teacherId
      ]
    );

    await logActivity(
      db,
      teacherId,
      'Regenerated AI lesson resources',
      'lesson_plan',
      row.title,
      `provider=${generated.provider}`
    );

    res.json({
      id: Number(req.params.id),
      provider: generated.provider,
      message:
        generated.provider === 'mock'
          ? 'Draft regenerated (mock). Set OPENAI_API_KEY and AI_DRY_RUN=false for live AI.'
          : 'Draft regenerated. Review, then save to Classwork or Approve.',
      content: generated.content
    });
  } catch (error) {
    console.error('Regenerate AI recommendation error:', error);
    const status = error.status || 500;
    res.status(status).json({
      error: error.status ? error.message : 'Server error regenerating AI draft',
      details: error.message
    });
  }
});

router.post('/ai/recommendations/:id/approve', verifyToken, async (req, res) => {
  try {
    await ensureAiRecommendationsSchema();
    await ensureAssessmentSchema();
    const teacherId = req.user?.id || req.user?.userId;
    const { type, section, quarter, max_score, quiz_link } = req.body || {};

    // Single-lesson AI drafts: quiz & activity only. Exams need multiple lessons (later phase).
    if (type === 'exam') {
      return res.status(400).json({
        error:
          'Exams should combine several lessons, not one lesson plan. Approve a quiz or activity instead, or create an exam manually in Progress.'
      });
    }
    if (!['quiz', 'activity'].includes(type)) {
      return res.status(400).json({ error: 'type must be quiz or activity' });
    }
    if (!section || !String(section).trim()) {
      return res.status(400).json({ error: 'section is required to create the progress record' });
    }

    try {
      await assertTeacherClassAssignment(teacherId, row.grade_level, section);
    } catch (e) {
      return res.status(e.status || 403).json({ error: e.message });
    }

    let quizLink = null;
    try {
      quizLink = sanitizeQuizLink(quiz_link);
    } catch (e) {
      return res.status(e.status || 400).json({ error: e.message });
    }

    const [[row]] = await db.query(
      `SELECT r.*, lp.title as lesson_title
       FROM ai_recommendations r
       LEFT JOIN lesson_plans lp ON lp.id = r.lesson_plan_id
       WHERE r.id = ? AND r.teacher_id = ?`,
      [req.params.id, teacherId]
    );
    if (!row) return res.status(404).json({ error: 'AI draft not found' });
    if (row.status !== 'pending') {
      return res.status(400).json({ error: 'Only pending drafts can be approved' });
    }

    const content = safeParseJsonContent(row.content);
    const part = pickDraftPart(content, type);
    if (!part) return res.status(400).json({ error: `Draft has no ${type} section` });

    const title = String(part.title || `${type}: ${row.lesson_title || 'Lesson'}`).trim();
    const maxScore = Math.max(1, Number(max_score) || Number(part.max_score) || 100);
    const qtr = normalizeQuarter(quarter || 'Q1');
    const current = await getCurrentQuarter();
    if (!isQuarterUnlocked(qtr, current)) {
      return res.status(400).json({
        error: `${qtr} is locked. Admin has unlocked through ${current} only.`
      });
    }

    let assessmentId;
    try {
      const [result] = await db.query(
        `INSERT INTO assessments (title, TYPE, subject_id, grade_level, section, max_score, created_by, quarter, quiz_link)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          title,
          type,
          row.subject_id || null,
          row.grade_level,
          String(section).trim(),
          maxScore,
          teacherId,
          qtr,
          quizLink
        ]
      );
      assessmentId = result.insertId;
    } catch (inner) {
      try {
        const [result] = await db.query(
          `INSERT INTO assessments (title, TYPE, subject_id, grade_level, section, max_score, created_by, quarter)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            title,
            type,
            row.subject_id || null,
            row.grade_level,
            String(section).trim(),
            maxScore,
            teacherId,
            qtr
          ]
        );
        assessmentId = result.insertId;
      } catch (inner2) {
        const [result] = await db.query(
          `INSERT INTO assessments (title, TYPE, subject_id, grade_level, section, max_score, created_by)
           VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [
            title,
            type,
            row.subject_id || null,
            row.grade_level,
            String(section).trim(),
            maxScore,
            teacherId
          ]
        );
        assessmentId = result.insertId;
      }
    }

    await db.query(
      `UPDATE ai_recommendations
       SET status = 'approved', assessment_id = ?, approved_type = ?
       WHERE id = ? AND teacher_id = ?`,
      [assessmentId, type, req.params.id, teacherId]
    );

    let bankSave = null;
    try {
      bankSave = await saveDraftPartsToBank({
        teacherId,
        subjectId: row.subject_id,
        gradeLevel: row.grade_level,
        lessonPlanId: row.lesson_plan_id,
        lessonTitle: row.lesson_title,
        aiRecommendationId: row.id,
        content,
        types: ['quiz', 'activity']
      });
    } catch (bankErr) {
      console.warn('[question-bank] save on approve failed:', bankErr.message);
    }

    await logActivity(
      db,
      teacherId,
      'Approved AI recommendation',
      'assessment',
      title,
      `Grade ${row.grade_level}-${String(section).trim()} · ${type}`
    );

    const bankNote =
      bankSave && bankSave.created
        ? ` Saved as Classwork set “${bankSave.title}” (${bankSave.created} items).`
        : bankSave && bankSave.already_exists
          ? ' Classwork set already saved.'
          : bankSave && bankSave.skipped
            ? ' Quiz items already in Classwork.'
            : '';

    res.json({
      message: `Progress record created.${bankNote} Enter scores in Progress after students finish.`,
      assessment_id: assessmentId,
      type,
      title,
      quiz_link: quizLink,
      bank: bankSave,
      draft_items: part
    });
  } catch (error) {
    console.error('Approve AI recommendation error:', error);
    res.status(500).json({ error: 'Server error approving AI draft', details: error.message });
  }
});

// ========== QUESTION BANK ==========
ensureQuestionBankSchema().catch((e) => {
  console.error('[question-bank] schema ensure failed:', e.message);
});

router.post('/question-bank/from-ai/:id', verifyToken, async (req, res) => {
  try {
    await ensureAiRecommendationsSchema();
    await ensureQuestionBankSchema();
    const teacherId = req.user?.id || req.user?.userId;
    const typesRaw = req.body?.types;
    const types = Array.isArray(typesRaw) && typesRaw.length
      ? typesRaw.filter((t) => t === 'quiz' || t === 'activity')
      : ['quiz', 'activity'];

    const [[row]] = await db.query(
      `SELECT r.*, lp.title as lesson_title
       FROM ai_recommendations r
       LEFT JOIN lesson_plans lp ON lp.id = r.lesson_plan_id
       WHERE r.id = ? AND r.teacher_id = ?`,
      [req.params.id, teacherId]
    );
    if (!row) return res.status(404).json({ error: 'AI draft not found' });

    const content = safeParseJsonContent(row.content);
    const result = await saveDraftPartsToBank({
      teacherId,
      subjectId: row.subject_id,
      gradeLevel: row.grade_level,
      lessonPlanId: row.lesson_plan_id,
      lessonTitle: row.lesson_title,
      aiRecommendationId: row.id,
      content,
      types
    });

    await logActivity(
      db,
      teacherId,
      'Saved AI set to quiz bank',
      'question_bank',
      result.title || row.lesson_title || `Draft #${row.id}`,
      `${result.created} created, set #${result.quiz_set_id || '-'}`
    );

    res.status(201).json({
      message:
        result.created > 0
          ? `Saved “${result.title}” to Classwork (${result.created} items).`
          : result.already_exists
            ? `“${result.title}” is already in your Classwork.`
            : result.skipped > 0
              ? 'Those items are already in your Classwork.'
              : 'No quiz items found to save.',
      ...result
    });
  } catch (error) {
    console.error('Save AI to question bank error:', error);
    res.status(500).json({ error: 'Server error saving to Classwork', details: error.message });
  }
});

router.get('/question-bank/sets', verifyToken, async (req, res) => {
  try {
    await ensureQuestionBankSchema();
    const teacherId = req.user?.id || req.user?.userId;
    await migrateOrphanBankItems(teacherId);

    const { grade, subject_id } = req.query;
    const assignmentRows = await getTeacherAssignmentRows(teacherId);
    const allowedGrades = [...new Set(assignmentRows.map((r) => Number(r.grade_level)).filter(Boolean))];
    if (!allowedGrades.length) return res.json([]);

    let sql = `SELECT qs.*, s.NAME as subject_name,
                (SELECT COUNT(*) FROM question_bank qb
                 WHERE qb.quiz_set_id = qs.id AND qb.status = 'active') as item_count
               FROM quiz_sets qs
               LEFT JOIN subjects s ON s.id = qs.subject_id
               WHERE qs.teacher_id = ? AND qs.status = 'active'`;
    const params = [teacherId];

    if (grade) {
      const g = Number(grade);
      if (!allowedGrades.includes(g)) return res.json([]);
      sql += ` AND qs.grade_level = ?`;
      params.push(g);
    } else {
      sql += ` AND qs.grade_level IN (${allowedGrades.map(() => '?').join(',')})`;
      params.push(...allowedGrades);
    }
    if (subject_id) {
      sql += ` AND qs.subject_id = ?`;
      params.push(Number(subject_id));
    }

    sql += ` ORDER BY qs.updated_at DESC LIMIT 100`;
    const [rows] = await db.query(sql, params);
    res.json(
      rows.map((r) => ({
        ...r,
        item_count: Number(r.item_count) || 0
      }))
    );
  } catch (error) {
    console.error('List quiz sets error:', error);
    res.status(500).json({ error: 'Server error fetching quiz sets', details: error.message });
  }
});

router.post('/question-bank/sets', verifyToken, async (req, res) => {
  try {
    await ensureQuestionBankSchema();
    const teacherId = req.user?.id || req.user?.userId;
    const { title, grade_level, subject_id } = req.body || {};
    const setTitle = String(title || '').trim().slice(0, 255);
    const grade = Number(grade_level);

    if (!setTitle) return res.status(400).json({ error: 'Title is required' });
    if (!grade) return res.status(400).json({ error: 'Grade level is required' });

    const assignmentRows = await getTeacherAssignmentRows(teacherId);
    const allowedGrades = [...new Set(assignmentRows.map((r) => Number(r.grade_level)).filter(Boolean))];
    if (!allowedGrades.includes(grade)) {
      return res.status(403).json({ error: `Grade ${grade} is not in your assigned classes.` });
    }

    const subjectId = subject_id ? Number(subject_id) : null;
    if (subjectId) {
      const hasExplicit = assignmentRows.some(
        (r) => Number(r.grade_level) === grade && Number(r.subject_id) === subjectId
      );
      const isG13Adviser = grade >= 1 && grade <= 3 && assignmentRows.some(
        (r) => Number(r.grade_level) === grade && r.subject_id == null
      );
      if (!hasExplicit && !isG13Adviser) {
        return res.status(403).json({
          error: 'That subject is not assigned to you for this grade.'
        });
      }
      if (!hasExplicit && isG13Adviser) {
        const [[sub]] = await db.query(
          'SELECT id, applicable_grades FROM subjects WHERE id = ?',
          [subjectId]
        );
        if (!sub) return res.status(400).json({ error: 'Subject not found' });
        const str = String(sub.applicable_grades || '').trim();
        let ok = false;
        const rangeMatch = str.match(/^(\d+)\s*-\s*(\d+)$/);
        if (rangeMatch) {
          ok = grade >= parseInt(rangeMatch[1], 10) && grade <= parseInt(rangeMatch[2], 10);
        } else if (str.includes(',')) {
          ok = str.split(',').map((x) => parseInt(x.trim(), 10)).includes(grade);
        } else {
          ok = parseInt(str, 10) === grade;
        }
        if (!ok) {
          return res.status(403).json({
            error: 'That subject is not assigned to you for this grade.'
          });
        }
      }
    }

    const [result] = await db.query(
      `INSERT INTO quiz_sets
        (teacher_id, title, subject_id, grade_level, source, status)
       VALUES (?, ?, ?, ?, 'manual', 'active')`,
      [teacherId, setTitle, subjectId, grade]
    );

    await logActivity(
      db,
      teacherId,
      'Created classwork set',
      'question_bank',
      setTitle,
      `Grade ${grade}${subjectId ? ` · subject #${subjectId}` : ''}`
    );

    res.status(201).json({
      id: result.insertId,
      title: setTitle,
      grade_level: grade,
      subject_id: subjectId,
      message: 'Classwork set created'
    });
  } catch (error) {
    console.error('Create quiz set error:', error);
    res.status(500).json({ error: 'Server error creating classwork set', details: error.message });
  }
});

router.get('/question-bank/sets/:id', verifyToken, async (req, res) => {
  try {
    await ensureQuestionBankSchema();
    const teacherId = req.user?.id || req.user?.userId;
    const setId = Number(req.params.id);

    const [[setRow]] = await db.query(
      `SELECT qs.*, s.NAME as subject_name
       FROM quiz_sets qs
       LEFT JOIN subjects s ON s.id = qs.subject_id
       WHERE qs.id = ? AND qs.teacher_id = ? AND qs.status = 'active'`,
      [setId, teacherId]
    );
    if (!setRow) return res.status(404).json({ error: 'Quiz set not found' });

    const assignmentRows = await getTeacherAssignmentRows(teacherId);
    const allowedGrades = [...new Set(assignmentRows.map((r) => Number(r.grade_level)).filter(Boolean))];
    if (!allowedGrades.includes(Number(setRow.grade_level))) {
      return res.status(403).json({ error: 'This set is outside your assigned grades.' });
    }

    const [items] = await db.query(
      `SELECT qb.*, s.NAME as subject_name
       FROM question_bank qb
       LEFT JOIN subjects s ON s.id = qb.subject_id
       WHERE qb.quiz_set_id = ? AND qb.teacher_id = ? AND qb.status = 'active'
       ORDER BY FIELD(qb.item_type, 'mcq', 'identification', 'enumeration', 'short_answer', 'activity_prompt'),
                qb.id ASC`,
      [setId, teacherId]
    );
    const formatted = items.map(formatBankRow);
    res.json({
      set: setRow,
      items: formatted,
      groups: groupItemsByType(formatted),
      categories: groupItemsByCategory(formatted)
    });
  } catch (error) {
    console.error('Get quiz set error:', error);
    res.status(500).json({ error: 'Server error fetching quiz set', details: error.message });
  }
});

router.delete('/question-bank/sets/:id', verifyToken, async (req, res) => {
  try {
    await ensureQuestionBankSchema();
    const teacherId = req.user?.id || req.user?.userId;
    const setId = Number(req.params.id);

    const [[setRow]] = await db.query(
      `SELECT id FROM quiz_sets WHERE id = ? AND teacher_id = ? AND status = 'active'`,
      [setId, teacherId]
    );
    if (!setRow) return res.status(404).json({ error: 'Quiz set not found' });

    await db.query(
      `UPDATE question_bank SET status = 'archived'
       WHERE quiz_set_id = ? AND teacher_id = ? AND status = 'active'`,
      [setId, teacherId]
    );
    await db.query(
      `UPDATE quiz_sets SET status = 'archived' WHERE id = ? AND teacher_id = ?`,
      [setId, teacherId]
    );
    res.json({ message: 'Quiz set removed' });
  } catch (error) {
    console.error('Delete quiz set error:', error);
    res.status(500).json({ error: 'Server error deleting quiz set', details: error.message });
  }
});

router.get('/question-bank', verifyToken, async (req, res) => {
  try {
    await ensureQuestionBankSchema();
    const teacherId = req.user?.id || req.user?.userId;
    const { grade, subject_id, lesson_plan_id, q, item_type, quiz_set_id } = req.query;

    const assignmentRows = await getTeacherAssignmentRows(teacherId);
    const allowedGrades = [...new Set(assignmentRows.map((r) => Number(r.grade_level)).filter(Boolean))];
    if (!allowedGrades.length) {
      return res.json([]);
    }

    let sql = `SELECT qb.*, s.NAME as subject_name
               FROM question_bank qb
               LEFT JOIN subjects s ON s.id = qb.subject_id
               WHERE qb.teacher_id = ? AND qb.status = 'active'`;
    const params = [teacherId];

    if (grade) {
      const g = Number(grade);
      if (!allowedGrades.includes(g)) {
        return res.json([]);
      }
      sql += ` AND qb.grade_level = ?`;
      params.push(g);
    } else {
      sql += ` AND qb.grade_level IN (${allowedGrades.map(() => '?').join(',')})`;
      params.push(...allowedGrades);
    }
    if (subject_id) {
      sql += ` AND qb.subject_id = ?`;
      params.push(Number(subject_id));
    }
    if (lesson_plan_id) {
      sql += ` AND qb.lesson_plan_id = ?`;
      params.push(Number(lesson_plan_id));
    }
    if (quiz_set_id) {
      sql += ` AND qb.quiz_set_id = ?`;
      params.push(Number(quiz_set_id));
    }
    if (
      item_type &&
      ['mcq', 'short_answer', 'identification', 'enumeration', 'activity_prompt'].includes(String(item_type))
    ) {
      sql += ` AND qb.item_type = ?`;
      params.push(String(item_type));
    }
    if (q && String(q).trim()) {
      sql += ` AND (qb.question LIKE ? OR qb.lesson_title LIKE ?)`;
      const like = `%${String(q).trim()}%`;
      params.push(like, like);
    }

    sql += ` ORDER BY qb.updated_at DESC LIMIT 200`;
    const [rows] = await db.query(sql, params);
    res.json(rows.map(formatBankRow));
  } catch (error) {
    console.error('List question bank error:', error);
    res.status(500).json({ error: 'Server error fetching quiz bank', details: error.message });
  }
});

router.post('/question-bank', verifyToken, async (req, res) => {
  try {
    await ensureQuestionBankSchema();
    const teacherId = req.user?.id || req.user?.userId;
    const {
      question,
      choices,
      answer,
      points,
      grade_level,
      subject_id,
      lesson_plan_id,
      lesson_title,
      item_type,
      quiz_set_id
    } = req.body || {};

    const qText = String(question || '').trim();
    if (!qText) return res.status(400).json({ error: 'question is required' });
    if (!grade_level) return res.status(400).json({ error: 'grade_level is required' });

    const assignmentRows = await getTeacherAssignmentRows(teacherId);
    const allowedGrades = [...new Set(assignmentRows.map((r) => Number(r.grade_level)).filter(Boolean))];
    if (!allowedGrades.includes(Number(grade_level))) {
      return res.status(403).json({
        error: `Grade ${grade_level} is not in your assigned classes.`
      });
    }

    let quizSetId = quiz_set_id ? Number(quiz_set_id) : null;
    let inheritedSubjectId = subject_id ? Number(subject_id) : null;
    if (quizSetId) {
      const [[setRow]] = await db.query(
        `SELECT id, grade_level, subject_id FROM quiz_sets
         WHERE id = ? AND teacher_id = ? AND status = 'active'`,
        [quizSetId, teacherId]
      );
      if (!setRow) return res.status(404).json({ error: 'Classwork set not found' });
      if (Number(setRow.grade_level) !== Number(grade_level)) {
        return res.status(400).json({ error: 'Question grade must match the Classwork set grade.' });
      }
      if (!inheritedSubjectId && setRow.subject_id) {
        inheritedSubjectId = Number(setRow.subject_id);
      }
    }

    const allowedTypes = ['mcq', 'short_answer', 'identification', 'enumeration', 'activity_prompt'];
    const type = allowedTypes.includes(item_type)
      ? item_type
      : normalizeChoices(choices)?.length
        ? 'mcq'
        : 'short_answer';
    const choiceList = type === 'mcq' ? normalizeChoices(choices) : null;
    if (type === 'mcq' && (!choiceList || choiceList.length < 2)) {
      return res.status(400).json({ error: 'MCQ items need at least 2 choices' });
    }

    const [result] = await db.query(
      `INSERT INTO question_bank
        (teacher_id, quiz_set_id, subject_id, grade_level, lesson_plan_id, lesson_title,
         item_type, question, choices, answer, points, source)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'manual')`,
      [
        teacherId,
        quizSetId,
        inheritedSubjectId,
        Number(grade_level),
        lesson_plan_id ? Number(lesson_plan_id) : null,
        lesson_title ? String(lesson_title).slice(0, 255) : null,
        type,
        qText,
        choiceList ? JSON.stringify(choiceList) : null,
        answer != null ? String(answer).trim().slice(0, 500) : null,
        Math.max(0.5, Number(points) || 1)
      ]
    );

    res.status(201).json({ id: result.insertId, quiz_set_id: quizSetId, message: 'Question added' });
  } catch (error) {
    console.error('Create question bank item error:', error);
    res.status(500).json({ error: 'Server error creating bank item', details: error.message });
  }
});

router.put('/question-bank/:id', verifyToken, async (req, res) => {
  try {
    await ensureQuestionBankSchema();
    const teacherId = req.user?.id || req.user?.userId;
    const { id } = req.params;
    const [[row]] = await db.query(
      `SELECT * FROM question_bank WHERE id = ? AND teacher_id = ? AND status = 'active'`,
      [id, teacherId]
    );
    if (!row) return res.status(404).json({ error: 'Bank item not found' });

    const {
      question,
      choices,
      answer,
      points,
      grade_level,
      subject_id,
      lesson_title,
      item_type
    } = req.body || {};

    const qText = question != null ? String(question).trim() : row.question;
    if (!qText) return res.status(400).json({ error: 'question cannot be empty' });

    let choiceList = parseChoicesColumn(row.choices);
    if (choices !== undefined) choiceList = normalizeChoices(choices);

    let type = row.item_type;
    if (item_type && ['mcq', 'short_answer', 'identification', 'enumeration', 'activity_prompt'].includes(item_type)) {
      type = item_type;
    } else if (choices !== undefined) {
      type = choiceList && choiceList.length >= 2 ? 'mcq' : row.item_type === 'activity_prompt' ? 'activity_prompt' : 'short_answer';
    }

    if (type === 'mcq' && (!choiceList || choiceList.length < 2)) {
      return res.status(400).json({ error: 'MCQ items need at least 2 choices' });
    }

    const nextAnswer =
      answer !== undefined
        ? answer != null
          ? String(answer).trim().slice(0, 500)
          : null
        : row.answer;
    const nextPoints =
      points != null ? Math.max(0.5, Number(points) || 1) : Number(row.points) || 1;
    const nextGrade =
      grade_level != null ? Number(grade_level) : Number(row.grade_level);
    const assignmentRows = await getTeacherAssignmentRows(teacherId);
    const allowedGrades = [...new Set(assignmentRows.map((r) => Number(r.grade_level)).filter(Boolean))];
    if (!allowedGrades.includes(nextGrade)) {
      return res.status(403).json({
        error: `Grade ${nextGrade} is not in your assigned classes.`
      });
    }
    const nextSubject =
      subject_id !== undefined
        ? subject_id
          ? Number(subject_id)
          : null
        : row.subject_id;
    const nextLessonTitle =
      lesson_title != null ? String(lesson_title).slice(0, 255) : row.lesson_title;

    await db.query(
      `UPDATE question_bank SET
         question = ?, choices = ?, answer = ?, points = ?,
         grade_level = ?, subject_id = ?, lesson_title = ?, item_type = ?
       WHERE id = ? AND teacher_id = ?`,
      [
        qText,
        type === 'mcq' && choiceList ? JSON.stringify(choiceList) : null,
        nextAnswer,
        nextPoints,
        nextGrade,
        nextSubject,
        nextLessonTitle,
        type,
        id,
        teacherId
      ]
    );

    const [[updated]] = await db.query(
      `SELECT qb.*, s.NAME as subject_name
       FROM question_bank qb
       LEFT JOIN subjects s ON s.id = qb.subject_id
       WHERE qb.id = ?`,
      [id]
    );
    res.json({ message: 'Bank item updated', item: formatBankRow(updated) });
  } catch (error) {
    console.error('Update question bank item error:', error);
    res.status(500).json({ error: 'Server error updating bank item', details: error.message });
  }
});

router.delete('/question-bank/:id', verifyToken, async (req, res) => {
  try {
    await ensureQuestionBankSchema();
    const teacherId = req.user?.id || req.user?.userId;
    const { id } = req.params;
    const [result] = await db.query(
      `UPDATE question_bank SET status = 'archived' WHERE id = ? AND teacher_id = ? AND status = 'active'`,
      [id, teacherId]
    );
    if (!result.affectedRows) return res.status(404).json({ error: 'Bank item not found' });
    res.json({ message: 'Removed from quiz bank' });
  } catch (error) {
    console.error('Delete question bank item error:', error);
    res.status(500).json({ error: 'Server error deleting bank item', details: error.message });
  }
});

router.post('/assessments/from-bank', verifyToken, async (req, res) => {
  try {
    await ensureQuestionBankSchema();
    await ensureAssessmentSchema();
    const teacherId = req.user?.id || req.user?.userId;
    const {
      title,
      type = 'quiz',
      grade_level,
      section,
      subject_id,
      quarter,
      question_ids,
      max_score
    } = req.body || {};

    if (!['quiz', 'activity', 'exam'].includes(type)) {
      return res.status(400).json({ error: 'Type must be quiz, activity, or exam' });
    }
    if (!grade_level || !section) {
      return res.status(400).json({ error: 'Grade and section are required' });
    }
    if (!Array.isArray(question_ids) || !question_ids.length) {
      return res.status(400).json({ error: 'Select at least one bank item' });
    }

    try {
      await assertTeacherClassAssignment(teacherId, grade_level, section);
    } catch (e) {
      return res.status(e.status || 403).json({ error: e.message });
    }

    const ids = question_ids.map((n) => Number(n)).filter((n) => Number.isFinite(n) && n > 0);
    if (!ids.length) return res.status(400).json({ error: 'Select at least one bank item' });

    const placeholders = ids.map(() => '?').join(',');
    const [items] = await db.query(
      `SELECT * FROM question_bank
       WHERE teacher_id = ? AND status = 'active' AND id IN (${placeholders})`,
      [teacherId, ...ids]
    );
    if (!items.length) return res.status(400).json({ error: 'No matching bank items found' });

    // Preserve teacher selection order
    const byId = new Map(items.map((it) => [it.id, it]));
    const ordered = ids.map((id) => byId.get(id)).filter(Boolean);

    const targetGrade = Number(grade_level);
    const mismatched = ordered.filter((it) => Number(it.grade_level) !== targetGrade);
    if (mismatched.length) {
      return res.status(400).json({
        error: `All selected bank items must be Grade ${targetGrade} to match the class.`
      });
    }

    const pointsSum = ordered.reduce((sum, it) => sum + (Number(it.points) || 1), 0);
    const maxScore = Math.max(1, Number(max_score) || Math.round(pointsSum) || ordered.length);
    const qtr = normalizeQuarter(quarter || 'Q1');
    const current = await getCurrentQuarter();
    if (!isQuarterUnlocked(qtr, current)) {
      return res.status(400).json({
        error: `${qtr} is locked. Admin has unlocked through ${current} only.`
      });
    }

    const subjectId =
      subject_id != null && subject_id !== ''
        ? Number(subject_id)
        : ordered.find((it) => it.subject_id)?.subject_id || null;
    const recordTitle =
      String(title || '').trim() ||
      `${typeLabelFallback(type)} from bank (${ordered.length} items)`;

    let assessmentId;
    try {
      const [result] = await db.query(
        `INSERT INTO assessments (title, TYPE, subject_id, grade_level, section, max_score, created_by, quarter)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          recordTitle,
          type,
          subjectId,
          Number(grade_level),
          String(section).trim(),
          maxScore,
          teacherId,
          qtr
        ]
      );
      assessmentId = result.insertId;
    } catch (inner) {
      const [result] = await db.query(
        `INSERT INTO assessments (title, TYPE, subject_id, grade_level, section, max_score, created_by)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          recordTitle,
          type,
          subjectId,
          Number(grade_level),
          String(section).trim(),
          maxScore,
          teacherId
        ]
      );
      assessmentId = result.insertId;
    }

    for (let i = 0; i < ordered.length; i++) {
      const it = ordered[i];
      await db.query(
        `INSERT INTO assessment_questions
          (assessment_id, question_bank_id, sort_order, item_type, question, choices, answer, points)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          assessmentId,
          it.id,
          i,
          it.item_type || 'mcq',
          it.question,
          it.choices
            ? typeof it.choices === 'string'
              ? it.choices
              : JSON.stringify(normalizeChoices(it.choices) || it.choices)
            : null,
          it.answer,
          Number(it.points) || 1
        ]
      );
    }

    await logActivity(
      db,
      teacherId,
      'Created progress record from quiz bank',
      'assessment',
      recordTitle,
      `Grade ${grade_level}-${String(section).trim()} · ${ordered.length} items`
    );

    res.status(201).json({
      id: assessmentId,
      message: 'Progress record created from Classwork. Enter scores when ready.',
      question_count: ordered.length,
      max_score: maxScore
    });
  } catch (error) {
    console.error('Create assessment from bank error:', error);
    res.status(500).json({
      error: 'Server error creating assessment from bank',
      details: error.message
    });
  }
});

function typeLabelFallback(type) {
  if (type === 'quiz') return 'Quiz';
  if (type === 'activity') return 'Activity';
  if (type === 'exam') return 'Exam';
  return 'Assessment';
}

function sanitizeQuizLink(raw) {
  const s = String(raw || '').trim();
  if (!s) return null;
  try {
    const u = new URL(s);
    if (u.protocol !== 'http:' && u.protocol !== 'https:') {
      const err = new Error('Quiz link must start with http:// or https://');
      err.status = 400;
      throw err;
    }
    return u.toString().slice(0, 500);
  } catch (e) {
    if (e.status === 400) throw e;
    const err = new Error('Invalid quiz link URL');
    err.status = 400;
    throw err;
  }
}

async function ensureAssessmentSchema() {
  try {
    await db.query(`ALTER TABLE assessments ADD COLUMN quarter VARCHAR(10) DEFAULT 'Q1'`);
  } catch (e) { /* column may already exist */ }
  try {
    await db.query(`ALTER TABLE assessments ADD COLUMN quiz_link VARCHAR(500) NULL`);
  } catch (e) { /* column may already exist */ }
  try {
    const { ensureQuizShareSchema } = require('../utils/quizShare');
    await ensureQuizShareSchema();
  } catch (e) {
    console.warn('[quiz-share] schema ensure:', e.message);
  }
  try {
    await ensureQuizAttendanceSchema();
  } catch (e) {
    console.warn('[quiz-attendance] schema ensure:', e.message);
  }
}

ensureAssessmentSchema();

router.post('/assessments/:id/assign-link', verifyToken, async (req, res) => {
  try {
    await ensureAssessmentSchema();
    await ensureQuizAttendanceSchema();
    const { generateShareToken, getAssessmentQuestions, ensureQuizShareSchema } = require('../utils/quizShare');
    await ensureQuizShareSchema();
    const teacherId = req.user?.id || req.user?.userId;
    const { id } = req.params;

    const [[assessment]] = await db.query(
      `SELECT id, title, grade_level, section, subject_id, share_token, share_enabled, created_by
       FROM assessments WHERE id = ? AND created_by = ?`,
      [id, teacherId]
    );
    if (!assessment) return res.status(404).json({ error: 'Assessment not found' });

    try {
      await assertTeacherClassAssignment(teacherId, assessment.grade_level, assessment.section);
    } catch (e) {
      return res.status(e.status || 403).json({ error: e.message });
    }

    const questions = await getAssessmentQuestions(assessment.id);
    if (!questions.length) {
      return res.status(400).json({
        error: 'Add questions first (create from Classwork) before assigning a shared link.'
      });
    }

    const today = manilaISODate();
    const slot = attendanceSlotForAssessment(
      { ...assessment, quiz_attendance_date: today, quiz_attendance_session: null },
      { date: today, session: req.body?.session, subject_id: assessment.subject_id }
    );
    const completion = await getAttendanceCompletion(
      assessment.grade_level,
      assessment.section,
      slot
    );
    if (!completion.complete) {
      const names = completion.unmarked.slice(0, 5).map((u) => u.name).join('; ');
      const more = completion.unmarked.length > 5 ? ` (+${completion.unmarked.length - 5} more)` : '';
      return res.status(400).json({
        error: `Mark attendance for every student before enabling the quiz (${completion.unmarked.length} unmarked).`,
        unmarked: completion.unmarked,
        hint: names ? `Unmarked: ${names}${more}` : undefined
      });
    }

    let token = assessment.share_token;
    const attendanceUpdates = [
      slot.date,
      slot.session,
      isSubjectGrade(assessment.grade_level) ? assessment.subject_id : null,
      JSON.stringify([])
    ];

    if (!token) {
      for (let i = 0; i < 5; i++) {
        token = generateShareToken();
        try {
          await db.query(
            `UPDATE assessments SET share_token = ?, share_enabled = 1,
             quiz_attendance_date = ?, quiz_attendance_session = ?,
             quiz_subject_id = ?, quiz_makeup_student_ids = ?
             WHERE id = ? AND created_by = ?`,
            [token, ...attendanceUpdates, id, teacherId]
          );
          break;
        } catch (err) {
          if (err.code === 'ER_DUP_ENTRY') token = null;
          else throw err;
        }
      }
      if (!token) return res.status(500).json({ error: 'Could not generate a unique quiz link' });
    } else {
      await db.query(
        `UPDATE assessments SET share_enabled = 1,
         quiz_attendance_date = ?, quiz_attendance_session = ?,
         quiz_subject_id = ?, quiz_makeup_student_ids = ?
         WHERE id = ? AND created_by = ?`,
        [...attendanceUpdates, id, teacherId]
      );
    }

    await logActivity(
      db,
      teacherId,
      'Assigned shared quiz link',
      'assessment',
      assessment.title,
      `token=${token}`
    );

    res.json({
      message: 'Shared quiz link is active. Present and Late students can take the quiz.',
      share_token: token,
      share_enabled: true,
      share_path: `/quiz/${token}`,
      question_count: questions.length,
      attendance_date: today,
      attendance_session: slot.session
    });
  } catch (error) {
    console.error('Assign quiz link error:', error);
    res.status(500).json({ error: 'Server error assigning quiz link', details: error.message });
  }
});

router.post('/assessments/:id/revoke-link', verifyToken, async (req, res) => {
  try {
    await ensureAssessmentSchema();
    const teacherId = req.user?.id || req.user?.userId;
    const { id } = req.params;
    const [[assessment]] = await db.query(
      `SELECT id, title FROM assessments WHERE id = ? AND created_by = ?`,
      [id, teacherId]
    );
    if (!assessment) return res.status(404).json({ error: 'Assessment not found' });

    await db.query(
      `UPDATE assessments SET share_enabled = 0, quiz_makeup_student_ids = NULL WHERE id = ? AND created_by = ?`,
      [id, teacherId]
    );

    await logActivity(
      db,
      teacherId,
      'Revoked shared quiz link',
      'assessment',
      assessment.title,
      null
    );

    res.json({ message: 'Shared quiz link turned off.', share_enabled: false });
  } catch (error) {
    console.error('Revoke quiz link error:', error);
    res.status(500).json({ error: 'Server error revoking quiz link', details: error.message });
  }
});

router.post('/assessments/:id/makeup-quiz', verifyToken, async (req, res) => {
  try {
    await ensureAssessmentSchema();
    await ensureQuizAttendanceSchema();
    const teacherId = req.user?.id || req.user?.userId;
    const { id } = req.params;
    const { mode, student_ids: studentIdsBody } = req.body || {};

    const [[assessment]] = await db.query(
      `SELECT id, title, grade_level, section, subject_id, share_enabled, share_token,
              quiz_attendance_date, quiz_attendance_session, quiz_subject_id, quiz_makeup_student_ids
       FROM assessments WHERE id = ? AND created_by = ?`,
      [id, teacherId]
    );
    if (!assessment) return res.status(404).json({ error: 'Assessment not found' });
    if (!assessment.share_enabled || !assessment.share_token) {
      return res.status(400).json({ error: 'Enable the shared quiz link first.' });
    }
    if (!assessment.quiz_attendance_date) {
      return res.status(400).json({
        error: 'This quiz has no attendance session yet. Re-enable the link after marking attendance.'
      });
    }

    const candidates = await getMakeupCandidates(assessment);
    const candidateIds = new Set(candidates.map((c) => c.id));
    let grantIds = [];

    if (mode === 'all') {
      grantIds = candidates.map((c) => c.id);
    } else if (mode === 'selected' && Array.isArray(studentIdsBody)) {
      grantIds = studentIdsBody.map(Number).filter((n) => Number.isFinite(n) && n > 0);
      const invalid = grantIds.filter((sid) => !candidateIds.has(sid));
      if (invalid.length) {
        return res.status(400).json({
          error: 'Some selected students are not eligible for make-up (must be Absent or Excused and not yet submitted).',
          invalid_ids: invalid
        });
      }
    } else {
      return res.status(400).json({ error: 'Use mode "all" or "selected" with student_ids.' });
    }

    if (!grantIds.length) {
      return res.status(400).json({ error: 'No eligible absent or excused students to grant make-up access.' });
    }

    const existing = parseMakeupIds(assessment.quiz_makeup_student_ids);
    const submittedSet = await getSubmittedStudentIds(assessment.id);
    const merged = [...new Set([...existing, ...grantIds])].filter((sid) => !submittedSet.has(sid));

    await db.query(
      `UPDATE assessments SET quiz_makeup_student_ids = ? WHERE id = ? AND created_by = ?`,
      [JSON.stringify(merged), id, teacherId]
    );

    await logActivity(
      db,
      teacherId,
      'Granted quiz make-up access',
      'assessment',
      assessment.title,
      `${grantIds.length} student(s)`
    );

    res.json({
      message: `Make-up access granted for ${grantIds.length} student(s).`,
      granted_count: grantIds.length,
      makeup_student_ids: merged
    });
  } catch (error) {
    console.error('Makeup quiz error:', error);
    res.status(500).json({ error: 'Server error granting make-up access', details: error.message });
  }
});

router.get('/assessments', verifyToken, async (req, res) => {
  try {
    const { grade, section, quarter } = req.query;
    if (!grade || !section) {
      return res.status(400).json({ error: 'grade and section are required' });
    }

    let sql = `SELECT a.id, a.title, a.TYPE as type, a.subject_id, a.grade_level, a.section,
                      a.max_score, a.quiz_link, a.share_token, a.share_enabled, a.created_by, a.created_at,
                      a.quiz_attendance_date, a.quiz_attendance_session, a.quiz_subject_id,
                      s.NAME as subject_name,
                      (SELECT COUNT(*) FROM assessment_scores sc WHERE sc.assessment_id = a.id) as scored_count,
                      (SELECT COUNT(*) FROM assessment_questions aq WHERE aq.assessment_id = a.id) as question_count
               FROM assessments a
               LEFT JOIN subjects s ON a.subject_id = s.id
               WHERE a.grade_level = ? AND a.section = ?`;
    const params = [grade, section];

    if (quarter) {
      sql += ` AND a.quarter = ?`;
      params.push(quarter);
    }

    sql += ` ORDER BY a.created_at DESC`;

    try {
      const [rows] = await db.query(sql, params);
      return res.json(rows);
    } catch (inner) {
      const [rows] = await db.query(
        `SELECT a.id, a.title, a.TYPE as type, a.subject_id, a.grade_level, a.section,
                a.max_score, a.created_by, a.created_at, s.NAME as subject_name,
                (SELECT COUNT(*) FROM assessment_scores sc WHERE sc.assessment_id = a.id) as scored_count
         FROM assessments a
         LEFT JOIN subjects s ON a.subject_id = s.id
         WHERE a.grade_level = ? AND a.section = ?
         ORDER BY a.created_at DESC`,
        [grade, section]
      );
      return res.json(rows);
    }
  } catch (error) {
    console.error('Get assessments error:', error);
    res.status(500).json({ error: 'Server error fetching assessments', details: error.message });
  }
});

router.post('/assessments', verifyToken, async (req, res) => {
  try {
    const teacherId = req.user?.id || req.user?.userId;
    const { title, type, subject_id, grade_level, section, max_score, quarter, quiz_link } = req.body;

    if (!title || !String(title).trim()) {
      return res.status(400).json({ error: 'Title is required' });
    }
    if (!['quiz', 'activity', 'exam'].includes(type)) {
      return res.status(400).json({ error: 'Type must be quiz, activity, or exam' });
    }
    if (!grade_level || !section) {
      return res.status(400).json({ error: 'Grade and section are required' });
    }

    try {
      await assertTeacherClassAssignment(teacherId, grade_level, section);
    } catch (e) {
      return res.status(e.status || 403).json({ error: e.message });
    }

    let quizLink = null;
    try {
      quizLink = sanitizeQuizLink(quiz_link);
    } catch (e) {
      return res.status(e.status || 400).json({ error: e.message });
    }

    const maxScore = Math.max(1, Number(max_score) || 100);
    const subjectId = subject_id ? Number(subject_id) : null;
    const qtr = normalizeQuarter(quarter || 'Q1');
    const current = await getCurrentQuarter();
    if (!isQuarterUnlocked(qtr, current)) {
      return res.status(400).json({
        error: `${qtr} is locked. Admin has unlocked through ${current} only.`
      });
    }

    try {
      const [result] = await db.query(
        `INSERT INTO assessments (title, TYPE, subject_id, grade_level, section, max_score, created_by, quarter, quiz_link)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [String(title).trim(), type, subjectId, Number(grade_level), section, maxScore, teacherId, qtr, quizLink]
      );
      await logActivity(
        db,
        teacherId,
        'Created progress record',
        'assessment',
        String(title).trim(),
        `Grade ${grade_level}-${section} · ${qtr}`
      );
      return res.status(201).json({ id: result.insertId, message: 'Progress record created' });
    } catch (inner) {
      try {
        const [result] = await db.query(
          `INSERT INTO assessments (title, TYPE, subject_id, grade_level, section, max_score, created_by, quarter)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
          [String(title).trim(), type, subjectId, Number(grade_level), section, maxScore, teacherId, qtr]
        );
        return res.status(201).json({ id: result.insertId, message: 'Progress record created' });
      } catch (inner2) {
        const [result] = await db.query(
          `INSERT INTO assessments (title, TYPE, subject_id, grade_level, section, max_score, created_by)
           VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [String(title).trim(), type, subjectId, Number(grade_level), section, maxScore, teacherId]
        );
        await logActivity(
          db,
          teacherId,
          'Created progress record',
          'assessment',
          String(title).trim(),
          `Grade ${grade_level}-${section}`
        );
        return res.status(201).json({ id: result.insertId, message: 'Progress record created' });
      }
    }
  } catch (error) {
    console.error('Create assessment error:', error);
    res.status(500).json({ error: 'Server error creating assessment', details: error.message });
  }
});

router.put('/assessments/:id', verifyToken, async (req, res) => {
  try {
    await ensureAssessmentSchema();
    const teacherId = req.user?.id || req.user?.userId;
    const { id } = req.params;
    const { quiz_link } = req.body || {};

    const [[assessment]] = await db.query(
      'SELECT id, title FROM assessments WHERE id = ? AND created_by = ?',
      [id, teacherId]
    );
    if (!assessment) return res.status(404).json({ error: 'Assessment not found' });

    let quizLink;
    try {
      quizLink = sanitizeQuizLink(quiz_link);
    } catch (e) {
      return res.status(e.status || 400).json({ error: e.message });
    }

    await db.query('UPDATE assessments SET quiz_link = ? WHERE id = ? AND created_by = ?', [
      quizLink,
      id,
      teacherId
    ]);

    res.json({ message: 'Quiz link saved', quiz_link: quizLink });
  } catch (error) {
    console.error('Update assessment error:', error);
    res.status(500).json({ error: 'Server error updating assessment', details: error.message });
  }
});

router.get('/assessments/:id', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    let assessment;
    try {
      const [[row]] = await db.query(
        `SELECT a.id, a.title, a.TYPE as type, a.subject_id, a.grade_level, a.section,
                a.max_score, a.quiz_link, a.share_token, a.share_enabled, a.created_by, a.created_at,
                a.quiz_attendance_date, a.quiz_attendance_session, a.quiz_subject_id, a.quiz_makeup_student_ids,
                s.NAME as subject_name
         FROM assessments a
         LEFT JOIN subjects s ON a.subject_id = s.id
         WHERE a.id = ?`,
        [id]
      );
      assessment = row;
    } catch (inner) {
      const [[row]] = await db.query(
        `SELECT a.id, a.title, a.TYPE as type, a.subject_id, a.grade_level, a.section,
                a.max_score, a.created_by, a.created_at, s.NAME as subject_name
         FROM assessments a
         LEFT JOIN subjects s ON a.subject_id = s.id
         WHERE a.id = ?`,
        [id]
      );
      assessment = row;
    }
    if (!assessment) return res.status(404).json({ error: 'Assessment not found' });

    await ensureQuizAttendanceSchema();
    let attendance_meta = null;
    let makeup_candidates = [];
    try {
      const shareOn = Number(assessment.share_enabled) === 1;
      // Link off: preview today + teacher's current session. Link on: frozen quiz gate slot.
      const slot = shareOn
        ? attendanceSlotForAssessment(assessment)
        : attendanceSlotForAssessment(
          { ...assessment, quiz_attendance_date: manilaISODate(), quiz_attendance_session: null },
          {
            date: manilaISODate(),
            session: req.query.session,
            subject_id: assessment.subject_id
          }
        );
      const completion = await getAttendanceCompletion(
        assessment.grade_level,
        assessment.section,
        slot
      );
      attendance_meta = {
        date: slot.date,
        session: slot.session,
        subject_id: slot.subjectId,
        locked: shareOn,
        complete: completion.complete,
        unmarked_count: completion.unmarked.length,
        unmarked: completion.unmarked
      };
      if (shareOn) {
        makeup_candidates = await getMakeupCandidates(assessment);
      }
    } catch (metaErr) {
      console.warn('[assessment] attendance meta:', metaErr.message);
    }

    assessment.quiz_makeup_student_ids = parseMakeupIds(assessment.quiz_makeup_student_ids);

    const [students] = await db.query(
      `SELECT s.id, s.lrn, s.first_name, s.last_name, sc.score
       FROM students s
       LEFT JOIN assessment_scores sc ON sc.student_id = s.id AND sc.assessment_id = ?
       WHERE s.grade_level = ? AND s.section = ? AND s.STATUS = 'active'
       ORDER BY s.last_name, s.first_name`,
      [id, assessment.grade_level, assessment.section]
    );

    let questions = [];
    try {
      await ensureQuestionBankSchema();
      const [qrows] = await db.query(
        `SELECT id, question_bank_id, sort_order, item_type, question, choices, answer, points
         FROM assessment_questions
         WHERE assessment_id = ?
         ORDER BY sort_order ASC, id ASC`,
        [id]
      );
      questions = qrows.map((r) => ({
        ...r,
        choices: formatBankRow(r).choices,
        points: Number(r.points) || 1
      }));
    } catch (qErr) {
      questions = [];
    }

    res.json({ assessment, students, questions, attendance_meta, makeup_candidates });
  } catch (error) {
    console.error('Get assessment error:', error);
    res.status(500).json({ error: 'Server error fetching assessment', details: error.message });
  }
});

router.post('/assessments/:id/scores', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { scores } = req.body;
    if (!Array.isArray(scores)) {
      return res.status(400).json({ error: 'scores must be an array' });
    }

    const [[assessment]] = await db.query(
      'SELECT id, title, max_score FROM assessments WHERE id = ?',
      [id]
    );
    if (!assessment) return res.status(404).json({ error: 'Assessment not found' });

    const maxScore = Number(assessment.max_score) || 100;

    for (const row of scores) {
      if (!row.student_id) continue;
      if (row.score === '' || row.score === null || row.score === undefined) continue;
      const score = Number(row.score);
      if (Number.isNaN(score) || score < 0 || score > maxScore) {
        return res.status(400).json({ error: `Score must be between 0 and ${maxScore}` });
      }

      const [existing] = await db.query(
        'SELECT id FROM assessment_scores WHERE assessment_id = ? AND student_id = ?',
        [id, row.student_id]
      );
      if (existing.length) {
        await db.query(
          'UPDATE assessment_scores SET score = ? WHERE id = ?',
          [score, existing[0].id]
        );
      } else {
        await db.query(
          'INSERT INTO assessment_scores (assessment_id, student_id, score) VALUES (?, ?, ?)',
          [id, row.student_id, score]
        );
      }
    }

    const teacherId = req.user?.id || req.user?.userId;
    await logActivity(
      db,
      teacherId,
      'Updated progress scores',
      'assessment',
      assessment.title,
      `${scores.length} score${scores.length === 1 ? '' : 's'} saved`
    );

    res.json({ message: 'Scores saved' });
  } catch (error) {
    console.error('Save scores error:', error);
    res.status(500).json({ error: 'Server error saving scores', details: error.message });
  }
});

router.delete('/assessments/:id', verifyToken, async (req, res) => {
  try {
    const teacherId = req.user?.id || req.user?.userId;
    const { id } = req.params;
    const [rows] = await db.query(
      'SELECT id FROM assessments WHERE id = ? AND created_by = ?',
      [id, teacherId]
    );
    if (!rows.length) return res.status(404).json({ error: 'Record not found' });
    await db.query('DELETE FROM assessment_scores WHERE assessment_id = ?', [id]);
    await db.query('DELETE FROM assessments WHERE id = ?', [id]);
    res.json({ message: 'Progress record deleted' });
  } catch (error) {
    console.error('Delete assessment error:', error);
    res.status(500).json({ error: 'Server error deleting assessment', details: error.message });
  }
});

router.post('/concerns/:id/read', verifyToken, async (req, res) => {
  try {
    const teacherId = req.user?.id || req.user?.userId;
    const { id } = req.params;
    const [rows] = await db.query(
      'SELECT id FROM concerns WHERE id = ? AND (teacher_id = ? OR teacher_id IS NULL)',
      [id, teacherId]
    );
    if (!rows.length) {
      const [any] = await db.query('SELECT id FROM concerns WHERE id = ?', [id]);
      if (!any.length) return res.status(404).json({ error: 'Concern not found' });
    }
    await markConcernRead(id, teacherId);
    res.json({ message: 'Marked as read' });
  } catch (error) {
    console.error('Teacher mark concern read error:', error);
    res.status(500).json({ error: 'Server error marking concern read', details: error.message });
  }
});

router.post('/concerns/:id/reply', verifyToken, async (req, res) => {
  try {
    const teacherId = req.user?.id || req.user?.userId;
    const { id } = req.params;
    const { message } = req.body;

    const [rows] = await db.query(
      'SELECT id FROM concerns WHERE id = ? AND (teacher_id = ? OR teacher_id IS NULL)',
      [id, teacherId]
    );
    if (!rows.length) {
      const [any] = await db.query('SELECT id FROM concerns WHERE id = ?', [id]);
      if (!any.length) return res.status(404).json({ error: 'Concern not found' });
    }

    const result = await addConcernReply({
      concernId: id,
      senderId: teacherId,
      senderRole: 'teacher',
      message
    });

    const [[concern]] = await db.query(
      'SELECT SUBJECT as subject FROM concerns WHERE id = ?',
      [id]
    );
    await logActivity(
      db,
      teacherId,
      'Replied to concern',
      'concern',
      concern?.subject || `Concern #${id}`,
      null
    );

    res.json({ id: result.id, message: 'Reply sent to the parent' });
  } catch (error) {
    console.error('Teacher reply error:', error);
    const status = error.status || 500;
    res.status(status).json({
      error: error.status ? error.message : 'Server error sending reply',
      details: error.message
    });
  }
});

router.patch('/concerns/:id/resolve', verifyToken, async (req, res) => {
  try {
    const teacherId = req.user?.id || req.user?.userId;
    const { id } = req.params;
    const [rows] = await db.query(
      'SELECT id FROM concerns WHERE id = ? AND (teacher_id = ? OR teacher_id IS NULL)',
      [id, teacherId]
    );
    if (!rows.length) return res.status(404).json({ error: 'Concern not found' });

    const [[concern]] = await db.query(
      'SELECT SUBJECT as subject FROM concerns WHERE id = ?',
      [id]
    );
    await db.query("UPDATE concerns SET STATUS = 'resolved' WHERE id = ?", [id]);
    try {
      await markConcernReadForParticipants(id, teacherId);
    } catch (e) {
      console.error('[concern_reads] mark on resolve:', e.message);
    }
    await logActivity(
      db,
      teacherId,
      'Resolved concern',
      'concern',
      concern?.subject || `Concern #${id}`,
      null
    );
    res.json({ message: 'Concern marked as resolved' });
  } catch (error) {
    console.error('Teacher resolve concern error:', error);
    res.status(500).json({ error: 'Server error resolving concern', details: error.message });
  }
});

module.exports = router;