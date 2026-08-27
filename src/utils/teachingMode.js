const db = require('../../db');

const MODE_VALUES = ['homeroom', 'subject', 'class_adviser', 'subject_teacher', 'both'];

let schemaPromise = null;

async function ensureTeachingModeEnum(conn = db) {
  if (schemaPromise) return schemaPromise;
  schemaPromise = (async () => {
    try {
      await conn.query(
        `ALTER TABLE teacher_profiles
         MODIFY COLUMN teaching_mode
         ENUM('homeroom','subject','class_adviser','subject_teacher','both')
         DEFAULT 'homeroom'`
      );
    } catch (e) {
      console.error('[teachingMode] enum migrate:', e.message);
    }
    try {
      await conn.query(
        `UPDATE teacher_profiles
         SET teaching_mode = 'homeroom'
         WHERE teaching_mode IS NULL OR teaching_mode = ''`
      );
    } catch (e) {
      console.error('[teachingMode] backfill empty:', e.message);
    }
  })();
  return schemaPromise;
}

async function syncTeachingModeFromAssignments(conn, teacherId) {
  await ensureTeachingModeEnum(conn);
  const { schoolYear } = require('../config');
  const [rows] = await conn.query(
    `SELECT subject_id, grade_level, section
     FROM teacher_assignments
     WHERE teacher_id = ? AND school_year = ?`,
    [teacherId, schoolYear]
  );
  const hasClassAdviser = rows.some(r => r.subject_id == null);
  const subjectCount = rows.filter(r => r.subject_id != null).length;
  const hasSubjectTeacher = rows.some(r => r.subject_id != null && Number(r.grade_level) >= 4);
  const teaching_mode = resolveTeachingMode({
    hasClassAdviser,
    hasSubjectTeacher: hasSubjectTeacher || subjectCount > 0,
    subjectCount
  });
  const ca = rows.find(r => r.subject_id == null);
  await conn.query(
    `UPDATE teacher_profiles
     SET teaching_mode = ?,
         homeroom_grade = COALESCE(?, homeroom_grade),
         homeroom_section = COALESCE(?, homeroom_section)
     WHERE user_id = ?`,
    [teaching_mode, ca?.grade_level || null, ca?.section || null, teacherId]
  );
  return teaching_mode;
}

function resolveTeachingMode({ hasClassAdviser, hasSubjectTeacher, subjectCount }) {
  const hasSubjects = Number(subjectCount) > 0 || hasSubjectTeacher;
  if (hasClassAdviser && hasSubjects) return 'both';
  if (hasClassAdviser) return 'class_adviser';
  if (hasSubjects) return 'subject_teacher';
  return 'homeroom';
}

function teachingModeLabel(mode) {
  const m = String(mode || '').toLowerCase();
  if (m === 'both') return 'Class Adviser & Subject Teacher';
  if (m === 'class_adviser' || m === 'homeroom') return 'Class Adviser';
  if (m === 'subject_teacher' || m === 'subject') return 'Subject Teacher';
  return 'Not set';
}

module.exports = {
  MODE_VALUES,
  ensureTeachingModeEnum,
  resolveTeachingMode,
  teachingModeLabel,
  syncTeachingModeFromAssignments
};
