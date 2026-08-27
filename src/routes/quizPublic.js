const express = require('express');
const router = express.Router();
const db = require('../../db');
const {
  ensureQuizShareSchema,
  publicQuestion,
  getAssessmentQuestions,
  scoreSubmission
} = require('../utils/quizShare');

router.get('/:token', async (req, res) => {
  try {
    await ensureQuizShareSchema();
    const token = String(req.params.token || '').trim();
    if (!token) return res.status(400).json({ error: 'Invalid quiz link' });

    const [[assessment]] = await db.query(
      `SELECT a.id, a.title, a.TYPE as type, a.grade_level, a.section, a.max_score,
              a.share_token, a.share_enabled, a.created_by, s.NAME as subject_name
       FROM assessments a
       LEFT JOIN subjects s ON s.id = a.subject_id
       WHERE a.share_token = ?`,
      [token]
    );
    if (!assessment || !assessment.share_enabled) {
      return res.status(404).json({ error: 'This quiz link is inactive or not found.' });
    }

    const questions = await getAssessmentQuestions(assessment.id);
    if (!questions.length) {
      return res.status(400).json({ error: 'This quiz has no questions yet.' });
    }

    const [students] = await db.query(
      `SELECT id, first_name, last_name
       FROM students
       WHERE grade_level = ? AND section = ? AND STATUS = 'active'
       ORDER BY last_name, first_name`,
      [assessment.grade_level, assessment.section]
    );

    const [submitted] = await db.query(
      `SELECT student_id FROM quiz_submissions WHERE assessment_id = ?`,
      [assessment.id]
    );
    const submittedSet = new Set(submitted.map((r) => r.student_id));

    res.json({
      title: assessment.title,
      type: assessment.type,
      subject_name: assessment.subject_name,
      grade_level: assessment.grade_level,
      section: assessment.section,
      max_score: Number(assessment.max_score) || 100,
      questions: questions.map(publicQuestion),
      students: students.map((s) => ({
        id: s.id,
        name: `${s.last_name}, ${s.first_name}`,
        last_name: s.last_name,
        first_name: s.first_name,
        submitted: submittedSet.has(s.id)
      }))
    });
  } catch (error) {
    console.error('Public quiz get error:', error);
    res.status(500).json({ error: 'Server error loading quiz', details: error.message });
  }
});

router.post('/:token/submit', async (req, res) => {
  try {
    await ensureQuizShareSchema();
    const token = String(req.params.token || '').trim();
    const { student_id, answers } = req.body || {};

    if (!token) return res.status(400).json({ error: 'Invalid quiz link' });
    if (!student_id) return res.status(400).json({ error: 'Select your name to submit.' });

    const [[assessment]] = await db.query(
      `SELECT a.id, a.title, a.max_score, a.grade_level, a.section, a.share_enabled, a.share_token
       FROM assessments a
       WHERE a.share_token = ?`,
      [token]
    );
    if (!assessment || !assessment.share_enabled) {
      return res.status(404).json({ error: 'This quiz link is inactive or not found.' });
    }

    const [[student]] = await db.query(
      `SELECT id, first_name, last_name FROM students
       WHERE id = ? AND grade_level = ? AND section = ? AND STATUS = 'active'`,
      [student_id, assessment.grade_level, assessment.section]
    );
    if (!student) {
      return res.status(400).json({ error: 'Student is not in this class roster.' });
    }

    const [existing] = await db.query(
      `SELECT id FROM quiz_submissions WHERE assessment_id = ? AND student_id = ?`,
      [assessment.id, student_id]
    );
    if (existing.length) {
      return res.status(409).json({ error: 'You already submitted this quiz.' });
    }

    const questions = await getAssessmentQuestions(assessment.id);
    if (!questions.length) {
      return res.status(400).json({ error: 'This quiz has no questions yet.' });
    }

    const { earned, maxScore, detail } = scoreSubmission(questions, answers);
    const recordMax = Math.max(1, Number(assessment.max_score) || maxScore || 1);
    // Scale auto MCQ earned to assessment max_score when bank points differ
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
