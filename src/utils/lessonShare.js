const db = require('../../db');
const { schoolYear } = require('../config');
const { ensureAnnouncementAudience } = require('./announcements');

let schemaPromise = null;

/** Adds lesson_plans.shared_with_students (teachers opt in per lesson). */
async function ensureLessonShareSchema(conn = db) {
  if (schemaPromise) return schemaPromise;
  schemaPromise = (async () => {
    try {
      await conn.query(
        'ALTER TABLE lesson_plans ADD COLUMN shared_with_students TINYINT(1) NOT NULL DEFAULT 0'
      );
    } catch (e) {
      if (e && e.code !== 'ER_DUP_FIELDNAME') {
        schemaPromise = null;
        throw e;
      }
    }
  })();
  return schemaPromise;
}

function fileTypeLabel(filePath) {
  const ext = String(filePath || '').split('.').pop().toLowerCase();
  if (ext === 'pdf') return 'PDF';
  if (ext === 'doc' || ext === 'docx') return 'Word';
  return ext.toUpperCase();
}

/**
 * Lessons teachers shared with students, for one student's class.
 * A lesson shows up only when its uploader actually teaches that grade and section
 * (subject teacher for the lesson's subject, class adviser, or homeroom teacher),
 * so a lesson from one section's teacher never reaches a section they do not teach.
 */
async function loadSharedLessons(student, schoolYear, subjectId = null) {
  await ensureLessonShareSchema();
  const params = [
    student.grade_level,
    student.grade_level, student.section, schoolYear, schoolYear,
    student.grade_level, student.section
  ];
  let subjectSql = '';
  if (subjectId) {
    subjectSql = ' AND lp.subject_id = ?';
    params.push(subjectId);
  }
  const [rows] = await db.query(
    `SELECT lp.id, lp.title, lp.objectives, lp.file_path, lp.created_at,
            lp.subject_id, sub.NAME AS subject_name,
            CONCAT(u.first_name, ' ', u.last_name) AS teacher_name
     FROM lesson_plans lp
     JOIN users u ON u.id = lp.uploaded_by
     LEFT JOIN subjects sub ON sub.id = lp.subject_id
     WHERE lp.shared_with_students = 1
       AND lp.file_path IS NOT NULL AND lp.file_path <> ''
       AND lp.grade_level = ?
       AND (
         EXISTS (
           SELECT 1 FROM teacher_assignments ta
           WHERE ta.teacher_id = lp.uploaded_by
             AND ta.grade_level = ?
             AND TRIM(UPPER(ta.section)) = TRIM(UPPER(?))
             AND (ta.subject_id IS NULL OR lp.subject_id IS NULL OR ta.subject_id = lp.subject_id)
             AND (
               ta.school_year = ?
               OR NOT EXISTS (
                 SELECT 1 FROM teacher_assignments cur
                 WHERE cur.teacher_id = lp.uploaded_by
                   AND cur.grade_level = lp.grade_level
                   AND cur.school_year = ?
                   AND (cur.subject_id IS NULL OR lp.subject_id IS NULL OR cur.subject_id = lp.subject_id)
               )
             )
         )
         OR EXISTS (
           SELECT 1 FROM teacher_profiles tp
           WHERE tp.user_id = lp.uploaded_by
             AND tp.homeroom_grade = ?
             AND TRIM(UPPER(tp.homeroom_section)) = TRIM(UPPER(?))
         )
       )
       ${subjectSql}
     ORDER BY lp.created_at DESC, lp.id DESC`,
    params
  );
  return rows.map((row) => ({
    id: row.id,
    title: row.title,
    objectives: row.objectives || null,
    file_path: row.file_path,
    file_type: fileTypeLabel(row.file_path),
    created_at: row.created_at,
    subject_id: row.subject_id || null,
    subject_name: row.subject_name || null,
    teacher_name: row.teacher_name || null,
    used_in: []
  }));
}

/**
 * Posts a "New material" notice to the students who can see this lesson (one per class the
 * teacher handles for the lesson's grade/subject). The file itself lives in the subject's
 * Materials tab; the notice only tells students it is there. Does nothing if one already exists.
 */
async function announceSharedLesson(lessonId) {
  await ensureLessonShareSchema();
  await ensureAnnouncementAudience();
  const [[lp]] = await db.query(
    `SELECT lp.id, lp.title, lp.subject_id, lp.grade_level, lp.uploaded_by, sub.NAME AS subject_name
     FROM lesson_plans lp
     LEFT JOIN subjects sub ON sub.id = lp.subject_id
     WHERE lp.id = ?`,
    [lessonId]
  );
  if (!lp) return 0;
  const [existing] = await db.query('SELECT id FROM announcements WHERE lesson_plan_id = ? LIMIT 1', [lp.id]);
  if (existing.length) return 0;

  // Prefer current school year; if this teacher has no assignment there yet, use any year
  // so share notices still reach the classes they actually teach.
  let [sections] = await db.query(
    `SELECT DISTINCT UPPER(TRIM(ta.section)) AS section
     FROM teacher_assignments ta
     WHERE ta.teacher_id = ? AND ta.grade_level = ? AND ta.school_year = ?
       AND ta.section IS NOT NULL AND TRIM(ta.section) <> ''
       AND (ta.subject_id IS NULL OR ? IS NULL OR ta.subject_id = ?)
     UNION
     SELECT UPPER(TRIM(tp.homeroom_section))
     FROM teacher_profiles tp
     WHERE tp.user_id = ? AND tp.homeroom_grade = ?
       AND tp.homeroom_section IS NOT NULL AND TRIM(tp.homeroom_section) <> ''`,
    [lp.uploaded_by, lp.grade_level, schoolYear, lp.subject_id, lp.subject_id, lp.uploaded_by, lp.grade_level]
  );
  if (!sections.length) {
    [sections] = await db.query(
      `SELECT DISTINCT UPPER(TRIM(ta.section)) AS section
       FROM teacher_assignments ta
       WHERE ta.teacher_id = ? AND ta.grade_level = ?
         AND ta.section IS NOT NULL AND TRIM(ta.section) <> ''
         AND (ta.subject_id IS NULL OR ? IS NULL OR ta.subject_id = ?)
       UNION
       SELECT UPPER(TRIM(tp.homeroom_section))
       FROM teacher_profiles tp
       WHERE tp.user_id = ? AND tp.homeroom_grade = ?
         AND tp.homeroom_section IS NOT NULL AND TRIM(tp.homeroom_section) <> ''`,
      [lp.uploaded_by, lp.grade_level, lp.subject_id, lp.subject_id, lp.uploaded_by, lp.grade_level]
    );
  }

  const where = lp.subject_name || 'your subject';
  const title = `New material: ${lp.title}`;
  const body = `Your teacher shared a new material in ${where}. Open ${where} and go to Materials to view it.`;
  let posted = 0;
  for (const row of sections) {
    await db.query(
      `INSERT INTO announcements
         (sender_id, title, body, scope, target_grade, target_section, priority, audience, lesson_plan_id)
       VALUES (?, ?, ?, 'class_specific', ?, ?, 'normal', 'students', ?)`,
      [lp.uploaded_by, title, body, lp.grade_level, row.section, lp.id]
    );
    posted += 1;
  }
  return posted;
}

/** Removes the "New material" notices for a lesson (unshared or deleted). */
async function removeLessonAnnouncements(lessonId) {
  await ensureAnnouncementAudience();
  await db.query('DELETE FROM announcements WHERE lesson_plan_id = ?', [lessonId]);
}

module.exports = {
  ensureLessonShareSchema,
  loadSharedLessons,
  fileTypeLabel,
  announceSharedLesson,
  removeLessonAnnouncements
};
