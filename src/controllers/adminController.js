const db = require('../../db');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const { schoolYear } = require('../config');
const { plainText } = require('../utils/plainText');
const {
  attachReplies,
  attachConcernReadState,
  markConcernRead,
  markConcernReadForParticipants,
  addConcernReply
} = require('../utils/concernReplies');
const {
  ensureAnnouncementAudience,
  normalizeAudience,
  announcementTargets
} = require('../utils/announcements');
const {
  getCurrentQuarter,
  setCurrentQuarter,
  QUARTERS
} = require('../utils/schoolSettings');
const { logActivity, getRecentActivity } = require('../utils/activityLog');
const { sendAccountDetails } = require('../utils/mail');
const { ensureSoftDeleteSchema } = require('../utils/softDeleteSchema');
const {
  ensureTeachingModeEnum,
  resolveTeachingMode,
  teachingModeLabel,
  syncTeachingModeFromAssignments
} = require('../utils/teachingMode');

// ============================================================
// HELPERS: Subject auto-assignment for Grades 1-3
// ============================================================

// Check if a grade level matches applicable_grades string
// Supports formats: "1-3", "4-6", "1-6", "1,2,3", "1"
function gradeMatchesApplicableGrades(gradeLevel, applicableGrades) {
  if (!applicableGrades) return false;
  const grade = parseInt(gradeLevel, 10);
  if (isNaN(grade)) return false;
  const str = String(applicableGrades).trim();

  // Range format: "1-3" or "4 - 6"
  const rangeMatch = str.match(/^(\d+)\s*-\s*(\d+)$/);
  if (rangeMatch) {
    const start = parseInt(rangeMatch[1], 10);
    const end = parseInt(rangeMatch[2], 10);
    return grade >= start && grade <= end;
  }

  // Comma format: "1,2,3" or "4, 5, 6"
  if (str.includes(',')) {
    const grades = str.split(',').map(s => parseInt(s.trim(), 10)).filter(n => !isNaN(n));
    return grades.includes(grade);
  }

  // Single grade
  return parseInt(str, 10) === grade;
}

// Get all subjects applicable to a specific grade level
async function getSubjectsForGrade(conn, gradeLevel) {
  try {
    await ensureSoftDeleteSchema(conn);
    const [subjects] = await conn.query(
      'SELECT id, applicable_grades FROM subjects WHERE deleted_at IS NULL'
    );
    return subjects.filter(s => gradeMatchesApplicableGrades(gradeLevel, s.applicable_grades));
  } catch (err) {
    console.error('[getSubjectsForGrade] Error fetching subjects:', err);
    return [];
  }
}

// GET /api/admin/subjects
exports.getSubjects = async (req, res) => {
  try {
    await ensureSoftDeleteSchema();
    const [subjects] = await db.query(
      "SELECT id, CODE AS code, NAME AS name FROM subjects WHERE deleted_at IS NULL ORDER BY NAME"
    );
    res.json(subjects);
  } catch (error) {
    console.error('Get subjects error:', error);
    res.status(500).json({ error: 'Server error fetching subjects' });
  }
};

// GET /api/admin/sections?grade_level=5
exports.getSections = async (req, res) => {
  try {
    const { grade_level } = req.query;
    let query, params = [];

    if (grade_level) {
      query = `SELECT DISTINCT section FROM (
        SELECT section FROM students WHERE section IS NOT NULL AND grade_level = ?
        UNION
        SELECT section FROM teacher_assignments WHERE section IS NOT NULL AND grade_level = ?
      ) AS combined ORDER BY section`;
      params = [grade_level, grade_level];
    } else {
      query = `SELECT DISTINCT section FROM (
        SELECT section FROM students WHERE section IS NOT NULL
        UNION
        SELECT section FROM teacher_assignments WHERE section IS NOT NULL
      ) AS combined ORDER BY section`;
    }

    const [sections] = await db.query(query, params);
    res.json(sections.map(s => s.section).filter(Boolean));
  } catch (error) {
    console.error('Get sections error:', error);
    res.json([]);
  }
};

// GET /api/admin/class-adviser?grade_level=3&section=A
exports.getClassAdviser = async (req, res) => {
  try {
    const { grade_level, section } = req.query;
    if (!grade_level || !section) {
      return res.status(400).json({ error: 'Grade level and section are required' });
    }

    console.log(`[getClassAdviser] Request: grade_level=${grade_level}, section=${section}`);

    // FALLBACK 1: Proper class adviser slot (subject_id IS NULL)
    let [rows] = await db.query(
      `SELECT u.id, u.first_name, u.last_name
       FROM teacher_assignments ta
       JOIN users u ON ta.teacher_id = u.id
       WHERE ta.grade_level = ?
       AND TRIM(UPPER(ta.section)) = TRIM(UPPER(?))
       AND ta.subject_id IS NULL
       AND ta.school_year = '${schoolYear}'
       AND u.STATUS = 'active'
       LIMIT 1`,
      [grade_level, section]
    );
    console.log(`[getClassAdviser] Fallback 1 (ta.subject_id IS NULL): ${rows.length} rows`);

    // FALLBACK 2: teacher_profiles homeroom data
    if (rows.length === 0) {
      [rows] = await db.query(
        `SELECT u.id, u.first_name, u.last_name
         FROM teacher_profiles tp
         JOIN users u ON tp.user_id = u.id
         WHERE tp.homeroom_grade = ? 
         AND TRIM(UPPER(tp.homeroom_section)) = TRIM(UPPER(?))
         AND u.STATUS = 'active'
         LIMIT 1`,
        [grade_level, section]
      );
      console.log(`[getClassAdviser] Fallback 2 (teacher_profiles): ${rows.length} rows`);
    }

    // FALLBACK 3: Any teacher assignment for this grade/section (legacy / mis-saved data)
    if (rows.length === 0) {
      [rows] = await db.query(
        `SELECT u.id, u.first_name, u.last_name
         FROM teacher_assignments ta
         JOIN users u ON ta.teacher_id = u.id
         WHERE ta.grade_level = ?
         AND TRIM(UPPER(ta.section)) = TRIM(UPPER(?))
         AND ta.school_year = '${schoolYear}'
         AND u.STATUS = 'active'
         LIMIT 1`,
        [grade_level, section]
      );
      console.log(`[getClassAdviser] Fallback 3 (any assignment): ${rows.length} rows`);
    }

    if (rows.length === 0) {
      console.log(`[getClassAdviser] No teacher found for Grade ${grade_level}-${section}`);
      return res.json({ 
        teacher: null, 
        message: 'No class adviser assigned for this grade and section' 
      });
    }

    console.log(`[getClassAdviser] Found: ${rows[0].first_name} ${rows[0].last_name} (ID: ${rows[0].id})`);
    res.json({ teacher: rows[0] });

  } catch (error) {
    console.error('Get class adviser error:', error);
    res.status(500).json({ error: 'Server error fetching class adviser' });
  }
};

// GET /api/admin/activity-log
exports.getActivityLog = async (req, res) => {
  try {
    const logs = await getRecentActivity();
    const safe = (Array.isArray(logs) ? logs : []).map((log) => {
      const action = String(log.action || '');
      const isConcern = log.target_type === 'concern'
        || /concern/i.test(action);
      if (!isConcern) return log;
      return { ...log, target_name: null, details: null };
    });
    res.json(safe);
  } catch (error) {
    console.error('Get activity log error:', error);
    res.status(500).json({ error: 'Server error fetching activity log', details: error.message });
  }
};

// GET /api/admin/inbox
exports.getAdminInbox = async (req, res) => {
  try {
    const adminId = req.user?.id || req.user?.userId;
    if (!adminId) {
      return res.status(400).json({ error: 'User ID not found in token', debug: req.user });
    }

    // Get admin's own announcements with read status
    const [announcements] = await db.query(
      `SELECT a.*, CONCAT(u.first_name, ' ', u.last_name) as admin_name,
        ar.read_at IS NOT NULL as is_read
       FROM announcements a
       JOIN users u ON a.sender_id = u.id
       LEFT JOIN announcement_reads ar ON a.id = ar.announcement_id AND ar.user_id = ?
       WHERE a.sender_id = ?
       ORDER BY a.created_at DESC`,
      [adminId, adminId]
    );

    let concerns = [];
    res.json({ concerns, announcements });
  } catch (error) {
    console.error('Get admin inbox error:', error);
    res.status(500).json({ error: 'Server error fetching inbox', details: error.message });
  }
};

exports.markConcernRead = async (req, res) => {
  return res.status(403).json({ error: 'Parent and teacher concerns are private.' });
};

// PATCH /api/admin/concerns/:id/resolve
exports.resolveConcern = async (req, res) => {
  return res.status(403).json({ error: 'Parent and teacher concerns are private.' });
};

exports.replyToConcern = async (req, res) => {
  return res.status(403).json({ error: 'Parent and teacher concerns are private.' });
};

// POST /api/admin/announcements
exports.createAnnouncement = async (req, res) => {
  try {
    const adminId = req.user?.id || req.user?.userId;
    if (!adminId) {
      return res.status(400).json({ error: 'User ID not found in token' });
    }

    const { title, body, scope, target_grade, target_section, priority, audience } = req.body;
    if (!title || !body) {
      return res.status(400).json({ error: 'Title and body are required' });
    }

    await ensureAnnouncementAudience();
    const targets = announcementTargets({ scope, target_grade, target_section });
    const audienceVal = normalizeAudience(audience);

    const [result] = await db.query(
      `INSERT INTO announcements (sender_id, title, body, scope, target_grade, target_section, priority, audience)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [adminId, title, body, targets.scope, targets.target_grade, targets.target_section, priority || 'normal', audienceVal]
    );

    await logActivity(db, adminId, 'Created announcement', 'announcement', title, `Scope: ${targets.scope} · Audience: ${audienceVal}`);

    res.status(201).json({ message: 'Announcement created', id: result.insertId });
  } catch (error) {
    console.error('Create announcement error:', error);
    const status = error.status || 500;
    res.status(status).json({
      error: error.status ? error.message : 'Server error creating announcement',
      details: error.message
    });
  }
};

// POST /api/admin/accounts
function accountError(status, message) {
  const err = new Error(message);
  err.status = status;
  return err;
}

async function createAccountRecord(body, actorId) {
  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();

    const {
      first_name, last_name, email, phone, password, role,
      is_class_adviser, class_adviser_grade, class_adviser_section,
      is_subject_teacher, subject_assignments,
      address, emergency_contact
    } = body || {};

    // Validation
    const firstName = plainText(first_name);
    const lastName = plainText(last_name);
    if (!firstName || !lastName || !email || !password || !role) {
      throw accountError(400, 'First name, last name, email, password, and role are required');
    }

    const { isValidPhMobile, normalizePhMobile } = require('../utils/sms');
    let normalizedPhone = phone || null;
    if (phone) {
      if (!isValidPhMobile(phone)) {
        throw accountError(400, 'Phone must be a valid PH mobile (e.g. 09171234567)');
      }
      normalizedPhone = normalizePhMobile(phone);
    }
    if (role === 'parent' && emergency_contact && !isValidPhMobile(emergency_contact)) {
      throw accountError(400, 'Emergency contact must be a valid PH mobile (e.g. 09171234567)');
    }
    if (role === 'parent' && !normalizedPhone && !normalizePhMobile(emergency_contact)) {
      throw accountError(400, 'Parents need a valid mobile number (phone or emergency contact) for SMS alerts');
    }

    // Teacher-specific validation
    if (role === 'teacher') {
      const hasClassAdviser = is_class_adviser === true || is_class_adviser === 'true';
      const hasSubjectTeacher = is_subject_teacher === true || is_subject_teacher === 'true';

      if (!hasClassAdviser && !hasSubjectTeacher) {
        throw accountError(400, 'Teacher must have at least one teaching role (Class Adviser or Subject Teacher)');
      }
      if (hasClassAdviser && (!class_adviser_grade || !class_adviser_section)) {
        throw accountError(400, 'Class Adviser must have a grade level and section assigned');
      }
      // Subject Teacher = Grades 4-6 subject rows (independent of 1-3 class adviser auto-subjects)
      if (hasSubjectTeacher) {
        const stRows = normalizeSubjectAssignments(subject_assignments).filter(a => isUpperGradeLevel(a.grade_level));
        if (!stRows.length) {
          throw accountError(400, 'Subject Teacher must have at least one Grades 4–6 subject assignment');
        }
      }
    }

    // Check duplicate email
    const [existing] = await conn.query('SELECT id FROM users WHERE email = ?', [email]);
    if (existing.length > 0) {
      throw accountError(409, 'Email already registered');
    }

    // Hash password
    const password_hash = await bcrypt.hash(password, 10);

    try {
      await db.query(
        'ALTER TABLE users ADD COLUMN must_change_password TINYINT(1) NOT NULL DEFAULT 0'
      );
    } catch (e) { /* exists */ }

    // Insert user
    const [userResult] = await conn.query(
      `INSERT INTO users (first_name, last_name, email, password_hash, phone, role, status, must_change_password)
       VALUES (?, ?, ?, ?, ?, ?, 'active', 1)`,
      [firstName, lastName, email, password_hash, normalizedPhone, role]
    );
    const userId = userResult.insertId;

    // Insert role-specific profile
    if (role === 'teacher') {
      const hasClassAdviser = is_class_adviser === true || is_class_adviser === 'true';
      const hasSubjectTeacher = is_subject_teacher === true || is_subject_teacher === 'true';

      // === VALIDATION: One Class Adviser per Grade-Section ===
      if (hasClassAdviser && class_adviser_grade && class_adviser_section) {
        const existing = await getExistingClassAdviser(conn, class_adviser_grade, class_adviser_section);
        if (existing) {
          throw accountError(409, `Grade ${class_adviser_grade}-${class_adviser_section} already has a Class Adviser: ${existing.first_name} ${existing.last_name} (${existing.email})`);
        }
      }

      let effectiveSubjectAssignments;
      try {
        effectiveSubjectAssignments = await buildEffectiveSubjectAssignments(conn, {
          hasClassAdviser,
          hasSubjectTeacher,
          class_adviser_grade,
          class_adviser_section,
          class_adviser_subjects: body.class_adviser_subjects,
          subject_assignments
        });
        await assertSubjectAssignmentUnique(conn, effectiveSubjectAssignments);
      } catch (assignErr) {
        throw accountError(assignErr.status || 400, assignErr.message);
      }

      let teaching_mode = resolveTeachingMode({
        hasClassAdviser,
        hasSubjectTeacher,
        subjectCount: effectiveSubjectAssignments.length
      });

      await ensureTeachingModeEnum(conn);

      // Prepare subjects_taught and grades_handled arrays for teacher_profiles summary
      let subjects_taught = null;
      let grades_handled = null;
      const allGradeLevels = new Set();
      if (hasClassAdviser && class_adviser_grade) allGradeLevels.add(String(class_adviser_grade));

      if (effectiveSubjectAssignments.length > 0) {
        const subjectIds = [...new Set(effectiveSubjectAssignments.map(a => a.subject_id).filter(Boolean))];
        effectiveSubjectAssignments.forEach(a => { if (a.grade_level) allGradeLevels.add(String(a.grade_level)); });
        if (subjectIds.length > 0) subjects_taught = JSON.stringify(subjectIds);
        if (allGradeLevels.size > 0) grades_handled = JSON.stringify([...allGradeLevels].map(Number).sort((a, b) => a - b));
      }

      await conn.query(
        `INSERT INTO teacher_profiles 
         (user_id, teaching_mode, homeroom_grade, homeroom_section, specialization, subjects_taught, grades_handled)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          userId,
          teaching_mode,
          hasClassAdviser ? class_adviser_grade : null,
          hasClassAdviser ? class_adviser_section : null,
          null, // specialization no longer used in new form
          subjects_taught,
          grades_handled
        ]
      );

      // Insert class adviser slot (subject_id = NULL)
      if (hasClassAdviser && class_adviser_grade && class_adviser_section) {
        await conn.query(
          `INSERT INTO teacher_assignments (teacher_id, grade_level, section, subject_id, school_year)
           VALUES (?, ?, ?, NULL, '${schoolYear}')`,
          [userId, class_adviser_grade, class_adviser_section]
        );
      }

      // Insert subject assignments (auto-generated for Grades 1-3, or user-provided)
      for (const assignment of effectiveSubjectAssignments) {
        await conn.query(
          `INSERT INTO teacher_assignments (teacher_id, grade_level, section, subject_id, school_year)
           VALUES (?, ?, ?, ?, '${schoolYear}')`,
          [userId, assignment.grade_level, assignment.section, assignment.subject_id]
        );
      }
    } else if (role === 'parent') {
      await conn.query(
        `INSERT INTO parent_profiles (user_id, address, emergency_contact)
         VALUES (?, ?, ?)`,
        [userId, address || null, normalizePhMobile(emergency_contact) || null]
      );
    }

    await logActivity(conn, actorId, 'Created account', role, `${firstName} ${lastName}`, email);

    await conn.commit();
    return { userId };

  } catch (error) {
    await conn.rollback();
    if (error.status) throw error;
    console.error('Create account error:', error);
    throw accountError(500, 'Server error creating account');
  } finally {
    conn.release();
  }
}

exports.createAccount = async (req, res) => {
  try {
    const { userId } = await createAccountRecord(req.body, req.user?.id || req.user?.userId);
    const mail = await sendAccountDetails({
      firstName: plainText(req.body?.first_name),
      lastName: plainText(req.body?.last_name),
      email: String(req.body?.email || '').trim(),
      role: req.body?.role,
      password: String(req.body?.password || '')
    });
    const message = mail.sent
      ? 'Account created successfully. Sign-in details were sent to the email address.'
      : `Account created successfully. The email was not sent: ${mail.error}`;
    res.status(201).json({ message, userId, emailSent: mail.sent });
  } catch (error) {
    const status = error.status || 500;
    if (status >= 500) console.error('Create account error:', error);
    res.status(status).json({ error: error.message || 'Server error creating account' });
  }
};

function yesFlag(value) {
  const s = String(value || '').trim().toLowerCase();
  return s === 'yes' || s === 'y' || s === 'true' || s === '1';
}

function generateTempPassword(length = 10) {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789';
  const bytes = crypto.randomBytes(length);
  let out = '';
  for (let i = 0; i < length; i += 1) out += alphabet[bytes[i] % alphabet.length];
  return out;
}

async function subjectAssignmentsFromCell(raw) {
  const text = String(raw || '').trim();
  if (!text) return [];
  await ensureSoftDeleteSchema();
  const out = [];
  for (const part of text.split(';').map((s) => s.trim()).filter(Boolean)) {
    const bits = part.split(':').map((s) => s.trim());
    if (bits.length < 3 || !bits[0] || !bits[1] || !bits[2]) {
      throw accountError(400, `Subject assignment "${part}" must look like CODE:grade:section`);
    }
    const [code, grade, section] = bits;
    const [rows] = await db.query(
      'SELECT id FROM subjects WHERE UPPER(CODE) = UPPER(?) AND deleted_at IS NULL LIMIT 1',
      [code]
    );
    if (!rows.length) throw accountError(400, `Unknown subject code "${code}"`);
    out.push({ subject_id: rows[0].id, grade_level: grade, section });
  }
  return out;
}

exports.bulkCreateAccounts = async (req, res) => {
  try {
    const { parseUpload } = require('../utils/tabularUpload');
    const rows = await parseUpload(req.file);
    if (!rows.length) return res.status(400).json({ error: 'The file has no data rows' });

    const actorId = req.user?.id || req.user?.userId;
    const failed = [];
    let created = 0;
    let emailed = 0;
    for (const row of rows) {
      const email = String(row.email || '').trim();
      try {
        const role = String(row.role || '').trim().toLowerCase();
        if (role === 'admin') throw accountError(400, 'Admin accounts cannot be imported');
        const password = String(row.password || '').trim() || generateTempPassword();
        const subject_assignments = await subjectAssignmentsFromCell(row.subject_assignments);
        await createAccountRecord({
          first_name: row.first_name,
          last_name: row.last_name,
          email,
          phone: row.phone,
          password,
          role,
          address: row.address,
          emergency_contact: row.emergency_contact,
          is_class_adviser: yesFlag(row.is_class_adviser),
          class_adviser_grade: row.class_adviser_grade,
          class_adviser_section: row.class_adviser_section,
          is_subject_teacher: yesFlag(row.is_subject_teacher),
          subject_assignments
        }, actorId);
        created += 1;
        const mail = await sendAccountDetails({
          firstName: plainText(row.first_name),
          lastName: plainText(row.last_name),
          email,
          role,
          password
        });
        if (mail.sent) emailed += 1;
      } catch (error) {
        failed.push({
          row: row.__row,
          email,
          error: error.status ? error.message : 'Server error creating account'
        });
      }
    }
    res.json({ created, failed, emailed });
  } catch (error) {
    console.error('Bulk create accounts error:', error);
    res.status(error.status || 500).json({ error: error.message || 'Server error importing accounts' });
  }
};

// GET /api/admin/accounts
exports.getAccounts = async (req, res) => {
  try {
    const [users] = await db.query(
      `SELECT u.id, u.first_name, u.last_name, u.email, u.phone, u.role, u.status, u.created_at,
        tp.teaching_mode, tp.homeroom_grade, tp.homeroom_section, tp.specialization,
        pp.address, pp.emergency_contact
       FROM users u
       LEFT JOIN teacher_profiles tp ON u.id = tp.user_id
       LEFT JOIN parent_profiles pp ON u.id = pp.user_id
       WHERE u.role IN ('teacher', 'parent', 'admin')
       ORDER BY u.created_at DESC`
    );
    res.json(users);
  } catch (error) {
    console.error('Get accounts error:', error);
    res.status(500).json({ error: 'Server error fetching accounts' });
  }
};

// GET /api/admin/accounts/:id
exports.getAccountById = async (req, res) => {
  try {
    const { id } = req.params;

    const [users] = await db.query(
      `SELECT u.id, u.first_name, u.last_name, u.email, u.phone, u.role, u.status,
        tp.teaching_mode, tp.homeroom_grade, tp.homeroom_section, tp.specialization,
        pp.address, pp.emergency_contact
       FROM users u
       LEFT JOIN teacher_profiles tp ON u.id = tp.user_id
       LEFT JOIN parent_profiles pp ON u.id = pp.user_id
       WHERE u.id = ?`,
      [id]
    );

    if (!users.length) {
      return res.status(404).json({ error: 'Account not found' });
    }

    const user = users[0];

    // If teacher, also fetch assignments
    if (user.role === 'teacher') {
      const [assignments] = await db.query(
        `SELECT grade_level, section, subject_id FROM teacher_assignments 
         WHERE teacher_id = ? AND school_year = '${schoolYear}'`,
        [id]
      );
      user.assignments = assignments;
    }

    res.json(user);
  } catch (error) {
    console.error('Get account error:', error);
    res.status(500).json({ error: 'Server error fetching account' });
  }
};

// PUT /api/admin/accounts/:id — edit profile info (teacher or parent)
exports.updateAccount = async (req, res) => {
  try {
    const { id } = req.params;
    const { first_name, last_name, email, phone, address, emergency_contact } = req.body;
    const { isValidPhMobile, normalizePhMobile } = require('../utils/sms');

    const firstName = plainText(first_name);
    const lastName = plainText(last_name);
    if (!firstName || !lastName || !email) {
      return res.status(400).json({ error: 'First name, last name, and email are required' });
    }

    const [users] = await db.query(
      'SELECT id, role, first_name, last_name FROM users WHERE id = ?',
      [id]
    );
    if (!users.length) {
      return res.status(404).json({ error: 'Account not found' });
    }
    const role = users[0].role;
    if (!['teacher', 'parent'].includes(role)) {
      return res.status(400).json({ error: 'Only teacher and parent accounts can be edited here' });
    }

    let normalizedPhone = null;
    if (phone != null && String(phone).trim() !== '') {
      if (!isValidPhMobile(phone)) {
        return res.status(400).json({
          error: 'Phone must be a valid PH mobile (e.g. 09171234567)'
        });
      }
      normalizedPhone = normalizePhMobile(phone);
    }

    let normalizedEmergency = null;
    if (role === 'parent' && emergency_contact != null && String(emergency_contact).trim() !== '') {
      if (!isValidPhMobile(emergency_contact)) {
        return res.status(400).json({
          error: 'Emergency contact must be a valid PH mobile (e.g. 09171234567)'
        });
      }
      normalizedEmergency = normalizePhMobile(emergency_contact);
    }

    if (role === 'parent' && !normalizedPhone && !normalizedEmergency) {
      return res.status(400).json({
        error: 'Parents need a valid mobile number (phone or emergency contact) for SMS alerts'
      });
    }

    const emailTrim = String(email).trim();
    const [dupes] = await db.query(
      'SELECT id FROM users WHERE email = ? AND id != ?',
      [emailTrim, id]
    );
    if (dupes.length) {
      return res.status(409).json({ error: 'Email already registered to another account' });
    }

    await db.query(
      `UPDATE users
       SET first_name = ?, last_name = ?, email = ?, phone = ?
       WHERE id = ?`,
      [
        firstName,
        lastName,
        emailTrim,
        normalizedPhone,
        id
      ]
    );

    if (role === 'parent') {
      const [profiles] = await db.query(
        'SELECT id FROM parent_profiles WHERE user_id = ?',
        [id]
      );
      if (profiles.length) {
        await db.query(
          `UPDATE parent_profiles
           SET address = ?, emergency_contact = ?
           WHERE user_id = ?`,
          [
            address != null && String(address).trim() !== '' ? String(address).trim() : null,
            normalizedEmergency,
            id
          ]
        );
      } else {
        await db.query(
          `INSERT INTO parent_profiles (user_id, address, emergency_contact)
           VALUES (?, ?, ?)`,
          [
            id,
            address != null && String(address).trim() !== '' ? String(address).trim() : null,
            normalizedEmergency
          ]
        );
      }
    }

    await logActivity(
      db,
      req.user?.id || req.user?.userId,
      'Updated account info',
      role,
      `${firstName} ${lastName}`,
      emailTrim
    );

    res.json({
      message: 'Account updated',
      user: {
        id: Number(id),
        first_name: firstName,
        last_name: lastName,
        email: emailTrim,
        phone: normalizedPhone,
        role,
        address: role === 'parent'
          ? (address != null && String(address).trim() !== '' ? String(address).trim() : null)
          : undefined,
        emergency_contact: role === 'parent' ? normalizedEmergency : undefined
      }
    });
  } catch (error) {
    console.error('Update account error:', error);
    res.status(500).json({ error: 'Server error updating account', details: error.message });
  }
};

// PUT /api/admin/accounts/:id/assignments
exports.updateAssignments = async (req, res) => {
  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();

    const { id } = req.params;
    const {
      is_class_adviser, class_adviser_grade, class_adviser_section,
      is_subject_teacher, subject_assignments
    } = req.body;

    // Verify user exists and is a teacher
    const [users] = await conn.query('SELECT role FROM users WHERE id = ?', [id]);
    if (!users.length) {
      await conn.rollback();
      return res.status(404).json({ error: 'Account not found' });
    }
    if (users[0].role !== 'teacher') {
      await conn.rollback();
      return res.status(400).json({ error: 'Only teacher accounts can have assignments' });
    }

    const hasClassAdviser = is_class_adviser === true || is_class_adviser === 'true';
    const hasSubjectTeacher = is_subject_teacher === true || is_subject_teacher === 'true';

    if (!hasClassAdviser && !hasSubjectTeacher) {
      await conn.rollback();
      return res.status(400).json({ error: 'Teacher must have at least one teaching role (Class Adviser or Subject Teacher)' });
    }
    if (hasClassAdviser && (!class_adviser_grade || !class_adviser_section)) {
      await conn.rollback();
      return res.status(400).json({ error: 'Class Adviser must have a grade level and section assigned' });
    }
    if (hasSubjectTeacher) {
      const stRows = normalizeSubjectAssignments(subject_assignments).filter(a => isUpperGradeLevel(a.grade_level));
      if (!stRows.length) {
        await conn.rollback();
        return res.status(400).json({ error: 'Subject Teacher must have at least one Grades 4–6 subject assignment' });
      }
    }

    // One Class Adviser per Grade-Section (exclude current teacher)
    if (hasClassAdviser && class_adviser_grade && class_adviser_section) {
      const existing = await getExistingClassAdviser(conn, class_adviser_grade, class_adviser_section, id);
      if (existing) {
        await conn.rollback();
        return res.status(409).json({ 
          error: `Grade ${class_adviser_grade}-${class_adviser_section} already has a Class Adviser: ${existing.first_name} ${existing.last_name} (${existing.email})`
        });
      }
    }

    let effectiveSubjectAssignments;
    try {
      effectiveSubjectAssignments = await buildEffectiveSubjectAssignments(conn, {
        hasClassAdviser,
        hasSubjectTeacher,
        class_adviser_grade,
        class_adviser_section,
        class_adviser_subjects: req.body.class_adviser_subjects,
        subject_assignments
      });
      await assertSubjectAssignmentUnique(conn, effectiveSubjectAssignments, id);
    } catch (assignErr) {
      await conn.rollback();
      return res.status(assignErr.status || 400).json({ error: assignErr.message });
    }

    let teaching_mode = resolveTeachingMode({
      hasClassAdviser,
      hasSubjectTeacher,
      subjectCount: effectiveSubjectAssignments.length
    });

    await ensureTeachingModeEnum(conn);

    // Prepare subjects_taught and grades_handled
    let subjects_taught = null;
    let grades_handled = null;
    const allGradeLevels = new Set();
    if (hasClassAdviser && class_adviser_grade) allGradeLevels.add(String(class_adviser_grade));

    if (effectiveSubjectAssignments.length > 0) {
      const subjectIds = [...new Set(effectiveSubjectAssignments.map(a => a.subject_id).filter(Boolean))];
      effectiveSubjectAssignments.forEach(a => { if (a.grade_level) allGradeLevels.add(String(a.grade_level)); });
      if (subjectIds.length > 0) subjects_taught = JSON.stringify(subjectIds);
      if (allGradeLevels.size > 0) grades_handled = JSON.stringify([...allGradeLevels].map(Number).sort((a, b) => a - b));
    }

    // Upsert teacher_profiles (update may no-op if profile row is missing)
    const [profiles] = await conn.query(
      'SELECT id FROM teacher_profiles WHERE user_id = ? LIMIT 1',
      [id]
    );
    if (profiles.length) {
      await conn.query(
        `UPDATE teacher_profiles 
         SET teaching_mode = ?, homeroom_grade = ?, homeroom_section = ?, 
             specialization = ?, subjects_taught = ?, grades_handled = ?
         WHERE user_id = ?`,
        [
          teaching_mode,
          hasClassAdviser ? class_adviser_grade : null,
          hasClassAdviser ? class_adviser_section : null,
          null,
          subjects_taught,
          grades_handled,
          id
        ]
      );
    } else {
      await conn.query(
        `INSERT INTO teacher_profiles 
         (user_id, teaching_mode, homeroom_grade, homeroom_section, specialization, subjects_taught, grades_handled)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          id,
          teaching_mode,
          hasClassAdviser ? class_adviser_grade : null,
          hasClassAdviser ? class_adviser_section : null,
          null,
          subjects_taught,
          grades_handled
        ]
      );
    }

    // Delete old assignments for this school year
    await conn.query(
      `DELETE FROM teacher_assignments WHERE teacher_id = ? AND school_year = '${schoolYear}'`,
      [id]
    );

    // Insert class adviser slot (subject_id = NULL)
    if (hasClassAdviser && class_adviser_grade && class_adviser_section) {
      await conn.query(
        `INSERT INTO teacher_assignments (teacher_id, grade_level, section, subject_id, school_year)
         VALUES (?, ?, ?, NULL, '${schoolYear}')`,
        [id, class_adviser_grade, class_adviser_section]
      );
    }

    // Insert subject assignments (auto-generated for Grades 1-3, or user-provided)
    for (const assignment of effectiveSubjectAssignments) {
      await conn.query(
        `INSERT INTO teacher_assignments (teacher_id, grade_level, section, subject_id, school_year)
         VALUES (?, ?, ?, ?, '${schoolYear}')`,
        [id, assignment.grade_level, assignment.section, assignment.subject_id]
      );
    }

    await logActivity(conn, (req.user?.id || req.user?.userId), 'Updated teacher assignments', 'teacher', `Teacher ID ${id}`, null);

    await conn.commit();
    res.json({ message: 'Assignments updated successfully' });

  } catch (error) {
    await conn.rollback();
    console.error('Update assignments error:', error);
    res.status(500).json({ error: 'Server error updating assignments' });
  } finally {
    conn.release();
  }
};

async function listTeacherDuties(teacherId) {
  const [rows] = await db.query(
    `SELECT ta.grade_level, ta.section, ta.subject_id, s.NAME AS subject_name
     FROM teacher_assignments ta
     LEFT JOIN subjects s ON s.id = ta.subject_id
     WHERE ta.teacher_id = ? AND ta.school_year = ?
     ORDER BY ta.grade_level, ta.section, ta.subject_id`,
    [teacherId, schoolYear]
  );
  const adviserKeys = new Set(
    rows
      .filter((row) => row.subject_id == null)
      .map((row) => `${row.grade_level}|${String(row.section || '').trim()}`)
  );
  const duties = [];
  for (const row of rows) {
    if (row.subject_id != null) continue;
    const section = String(row.section || '').trim();
    duties.push({
      kind: 'adviser',
      grade_level: row.grade_level,
      section,
      subject_id: null,
      label: `Class adviser — Grade ${row.grade_level}-${section}`
    });
  }
  for (const row of rows) {
    if (row.subject_id == null) continue;
    const section = String(row.section || '').trim();
    if (adviserKeys.has(`${row.grade_level}|${section}`)) continue;
    duties.push({
      kind: 'subject',
      grade_level: row.grade_level,
      section,
      subject_id: row.subject_id,
      subject_name: row.subject_name || 'Subject',
      label: `${row.subject_name || 'Subject'} — Grade ${row.grade_level}-${section}`
    });
  }
  return duties;
}

async function attachTransferChoices(teacherId, duties) {
  for (const duty of duties) {
    if (duty.kind === 'adviser') {
      duty.candidates = [];
      continue;
    }
    const [rows] = await db.query(
      `SELECT DISTINCT u.id, u.first_name, u.last_name
       FROM teacher_assignments ta
       JOIN users u ON u.id = ta.teacher_id
       WHERE ta.subject_id = ? AND ta.school_year = ?
         AND ta.teacher_id <> ?
         AND u.role = 'teacher' AND u.status = 'active'
       ORDER BY u.last_name, u.first_name`,
      [duty.subject_id, schoolYear, teacherId]
    );
    duty.candidates = rows;
  }
  return duties;
}

async function refreshTeacherClassProfile(conn, teacherId) {
  const [rows] = await conn.query(
    `SELECT subject_id, grade_level, section
     FROM teacher_assignments
     WHERE teacher_id = ? AND school_year = ?`,
    [teacherId, schoolYear]
  );
  const adviser = rows.find((row) => row.subject_id == null);
  const subjectCount = rows.filter((row) => row.subject_id != null).length;
  const hasSubjectTeacher = rows.some((row) => row.subject_id != null && Number(row.grade_level) >= 4);
  const teachingMode = resolveTeachingMode({
    hasClassAdviser: !!adviser,
    hasSubjectTeacher: hasSubjectTeacher || subjectCount > 0,
    subjectCount
  });
  const [[profile]] = await conn.query(
    'SELECT user_id FROM teacher_profiles WHERE user_id = ?',
    [teacherId]
  );
  if (profile) {
    await conn.query(
      `UPDATE teacher_profiles
       SET teaching_mode = ?, homeroom_grade = ?, homeroom_section = ?
       WHERE user_id = ?`,
      [teachingMode, adviser ? adviser.grade_level : null, adviser ? adviser.section : null, teacherId]
    );
    return;
  }
  await conn.query(
    `INSERT INTO teacher_profiles (user_id, teaching_mode, homeroom_grade, homeroom_section)
     VALUES (?, ?, ?, ?)`,
    [teacherId, teachingMode, adviser ? adviser.grade_level : null, adviser ? adviser.section : null]
  );
}

async function moveAssignmentRow(conn, rowId, fromId, toId, grade, section, subjectId) {
  const matchParams = [toId, grade, section, schoolYear];
  let subjectSql = 'subject_id IS NULL';
  if (subjectId != null) {
    subjectSql = 'subject_id = ?';
    matchParams.push(subjectId);
  }
  const [existing] = await conn.query(
    `SELECT id FROM teacher_assignments
     WHERE teacher_id = ? AND grade_level = ? AND TRIM(section) = TRIM(?)
       AND school_year = ? AND ${subjectSql}
     LIMIT 1`,
    matchParams
  );
  if (existing.length) {
    await conn.query('DELETE FROM teacher_assignments WHERE id = ? AND teacher_id = ?', [rowId, fromId]);
    return;
  }
  await conn.query('UPDATE teacher_assignments SET teacher_id = ? WHERE id = ? AND teacher_id = ?', [
    toId,
    rowId,
    fromId
  ]);
}

// PATCH /api/admin/accounts/:id/status
exports.toggleStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['active', 'inactive'].includes(status)) {
      return res.status(400).json({ error: 'Status must be active or inactive' });
    }

    if (status === 'inactive') {
      const [[user]] = await db.query('SELECT id, role FROM users WHERE id = ?', [id]);
      if (!user) return res.status(404).json({ error: 'Account not found' });
      if (user.role === 'teacher') {
        const classes = await attachTransferChoices(id, await listTeacherDuties(id));
        if (classes.length) {
          return res.status(409).json({
            error: 'Assign another teacher to each class before deactivating this account.',
            classes
          });
        }
      }
    }

    await db.query('UPDATE users SET status = ? WHERE id = ?', [status, id]);
    await logActivity(db, (req.user?.id || req.user?.userId), `${status === 'active' ? 'Activated' : 'Deactivated'} account`, 'user', `User ID ${id}`, null);
    res.json({ message: `Account ${status}` });
  } catch (error) {
    console.error('Toggle status error:', error);
    res.status(500).json({ error: 'Server error updating status' });
  }
};

exports.transferAndDeactivate = async (req, res) => {
  const { id } = req.params;
  const transfers = Array.isArray(req.body?.transfers) ? req.body.transfers : [];
  const conn = await db.getConnection();
  try {
    const [[user]] = await conn.query(
      'SELECT id, role, first_name, last_name FROM users WHERE id = ?',
      [id]
    );
    if (!user) return res.status(404).json({ error: 'Account not found' });
    if (user.role !== 'teacher') {
      return res.status(400).json({ error: 'Only a teacher with classes needs a transfer' });
    }

    const duties = await listTeacherDuties(id);
    if (!duties.length) {
      await conn.query('UPDATE users SET status = ? WHERE id = ?', ['inactive', id]);
      await logActivity(conn, (req.user?.id || req.user?.userId), 'Deactivated account', 'user', `User ID ${id}`, null);
      return res.json({ message: 'Account deactivated' });
    }

    const transfersNeedNew = transfers.some((item) => String(item.replacement_id) === 'new');
    if (transfersNeedNew) {
      try {
        await db.query(
          'ALTER TABLE users ADD COLUMN must_change_password TINYINT(1) NOT NULL DEFAULT 0'
        );
      } catch (_) { /* column exists */ }
    }

    await conn.beginTransaction();
    const replacementIds = new Set();
    let newTeacherId = null;
    let hiredMail = null;
    const needsNewTeacher = transfersNeedNew;
    if (needsNewTeacher) {
      const hire = req.body?.new_teacher || {};
      const firstName = plainText(hire.first_name);
      const lastName = plainText(hire.last_name);
      const email = String(hire.email || '').trim();
      const password = String(hire.password || '');
      if (!firstName || !lastName || !email || password.length < 6) {
        await conn.rollback();
        return res.status(400).json({
          error: 'A newly hired teacher needs a first name, last name, email, and a temporary password of at least 6 characters.'
        });
      }
      const [existingEmail] = await conn.query('SELECT id FROM users WHERE email = ?', [email]);
      if (existingEmail.length) {
        await conn.rollback();
        return res.status(409).json({ error: 'That email is already registered.' });
      }
      const passwordHash = await bcrypt.hash(password, 10);
      const [created] = await conn.query(
        `INSERT INTO users (first_name, last_name, email, password_hash, phone, role, status, must_change_password)
         VALUES (?, ?, ?, ?, NULL, 'teacher', 'active', 1)`,
        [firstName, lastName, email, passwordHash]
      );
      newTeacherId = created.insertId;
      replacementIds.add(newTeacherId);
      hiredMail = { firstName, lastName, email, password, role: 'teacher' };
    }

    for (const duty of duties) {
      const match = transfers.find((item) =>
        Number(item.grade_level) === Number(duty.grade_level)
        && String(item.section || '').trim() === duty.section
        && (duty.subject_id == null
          ? item.subject_id == null || item.subject_id === ''
          : Number(item.subject_id) === Number(duty.subject_id))
      );
      const rawReplacement = match?.replacement_id;
      if (duty.kind === 'adviser' && String(rawReplacement) !== 'new') {
        await conn.rollback();
        return res.status(400).json({
          error: `${duty.label} can only transfer to a newly hired teacher.`
        });
      }
      if (duty.kind === 'subject' && String(rawReplacement) === 'new') {
        await conn.rollback();
        return res.status(400).json({
          error: `${duty.label} can only transfer to a teacher who already handles that subject.`
        });
      }
      const replacementId = String(rawReplacement) === 'new'
        ? newTeacherId
        : Number(rawReplacement);
      if (!replacementId) {
        await conn.rollback();
        return res.status(400).json({ error: `Choose a teacher for ${duty.label}.` });
      }
      if (replacementId === Number(id)) {
        await conn.rollback();
        return res.status(400).json({ error: 'Choose a different teacher for each class.' });
      }
      const [[replacement]] = await conn.query(
        `SELECT id FROM users WHERE id = ? AND role = 'teacher' AND status = 'active'`,
        [replacementId]
      );
      if (!replacement) {
        await conn.rollback();
        return res.status(400).json({ error: 'Each class must go to an active teacher.' });
      }
      if (duty.kind === 'subject') {
        const [[sameSubject]] = await conn.query(
          `SELECT id FROM teacher_assignments
           WHERE teacher_id = ? AND subject_id = ? AND school_year = ?
           LIMIT 1`,
          [replacementId, duty.subject_id, schoolYear]
        );
        if (!sameSubject) {
          await conn.rollback();
          return res.status(400).json({
            error: `${duty.label} can only transfer to a teacher who already handles that subject.`
          });
        }
      }
      replacementIds.add(replacementId);

      const ownedParams = [id, duty.grade_level, duty.section, schoolYear];
      let subjectSql = '1=1';
      if (duty.subject_id != null) {
        subjectSql = 'subject_id = ?';
        ownedParams.push(duty.subject_id);
      }
      const [owned] = await conn.query(
        `SELECT id, subject_id, grade_level, section
         FROM teacher_assignments
         WHERE teacher_id = ? AND grade_level = ? AND TRIM(section) = TRIM(?)
           AND school_year = ? AND ${subjectSql}`,
        ownedParams
      );
      for (const row of owned) {
        await moveAssignmentRow(
          conn,
          row.id,
          id,
          replacementId,
          row.grade_level,
          row.section,
          row.subject_id
        );
      }
    }

    await refreshTeacherClassProfile(conn, id);
    for (const replacementId of replacementIds) {
      await refreshTeacherClassProfile(conn, replacementId);
    }
    await conn.query('UPDATE users SET status = ? WHERE id = ?', ['inactive', id]);
    await logActivity(
      conn,
      (req.user?.id || req.user?.userId),
      'Transferred classes and deactivated teacher',
      'teacher',
      `${user.first_name} ${user.last_name}`,
      `${duties.length} class${duties.length === 1 ? '' : 'es'}`
    );
    await conn.commit();
    let hired = '';
    if (newTeacherId) {
      const mail = hiredMail ? await sendAccountDetails(hiredMail) : { sent: false, error: 'Mail is not configured.' };
      hired = mail.sent
        ? ' Sign-in details were sent to the new teacher’s email. They set their own password after signing in.'
        : ` The new teacher account was created. The email was not sent: ${mail.error}`;
    }
    res.json({ message: `Classes transferred and account deactivated.${hired}` });
  } catch (error) {
    try { await conn.rollback(); } catch (_) { /* no transaction */ }
    console.error('Transfer and deactivate error:', error);
    res.status(500).json({ error: 'Server error transferring classes' });
  } finally {
    conn.release();
  }
};

exports.resetAccountPassword = async (req, res) => {
  try {
    const adminId = req.user?.id || req.user?.userId;
    const { id } = req.params;
    const { password } = req.body;

    if (!password || String(password).trim().length < 6) {
      return res.status(400).json({ error: 'Temporary password must be at least 6 characters' });
    }

    const [users] = await db.query(
      'SELECT id, first_name, last_name, role FROM users WHERE id = ?',
      [id]
    );
    if (!users.length) return res.status(404).json({ error: 'Account not found' });
    if (users[0].role === 'admin') {
      return res.status(403).json({ error: 'Admin passwords cannot be reset from this screen' });
    }
    if (Number(id) === Number(adminId)) {
      return res.status(400).json({ error: 'Use Change Password in your profile for your own account' });
    }

    try {
      await db.query(
        'ALTER TABLE users ADD COLUMN must_change_password TINYINT(1) NOT NULL DEFAULT 0'
      );
    } catch (e) { /* exists */ }

    const password_hash = await bcrypt.hash(String(password).trim(), 10);
    await db.query(
      'UPDATE users SET password_hash = ?, must_change_password = 1 WHERE id = ?',
      [password_hash, id]
    );

    const name = `${users[0].first_name} ${users[0].last_name}`;
    await logActivity(db, adminId, 'Reset account password', 'user', name, `User ID ${id}`);
    res.json({ message: 'Temporary password set. The user must change it after sign-in.' });
  } catch (error) {
    console.error('Reset account password error:', error);
    res.status(500).json({ error: 'Server error resetting password', details: error.message });
  }
};

// PUT /api/admin/announcements/:id
exports.updateAnnouncement = async (req, res) => {
  try {
    const { id } = req.params;
    const adminId = req.user?.id || req.user?.userId;

    const [rows] = await db.query('SELECT sender_id FROM announcements WHERE id = ?', [id]);
    if (rows.length === 0) return res.status(404).json({ error: 'Announcement not found' });
    if (rows[0].sender_id !== adminId) return res.status(403).json({ error: 'You can only edit your own announcements' });

    const { title, body, scope, target_grade, target_section, priority, audience } = req.body;
    if (!title || !body) {
      return res.status(400).json({ error: 'Title and body are required' });
    }

    await ensureAnnouncementAudience();
    const targets = announcementTargets({ scope, target_grade, target_section });
    const audienceVal = normalizeAudience(audience);

    await db.query(
      `UPDATE announcements 
       SET title = ?, body = ?, scope = ?, target_grade = ?, target_section = ?, priority = ?, audience = ?, updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [title, body, targets.scope, targets.target_grade, targets.target_section, priority || 'normal', audienceVal, id]
    );

    await logActivity(db, adminId, 'Updated announcement', 'announcement', title, `Scope: ${targets.scope} · Audience: ${audienceVal}`);

    res.json({ message: 'Announcement updated' });
  } catch (error) {
    console.error('Update announcement error:', error);
    const status = error.status || 500;
    res.status(status).json({
      error: error.status ? error.message : 'Server error updating announcement',
      details: error.message
    });
  }
};

// DELETE /api/admin/announcements/:id
exports.deleteAnnouncement = async (req, res) => {
  try {
    const { id } = req.params;
    const adminId = req.user?.id || req.user?.userId;

    const [rows] = await db.query('SELECT sender_id, title FROM announcements WHERE id = ?', [id]);
    if (rows.length === 0) return res.status(404).json({ error: 'Announcement not found' });
    if (rows[0].sender_id !== adminId) return res.status(403).json({ error: 'You can only delete your own announcements' });

    await db.query('DELETE FROM announcements WHERE id = ?', [id]);
    await logActivity(db, adminId, 'Deleted announcement', 'announcement', rows[0].title, null);

    res.json({ message: 'Announcement deleted' });
  } catch (error) {
    console.error('Delete announcement error:', error);
    res.status(500).json({ error: 'Server error deleting announcement' });
  }
};

// POST /api/admin/announcements/:id/read
exports.markAnnouncementRead = async (req, res) => {
  try {
    const userId = req.user?.id || req.user?.userId;
    const { id } = req.params;
    await db.query(
      'INSERT INTO announcement_reads (user_id, announcement_id) VALUES (?, ?) ON DUPLICATE KEY UPDATE read_at = CURRENT_TIMESTAMP',
      [userId, id]
    );
    res.json({ message: 'Marked as read' });
  } catch (error) {
    console.error('Mark read error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// DELETE /api/admin/announcements/:id/read
exports.markAnnouncementUnread = async (req, res) => {
  try {
    const userId = req.user?.id || req.user?.userId;
    const { id } = req.params;
    await db.query(
      'DELETE FROM announcement_reads WHERE user_id = ? AND announcement_id = ?',
      [userId, id]
    );
    res.json({ message: 'Marked as unread' });
  } catch (error) {
    console.error('Mark unread error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// POST /api/admin/announcements/mark-all-read
exports.markAllAnnouncementsRead = async (req, res) => {
  try {
    const userId = req.user?.id || req.user?.userId;
    const { announcement_ids } = req.body;
    if (!Array.isArray(announcement_ids) || announcement_ids.length === 0) {
      return res.json({ message: 'Nothing to mark' });
    }
    // Batch in groups of 100 to avoid query length limits
    const batchSize = 100;
    for (let i = 0; i < announcement_ids.length; i += batchSize) {
      const batch = announcement_ids.slice(i, i + batchSize);
      const placeholders = batch.map(() => '(?, ?)').join(', ');
      const values = batch.flatMap(id => [userId, id]);
      await db.query(
        `INSERT INTO announcement_reads (user_id, announcement_id) VALUES ${placeholders} ON DUPLICATE KEY UPDATE read_at = CURRENT_TIMESTAMP`,
        values
      );
    }
    res.json({ message: 'All marked as read' });
  } catch (error) {
    console.error('Mark all read error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// GET /api/admin/parents
exports.getParents = async (req, res) => {
  try {
    const [parents] = await db.query(
      `SELECT u.id, u.first_name, u.last_name, u.email, u.phone, u.status,
        pp.address, pp.emergency_contact
       FROM users u
       LEFT JOIN parent_profiles pp ON u.id = pp.user_id
       WHERE u.role = 'parent'
       ORDER BY u.last_name, u.first_name`
    );
    res.json(parents);
  } catch (error) {
    console.error('Get parents error:', error);
    res.status(500).json({ error: 'Server error fetching parents' });
  }
};

// GET /api/admin/teachers/:id/detail
exports.getTeacherDetail = async (req, res) => {
  try {
    const { id } = req.params;
    await ensureTeachingModeEnum();
    // Repair empty/invalid teaching_mode from live assignments
    try {
      await syncTeachingModeFromAssignments(db, id);
    } catch (e) {
      console.error('[getTeacherDetail] sync mode:', e.message);
    }

    const [users] = await db.query(
      `SELECT u.id, u.first_name, u.last_name, u.email, u.phone, u.status, u.created_at,
        tp.teaching_mode, tp.homeroom_grade, tp.homeroom_section, tp.specialization,
        tp.subjects_taught, tp.grades_handled
       FROM users u
       LEFT JOIN teacher_profiles tp ON u.id = tp.user_id
       WHERE u.id = ? AND u.role = 'teacher'`,
      [id]
    );

    if (!users.length) {
      return res.status(404).json({ error: 'Teacher not found' });
    }

    const teacher = users[0];

    const [assignments] = await db.query(
      `SELECT DISTINCT ta.grade_level, ta.section, ta.school_year, ta.subject_id, s.NAME as subject_name, s.CODE as subject_code
       FROM teacher_assignments ta
       LEFT JOIN subjects s ON ta.subject_id = s.id
       WHERE ta.teacher_id = ?
       ORDER BY ta.grade_level, ta.section, s.NAME`,
      [id]
    );

    const classAdviserAssignments = assignments.filter(a => a.subject_id === null);
    const subjectAssignments = assignments.filter(a => a.subject_id !== null);

    // Split: 1-3 subjects under CA class = adviser subjects; 4-6 with subject_id = subject teacher
    const caKeys = new Set(
      classAdviserAssignments.map(a => `${a.grade_level}|${String(a.section).trim().toUpperCase()}`)
    );
    const adviserSubjects = [];
    const subjectTeacherOnly = [];
    for (const a of subjectAssignments) {
      const key = `${a.grade_level}|${String(a.section).trim().toUpperCase()}`;
      const grade = Number(a.grade_level);
      if (caKeys.has(key) && grade >= 1 && grade <= 3) {
        adviserSubjects.push(a);
      } else if (caKeys.has(key) && grade >= 4 && grade <= 6) {
        // Subjects the 4-6 CA also teaches in their own class
        adviserSubjects.push(a);
      } else {
        subjectTeacherOnly.push(a);
      }
    }

    res.json({
      ...teacher,
      teaching_mode_label: teachingModeLabel(teacher.teaching_mode),
      class_adviser_assignments: classAdviserAssignments,
      adviser_subjects: adviserSubjects,
      subject_assignments: subjectTeacherOnly
    });
  } catch (error) {
    console.error('Get teacher detail error:', error);
    res.status(500).json({ error: 'Server error fetching teacher details' });
  }
};

// GET /api/admin/parents/:id/detail
exports.getParentDetail = async (req, res) => {
  try {
    const { id } = req.params;

    const [users] = await db.query(
      `SELECT u.id, u.first_name, u.last_name, u.email, u.phone, u.status, u.created_at,
        pp.address, pp.emergency_contact
       FROM users u
       LEFT JOIN parent_profiles pp ON u.id = pp.user_id
       WHERE u.id = ? AND u.role = 'parent'`,
      [id]
    );

    if (!users.length) {
      return res.status(404).json({ error: 'Parent not found' });
    }

    const parent = users[0];

    const [students] = await db.query(
      `SELECT s.id, s.lrn, s.first_name, s.middle_name, s.last_name, 
        s.grade_level, s.section, s.gender, s.status as student_status
       FROM parent_student_links psl
       JOIN students s ON psl.student_id = s.id
       WHERE psl.parent_id = ?
       ORDER BY s.grade_level, s.section, s.last_name`,
      [id]
    );

    res.json({
      ...parent,
      linked_students: students
    });
  } catch (error) {
    console.error('Get parent detail error:', error);
    res.status(500).json({ error: 'Server error fetching parent details' });
  }
};

// Check if a class adviser already exists for grade/section
async function getExistingClassAdviser(conn, gradeLevel, section, excludeTeacherId = null) {
  let query = `
    SELECT u.id, u.first_name, u.last_name, u.email
    FROM teacher_assignments ta
    JOIN users u ON ta.teacher_id = u.id
    WHERE ta.grade_level = ?
    AND TRIM(UPPER(ta.section)) = TRIM(UPPER(?))
    AND ta.subject_id IS NULL
    AND ta.school_year = '${schoolYear}'
    AND u.status = 'active'
  `;
  const params = [gradeLevel, section];
  
  if (excludeTeacherId) {
    query += ' AND ta.teacher_id != ?';
    params.push(excludeTeacherId);
  }
  
  query += ' LIMIT 1';
  
  const [rows] = await conn.query(query, params);
  return rows.length ? rows[0] : null;
}

// One subject teacher per subject per class (grade + section)
async function getExistingSubjectTeacher(conn, gradeLevel, section, subjectId, excludeTeacherId = null) {
  let query = `
    SELECT u.id, u.first_name, u.last_name, u.email, s.NAME as subject_name
    FROM teacher_assignments ta
    JOIN users u ON ta.teacher_id = u.id
    LEFT JOIN subjects s ON ta.subject_id = s.id
    WHERE ta.grade_level = ?
    AND TRIM(UPPER(ta.section)) = TRIM(UPPER(?))
    AND ta.subject_id = ?
    AND ta.school_year = '${schoolYear}'
    AND u.status = 'active'
  `;
  const params = [gradeLevel, section, subjectId];

  if (excludeTeacherId) {
    query += ' AND ta.teacher_id != ?';
    params.push(excludeTeacherId);
  }

  query += ' LIMIT 1';
  const [rows] = await conn.query(query, params);
  return rows.length ? rows[0] : null;
}

function normalizeSubjectAssignments(list) {
  if (!Array.isArray(list)) return [];
  const seen = new Set();
  const out = [];
  for (const a of list) {
    if (!a || !a.subject_id || !a.grade_level || !a.section) continue;
    const grade = String(a.grade_level);
    const key = `${a.subject_id}|${grade}|${String(a.section).trim().toUpperCase()}`;
    if (seen.has(key)) continue;
    seen.add(key);
    out.push({
      subject_id: Number(a.subject_id),
      grade_level: grade,
      section: String(a.section).trim()
    });
  }
  return out;
}

function isUpperGradeLevel(grade) {
  return ['4', '5', '6'].includes(String(grade));
}

function isLowerGradeLevel(grade) {
  return ['1', '2', '3'].includes(String(grade));
}

/** Build merged subject rows: 1-3 CA auto-all, 4-6 CA selected, plus ST rows (4-6 only). */
async function buildEffectiveSubjectAssignments(conn, {
  hasClassAdviser,
  hasSubjectTeacher,
  class_adviser_grade,
  class_adviser_section,
  class_adviser_subjects,
  subject_assignments
}) {
  let effective = [];
  const isLowerGrade = hasClassAdviser && isLowerGradeLevel(class_adviser_grade);
  const isUpperGrade = hasClassAdviser && isUpperGradeLevel(class_adviser_grade);

  if (hasClassAdviser && isLowerGrade && class_adviser_grade && class_adviser_section) {
    const autoSubjects = await getSubjectsForGrade(conn, class_adviser_grade);
    effective = effective.concat(autoSubjects.map(s => ({
      subject_id: s.id,
      grade_level: String(class_adviser_grade),
      section: class_adviser_section
    })));
  }

  if (hasClassAdviser && isUpperGrade && Array.isArray(class_adviser_subjects)) {
    effective = effective.concat(class_adviser_subjects.map(sid => ({
      subject_id: Number(sid),
      grade_level: String(class_adviser_grade),
      section: class_adviser_section
    })));
  }

  if (hasSubjectTeacher && Array.isArray(subject_assignments)) {
    const stRows = normalizeSubjectAssignments(subject_assignments);
    const invalidLower = stRows.find(a => isLowerGradeLevel(a.grade_level));
    if (invalidLower) {
      const err = new Error('Subject teacher assignments are only for Grades 4–6. Grades 1–3 are covered by the class adviser.');
      err.status = 400;
      throw err;
    }
    effective = effective.concat(stRows.filter(a => isUpperGradeLevel(a.grade_level)));
  }

  return normalizeSubjectAssignments(effective);
}

async function assertSubjectAssignmentUnique(conn, assignments, excludeTeacherId = null) {
  for (const a of assignments) {
    if (!a.subject_id) continue;
    const existing = await getExistingSubjectTeacher(
      conn,
      a.grade_level,
      a.section,
      a.subject_id,
      excludeTeacherId
    );
    if (existing) {
      const subjectLabel = existing.subject_name || `Subject #${a.subject_id}`;
      const err = new Error(
        `Grade ${a.grade_level}-${a.section} already has a teacher for ${subjectLabel}: ${existing.first_name} ${existing.last_name}`
      );
      err.status = 409;
      throw err;
    }
  }
}

// GET /api/admin/settings
exports.getSchoolSettings = async (req, res) => {
  try {
    const currentQuarter = await getCurrentQuarter();
    res.json({
      schoolYear,
      currentQuarter,
      quarters: QUARTERS
    });
  } catch (error) {
    console.error('Get school settings error:', error);
    res.status(500).json({ error: 'Server error fetching school settings', details: error.message });
  }
};

// PUT /api/admin/settings/current-quarter
exports.updateCurrentQuarter = async (req, res) => {
  try {
    const adminId = req.user?.id || req.user?.userId;
    const raw = String(req.body?.current_quarter || req.body?.quarter || '').toUpperCase();
    if (!QUARTERS.includes(raw)) {
      return res.status(400).json({ error: 'Quarter must be Q1, Q2, Q3, or Q4' });
    }

    const saved = await setCurrentQuarter(raw);
    await logActivity(db, adminId, 'Updated current quarter', 'settings', saved, `School year ${schoolYear}`);
    res.json({
      message: `Current quarter set to ${saved}`,
      schoolYear,
      currentQuarter: saved
    });
  } catch (error) {
    console.error('Update current quarter error:', error);
    res.status(500).json({ error: 'Server error updating current quarter', details: error.message });
  }
};

function classifyAttendanceRow(row) {
  if (Number(row.present_n) > 0) return 'present';
  if (Number(row.late_n) > 0) return 'late';
  if (Number(row.excused_n) > 0) return 'excused';
  return 'absent';
}

async function presentOverviewAnnouncement(raw) {
  if (!raw) return null;
  return {
    id: raw.id,
    title: plainText(raw.title),
    body: plainText(raw.body),
    priority: raw.priority || 'normal',
    scope: raw.scope || 'school_wide',
    target_grade: raw.target_grade,
    target_section: raw.target_section,
    audience: raw.audience || 'everyone',
    created_at: raw.created_at,
    sender_name: raw.sender_name || 'Admin',
    sender_avatar: raw.sender_avatar || null,
    reached: await announcementReachCount(raw)
  };
}

async function announcementReachCount(ann) {
  const audience = String(ann.audience || 'everyone');
  const scope = String(ann.scope || 'school_wide');
  const grade = ann.target_grade;
  const section = ann.target_section;
  let teacherSql = `SELECT COUNT(*) AS n FROM users WHERE role = 'teacher' AND STATUS = 'active'`;
  let teacherParams = [];
  if (scope === 'grade_wide' && grade) {
    teacherSql = `
      SELECT COUNT(DISTINCT u.id) AS n
      FROM users u
      LEFT JOIN teacher_assignments ta
        ON ta.teacher_id = u.id AND ta.school_year = ? AND ta.grade_level = ?
      LEFT JOIN teacher_profiles tp
        ON tp.user_id = u.id AND tp.homeroom_grade = ?
      WHERE u.role = 'teacher' AND u.STATUS = 'active'
        AND (ta.teacher_id IS NOT NULL OR tp.user_id IS NOT NULL)`;
    teacherParams = [schoolYear, grade, grade];
  } else if (scope === 'class_specific' && grade && section) {
    teacherSql = `
      SELECT COUNT(DISTINCT u.id) AS n
      FROM users u
      LEFT JOIN teacher_assignments ta
        ON ta.teacher_id = u.id AND ta.school_year = ? AND ta.grade_level = ? AND ta.section = ?
      LEFT JOIN teacher_profiles tp
        ON tp.user_id = u.id AND tp.homeroom_grade = ? AND tp.homeroom_section = ?
      WHERE u.role = 'teacher' AND u.STATUS = 'active'
        AND (ta.teacher_id IS NOT NULL OR tp.user_id IS NOT NULL)`;
    teacherParams = [schoolYear, grade, section, grade, section];
  }
  const [[teachers]] = await db.query(teacherSql, teacherParams);

  let parents = 0;
  if (audience !== 'teachers') {
    let parentSql = `
      SELECT COUNT(DISTINCT u.id) AS n
      FROM users u
      JOIN parent_student_links psl ON psl.parent_id = u.id
      JOIN students s ON s.id = psl.student_id AND s.STATUS = 'active'
      WHERE u.role = 'parent' AND u.STATUS = 'active'`;
    const parentParams = [];
    if (scope === 'grade_wide' && grade) {
      parentSql += ' AND s.grade_level = ?';
      parentParams.push(grade);
    } else if (scope === 'class_specific' && grade && section) {
      parentSql += ' AND s.grade_level = ? AND s.section = ?';
      parentParams.push(grade, section);
    }
    const [[parentRow]] = await db.query(parentSql, parentParams);
    parents = Number(parentRow?.n) || 0;
  }
  return (Number(teachers?.n) || 0) + parents;
}

// GET /api/admin/overview-charts
exports.getOverviewCharts = async (req, res) => {
  try {
    const now = new Date();
    const date = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

    const [gradeRows] = await db.query(
      `SELECT grade_level AS grade, COUNT(*) AS count
       FROM students
       WHERE \`STATUS\` = 'active'
       GROUP BY grade_level`
    );
    const studentsByGrade = [1, 2, 3, 4, 5, 6].map((grade) => {
      const row = gradeRows.find((r) => Number(r.grade) === grade);
      return { grade, count: row ? Number(row.count) : 0 };
    });

    const [[studentCountRow]] = await db.query(
      `SELECT COUNT(*) AS n FROM students WHERE \`STATUS\` = 'active'`
    );
    const [attRows] = await db.query(
      `SELECT student_id,
              SUM(\`STATUS\` = 'Present') AS present_n,
              SUM(\`STATUS\` = 'Late') AS late_n,
              SUM(\`STATUS\` = 'Absent') AS absent_n,
              SUM(\`STATUS\` = 'Excused') AS excused_n
       FROM attendance
       WHERE \`DATE\` = ?
       GROUP BY student_id`,
      [date]
    );
    const attendance = { present: 0, late: 0, absent: 0, excused: 0 };
    for (const row of attRows) attendance[classifyAttendanceRow(row)] += 1;
    const recorded = attRows.length;
    const activeStudents = Number(studentCountRow?.n) || 0;
    attendance.unmarked = Math.max(0, activeStudents - recorded);
    attendance.recorded = recorded;
    attendance.activeStudents = activeStudents;

    const announcementSelect = `
      SELECT a.id, a.title,
             COALESCE(NULLIF(TRIM(a.body), ''), a.content) AS body,
             a.priority, a.scope, a.target_grade, a.target_section, a.audience, a.created_at,
             CONCAT(u.first_name, ' ', u.last_name) AS sender_name,
             u.avatar_url AS sender_avatar
      FROM announcements a
      JOIN users u ON a.sender_id = u.id`;
    const [annRows] = await db.query(
      `${announcementSelect}
       WHERE DATE(a.created_at) = ?
       ORDER BY a.created_at DESC
       LIMIT 1`,
      [date]
    );
    const raw = annRows[0] || null;
    const [importantRows] = await db.query(
      `${announcementSelect}
       WHERE (? IS NULL OR a.id <> ?)
       ORDER BY CASE COALESCE(a.priority, 'normal')
         WHEN 'urgent' THEN 1
         WHEN 'high' THEN 2
         WHEN 'normal' THEN 3
         ELSE 4
       END, a.created_at DESC
       LIMIT 1`,
      [raw ? raw.id : null, raw ? raw.id : null]
    );
    const announcement = await presentOverviewAnnouncement(raw);
    const importantAnnouncement = await presentOverviewAnnouncement(importantRows[0] || null);

    res.json({ date, studentsByGrade, attendance, announcement, importantAnnouncement });
  } catch (error) {
    console.error('Get overview charts error:', error);
    res.status(500).json({ error: 'Server error fetching overview charts' });
  }
};