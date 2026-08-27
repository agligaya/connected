const crypto = require('crypto');
const db = require('../../db');
const { ensureQuestionBankSchema, parseChoicesColumn } = require('./questionBank');

let schemaPromise = null;

async function ensureQuizShareSchema(conn = db) {
  if (schemaPromise) return schemaPromise;
  schemaPromise = (async () => {
    await ensureQuestionBankSchema(conn);
    try {
      await conn.query(`ALTER TABLE assessments ADD COLUMN share_token VARCHAR(32) NULL`);
    } catch (e) { /* exists */ }
    try {
      await conn.query(`ALTER TABLE assessments ADD COLUMN share_enabled TINYINT(1) NOT NULL DEFAULT 0`);
    } catch (e) { /* exists */ }
    try {
      await conn.query(`ALTER TABLE assessments ADD UNIQUE KEY uq_assessments_share_token (share_token)`);
    } catch (e) { /* exists */ }

    await conn.query(`
      CREATE TABLE IF NOT EXISTS quiz_submissions (
        id INT AUTO_INCREMENT PRIMARY KEY,
        assessment_id INT NOT NULL,
        student_id INT NOT NULL,
        share_token VARCHAR(32) NOT NULL,
        answers JSON NOT NULL,
        score DECIMAL(8,2) NOT NULL DEFAULT 0,
        max_score DECIMAL(8,2) NOT NULL DEFAULT 0,
        submitted_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        UNIQUE KEY uq_quiz_sub_assessment_student (assessment_id, student_id),
        KEY idx_quiz_sub_token (share_token)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);
  })().catch((e) => {
    schemaPromise = null;
    throw e;
  });
  return schemaPromise;
}

function generateShareToken() {
  return crypto.randomBytes(8).toString('hex');
}

function publicQuestion(row) {
  return {
    id: row.id,
    sort_order: row.sort_order,
    item_type: row.item_type,
    question: row.question,
    choices: parseChoicesColumn(row.choices),
    points: Number(row.points) || 1
  };
}

async function getAssessmentQuestions(assessmentId) {
  await ensureQuestionBankSchema();
  const [rows] = await db.query(
    `SELECT id, question_bank_id, sort_order, item_type, question, choices, answer, points
     FROM assessment_questions
     WHERE assessment_id = ?
     ORDER BY sort_order ASC, id ASC`,
    [assessmentId]
  );
  return rows.map((r) => ({
    ...r,
    choices: parseChoicesColumn(r.choices),
    points: Number(r.points) || 1
  }));
}

function scoreSubmission(questions, answersInput) {
  const byId = new Map(questions.map((q) => [Number(q.id), q]));
  const answerMap = new Map();
  (Array.isArray(answersInput) ? answersInput : []).forEach((a) => {
    if (a == null || a.question_id == null) return;
    answerMap.set(Number(a.question_id), a.answer != null ? String(a.answer).trim() : '');
  });

  let earned = 0;
  let maxScore = 0;
  const detail = [];

  for (const q of questions) {
    const pts = Number(q.points) || 1;
    maxScore += pts;
    const given = answerMap.has(Number(q.id)) ? answerMap.get(Number(q.id)) : '';
    let correct = false;
    if (q.item_type === 'mcq' || (Array.isArray(q.choices) && q.choices.length)) {
      const expected = String(q.answer || '').trim();
      correct = expected !== '' && given.toLowerCase() === expected.toLowerCase();
      if (correct) earned += pts;
    } else if (q.item_type === 'activity_prompt') {
      // Activity prompts are not auto-scored; count toward max only if teacher uses total
      // Leave earned at 0 for auto — teacher can override in Progress
    } else {
      // short_answer: no auto-score
    }
    detail.push({
      question_id: q.id,
      given,
      correct: q.item_type === 'mcq' || (Array.isArray(q.choices) && q.choices.length) ? correct : null,
      points: pts
    });
  }

  return { earned, maxScore, detail };
}

module.exports = {
  ensureQuizShareSchema,
  generateShareToken,
  publicQuestion,
  getAssessmentQuestions,
  scoreSubmission
};
