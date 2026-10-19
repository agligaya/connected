const db = require('../../db');

let schemaPromise = null;

async function ensureStudentRoleSchema() {
  if (schemaPromise) return schemaPromise;
  schemaPromise = (async () => {
    await db.query(
      `ALTER TABLE users MODIFY COLUMN role ENUM('admin','teacher','parent','student') NOT NULL`
    );
    try {
      await db.query('ALTER TABLE users ADD COLUMN student_id INT NULL');
    } catch (e) { /* exists */ }
    try {
      await db.query('ALTER TABLE users ADD UNIQUE KEY uq_users_student_id (student_id)');
    } catch (e) { /* exists */ }
  })().catch((error) => {
    schemaPromise = null;
    throw error;
  });
  return schemaPromise;
}

module.exports = { ensureStudentRoleSchema };
