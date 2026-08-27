const db = require('../../db');

let schemaPromise = null;

async function ensureQuestionBankSchema(conn = db) {
  if (schemaPromise) return schemaPromise;
  schemaPromise = (async () => {
    await conn.query(`
      CREATE TABLE IF NOT EXISTS quiz_sets (
        id INT AUTO_INCREMENT PRIMARY KEY,
        teacher_id INT NOT NULL,
        title VARCHAR(255) NOT NULL,
        subject_id INT NULL,
        grade_level INT NOT NULL,
        lesson_plan_id INT NULL,
        lesson_title VARCHAR(255) NULL,
        ai_recommendation_id INT NULL,
        source ENUM('ai','manual') NOT NULL DEFAULT 'manual',
        status ENUM('active','archived') NOT NULL DEFAULT 'active',
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        KEY idx_qs_teacher (teacher_id, status),
        KEY idx_qs_grade (teacher_id, grade_level),
        KEY idx_qs_ai (ai_recommendation_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);

    await conn.query(`
      CREATE TABLE IF NOT EXISTS question_bank (
        id INT AUTO_INCREMENT PRIMARY KEY,
        teacher_id INT NOT NULL,
        quiz_set_id INT NULL,
        subject_id INT NULL,
        grade_level INT NOT NULL,
        lesson_plan_id INT NULL,
        lesson_title VARCHAR(255) NULL,
        item_type VARCHAR(32) NOT NULL DEFAULT 'mcq',
        question TEXT NOT NULL,
        choices JSON NULL,
        answer VARCHAR(500) NULL,
        points DECIMAL(8,2) NOT NULL DEFAULT 1,
        source ENUM('ai','manual') NOT NULL DEFAULT 'manual',
        ai_recommendation_id INT NULL,
        status ENUM('active','archived') NOT NULL DEFAULT 'active',
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        KEY idx_qb_teacher (teacher_id, status),
        KEY idx_qb_set (quiz_set_id),
        KEY idx_qb_grade_subject (teacher_id, grade_level, subject_id),
        KEY idx_qb_lesson (lesson_plan_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);

    try {
      await conn.query(`ALTER TABLE question_bank ADD COLUMN quiz_set_id INT NULL`);
    } catch (e) { /* exists */ }
    try {
      await conn.query(
        `ALTER TABLE question_bank MODIFY item_type VARCHAR(32) NOT NULL DEFAULT 'mcq'`
      );
    } catch (e) { /* ignore */ }

    await conn.query(`
      CREATE TABLE IF NOT EXISTS assessment_questions (
        id INT AUTO_INCREMENT PRIMARY KEY,
        assessment_id INT NOT NULL,
        question_bank_id INT NULL,
        sort_order INT NOT NULL DEFAULT 0,
        item_type VARCHAR(32) NOT NULL DEFAULT 'mcq',
        question TEXT NOT NULL,
        choices JSON NULL,
        answer VARCHAR(500) NULL,
        points DECIMAL(8,2) NOT NULL DEFAULT 1,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        KEY idx_aq_assessment (assessment_id),
        KEY idx_aq_bank (question_bank_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);
    try {
      await conn.query(
        `ALTER TABLE assessment_questions MODIFY item_type VARCHAR(32) NOT NULL DEFAULT 'mcq'`
      );
    } catch (e) { /* ignore */ }
  })().catch((e) => {
    schemaPromise = null;
    throw e;
  });
  return schemaPromise;
}

function normalizeChoices(raw) {
  if (raw == null) return null;
  if (Array.isArray(raw)) {
    const list = raw.map((c) => String(c ?? '').trim()).filter(Boolean).slice(0, 8);
    return list.length ? list : null;
  }
  if (typeof raw === 'string') {
    try {
      return normalizeChoices(JSON.parse(raw));
    } catch {
      return null;
    }
  }
  return null;
}

function parseChoicesColumn(raw) {
  if (raw == null) return null;
  if (Array.isArray(raw)) return raw;
  if (typeof raw === 'string') {
    try {
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : null;
    } catch {
      return null;
    }
  }
  return null;
}

function quizItemsFromDraft(part) {
  if (!part || typeof part !== 'object') return [];
  const items = Array.isArray(part.items) ? part.items : [];
  return items
    .map((it) => {
      const question = String(it?.question || '').trim();
      if (!question) return null;
      const choices = normalizeChoices(it.choices);
      const answer = it.answer != null ? String(it.answer).trim().slice(0, 500) : null;
      const points = Math.max(0.5, Number(it.points) || 1);
      let item_type = String(it.type || it.item_type || '').toLowerCase();
      if (!['mcq', 'identification', 'enumeration', 'short_answer', 'activity_prompt'].includes(item_type)) {
        item_type = choices && choices.length ? 'mcq' : 'identification';
      }
      return {
        item_type,
        question,
        choices: item_type === 'mcq' ? choices : null,
        answer,
        points
      };
    })
    .filter(Boolean);
}

function activityPromptFromDraft(part) {
  if (!part || typeof part !== 'object') return null;
  const question = String(part.description || part.title || '').trim();
  if (!question) return null;
  return {
    item_type: 'activity_prompt',
    question,
    choices: null,
    answer: null,
    points: Math.max(1, Number(part.max_score) || 20)
  };
}

async function insertBankItem(teacherId, setId, meta, item) {
  const [result] = await db.query(
    `INSERT INTO question_bank
      (teacher_id, quiz_set_id, subject_id, grade_level, lesson_plan_id, lesson_title,
       item_type, question, choices, answer, points, source, ai_recommendation_id)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      teacherId,
      setId,
      meta.subjectId || null,
      Number(meta.gradeLevel),
      meta.lessonPlanId || null,
      meta.lessonTitle ? String(meta.lessonTitle).slice(0, 255) : null,
      item.item_type,
      item.question,
      item.choices ? JSON.stringify(item.choices) : null,
      item.answer,
      item.points,
      meta.source || 'ai',
      meta.aiRecommendationId || null
    ]
  );
  return result.insertId;
}

/**
 * Create a quiz set from an AI draft and attach all items under it.
 */
async function saveDraftPartsToBank({
  teacherId,
  subjectId,
  gradeLevel,
  lessonPlanId,
  lessonTitle,
  aiRecommendationId,
  content,
  types = ['quiz', 'activity']
}) {
  await ensureQuestionBankSchema();

  if (aiRecommendationId) {
    const [[existingSet]] = await db.query(
      `SELECT id, title FROM quiz_sets
       WHERE teacher_id = ? AND ai_recommendation_id = ? AND status = 'active'
       LIMIT 1`,
      [teacherId, aiRecommendationId]
    );
    if (existingSet) {
      const [items] = await db.query(
        `SELECT id FROM question_bank WHERE quiz_set_id = ? AND status = 'active'`,
        [existingSet.id]
      );
      return {
        created: 0,
        skipped: items.length,
        ids: items.map((r) => r.id),
        quiz_set_id: existingSet.id,
        title: existingSet.title,
        already_exists: true
      };
    }
  }

  const quizTitle =
    (content?.quiz && content.quiz.title) ||
    (lessonTitle ? `Quiz — ${lessonTitle}` : 'Quiz set');
  const setTitle = String(quizTitle).trim().slice(0, 255) || 'Quiz set';

  const [setResult] = await db.query(
    `INSERT INTO quiz_sets
      (teacher_id, title, subject_id, grade_level, lesson_plan_id, lesson_title,
       ai_recommendation_id, source)
     VALUES (?, ?, ?, ?, ?, ?, ?, 'ai')`,
    [
      teacherId,
      setTitle,
      subjectId || null,
      Number(gradeLevel),
      lessonPlanId || null,
      lessonTitle ? String(lessonTitle).slice(0, 255) : null,
      aiRecommendationId || null
    ]
  );
  const setId = setResult.insertId;
  const meta = {
    subjectId,
    gradeLevel,
    lessonPlanId,
    lessonTitle,
    aiRecommendationId,
    source: 'ai'
  };

  const inserted = [];

  if (types.includes('quiz') && content?.quiz) {
    for (const item of quizItemsFromDraft(content.quiz)) {
      const id = await insertBankItem(teacherId, setId, meta, item);
      inserted.push({ id, skipped: false, item_type: item.item_type });
    }
  }

  if (types.includes('activity') && content?.activity) {
    const prompt = activityPromptFromDraft(content.activity);
    if (prompt) {
      const id = await insertBankItem(teacherId, setId, meta, prompt);
      inserted.push({ id, skipped: false, item_type: prompt.item_type });
    }
  }

  // Drop empty set
  if (!inserted.length) {
    await db.query(`UPDATE quiz_sets SET status = 'archived' WHERE id = ?`, [setId]);
    return { created: 0, skipped: 0, ids: [], quiz_set_id: null, title: setTitle };
  }

  return {
    created: inserted.length,
    skipped: 0,
    ids: inserted.map((r) => r.id),
    quiz_set_id: setId,
    title: setTitle
  };
}

function formatBankRow(row) {
  if (!row) return row;
  return {
    ...row,
    choices: parseChoicesColumn(row.choices),
    points: Number(row.points) || 1
  };
}

/**
 * Group legacy flat bank items (no quiz_set_id) into quiz_sets once.
 */
async function migrateOrphanBankItems(teacherId) {
  await ensureQuestionBankSchema();
  const [orphans] = await db.query(
    `SELECT * FROM question_bank
     WHERE teacher_id = ? AND status = 'active' AND quiz_set_id IS NULL
     ORDER BY id ASC`,
    [teacherId]
  );
  if (!orphans.length) return 0;

  const groups = new Map();
  for (const row of orphans) {
    const key = [
      row.ai_recommendation_id || 'x',
      row.lesson_plan_id || 'x',
      row.grade_level,
      row.subject_id || 'x',
      row.lesson_title || ''
    ].join('|');
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(row);
  }

  let setsCreated = 0;
  for (const items of groups.values()) {
    const first = items[0];
    const title = first.lesson_title
      ? `Quiz — ${String(first.lesson_title).slice(0, 220)}`
      : `Saved items (${items.length})`;
    const [setResult] = await db.query(
      `INSERT INTO quiz_sets
        (teacher_id, title, subject_id, grade_level, lesson_plan_id, lesson_title,
         ai_recommendation_id, source)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        teacherId,
        title.slice(0, 255),
        first.subject_id || null,
        Number(first.grade_level),
        first.lesson_plan_id || null,
        first.lesson_title || null,
        first.ai_recommendation_id || null,
        first.source === 'ai' ? 'ai' : 'manual'
      ]
    );
    const setId = setResult.insertId;
    setsCreated += 1;
    const ids = items.map((i) => i.id);
    const placeholders = ids.map(() => '?').join(',');
    await db.query(
      `UPDATE question_bank SET quiz_set_id = ? WHERE id IN (${placeholders})`,
      [setId, ...ids]
    );
  }
  return setsCreated;
}

function bankItemTypeLabel(type) {
  const t = String(type || '').toLowerCase();
  if (t === 'mcq') return 'Multiple choice';
  if (t === 'identification') return 'Identification';
  if (t === 'enumeration') return 'Enumeration';
  if (t === 'short_answer') return 'Short answer';
  if (t === 'activity_prompt') return 'Activity';
  return type ? String(type) : 'Multiple choice';
}

const TYPE_ORDER = ['mcq', 'identification', 'enumeration', 'short_answer', 'activity_prompt'];

function groupItemsByType(items) {
  const map = new Map();
  for (const item of items) {
    const key = item.item_type || 'mcq';
    if (!map.has(key)) map.set(key, []);
    map.get(key).push(item);
  }
  const ordered = [];
  for (const key of TYPE_ORDER) {
    if (map.has(key)) {
      ordered.push({ item_type: key, label: bankItemTypeLabel(key), items: map.get(key) });
      map.delete(key);
    }
  }
  for (const [key, list] of map.entries()) {
    ordered.push({ item_type: key, label: bankItemTypeLabel(key), items: list });
  }
  return ordered;
}

/**
 * Top-level folders inside a set: Quizzes vs Activity.
 */
function groupItemsByCategory(items) {
  const quizItems = [];
  const activityItems = [];
  for (const item of items || []) {
    if (String(item.item_type) === 'activity_prompt') activityItems.push(item);
    else quizItems.push(item);
  }
  const categories = [];
  if (quizItems.length) {
    categories.push({
      category: 'quizzes',
      label: 'Quizzes',
      item_count: quizItems.length,
      groups: groupItemsByType(quizItems)
    });
  }
  if (activityItems.length) {
    categories.push({
      category: 'activity',
      label: 'Activity',
      item_count: activityItems.length,
      groups: groupItemsByType(activityItems)
    });
  }
  return categories;
}

module.exports = {
  ensureQuestionBankSchema,
  normalizeChoices,
  parseChoicesColumn,
  quizItemsFromDraft,
  activityPromptFromDraft,
  saveDraftPartsToBank,
  formatBankRow,
  bankItemTypeLabel,
  groupItemsByType,
  groupItemsByCategory,
  migrateOrphanBankItems,
  TYPE_ORDER
};
