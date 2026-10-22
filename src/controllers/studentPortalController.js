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
  isPastManila,
  parseMakeupIds
} = require('../utils/quizAttendance');
const { ensureQuizShareSchema, activityWorkFromSubmission, quizTakenFromSubmission, identificationReviewBank } = require('../utils/quizShare');
const { ensureQuestionBankSchema, formatBankRow } = require('../utils/questionBank');

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

/** Turned in online, or already scored by the teacher (e.g. an activity done in class). */
function isWorkDone(row) {
  return row.submission_id != null || Number(row.recorded_count) > 0;
}

/** The three groups the student portal shows: pending, done, missing. */
function workGroup(state) {
  if (state === 'submitted') return 'done';
  if (state === 'closed') return 'missing';
  return 'pending';
}

function classifyWork(row, student, attendance) {
  const submitted = isWorkDone(row);
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
  // submitted   - the student already turned it in
  // not_open    - the teacher has not enabled the link (or turned it off)
  // closed      - the deadline has passed (checked before attendance, so it applies to everyone)
  // open        - enabled, in time, and attendance lets this student in
  // no_access   - enabled and in time, but the student is Absent or Excused with no make-up allowance
  // waiting     - enabled and in time, but attendance has not been recorded yet
  let state = 'waiting';
  if (submitted) {
    state = 'submitted';
  } else if (!Number(row.share_enabled)) {
    state = 'not_open';
  } else if (
    phase === 'live_ended'
    || phase === 'makeup_ended'
    || (phase !== 'makeup' && row.quiz_closes_at && isPastManila(row.quiz_closes_at))
  ) {
    state = 'closed';
  } else if (eligible && row.share_token) {
    state = 'open';
  } else if (phase === 'needs_makeup') {
    state = 'no_access';
  }
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
  params.unshift(student.id); // for the recorded_count subquery, which comes first in the SQL
  const [rows] = await db.query(
    `SELECT a.id, a.title, a.TYPE as type, a.max_score, a.share_token, a.share_enabled,
            (SELECT COUNT(*) FROM assessment_scores asr
              WHERE asr.assessment_id = a.id AND asr.student_id = ? AND asr.score IS NOT NULL) AS recorded_count,
            a.grade_level, a.section, a.subject_id, a.quiz_subject_id,
            a.quiz_attendance_date, a.quiz_attendance_session, a.quiz_makeup_student_ids,
            a.quiz_closes_at, a.quiz_makeup_closes_at,
            qs.id AS submission_id, qs.score, qs.max_score AS submission_max, qs.submitted_at, qs.answers
     FROM assessments a
     LEFT JOIN quiz_submissions qs
       ON qs.assessment_id = a.id AND qs.student_id = ?
     WHERE a.grade_level = ?
       AND TRIM(UPPER(a.section)) = TRIM(UPPER(?))
       AND (a.share_enabled = 1 OR a.share_token IS NOT NULL)
       AND a.subject_id IS NOT NULL
       ${subjectSql}
     ORDER BY a.created_at DESC`,
    params
  );
  return rows;
}

function subjectCoversGrade(gradeLevel, applicableGrades) {
  if (!applicableGrades) return false;
  const grade = parseInt(gradeLevel, 10);
  if (Number.isNaN(grade)) return false;
  const text = String(applicableGrades).trim();
  const range = text.match(/^(\d+)\s*-\s*(\d+)$/);
  if (range) return grade >= parseInt(range[1], 10) && grade <= parseInt(range[2], 10);
  if (text.includes(',')) {
    return text.split(',').map((part) => parseInt(part.trim(), 10)).includes(grade);
  }
  return parseInt(text, 10) === grade;
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
    const [gradeSubjects] = await db.query(
      'SELECT id, applicable_grades FROM subjects WHERE deleted_at IS NULL'
    );
    const gradeSubjectIds = gradeSubjects
      .filter((row) => subjectCoversGrade(grade, row.applicable_grades))
      .map((row) => row.id)
      .join(',');
    const [subjects] = await db.query(
      `SELECT sub.id, sub.NAME AS name, sub.CODE AS code,
              (SELECT CONCAT(u.first_name, ' ', u.last_name)
                 FROM teacher_assignments ta
                 JOIN users u ON u.id = ta.teacher_id
                 WHERE ta.subject_id = sub.id
                   AND ta.grade_level = ?
                   AND TRIM(UPPER(ta.section)) = TRIM(UPPER(?))
                 ORDER BY (ta.school_year = ?) DESC, ta.id DESC
                 LIMIT 1) AS subject_teacher_name,
              (SELECT CONCAT(u.first_name, ' ', u.last_name)
                 FROM teacher_assignments ta
                 JOIN users u ON u.id = ta.teacher_id
                 WHERE ta.subject_id IS NULL
                   AND ta.slot = 'adviser'
                   AND ta.grade_level = ?
                   AND TRIM(UPPER(ta.section)) = TRIM(UPPER(?))
                 ORDER BY (ta.school_year = ?) DESC, ta.id DESC
                 LIMIT 1) AS adviser_name
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
           AND (a.share_enabled = 1 OR a.share_token IS NOT NULL)
           AND a.subject_id IS NOT NULL
         UNION
         SELECT gs.id AS subject_id
         FROM subjects gs
         WHERE FIND_IN_SET(gs.id, ?) > 0
       ) ids
       JOIN subjects sub ON sub.id = ids.subject_id
       WHERE sub.deleted_at IS NULL
       ORDER BY sub.NAME`,
      [grade, section, schoolYear, grade, section, schoolYear, grade, section, grade, section, gradeSubjectIds]
    );

    const rows = await loadWorkRows(student);
    const rosterCache = new Map();
    const dueBySubject = new Map();
    for (const row of rows) {
      const attendance = isWorkDone(row) ? null : await attendanceFor(student, row, rosterCache);
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
        // A subject teacher handles this subject; otherwise the class adviser covers it.
        teacher_name: subject.subject_teacher_name || subject.adviser_name || null,
        teacher_role: subject.subject_teacher_name
          ? 'subject_teacher'
          : (subject.adviser_name ? 'class_adviser' : null),
        due_count: dueBySubject.get(Number(subject.id)) || 0
      }))
    });
  } catch (error) {
    console.error('Student subjects error:', error);
    res.status(500).json({ error: 'Server error loading subjects' });
  }
};

const STATE_ORDER = { open: 0, waiting: 1, no_access: 2, not_open: 3, closed: 4, submitted: 5 };

/** Lesson files the teacher attached to classwork shared with this class. */
async function loadMaterials(student, subjectId) {
  const [rows] = await db.query(
    `SELECT lp.id, lp.title, lp.objectives, lp.file_path,
            GROUP_CONCAT(DISTINCT a.title ORDER BY a.created_at SEPARATOR '||') AS used_in
     FROM assessments a
     JOIN lesson_plans lp ON lp.id = a.lesson_plan_id
     WHERE a.grade_level = ?
       AND TRIM(UPPER(a.section)) = TRIM(UPPER(?))
       AND a.share_enabled = 1
       AND a.subject_id = ?
       AND lp.file_path IS NOT NULL AND lp.file_path <> ''
     GROUP BY lp.id, lp.title, lp.objectives, lp.file_path
     ORDER BY MAX(a.created_at) DESC`,
    [student.grade_level, student.section, subjectId]
  );
  return rows.map((row) => {
    const ext = String(row.file_path).split('.').pop().toLowerCase();
    return {
      id: row.id,
      title: row.title,
      objectives: row.objectives || null,
      file_path: row.file_path,
      file_type: ext === 'pdf' ? 'PDF' : (ext === 'doc' || ext === 'docx') ? 'Word' : ext.toUpperCase(),
      used_in: row.used_in ? String(row.used_in).split('||').filter(Boolean) : []
    };
  });
}

/** Everything this student has taken in the subject, with the recorded score. */
async function loadRecords(student, subjectId) {
  const [rows] = await db.query(
    `SELECT a.id, a.title, a.TYPE AS type, a.quarter, a.max_score,
            asr.score AS recorded_score, asr.recorded_at,
            qs.id AS submission_id, qs.score AS submission_score,
            qs.max_score AS submission_max, qs.submitted_at
     FROM assessments a
     LEFT JOIN assessment_scores asr ON asr.assessment_id = a.id AND asr.student_id = ?
     LEFT JOIN quiz_submissions qs ON qs.assessment_id = a.id AND qs.student_id = ?
     WHERE a.subject_id = ?
       AND (asr.id IS NOT NULL OR qs.id IS NOT NULL)
     ORDER BY COALESCE(qs.submitted_at, asr.recorded_at) DESC, asr.id DESC`,
    [student.id, student.id, subjectId]
  );
  const seen = new Set();
  const records = [];
  for (const row of rows) {
    if (seen.has(row.id)) continue;
    seen.add(row.id);
    const kind = String(row.type || '').toLowerCase();
    const hasRecorded = row.recorded_score != null;
    // An activity is scored by the teacher; until then there is no recorded score.
    const pending = !hasRecorded && kind === 'activity';
    let score = null;
    if (hasRecorded) score = Number(row.recorded_score);
    else if (!pending && row.submission_id != null) score = Number(row.submission_score);
    records.push({
      id: row.id,
      title: row.title,
      type: row.type,
      quarter: row.quarter || null,
      score,
      max_score: Number(row.submission_max || row.max_score) || null,
      taken_at: row.submitted_at || row.recorded_at || null,
      score_pending: pending || score == null,
      has_submission: row.submission_id != null
    });
  }
  return records;
}

// GET /api/student/subjects/:subjectId
exports.subjectDetail = async (req, res) => {
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

    const classworks = [];
    for (const row of rows) {
      const attendance = isWorkDone(row) ? null : await attendanceFor(student, row, rosterCache);
      const { state } = classifyWork(row, student, attendance);
      classworks.push({
        id: row.id,
        title: row.title,
        type: row.type,
        state,
        group: workGroup(state),
        path: state === 'open' ? workPath(row.type, row.share_token) : null,
        submitted_at: state === 'submitted' ? row.submitted_at : null,
        scored_by_teacher: state === 'submitted' && row.submission_id == null
      });
    }
    classworks.sort((a, b) => (STATE_ORDER[a.state] ?? 1) - (STATE_ORDER[b.state] ?? 1));

    const [materials, records] = await Promise.all([
      loadMaterials(student, subjectId),
      loadRecords(student, subjectId)
    ]);

    res.json({ classworks, materials, records });
  } catch (error) {
    console.error('Student subject detail error:', error);
    res.status(500).json({ error: 'Server error loading this subject' });
  }
};

// GET /api/student/records/:assessmentId/work
exports.submission = async (req, res) => {
  try {
    const student = await loadLearner(req.user.id);
    if (!student || String(student.status).toLowerCase() !== 'active') {
      return res.status(403).json({ error: 'This student account is not active.' });
    }
    const assessmentId = Number(req.params.assessmentId);
    if (!assessmentId) return res.status(400).json({ error: 'Choose a record.' });

    await ensureQuizShareSchema();
    await ensureQuestionBankSchema();
    const [[assessment]] = await db.query(
      `SELECT a.id, a.title, a.TYPE AS type, a.max_score
       FROM assessments a
       JOIN quiz_submissions qs ON qs.assessment_id = a.id AND qs.student_id = ?
       WHERE a.id = ?
         AND a.grade_level = ?
         AND TRIM(UPPER(a.section)) = TRIM(UPPER(?))`,
      [student.id, assessmentId, student.grade_level, student.section]
    );
    if (!assessment) return res.status(404).json({ error: 'No submitted work for this record.' });

    const [[submission]] = await db.query(
      `SELECT answers FROM quiz_submissions WHERE assessment_id = ? AND student_id = ?`,
      [assessmentId, student.id]
    );
    if (!submission) return res.status(404).json({ error: 'No submitted work for this record.' });
    const [qrows] = await db.query(
      `SELECT id, item_type, question, choices, answer, points, rubric
       FROM assessment_questions
       WHERE assessment_id = ?
       ORDER BY sort_order ASC, id ASC`,
      [assessmentId]
    );
    const questions = qrows.map((row) => formatBankRow(row));
    res.json({
      title: assessment.title,
      type: assessment.type,
      max_score: assessment.max_score,
      quiz_taken: quizTakenFromSubmission(submission.answers, questions).map((item) => ({
        n: item.n,
        item_type: item.item_type,
        question: item.question,
        choices: item.choices,
        given: item.given,
        expected: item.expected,
        correct: item.correct,
        points: item.points
      })),
      activity_work: activityWorkFromSubmission(submission.answers, questions).map((item) => ({
        question: item.question,
        text: item.text,
        file: item.file && String(item.file.url || '').startsWith('/uploads/')
          ? { url: item.file.url, name: item.file.name }
          : null
      })),
      identification_bank: identificationReviewBank(questions)
    });
  } catch (error) {
    console.error('Student submission error:', error);
    res.status(500).json({ error: 'Server error loading submitted work' });
  }
};
