const fs = require('fs');
const path = require('path');
const db = require('../../db');

let schemaPromise = null;

async function ensureAiRecommendationsSchema(conn = db) {
  if (schemaPromise) return schemaPromise;
  schemaPromise = (async () => {
    await conn.query(`
      CREATE TABLE IF NOT EXISTS ai_recommendations (
        id INT AUTO_INCREMENT PRIMARY KEY,
        lesson_plan_id INT NOT NULL,
        teacher_id INT NOT NULL,
        subject_id INT NULL,
        grade_level INT NOT NULL,
        status ENUM('pending','approved','rejected') NOT NULL DEFAULT 'pending',
        provider VARCHAR(32) NOT NULL DEFAULT 'mock',
        source_excerpt TEXT NULL,
        content JSON NOT NULL,
        assessment_id INT NULL,
        approved_type VARCHAR(20) NULL,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        KEY idx_ai_rec_teacher (teacher_id, status),
        KEY idx_ai_rec_lesson (lesson_plan_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);
  })().catch((e) => {
    schemaPromise = null;
    throw e;
  });
  return schemaPromise;
}

function isAiDryRun() {
  const v = String(process.env.AI_DRY_RUN || '').toLowerCase();
  if (v === '0' || v === 'false' || v === 'no') return false;
  if (v === '1' || v === 'true' || v === 'yes') return true;
  // Default: dry-run when no API key
  return !String(process.env.OPENAI_API_KEY || '').trim();
}

function isAiConfigured() {
  return !!String(process.env.OPENAI_API_KEY || '').trim();
}

function getOpenAiModel() {
  return String(process.env.OPENAI_MODEL || 'gpt-4o-mini').trim() || 'gpt-4o-mini';
}

function publicFileToDisk(filePath) {
  if (!filePath) return null;
  const rel = String(filePath).replace(/^\//, '');
  return path.join(__dirname, '../../public', rel);
}

async function extractTextFromFile(filePath) {
  const disk = publicFileToDisk(filePath);
  if (!disk || !fs.existsSync(disk)) return '';

  const ext = path.extname(disk).toLowerCase();
  try {
    if (ext === '.pdf') {
      const pdfParse = require('pdf-parse');
      const data = await pdfParse(fs.readFileSync(disk));
      return String(data?.text || '').trim();
    }
    if (ext === '.docx') {
      const mammoth = require('mammoth');
      const result = await mammoth.extractRawText({ path: disk });
      return String(result?.value || '').trim();
    }
    if (ext === '.doc') {
      // Legacy .doc is binary; skip binary noise
      return '';
    }
  } catch (e) {
    console.warn('[ai] file extract failed:', e.message);
  }
  return '';
}

function buildSourceText({ title, objectives, fileText }) {
  const parts = [];
  if (title) parts.push(`Lesson title: ${title}`);
  if (objectives) parts.push(`Learning objectives:\n${objectives}`);
  if (fileText) {
    const clipped = String(fileText).replace(/\s+/g, ' ').trim().slice(0, 6000);
    if (clipped) parts.push(`Lesson plan excerpt:\n${clipped}`);
  }
  return parts.join('\n\n').trim();
}

function mockGenerate({ title, gradeLevel, subjectName, sourceText }) {
  const topic = title || 'this lesson';
  const subject = subjectName || 'the subject';
  const grade = Number(gradeLevel) || 1;
  const mcqCount = grade <= 2 ? 3 : grade <= 4 ? 4 : 5;
  const idCount = grade <= 2 ? 1 : 2;
  const enumCount = grade <= 3 ? 1 : 2;
  const quizMax = mcqCount + idCount + enumCount;

  const items = [];

  for (let i = 1; i <= mcqCount; i++) {
    items.push({
      type: 'mcq',
      question: i === 1
        ? `What is the main idea of "${topic}" for Grade ${grade} ${subject}?`
        : i === 2
          ? `Which statement best shows understanding of ${topic}?`
          : `Based on the objectives, students should practice ${topic} by:`,
      choices: [
        'A key concept from the lesson',
        'An unrelated topic',
        'A homework rule',
        'A recess activity'
      ],
      answer: 'A key concept from the lesson',
      points: 1
    });
  }

  for (let i = 1; i <= idCount; i++) {
    items.push({
      type: 'identification',
      question: i === 1
        ? `Identify one important term from the lesson "${topic}".`
        : `Name the main skill practiced in "${topic}" (${subject}).`,
      choices: null,
      answer: i === 1 ? `Key term from ${topic}` : `Skill from ${topic}`,
      points: 1
    });
  }

  for (let i = 1; i <= enumCount; i++) {
    items.push({
      type: 'enumeration',
      question: i === 1
        ? `List 2–3 things you learned about "${topic}".`
        : `Enumerate steps or examples related to "${topic}" for Grade ${grade}.`,
      choices: null,
      answer: 'Possible answers: concepts or steps from the lesson objectives',
      points: 2
    });
  }

  return {
    quiz: {
      title: `Quiz: ${topic}`,
      max_score: quizMax,
      items,
      notes:
        'Mock draft mixes Multiple choice, Identification, and Enumeration. Save to Classwork, then pick items for Progress.'
    },
    activity: {
      title: `Activity: Explore ${topic}`,
      max_score: grade <= 2 ? 10 : 20,
      description:
        `Students work in pairs on a short Grade ${grade} task about "${topic}" (${subject}). ` +
        `They write or draw examples, share with a partner, then present one idea. ` +
        `Teacher scores with a simple checklist (participation, correctness, effort).`,
      notes: sourceText
        ? 'Generated from lesson title/objectives (and file text if available).'
        : 'Generated from lesson title/objectives only.'
    },
    exam: null
  };
}

function safeParseJsonContent(raw) {
  if (raw == null) return null;
  if (typeof raw === 'object') return raw;
  try {
    return JSON.parse(String(raw));
  } catch {
    return null;
  }
}

function normalizeGeneratedContent(parsed, fallbackMeta) {
  const base = mockGenerate(fallbackMeta);
  if (!parsed || typeof parsed !== 'object') return base;

  return {
    quiz: {
      ...base.quiz,
      ...(parsed.quiz || {}),
      items: Array.isArray(parsed.quiz?.items) && parsed.quiz.items.length
        ? parsed.quiz.items
        : base.quiz.items
    },
    activity: {
      ...base.activity,
      ...(parsed.activity || {})
    },
    exam: null
  };
}

async function callOpenAiGenerate({ title, gradeLevel, subjectName, sourceText }) {
  const apiKey = String(process.env.OPENAI_API_KEY || '').trim();
  if (!apiKey) throw new Error('OPENAI_API_KEY is not set');

  const grade = Number(gradeLevel) || 1;
  const mcqItems = grade <= 2 ? '3' : grade <= 4 ? '4' : '5';
  const idItems = grade <= 2 ? '1–2' : '2';
  const enumItems = grade <= 3 ? '1' : '1–2';

  const system = `You are an education assistant for a Philippine Montessori elementary school (Grades 1–6).
Generate age-appropriate QUIZ and ACTIVITY drafts from ONE lesson plan only.
Do NOT generate a full exam — exams must combine several lessons and are created separately by the teacher.

Return ONLY valid JSON with keys: quiz, activity.
- quiz: {
    title,
    max_score (number),
    items: [
      // Mix of types. Each item MUST include "type".
      { type: "mcq", question, choices: [exactly 4 short strings], answer (must match one choice), points },
      { type: "identification", question, answer (short expected word/phrase), points },
      { type: "enumeration", question, answer (brief expected list tip for the teacher), points }
    ],
    notes (short teacher tip)
  }
- activity: {
    title,
    max_score (number),
    description (classroom-friendly steps a teacher can run),
    notes (how to score simply, e.g. checklist)
  }

Rules by grade level:
- Grade ${grade}: use vocabulary and sentence length suitable for that grade.
- Quiz mix: about ${mcqItems} mcq, ${idItems} identification, ${enumItems} enumeration — all aligned to THIS lesson's objectives.
- MCQ: one clear correct answer; distractors plausible but clearly wrong.
- Identification: one short factual answer (term, name, number, or phrase).
- Enumeration: ask for a short list (2–4 items); put a scoring tip in answer.
- Activity: short (10–25 min), concrete, Montessori-friendly (hands-on / collaborative when possible).
- No student names, LRNs, or private data.
- Language clear for elementary teachers and learners.
- Content must fit THIS single lesson only.`;

  const user = `Grade: ${gradeLevel}
Subject: ${subjectName || 'General'}
Lesson: ${title}

Source material (no student PII):
${sourceText || '(title/objectives only)'}`;

  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: getOpenAiModel(),
      temperature: 0.4,
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: system },
        { role: 'user', content: user }
      ]
    })
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const msg = data?.error?.message || `OpenAI HTTP ${res.status}`;
    throw new Error(msg);
  }

  const text = data?.choices?.[0]?.message?.content || '{}';
  let parsed;
  try {
    parsed = JSON.parse(text);
  } catch {
    throw new Error('OpenAI returned invalid JSON');
  }

  return normalizeGeneratedContent(parsed, { title, gradeLevel, subjectName, sourceText });
}

/**
 * Generate quiz/activity drafts for a single lesson plan.
 * Uses OpenAI when configured and AI_DRY_RUN is false; otherwise mock.
 * Exams are intentionally not generated from one lesson.
 */
async function generateRecommendationsForLesson({
  lessonPlan,
  subjectName = null
}) {
  const fileText = await extractTextFromFile(lessonPlan.file_path);
  const sourceText = buildSourceText({
    title: lessonPlan.title,
    objectives: lessonPlan.objectives,
    fileText
  });

  if (!sourceText) {
    throw Object.assign(new Error('Lesson plan needs a title, objectives, or readable file'), {
      status: 400
    });
  }

  const meta = {
    title: lessonPlan.title,
    gradeLevel: lessonPlan.grade_level,
    subjectName,
    sourceText
  };

  let provider = 'mock';
  let content;

  if (!isAiDryRun() && isAiConfigured()) {
    content = await callOpenAiGenerate(meta);
    provider = 'openai';
  } else {
    content = mockGenerate(meta);
    provider = 'mock';
  }

  return {
    provider,
    sourceExcerpt: sourceText.slice(0, 2000),
    content
  };
}

function pickDraftPart(content, type) {
  const c = safeParseJsonContent(content) || {};
  if (type === 'quiz') return c.quiz || null;
  if (type === 'activity') return c.activity || null;
  if (type === 'exam') return c.exam || null;
  return null;
}

module.exports = {
  ensureAiRecommendationsSchema,
  isAiDryRun,
  isAiConfigured,
  generateRecommendationsForLesson,
  safeParseJsonContent,
  pickDraftPart,
  extractTextFromFile,
  buildSourceText
};
