const express = require('express');
const router = express.Router();
const db = require('../../db');
const {
  ensureQuizShareSchema,
  publicQuestion,
  getAssessmentQuestions,
  scoreSubmission
} = require('../utils/quizShare');
const {
  ensureQuizAttendanceSchema,
  parseMakeupIds,
  attendanceSlotForAssessment,
  loadAttendanceRoster,
  isStudentEligibleForQuiz,
  getSubmittedStudentIds
} = require('../utils/quizAttendance');

function normalizeLrn(value) {
  const digits = String(value || '').replace(/\D/g, '');
  return digits.length === 12 ? digits : null;
}

async function loadAssessmentByToken(token) {
  const [[assessment]] = await db.query(
    `SELECT a.id, a.title, a.TYPE as type, a.grade_level, a.section, a.max_score,
            a.subject_id, a.share_token, a.share_enabled, a.created_by,
            a.quiz_attendance_date, a.quiz_attendance_session, a.quiz_subject_id,
            a.quiz_makeup_student_ids, s.NAME as subject_name
     FROM assessments a
     LEFT JOIN subjects s ON s.id = a.subject_id
     WHERE a.share_token = ?`,
    [token]
  );
  return assessment;
}

function eligibilityBlockReason(attendanceStatus, eligible, submitted) {
  if (submitted) return 'You already submitted this quiz.';
  if (!attendanceStatus) {
    return 'Attendance has not been recorded for you yet. Ask your teacher to mark attendance first.';
  }
  if (eligible) return null;
  const st = String(attendanceStatus || '');
  if (['Absent', 'Excused'].includes(st)) {
    return 'This quiz is not open for you yet. Ask your teacher for a make-up quiz.';
  }
  return 'You are not allowed to take this quiz with your current attendance status.';
}

async function findStudentByLrnInClass(assessment, lrnProvided) {
  const slot = attendanceSlotForAssessment(assessment);
  const roster = await loadAttendanceRoster(assessment.grade_level, assessment.section, slot);
  return roster.find((s) => normalizeLrn(s.lrn) === lrnProvided) || null;
}

router.get('/:token', async (req, res) => {
  try {
    await ensureQuizShareSchema();
    await ensureQuizAttendanceSchema();
    const token = String(req.params.token || '').trim();
    if (!token) return res.status(400).json({ error: 'Invalid quiz link' });

    const assessment = await loadAssessmentByToken(token);
    if (!assessment || !assessment.share_enabled) {
      return res.status(404).json({ error: 'This quiz link is inactive or not found.' });
    }

    const questions = await getAssessmentQuestions(assessment.id);
    if (!questions.length) {
      return res.status(400).json({ error: 'This quiz has no questions yet.' });
    }

    const makeupIds = parseMakeupIds(assessment.quiz_makeup_student_ids);

    res.json({
      title: assessment.title,
      type: assessment.type,
      subject_name: assessment.subject_name,
      grade_level: assessment.grade_level,
      section: assessment.section,
      max_score: Number(assessment.max_score) || 100,
      questions: questions.map(publicQuestion),
      quiz_mode: makeupIds.length ? 'live_and_makeup' : 'live_only',
      identity_verification: 'lrn_first',
      live_statuses: ['Present', 'Late']
    });
  } catch (error) {
    console.error('Public quiz get error:', error);
    res.status(500).json({ error: 'Server error loading quiz', details: error.message });
  }
});

/** LRN → confirm student name + eligibility (Present/Late live; Absent/Excused if make-up granted). */
router.post('/:token/identify', async (req, res) => {
  try {
    await ensureQuizShareSchema();
    await ensureQuizAttendanceSchema();
    const token = String(req.params.token || '').trim();
    const lrnProvided = normalizeLrn(req.body?.lrn);

    if (!token) return res.status(400).json({ error: 'Invalid quiz link' });
    if (!lrnProvided) {
      return res.status(400).json({ error: 'Enter your 12-digit LRN.' });
    }

    const assessment = await loadAssessmentByToken(token);
    if (!assessment || !assessment.share_enabled) {
      return res.status(404).json({ error: 'This quiz link is inactive or not found.' });
    }

    const row = await findStudentByLrnInClass(assessment, lrnProvided);
    if (!row) {
      return res.status(404).json({
        error: 'No student in this class matched that LRN. Check the number and try again.'
      });
    }

    const submittedSet = await getSubmittedStudentIds(assessment.id);
    const submitted = submittedSet.has(Number(row.id));
    const makeupIds = parseMakeupIds(assessment.quiz_makeup_student_ids);
    const eligible = isStudentEligibleForQuiz({
      attendanceStatus: row.attendance_status,
      submitted,
      makeupStudentIds: makeupIds,
      studentId: row.id
    });
    const block_reason = eligibilityBlockReason(row.attendance_status, eligible, submitted);

    res.json({
      student_id: row.id,
      student_name: `${row.last_name}, ${row.first_name}`,
      first_name: row.first_name,
      last_name: row.last_name,
      attendance_status: row.attendance_status || null,
      submitted,
      eligible: !!eligible,
      block_reason,
      makeup: makeupIds.includes(Number(row.id))
    });
  } catch (error) {
    console.error('Public quiz identify error:', error);
    res.status(500).json({ error: 'Server error verifying LRN', details: error.message });
  }
});

router.post('/:token/submit', async (req, res) => {
  try {
    await ensureQuizShareSchema();
    await ensureQuizAttendanceSchema();
    const token = String(req.params.token || '').trim();
    const { student_id, answers, lrn: lrnBody } = req.body || {};

    if (!token) return res.status(400).json({ error: 'Invalid quiz link' });
    if (!student_id) return res.status(400).json({ error: 'Confirm your LRN before submitting.' });

    const assessment = await loadAssessmentByToken(token);
    if (!assessment || !assessment.share_enabled) {
      return res.status(404).json({ error: 'This quiz link is inactive or not found.' });
    }

    const [[student]] = await db.query(
      `SELECT id, first_name, last_name, lrn FROM students
       WHERE id = ? AND grade_level = ? AND section = ? AND STATUS = 'active'`,
      [student_id, assessment.grade_level, assessment.section]
    );
    if (!student) {
      return res.status(400).json({ error: 'Student is not in this class roster.' });
    }

    const lrnOnFile = normalizeLrn(student.lrn);
    const lrnProvided = normalizeLrn(lrnBody);
    if (!lrnOnFile) {
      return res.status(403).json({
        error: 'No LRN on file for this student. Ask your teacher to add your LRN before taking the quiz.'
      });
    }
    if (!lrnProvided) {
      return res.status(400).json({
        error: 'Enter your 12-digit LRN to confirm your identity.'
      });
    }
    if (lrnProvided !== lrnOnFile) {
      return res.status(403).json({
        error: 'No LRN matched to your input. Please try again.'
      });
    }

    const [existing] = await db.query(
      `SELECT id FROM quiz_submissions WHERE assessment_id = ? AND student_id = ?`,
      [assessment.id, student_id]
    );
    if (existing.length) {
      return res.status(409).json({ error: 'You already submitted this quiz.' });
    }

    const slot = attendanceSlotForAssessment(assessment);
    const roster = await loadAttendanceRoster(assessment.grade_level, assessment.section, slot);
    const row = roster.find((s) => Number(s.id) === Number(student_id));
    const makeupIds = parseMakeupIds(assessment.quiz_makeup_student_ids);
    const eligible = isStudentEligibleForQuiz({
      attendanceStatus: row?.attendance_status,
      submitted: false,
      makeupStudentIds: makeupIds,
      studentId: student_id
    });

    if (!row?.attendance_status) {
      return res.status(403).json({
        error: 'Attendance has not been recorded for you today. Ask your teacher to mark attendance first.'
      });
    }
    if (!eligible) {
      const st = String(row.attendance_status || '');
      if (['Absent', 'Excused'].includes(st)) {
        return res.status(403).json({
          error: 'This quiz is not open for you yet. Ask your teacher for a make-up quiz.'
        });
      }
      return res.status(403).json({
        error: 'You are not allowed to take this quiz with your current attendance status.'
      });
    }

    const questions = await getAssessmentQuestions(assessment.id);
    if (!questions.length) {
      return res.status(400).json({ error: 'This quiz has no questions yet.' });
    }

    const { earned, maxScore, detail } = scoreSubmission(questions, answers);
    const recordMax = Math.max(1, Number(assessment.max_score) || maxScore || 1);
    let finalScore = earned;
    if (maxScore > 0 && Math.abs(recordMax - maxScore) > 0.01) {
      finalScore = Math.round((earned / maxScore) * recordMax * 100) / 100;
    }
    finalScore = Math.min(recordMax, Math.max(0, finalScore));

    await db.query(
      `INSERT INTO quiz_submissions
        (assessment_id, student_id, share_token, answers, score, max_score)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        assessment.id,
        student_id,
        token,
        JSON.stringify({ answers: Array.isArray(answers) ? answers : [], detail }),
        finalScore,
        recordMax
      ]
    );

    const [scoreRow] = await db.query(
      `SELECT id FROM assessment_scores WHERE assessment_id = ? AND student_id = ?`,
      [assessment.id, student_id]
    );
    if (scoreRow.length) {
      await db.query(`UPDATE assessment_scores SET score = ? WHERE id = ?`, [
        finalScore,
        scoreRow[0].id
      ]);
    } else {
      await db.query(
        `INSERT INTO assessment_scores (assessment_id, student_id, score) VALUES (?, ?, ?)`,
        [assessment.id, student_id, finalScore]
      );
    }

    res.status(201).json({
      message: 'Submitted. Your teacher can see your score in Progress.',
      score: finalScore,
      max_score: recordMax,
      student_name: `${student.last_name}, ${student.first_name}`
    });
  } catch (error) {
    console.error('Public quiz submit error:', error);
    if (error && error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ error: 'You already submitted this quiz.' });
    }
    res.status(500).json({ error: 'Server error submitting quiz', details: error.message });
  }
});

module.exports = router;
