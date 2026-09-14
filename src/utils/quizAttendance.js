const db = require('../../db');
const {
  ensureAttendanceSchema,
  manilaISODate,
  sqlDateToISO,
  isSubjectGrade,
  normalizeSession
} = require('./attendanceSchema');

const VALID_STATUSES = ['Present', 'Absent', 'Late', 'Excused'];
const LIVE_QUIZ_STATUSES = ['Present', 'Late'];
const MAKEUP_STATUSES = ['Absent', 'Excused'];

let schemaPromise = null;

async function ensureExcusedStatus(conn = db) {
  await ensureAttendanceSchema(conn);
  try {
    await conn.query(
      `ALTER TABLE attendance
       MODIFY COLUMN \`STATUS\` ENUM('Present','Absent','Late','Excused') NOT NULL`
    );
  } catch (e) {
    /* already migrated or unsupported — individual saves may still work if enum includes Excused */
  }
}

async function ensureQuizAttendanceSchema(conn = db) {
  if (schemaPromise) return schemaPromise;
  schemaPromise = (async () => {
    await ensureExcusedStatus(conn);
    const alters = [
      `ALTER TABLE assessments ADD COLUMN quiz_attendance_date DATE NULL`,
      `ALTER TABLE assessments ADD COLUMN quiz_attendance_session VARCHAR(2) NULL DEFAULT 'AM'`,
      `ALTER TABLE assessments ADD COLUMN quiz_subject_id INT NULL`,
      `ALTER TABLE assessments ADD COLUMN quiz_makeup_student_ids JSON NULL`
    ];
    for (const sql of alters) {
      try {
        await conn.query(sql);
      } catch (e) { /* exists */ }
    }
  })().catch((e) => {
    schemaPromise = null;
    throw e;
  });
  return schemaPromise;
}

function parseMakeupIds(raw) {
  if (raw == null) return [];
  if (Array.isArray(raw)) return raw.map(Number).filter((n) => Number.isFinite(n) && n > 0);
  try {
    const parsed = typeof raw === 'string' ? JSON.parse(raw) : raw;
    if (Array.isArray(parsed)) return parsed.map(Number).filter((n) => Number.isFinite(n) && n > 0);
  } catch (_) { /* ignore */ }
  return [];
}

/** Coerce MySQL DATE / string to YYYY-MM-DD in Asia/Manila (no UTC day-shift). */
function coerceAttendanceDate(value) {
  if (value == null || value === '') return manilaISODate();
  if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}/.test(value)) return value.slice(0, 10);
  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return manilaISODate(value);
  }
  const fromSql = sqlDateToISO(value);
  return fromSql || manilaISODate();
}

function attendanceSlotForAssessment(assessment, overrides = {}) {
  const grade = Number(assessment.grade_level);
  const subjectMode = isSubjectGrade(grade);
  const rawDate = overrides.date != null && overrides.date !== ''
    ? overrides.date
    : (assessment.quiz_attendance_date || manilaISODate());
  const date = coerceAttendanceDate(rawDate);
  const session = subjectMode
    ? 'AM'
    : normalizeSession(overrides.session || assessment.quiz_attendance_session || 'AM', { subjectMode: false });
  const subjectId = subjectMode
    ? (overrides.subject_id != null ? Number(overrides.subject_id) : Number(assessment.quiz_subject_id || assessment.subject_id))
    : null;
  const subjectKey = subjectMode && subjectId ? subjectId : 0;
  return { date, session, subjectId, subjectKey, subjectMode };
}

async function loadAttendanceRoster(grade, section, slot) {
  const sectionNorm = String(section || '').trim();
  const [students] = await db.query(
    `SELECT s.id, s.lrn, s.first_name, s.last_name, s.gender,
            a.\`STATUS\` as attendance_status
     FROM students s
     LEFT JOIN attendance a
       ON s.id = a.student_id
      AND a.\`DATE\` = ?
      AND a.session = ?
      AND a.subject_key = ?
     WHERE s.grade_level = ? AND TRIM(s.section) = ? AND s.\`STATUS\` = 'active'
     ORDER BY s.last_name, s.first_name`,
    [slot.date, slot.session, slot.subjectKey, grade, sectionNorm]
  );
  return students;
}

async function getAttendanceCompletion(grade, section, slot) {
  const students = await loadAttendanceRoster(grade, section, slot);
  const unmarked = students.filter((s) => !s.attendance_status);
  return {
    complete: students.length > 0 && unmarked.length === 0,
    total: students.length,
    unmarked: unmarked.map((s) => ({
      id: s.id,
      name: `${s.last_name}, ${s.first_name}`
    })),
    students
  };
}

function normalizeStatus(status) {
  const s = String(status || '').trim();
  if (!s) return '';
  const lower = s.toLowerCase();
  return VALID_STATUSES.find((v) => v.toLowerCase() === lower) || s;
}

function isLiveQuizStatus(status) {
  const st = normalizeStatus(status);
  return LIVE_QUIZ_STATUSES.includes(st);
}

function isMakeupStatus(status) {
  const st = normalizeStatus(status);
  return MAKEUP_STATUSES.includes(st);
}

function isStudentEligibleForQuiz({ attendanceStatus, submitted, makeupStudentIds, studentId }) {
  if (submitted) return false;
  const makeupSet = new Set(parseMakeupIds(makeupStudentIds));
  if (makeupSet.has(Number(studentId))) {
    return isMakeupStatus(attendanceStatus);
  }
  return isLiveQuizStatus(attendanceStatus);
}

async function getSubmittedStudentIds(assessmentId) {
  const [rows] = await db.query(
    `SELECT student_id FROM quiz_submissions WHERE assessment_id = ?`,
    [assessmentId]
  );
  return new Set(rows.map((r) => Number(r.student_id)));
}

async function getMakeupCandidates(assessment) {
  const slot = attendanceSlotForAssessment(assessment);
  const students = await loadAttendanceRoster(assessment.grade_level, assessment.section, slot);
  const submittedSet = await getSubmittedStudentIds(assessment.id);
  return students
    .filter((s) => isMakeupStatus(s.attendance_status) && !submittedSet.has(s.id))
    .map((s) => ({
      id: s.id,
      first_name: s.first_name,
      last_name: s.last_name,
      attendance_status: s.attendance_status
    }));
}

module.exports = {
  VALID_STATUSES,
  LIVE_QUIZ_STATUSES,
  MAKEUP_STATUSES,
  ensureQuizAttendanceSchema,
  ensureExcusedStatus,
  parseMakeupIds,
  attendanceSlotForAssessment,
  loadAttendanceRoster,
  getAttendanceCompletion,
  normalizeStatus,
  isLiveQuizStatus,
  isMakeupStatus,
  isStudentEligibleForQuiz,
  getSubmittedStudentIds,
  getMakeupCandidates
};
