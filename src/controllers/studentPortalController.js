const db = require('../../db');
const { schoolYear } = require('../config');
const { ensureStudentRoleSchema } = require('../utils/studentAccounts');
const { ensureSoftDeleteSchema } = require('../utils/softDeleteSchema');
const { ensureAssignmentSlots } = require('../utils/teachingMode');
const {
  ensureQuizAttendanceSchema,
  attendanceSlotForAssessment,
  loadAttendanceRoster,
  isStudentEligibleForQuiz,
  getQuizAccessPhase,
  parseMakeupIds
} = require('../utils/quizAttendance');

async function loadLearner(userId) {
  await ensureStudentRoleSchema();
  await ensureSoftDeleteSchema();
  const [rows] = await db.query(
    `SELECT s.id, s.lrn, s.first_name, s.middle_name, s.last_name, s.grade_level, s.section, s.STATUS as status
     FROM users u
     JOIN students s ON s.id = u.student_id
     WHERE u.id = ? AND u.role = 'student' AND s.deleted_at IS NULL
     LIMIT 1`,
    [userId]
  );
  return rows[0] || null;
}

function workPath(type, token) {
  const kind = String(type || '').toLowerCase();
  if (kind === 'activity') return `/activity/${token}`;
  if (kind === 'exam') return `/exam/${token}`;
  return `/quiz/${token}`;
}

function scorePending(type, answers) {
  if (String(type || '').toLowerCase() !== 'activity') return false;
  try {
    const parsed = typeof answers === 'string' ? JSON.parse(answers) : answers;
    return !parsed || !parsed.scored_at;
  } catch {
    return true;
  }
}

exports.me = async (req, res) => {
  try {
    const student = await loadLearner(req.user.id);
    if (!student || String(student.status).toLowerCase() !== 'active') {
      return res.status(403).json({ error: 'This student account is not active.' });
    }
    res.json({
      id: student.id,
      lrn: student.lrn,
      first_name: student.first_name,
      middle_name: student.middle_name,
      last_name: student.last_name,
      grade_level: student.grade_level,
      section: student.section
    });
  } catch (error) {
    console.error('Student me error:', error);
    res.status(500).json({ error: 'Server error loading student' });
  }
};

function classifyWork(row, student, attendance) {
  const submitted = row.submission_id != null;
  const makeupStudentIds = parseMakeupIds(row.quiz_makeup_student_ids);
  const eligible = !submitted && isStudentEligibleForQuiz({
    attendanceStatus: attendance,
    submitted: false,
    makeupStudentIds,
    studentId: student.id,
    assessment: row
  });
  const phase = submitted ? 'submitted' : getQuizAccessPhase(row, {
    attendanceStatus: attendance,
    makeupStudentIds,
    studentId: student.id
  });
  let state = 'unavailable';
  if (submitted) state = 'submitted';
  else if (eligible && row.share_token) state = 'open';
  else if (phase === 'live_ended' || phase === 'makeup_ended') state = 'closed';
  return { state, submitted, makeupStudentIds };
}

async function attendanceFor(student, assessment, rosterCache) {
  const slot = attendanceSlotForAssessment(assessment);
  const key = `${slot.date}|${slot.session}|${slot.subjectKey}`;
  if (!rosterCache.has(key)) {
    rosterCache.set(key, loadAttendanceRoster(assessment.grade_level, assessment.section, slot));
  }
  const roster = await rosterCache.get(key);
  const row = roster.find((item) => Number(item.id) === Number(student.id));
  return row?.attendance_status || null;
}

async function loadWorkRows(student, subjectId) {
  const params = [student.id, student.grade_level, student.section];
  let subjectSql = '';
  if (subjectId) {
    subjectSql = ' AND a.subject_id = ?';
    params.push(subjectId);
  }
  const [rows] = await db.query(
    `SELECT a.id, a.title, a.TYPE as type, a.max_score, a.share_token, a.share_enabled,
            a.grade_level, a.section, a.subject_id, a.quiz_subject_id,
            a.quiz_attendance_date, a.quiz_attendance_session, a.quiz_makeup_student_ids,
            a.quiz_closes_at, a.quiz_makeup_closes_at,
            qs.id AS submission_id, qs.score, qs.max_score AS submission_max, qs.submitted_at, qs.answers
     FROM assessments a
     LEFT JOIN quiz_submissions qs
       ON qs.assessment_id = a.id AND qs.student_id = ?
     WHERE a.grade_level = ?
       AND TRIM(UPPER(a.section)) = TRIM(UPPER(?))
       AND a.share_enabled = 1
       AND a.subject_id IS NOT NULL
       ${subjectSql}
     ORDER BY a.created_at DESC`,
    params
  );
  return rows;
}

exports.subjects = async (req, res) => {
  try {
    await ensureQuizAttendanceSchema();
    await ensureAssignmentSlots();
    const student = await loadLearner(req.user.id);
    if (!student || String(student.status).toLowerCase() !== 'active') {
      return res.status(403).json({ error: 'This student account is not active.' });
    }
    const grade = student.grade_level;
    const section = student.section;
    const [subjects] = await db.query(
      `SELECT sub.id, sub.NAME AS name, sub.CODE AS code,
              COALESCE(
                (SELECT CONCAT(u.first_name, ' ', u.last_name)
                 FROM teacher_assignments ta
                 JOIN users u ON u.id = ta.teacher_id
                 WHERE ta.subject_id = sub.id
                   AND ta.grade_level = ?
                   AND TRIM(UPPER(ta.section)) = TRIM(UPPER(?))
                 ORDER BY (ta.school_year = ?) DESC, ta.id DESC
                 LIMIT 1),
                (SELECT CONCAT(u.first_name, ' ', u.last_name)
                 FROM teacher_assignments ta
                 JOIN users u ON u.id = ta.teacher_id
                 WHERE ta.subject_id IS NULL
                   AND ta.slot = 'adviser'
                   AND ta.grade_level = ?
                   AND TRIM(UPPER(ta.section)) = TRIM(UPPER(?))
                 ORDER BY (ta.school_year = ?) DESC, ta.id DESC
                 LIMIT 1)
              ) AS teacher_name
       FROM (
         SELECT ta.subject_id
         FROM teacher_assignments ta
         WHERE ta.grade_level = ?
           AND TRIM(UPPER(ta.section)) = TRIM(UPPER(?))
           AND ta.subject_id IS NOT NULL
         UNION
         SELECT a.subject_id
         FROM assessments a
         WHERE a.grade_level = ?
           AND TRIM(UPPER(a.section)) = TRIM(UPPER(?))
           AND a.share_enabled = 1
           AND a.subject_id IS NOT NULL
       ) ids
       JOIN subjects sub ON sub.id = ids.subject_id
       WHERE sub.deleted_at IS NULL
       ORDER BY sub.NAME`,
      [grade, section, schoolYear, grade, section, schoolYear, grade, section, grade, section]
    );

    const rows = await loadWorkRows(student);
    const rosterCache = new Map();
    const dueBySubject = new Map();
    for (const row of rows) {
      const attendance = row.submission_id != null ? null : await attendanceFor(student, row, rosterCache);
      const { state } = classifyWork(row, student, attendance);
      if (state !== 'open') continue;
      const key = Number(row.subject_id);
      dueBySubject.set(key, (dueBySubject.get(key) || 0) + 1);
    }

    res.json({
      student: {
        id: student.id,
        first_name: student.first_name,
        last_name: student.last_name,
        grade_level: grade,
        section
      },
      subjects: subjects.map((subject) => ({
        id: subject.id,
        code: subject.code,
        name: subject.name,
        teacher_name: subject.teacher_name || null,
        due_count: dueBySubject.get(Number(subject.id)) || 0
      }))
    });
  } catch (error) {
    console.error('Student subjects error:', error);
    res.status(500).json({ error: 'Server error loading subjects' });
  }
};

exports.classwork = async (req, res) => {
  try {
    await ensureQuizAttendanceSchema();
    const student = await loadLearner(req.user.id);
    if (!student || String(student.status).toLowerCase() !== 'active') {
      return res.status(403).json({ error: 'This student account is not active.' });
    }
    const subjectId = Number(req.params.subjectId);
    if (!subjectId) return res.status(400).json({ error: 'Choose a subject.' });

    const rows = await loadWorkRows(student, subjectId);
    const rosterCache = new Map();

    const items = [];
    for (const row of rows) {
      const attendance = row.submission_id != null ? null : await attendanceFor(student, row, rosterCache);
      const { state, submitted } = classifyWork(row, student, attendance);
      const pending = submitted && scorePending(row.type, row.answers);
      items.push({
        id: row.id,
        title: row.title,
        type: row.type,
        state,
        path: state === 'open' ? workPath(row.type, row.share_token) : null,
        submitted_at: submitted ? row.submitted_at : null,
        score: submitted && !pending ? Number(row.score) : null,
        max_score: submitted ? Number(row.submission_max || row.max_score) : Number(row.max_score),
        score_pending: pending
      });
    }

    res.json({
      to_submit: items.filter((item) => item.state !== 'submitted'),
      submitted: items.filter((item) => item.state === 'submitted')
    });
  } catch (error) {
    console.error('Student classwork error:', error);
    res.status(500).json({ error: 'Server error loading classwork' });
  }
};
