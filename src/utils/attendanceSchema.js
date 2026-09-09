const db = require('../../db');

let schemaPromise = null;

/**
 * Extends attendance for AM/PM sessions and optional subject (Grades 4–6).
 * Unique key: (student_id, DATE, session, subject_key) where subject_key = IFNULL(subject_id, 0).
 */
async function ensureAttendanceSchema(conn = db) {
  if (schemaPromise) return schemaPromise;
  schemaPromise = (async () => {
    try {
      const [cols] = await conn.query(
        `SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS
         WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'attendance'`
      );
      const names = new Set(cols.map((c) => c.COLUMN_NAME));

      if (!names.has('session')) {
        await conn.query(
          `ALTER TABLE attendance
           ADD COLUMN session ENUM('AM','PM') NOT NULL DEFAULT 'AM' AFTER \`DATE\``
        );
      }

      if (!names.has('subject_id')) {
        await conn.query(
          `ALTER TABLE attendance
           ADD COLUMN subject_id INT NULL DEFAULT NULL AFTER session`
        );
      }

      if (!names.has('subject_key')) {
        await conn.query(
          `ALTER TABLE attendance
           ADD COLUMN subject_key INT
             GENERATED ALWAYS AS (IFNULL(subject_id, 0)) STORED AFTER subject_id`
        );
      }

      const [indexes] = await conn.query(`SHOW INDEX FROM attendance`);
      const indexNames = new Set(indexes.map((i) => i.Key_name));

      // Old unique (student_id, DATE) blocks AM+PM / subject rows.
      // It may also back the student_id FK — drop FK, replace index, restore FK.
      if (indexNames.has('student_id')) {
        const studentIdx = indexes.filter((i) => i.Key_name === 'student_id');
        const coversDate = studentIdx.some(
          (i) => String(i.Column_name).toUpperCase() === 'DATE'
        );
        if (coversDate) {
          try {
            await conn.query('ALTER TABLE attendance DROP FOREIGN KEY `attendance_ibfk_1`');
          } catch (e) {
            console.error('[attendanceSchema] drop FK attendance_ibfk_1:', e.message);
          }
          try {
            await conn.query('ALTER TABLE attendance DROP INDEX `student_id`');
          } catch (e) {
            console.error('[attendanceSchema] drop student_id index:', e.message);
          }
          try {
            await conn.query(
              'ALTER TABLE attendance ADD KEY `idx_attendance_student` (`student_id`)'
            );
          } catch (e) {
            console.error('[attendanceSchema] add idx_attendance_student:', e.message);
          }
          try {
            await conn.query(
              `ALTER TABLE attendance
               ADD CONSTRAINT \`attendance_ibfk_1\`
               FOREIGN KEY (\`student_id\`) REFERENCES \`students\` (\`id\`) ON DELETE CASCADE`
            );
          } catch (e) {
            console.error('[attendanceSchema] restore FK attendance_ibfk_1:', e.message);
          }
        }
      }

      const [indexes2] = await conn.query(`SHOW INDEX FROM attendance`);
      const indexNames2 = new Set(indexes2.map((i) => i.Key_name));
      if (!indexNames2.has('uq_attendance_slot')) {
        await conn.query(
          `ALTER TABLE attendance
           ADD UNIQUE KEY uq_attendance_slot (student_id, \`DATE\`, session, subject_key)`
        );
      }

      // Non-unique lookup helpers
      if (!indexNames2.has('idx_attendance_subject')) {
        try {
          await conn.query(
            'ALTER TABLE attendance ADD KEY idx_attendance_subject (subject_id)'
          );
        } catch (_) { /* ignore */ }
      }
    } catch (e) {
      console.error('[attendanceSchema] migrate:', e.message);
      schemaPromise = null;
      throw e;
    }
  })();
  return schemaPromise;
}

/** Local calendar date in Asia/Manila. */
function manilaISODate(d = new Date()) {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Manila',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).format(d);
}

/** Normalize MySQL DATE / JS Date to YYYY-MM-DD without UTC day-shift. */
function sqlDateToISO(value) {
  if (value == null) return '';
  if (value instanceof Date) {
    const y = value.getFullYear();
    const m = String(value.getMonth() + 1).padStart(2, '0');
    const day = String(value.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  }
  const s = String(value);
  if (/^\d{4}-\d{2}-\d{2}/.test(s)) return s.slice(0, 10);
  const parsed = new Date(s);
  if (!Number.isNaN(parsed.getTime())) {
    const y = parsed.getFullYear();
    const m = String(parsed.getMonth() + 1).padStart(2, '0');
    const day = String(parsed.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  }
  return s.slice(0, 10);
}

/** Monday (YYYY-MM-DD) of the week containing isoDate. */
function weekStartMonday(isoDate) {
  const [y, m, d] = String(isoDate).split('-').map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d));
  const dow = dt.getUTCDay(); // 0 Sun .. 6 Sat
  const offset = dow === 0 ? -6 : 1 - dow;
  dt.setUTCDate(dt.getUTCDate() + offset);
  return dt.toISOString().slice(0, 10);
}

/** Mon–Fri ISO dates for the week starting on weekStart (Monday). */
function weekdaysMonFri(weekStart) {
  const [y, m, d] = String(weekStart).split('-').map(Number);
  const out = [];
  for (let i = 0; i < 5; i += 1) {
    const dt = new Date(Date.UTC(y, m - 1, d + i));
    out.push(dt.toISOString().slice(0, 10));
  }
  return out;
}

function addDaysISO(isoDate, days) {
  const [y, m, d] = String(isoDate).split('-').map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d + days));
  return dt.toISOString().slice(0, 10);
}

function isSubjectGrade(grade) {
  return Number(grade) >= 4;
}

function normalizeSession(session, { subjectMode = false } = {}) {
  const s = String(session || '').toUpperCase();
  if (subjectMode) return 'AM'; // one slot per subject/day
  if (s === 'PM') return 'PM';
  return 'AM';
}

function statusLetter(status) {
  const st = String(status || '').toLowerCase();
  if (st === 'present') return 'P';
  if (st === 'absent') return 'A';
  if (st === 'late') return 'L';
  if (st === 'excused') return 'E';
  return '';
}

module.exports = {
  ensureAttendanceSchema,
  manilaISODate,
  sqlDateToISO,
  weekStartMonday,
  weekdaysMonFri,
  addDaysISO,
  isSubjectGrade,
  normalizeSession,
  statusLetter
};
