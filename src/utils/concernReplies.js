const db = require('../../db');

let schemaPromise = null;

async function ensureConcernRepliesSchema() {
  if (schemaPromise) return schemaPromise;

  schemaPromise = (async () => {
    try {
      await db.query('ALTER TABLE concerns ADD COLUMN teacher_reply TEXT NULL');
    } catch (e) { /* exists */ }
    try {
      await db.query('ALTER TABLE concerns ADD COLUMN replied_at TIMESTAMP NULL');
    } catch (e) { /* exists */ }

    await db.query(`
      CREATE TABLE IF NOT EXISTS concern_replies (
        id INT AUTO_INCREMENT PRIMARY KEY,
        concern_id INT NOT NULL,
        sender_id INT NOT NULL,
        message TEXT NOT NULL,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_concern_replies_concern (concern_id),
        INDEX idx_concern_replies_sender (sender_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);

    try {
      await db.query(`
        INSERT INTO concern_replies (concern_id, sender_id, message, created_at)
        SELECT c.id,
               COALESCE(
                 c.teacher_id,
                 (SELECT u.id FROM users u WHERE u.role = 'admin' ORDER BY u.id ASC LIMIT 1),
                 c.parent_id
               ),
               c.teacher_reply,
               COALESCE(c.replied_at, c.updated_at, c.created_at)
        FROM concerns c
        WHERE c.teacher_reply IS NOT NULL
          AND TRIM(c.teacher_reply) <> ''
          AND NOT EXISTS (
            SELECT 1 FROM concern_replies cr
            WHERE cr.concern_id = c.id
              AND cr.message = c.teacher_reply
          )
      `);
    } catch (e) {
      console.error('[concern_replies] migrate teacher_reply:', e.message);
    }
  })();

  try {
    await schemaPromise;
  } catch (e) {
    schemaPromise = null;
    throw e;
  }
}

async function attachReplies(concerns) {
  await ensureConcernRepliesSchema();
  if (!concerns || !concerns.length) return concerns || [];

  const ids = concerns.map((c) => c.id);
  const placeholders = ids.map(() => '?').join(',');
  const [replies] = await db.query(
    `SELECT cr.id, cr.concern_id, cr.sender_id, cr.message, cr.created_at,
            CONCAT(u.first_name, ' ', u.last_name) AS sender_name,
            u.role AS sender_role
     FROM concern_replies cr
     JOIN users u ON u.id = cr.sender_id
     WHERE cr.concern_id IN (${placeholders})
     ORDER BY cr.created_at ASC, cr.id ASC`,
    ids
  );

  const byId = {};
  for (const reply of replies) {
    if (!byId[reply.concern_id]) byId[reply.concern_id] = [];
    byId[reply.concern_id].push(reply);
  }

  return concerns.map((c) => ({
    ...c,
    replies: byId[c.id] || []
  }));
}

function isConcernOpen(status) {
  const s = String(status || 'open').toLowerCase();
  return s !== 'resolved' && s !== 'closed';
}

/**
 * Insert a follow-up reply. Fails if concern is resolved/closed.
 * For teacher/admin senders, also mirrors into teacher_reply for older clients.
 */
async function addConcernReply({ concernId, senderId, senderRole, message }) {
  await ensureConcernRepliesSchema();

  const text = String(message || '').trim();
  if (!text) {
    const err = new Error('Reply message is required');
    err.status = 400;
    throw err;
  }

  const [rows] = await db.query(
    'SELECT id, parent_id, teacher_id, STATUS as status FROM concerns WHERE id = ?',
    [concernId]
  );
  if (!rows.length) {
    const err = new Error('Concern not found');
    err.status = 404;
    throw err;
  }

  const concern = rows[0];
  if (!isConcernOpen(concern.status)) {
    const err = new Error('This concern is resolved. New replies are closed.');
    err.status = 400;
    throw err;
  }

  const [result] = await db.query(
    `INSERT INTO concern_replies (concern_id, sender_id, message)
     VALUES (?, ?, ?)`,
    [concernId, senderId, text]
  );

  if (senderRole === 'teacher' || senderRole === 'admin') {
    await db.query(
      `UPDATE concerns
       SET teacher_reply = ?, replied_at = NOW(),
           teacher_id = COALESCE(teacher_id, ?)
       WHERE id = ?`,
      [text, senderRole === 'teacher' ? senderId : null, concernId]
    );
  }

  return { id: result.insertId, concern };
}

ensureConcernRepliesSchema().catch((e) => {
  console.error('[concern_replies] schema init:', e.message);
});

module.exports = {
  ensureConcernRepliesSchema,
  attachReplies,
  addConcernReply,
  isConcernOpen
};
