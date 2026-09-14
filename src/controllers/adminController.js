const db = require('../../db');
const bcrypt = require('bcryptjs');
const { schoolYear } = require('../config');
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
    const [subjects] = await conn.query('SELECT id, applicable_grades FROM subjects');
    return subjects.filter(s => gradeMatchesApplicableGrades(gradeLevel, s.applicable_grades));
  } catch (err) {
    console.error('[getSubjectsForGrade] Error fetching subjects:', err);
    return [];
  }
}

// GET /api/admin/subjects
exports.getSubjects = async (req, res) => {
  try {
    const [subjects] = await db.query("SELECT id, CODE AS code, NAME AS name FROM subjects ORDER BY NAME");
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
    res.json(sections.map(s => s.section));
  } catch (error) {
    console.error('Get sections error:', error);
    res.status(500).json({ error: 'Server error fetching sections' });
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
    res.json(logs);
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
    try {
      const [rows] = await db.query(
        `SELECT c.id, c.parent_id, c.teacher_id, c.student_id,
                c.SUBJECT as subject, c.message, c.STATUS as status, c.priority,
                c.created_at, c.updated_at, c.teacher_reply, c.replied_at,
                CONCAT(p.first_name, ' ', p.last_name) as parent_name,
                CONCAT(t.first_name, ' ', t.last_name) as teacher_name,
                CONCAT(s.first_name, ' ', s.last_name) as student_name,
                s.grade_level, s.section
         FROM concerns c
         LEFT JOIN users p ON c.parent_id = p.id
         LEFT JOIN users t ON c.teacher_id = t.id
         LEFT JOIN students s ON c.student_id = s.id
         ORDER BY c.created_at DESC`
      );
      concerns = await attachConcernReadState(await attachReplies(rows), adminId);
    } catch (e) {
      console.error('[Admin Inbox] concerns error:', e.message);
    }

    res.json({ concerns, announcements });
  } catch (error) {
    console.error('Get admin inbox error:', error);
    res.status(500).json({ error: 'Server error fetching inbox', details: error.message });
  }
};

exports.markConcernRead = async (req, res) => {
  try {
    const adminId = req.user?.id || req.user?.userId;
    const { id } = req.params;
    const [any] = await db.query('SELECT id FROM concerns WHERE id = ?', [id]);
    if (!any.length) return res.status(404).json({ error: 'Concern not found' });
    await markConcernRead(id, adminId);
    res.json({ message: 'Marked as read' });
  } catch (error) {
    console.error('Admin mark concern read error:', error);
    res.status(500).json({ error: 'Server error marking concern read', details: error.message });
  }
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

// PATCH /api/admin/concerns/:id/resolve
exports.resolveConcern = async (req, res) => {
  try {
    const adminId = req.user?.id || req.user?.userId;
    const { id } = req.params;
    await db.query("UPDATE concerns SET STATUS = 'resolved' WHERE id = ?", [id]);
    try {
      await markConcernReadForParticipants(id, adminId);
    } catch (e) {
      console.error('[concern_reads] mark on resolve:', e.message);
    }
    res.json({ message: 'Concern marked as resolved' });
  } catch (error) {
    console.error('Resolve concern error:', error);
    res.status(500).json({ error: 'Server error resolving concern' });
  }
};

exports.replyToConcern = async (req, res) => {
  try {
    const adminId = req.user?.id || req.user?.userId;
    const { id } = req.params;
    const { message } = req.body;

    const [any] = await db.query('SELECT id FROM concerns WHERE id = ?', [id]);
    if (!any.length) return res.status(404).json({ error: 'Concern not found' });

    const result = await addConcernReply({
      concernId: id,
      senderId: adminId,
      senderRole: 'admin',
      message
    });
    res.json({ id: result.id, message: 'Reply sent to the parent' });
  } catch (error) {
    console.error('Admin reply concern error:', error);
    const status = error.status || 500;
    res.status(status).json({
      error: error.status ? error.message : 'Server error sending reply',
      details: error.message
    });
  }
};

// POST /api/admin/accounts
exports.createAccount = async (req, res) => {
  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();

    const {
      first_name, last_name, email, phone, password, role,
      // New teacher fields
      is_class_adviser, class_adviser_grade, class_adviser_section,
      is_subject_teacher, subject_assignments,
      // Parent fields
      address, emergency_contact
    } = req.body;

    // Validation
    if (!first_name || !last_name || !email || !password || !role) {
      return res.status(400).json({ error: 'First name, last name, email, password, and role are required' });
    }

    const { isValidPhMobile, normalizePhMobile } = require('../utils/sms');
    let normalizedPhone = phone || null;
    if (phone) {
      if (!isValidPhMobile(phone)) {
        return res.status(400).json({
          error: 'Phone must be a valid PH mobile (e.g. 09171234567)'
        });
      }
      normalizedPhone = normalizePhMobile(phone);
    }
    if (role === 'parent' && emergency_contact && !isValidPhMobile(emergency_contact)) {
      return res.status(400).json({
        error: 'Emergency contact must be a valid PH mobile (e.g. 09171234567)'
      });
    }
    if (role === 'parent' && !normalizedPhone && !normalizePhMobile(emergency_contact)) {
      return res.status(400).json({
        error: 'Parents need a valid mobile number (phone or emergency contact) for SMS alerts'
      });
    }

    // Teacher-specific validation
    if (role === 'teacher') {
      const hasClassAdviser = is_class_adviser === true || is_class_adviser === 'true';
      const hasSubjectTeacher = is_subject_teacher === true || is_subject_teacher === 'true';

      if (!hasClassAdviser && !hasSubjectTeacher) {
        return res.status(400).json({ error: 'Teacher must have at least one teaching role (Class Adviser or Subject Teacher)' });
      }
      if (hasClassAdviser && (!class_adviser_grade || !class_adviser_section)) {
        return res.status(400).json({ error: 'Class Adviser must have a grade level and section assigned' });
      }
      // Subject Teacher = Grades 4-6 subject rows (independent of 1-3 class adviser auto-subjects)
      if (hasSubjectTeacher) {
        const stRows = normalizeSubjectAssignments(subject_assignments).filter(a => isUpperGradeLevel(a.grade_level));
        if (!stRows.length) {
          return res.status(400).json({ error: 'Subject Teacher must have at least one Grades 4–6 subject assignment' });
        }
      }
    }

    // Check duplicate email
    const [existing] = await conn.query('SELECT id FROM users WHERE email = ?', [email]);
    if (existing.length > 0) {
      return res.status(409).json({ error: 'Email already registered' });
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
      [first_name, last_name, email, password_hash, normalizedPhone, role]
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
        await assertSubjectAssignmentUnique(conn, effectiveSubjectAssignments);
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

    await logActivity(conn, (req.user?.id || req.user?.userId), 'Created account', req.body.role, `${req.body.first_name} ${req.body.last_name}`, req.body.email);

    await conn.commit();
    res.status(201).json({ message: 'Account created successfully', userId });

  } catch (error) {
    await conn.rollback();
    console.error('Create account error:', error);
    res.status(500).json({ error: 'Server error creating account' });
  } finally {
    conn.release();
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

    if (!first_name || !last_name || !email) {
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
        String(first_name).trim(),
        String(last_name).trim(),
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
      `${String(first_name).trim()} ${String(last_name).trim()}`,
      emailTrim
    );

    res.json({
      message: 'Account updated',
      user: {
        id: Number(id),
        first_name: String(first_name).trim(),
        last_name: String(last_name).trim(),
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

// PATCH /api/admin/accounts/:id/status
exports.toggleStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['active', 'inactive'].includes(status)) {
      return res.status(400).json({ error: 'Status must be active or inactive' });
    }

    await db.query('UPDATE users SET status = ? WHERE id = ?', [status, id]);
    await logActivity(db, (req.user?.id || req.user?.userId), `${status === 'active' ? 'Activated' : 'Deactivated'} account`, 'user', `User ID ${id}`, null);
    res.json({ message: `Account ${status}` });
  } catch (error) {
    console.error('Toggle status error:', error);
    res.status(500).json({ error: 'Server error updating status' });
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