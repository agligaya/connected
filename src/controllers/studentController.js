const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const db = require('../../db');
const { schoolYear, tempPasswordMinutes } = require('../config');
const { ensureAuthColumns } = require('./authController');
const { plainText } = require('../utils/plainText');
const { ensureSoftDeleteSchema } = require('../utils/softDeleteSchema');
const { ensureAssignmentSlots } = require('../utils/teachingMode');
const { ensureStudentRoleSchema } = require('../utils/studentAccounts');
const { studentUsernameBase } = require('../utils/studentUsername');
const { sendAccountDetails, publicLoginUrl } = require('../utils/mail');

function studentError(status, message) {
  const err = new Error(message);
  err.status = status;
  return err;
}

function normalizeGender(value) {
  const s = String(value || '').trim().toLowerCase();
  if (!s) return null;
  if (s === 'm' || s === 'male') return 'M';
  if (s === 'f' || s === 'female') return 'F';
  throw studentError(400, 'Gender must be M or F');
}

async function enrollStudentRecord(body, { linkHomeroom = true } = {}) {
  const {
    lrn, first_name, middle_name, last_name, grade_level, section,
    dob, date_of_birth, gender, parent_id, homeroom_teacher_id
  } = body || {};
  const dobValue = dob || date_of_birth || null;

  const firstName = plainText(first_name);
  const middleName = plainText(middle_name);
  const lastName = plainText(last_name);
  if (!firstName || !lastName || !grade_level || !section) {
    throw studentError(400, 'First name, last name, grade, and section are required');
  }

  const lrnText = lrn != null && String(lrn).trim() !== '' ? String(lrn).trim() : '';
  if (lrnText && !/^\d{12}$/.test(lrnText)) {
    throw studentError(400, 'LRN must be exactly 12 digits');
  }
  if (lrnText) {
    const [existing] = await db.query('SELECT id FROM students WHERE lrn = ?', [lrnText]);
    if (existing.length > 0) throw studentError(409, 'LRN already exists');
  }

  const genderValue = normalizeGender(gender);
  const [result] = await db.query(
    `INSERT INTO students (lrn, first_name, middle_name, last_name, grade_level, section, dob, gender, STATUS)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'active')`,
    [lrnText || null, firstName, middleName || null, lastName, grade_level, section, dobValue || null, genderValue]
  );
  const studentId = result.insertId;

  if (parent_id) {
    await db.query(
      'INSERT INTO parent_student_links (parent_id, student_id) VALUES (?, ?)',
      [parent_id, studentId]
    );
  }

  if (linkHomeroom && homeroom_teacher_id) {
    await ensureAdviserSlot(homeroom_teacher_id, grade_level, section);
  }

  return { studentId };
}

// Lowercase letters and digits only, with look-alikes (i, l, o, 0, 1) removed,
// so students can type it without worrying about letter case.
function generateTempPassword(length = 8) {
  const alphabet = 'abcdefghjkmnpqrstuvwxyz23456789';
  let out = '';
  for (let i = 0; i < length; i += 1) out += alphabet[crypto.randomInt(alphabet.length)];
  return out;
}

async function availableUsername(firstName, lastName, lrn) {
  const base = studentUsernameBase(firstName, lastName);
  if (base.length < 2) throw studentError(400, 'The student name cannot form a username.');
  const suffix = String(lrn || '').replace(/\D/g, '').slice(-3);
  const candidates = [base];
  if (suffix) candidates.push(`${base}${suffix}`);
  for (let n = 2; n < 100; n += 1) {
    candidates.push(suffix ? `${base}${suffix}${n}` : `${base}${n}`);
  }
  const [rows] = await db.query(
    `SELECT LOWER(email) AS email FROM users WHERE LOWER(email) IN (${candidates.map(() => '?').join(',')})`,
    candidates
  );
  const taken = new Set(rows.map((row) => row.email));
  const free = candidates.find((name) => !taken.has(name));
  if (!free) throw studentError(409, 'Could not create a unique username for this student.');
  return free;
}

async function parentContact(studentId) {
  const [rows] = await db.query(
    `SELECT u.email, u.first_name, u.last_name
     FROM parent_student_links psl
     JOIN users u ON u.id = psl.parent_id
     WHERE psl.student_id = ? AND u.role = 'parent'
     LIMIT 1`,
    [studentId]
  );
  return rows[0] || null;
}

async function notifyParentOfLogin(student, username, password, loginUrl) {
  const parent = await parentContact(student.id);
  if (!parent?.email) {
    return {
      sent: false,
      error: 'This student has no parent email, so the sign-in details were not emailed.',
      parentEmail: ''
    };
  }
  const mail = await sendAccountDetails({
    firstName: parent.first_name,
    lastName: parent.last_name,
    email: parent.email,
    role: 'student',
    password,
    loginUrl,
    childName: `${student.first_name} ${student.last_name}`.trim(),
    username,
    expiresMinutes: tempPasswordMinutes
  });
  return { ...mail, parentEmail: parent.email };
}

function loginNotice(mail, username, password) {
  const expiry = `It expires in ${tempPasswordMinutes} minutes.`;
  if (mail.sent) {
    return `Username ${username} and the temporary password were sent to ${mail.parentEmail}. ${expiry}`;
  }
  return `Username: ${username}. Temporary password: ${password}. ${expiry} ${mail.error}`;
}

async function issueStudentLogin(student, password, loginUrl) {
  await ensureStudentRoleSchema();
  await ensureAuthColumns();
  const [existing] = await db.query(
    `SELECT id FROM users WHERE student_id = ? AND role = 'student' LIMIT 1`,
    [student.id]
  );
  if (existing.length) throw studentError(409, 'This student already has a login.');
  const username = await availableUsername(student.first_name, student.last_name, student.lrn);
  const password_hash = await bcrypt.hash(password, 10);
  await db.query(
    `INSERT INTO users (first_name, last_name, email, password_hash, role, STATUS, must_change_password, student_id, temp_password_expires_at)
     VALUES (?, ?, ?, ?, 'student', 'active', 1, ?, DATE_ADD(NOW(), INTERVAL ? MINUTE))`,
    [student.first_name, student.last_name, username, password_hash, student.id, tempPasswordMinutes]
  );
  const mail = await notifyParentOfLogin(student, username, password, loginUrl);
  return { username, mail };
}

async function removeEnrolledStudent(studentId) {
  await db.query('DELETE FROM users WHERE student_id = ? AND role = ?', [studentId, 'student']);
  await db.query('DELETE FROM parent_student_links WHERE student_id = ?', [studentId]);
  await db.query('DELETE FROM students WHERE id = ?', [studentId]);
}

async function enrollWithLogin(body, loginUrl, options) {
  const { studentId } = await enrollStudentRecord(body, options);
  try {
    const student = await studentForLogin(studentId);
    if (!student) throw studentError(500, 'The enrolled student could not be loaded.');
    const password = generateTempPassword();
    const issued = await issueStudentLogin(student, password, loginUrl);
    return { studentId, password, ...issued };
  } catch (error) {
    await removeEnrolledStudent(studentId);
    throw error;
  }
}

// POST /api/admin/students
exports.createStudent = async (req, res) => {
  try {
    const enrolled = await enrollWithLogin(req.body, publicLoginUrl(req));
    res.status(201).json({
      message: `Student enrolled. ${loginNotice(enrolled.mail, enrolled.username, enrolled.password)}`,
      studentId: enrolled.studentId,
      username: enrolled.username,
      emailSent: enrolled.mail.sent
    });
  } catch (error) {
    const status = error.status || 500;
    if (status >= 500) console.error('Create student error:', error);
    res.status(status).json({ error: error.message || 'Server error enrolling student' });
  }
};

exports.bulkEnrollStudents = async (req, res) => {
  try {
    const { parseUpload } = require('../utils/tabularUpload');
    const rows = await parseUpload(req.file);
    if (!rows.length) return res.status(400).json({ error: 'The file has no data rows' });

    const failed = [];
    let created = 0;
    let emailed = 0;
    const loginUrl = publicLoginUrl(req);
    for (const row of rows) {
      const name = [row.first_name, row.last_name].filter(Boolean).join(' ');
      try {
        let parentId = null;
        const parentEmail = String(row.parent_email || '').trim();
        if (parentEmail) {
          const [parents] = await db.query(
            `SELECT id FROM users WHERE email = ? AND role = 'parent' LIMIT 1`,
            [parentEmail]
          );
          if (!parents.length) throw studentError(400, `No parent account for ${parentEmail}`);
          parentId = parents[0].id;
        }
        const enrolled = await enrollWithLogin({
          lrn: row.lrn,
          first_name: row.first_name,
          middle_name: row.middle_name,
          last_name: row.last_name,
          grade_level: row.grade_level,
          section: row.section,
          dob: row.dob,
          gender: row.gender,
          parent_id: parentId
        }, loginUrl, { linkHomeroom: false });
        created += 1;
        if (enrolled.mail.sent) emailed += 1;
      } catch (error) {
        failed.push({
          row: row.__row,
          name,
          error: error.status ? error.message : 'Server error enrolling student'
        });
      }
    }
    res.json({ created, failed, emailed });
  } catch (error) {
    console.error('Bulk enroll students error:', error);
    res.status(error.status || 500).json({ error: error.message || 'Server error importing students' });
  }
};

async function ensureAdviserSlot(teacherId, gradeLevel, section) {
  await ensureAssignmentSlots();
  const [existing] = await db.query(
    `SELECT id FROM teacher_assignments
     WHERE teacher_id = ? AND grade_level = ?
       AND TRIM(UPPER(section)) = TRIM(UPPER(?))
       AND subject_id IS NULL AND slot = 'adviser' AND school_year = ?
     LIMIT 1`,
    [teacherId, gradeLevel, section, schoolYear]
  );
  if (existing.length) return;
  await db.query(
    `INSERT INTO teacher_assignments (teacher_id, grade_level, section, school_year, slot)
     VALUES (?, ?, ?, ?, 'adviser')`,
    [teacherId, gradeLevel, section, schoolYear]
  );
}

exports.getStudents = async (req, res) => {
  try {
    await ensureSoftDeleteSchema();
    await ensureAssignmentSlots();
    await ensureStudentRoleSchema();
    const [students] = await db.query(
      `SELECT s.id, s.lrn, s.first_name, s.middle_name, s.last_name, s.grade_level, s.section, s.gender, s.dob, s.STATUS as status,
        MAX(psl.parent_id) as parent_id,
        MAX(p.first_name) as parent_first, MAX(p.last_name) as parent_last,
        MAX(t.first_name) as teacher_first, MAX(t.last_name) as teacher_last,
        MAX(su.id) as login_user_id,
        MAX(su.email) as login_username,
        MAX(su.STATUS) as login_status
       FROM students s
       LEFT JOIN parent_student_links psl ON s.id = psl.student_id
       LEFT JOIN users p ON psl.parent_id = p.id
       LEFT JOIN users su ON su.student_id = s.id AND su.role = 'student'
       LEFT JOIN (
         SELECT teacher_id, grade_level, section
         FROM teacher_assignments
         WHERE subject_id IS NULL AND slot = 'adviser' AND school_year = '${schoolYear}'
       ) ta ON s.grade_level = ta.grade_level AND s.section = ta.section
       LEFT JOIN users t ON ta.teacher_id = t.id
       WHERE s.deleted_at IS NULL
       GROUP BY s.id, s.lrn, s.first_name, s.middle_name, s.last_name, s.grade_level, s.section, s.gender, s.dob, s.STATUS
       ORDER BY s.grade_level, s.section, s.last_name`
    );
    res.json(students);
  } catch (error) {
    console.error('Get students error:', error);
    res.status(500).json({ error: 'Server error fetching students' });
  }
};

// PUT /api/admin/students/:id
exports.updateStudent = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      lrn,
      first_name,
      middle_name,
      last_name,
      status,
      grade_level,
      section,
      gender,
      dob,
      date_of_birth,
      parent_id,
      homeroom_teacher_id
    } = req.body;

    const dobValue = dob || date_of_birth || null;
    const sectionNorm = section != null ? String(section).trim() : null;
    const isReenroll = grade_level != null && sectionNorm;

    const firstName = plainText(first_name);
    const middleName = plainText(middle_name);
    const lastName = plainText(last_name);
    if (!firstName || !lastName) {
      return res.status(400).json({ error: 'First name and last name are required' });
    }

    if (isReenroll && (!grade_level || !sectionNorm)) {
      return res.status(400).json({ error: 'Grade level and section are required for re-enrollment' });
    }

    await ensureSoftDeleteSchema();
    const [existingStudent] = await db.query(
      'SELECT id, deleted_at FROM students WHERE id = ?',
      [id]
    );
    if (!existingStudent.length || existingStudent[0].deleted_at) {
      return res.status(404).json({ error: 'Student not found' });
    }

    // Validate LRN if provided
    if (lrn && !/^\d{12}$/.test(lrn)) {
      return res.status(400).json({ error: 'LRN must be exactly 12 digits' });
    }

    // Check duplicate LRN (exclude self)
    if (lrn) {
      const [existing] = await db.query('SELECT id FROM students WHERE lrn = ? AND id != ?', [lrn, id]);
      if (existing.length > 0) {
        return res.status(409).json({ error: 'LRN already exists' });
      }
    }

    if (isReenroll) {
      await db.query(
        `UPDATE students SET lrn = ?, first_name = ?, middle_name = ?, last_name = ?,
         grade_level = ?, section = ?, dob = ?, gender = ?, STATUS = ?
         WHERE id = ?`,
        [
          lrn || null,
          firstName,
          middleName || null,
          lastName,
          grade_level,
          sectionNorm,
          dobValue || null,
          gender || null,
          status || 'active',
          id
        ]
      );

      await db.query('DELETE FROM parent_student_links WHERE student_id = ?', [id]);
      if (parent_id) {
        await db.query(
          'INSERT INTO parent_student_links (parent_id, student_id) VALUES (?, ?)',
          [parent_id, id]
        );
      }

      if (homeroom_teacher_id) {
        await ensureAdviserSlot(homeroom_teacher_id, grade_level, sectionNorm);
      }
    } else {
      await db.query(
        `UPDATE students SET lrn = ?, first_name = ?, middle_name = ?, last_name = ?
         WHERE id = ?`,
        [lrn || null, firstName, middleName || null, lastName, id]
      );

      if (Object.prototype.hasOwnProperty.call(req.body, 'parent_id')) {
        await setParentLink(id, parent_id);
      }
    }

    await syncStudentLogin(id, firstName, lastName);

    res.json({ message: isReenroll ? 'Student re-enrolled successfully' : 'Student updated successfully' });
  } catch (error) {
    console.error('Update student error:', error);
    res.status(error.status || 500).json({ error: error.status ? error.message : 'Server error updating student' });
  }
};

async function setParentLink(studentId, parentId) {
  const nextId = parentId ? Number(parentId) : null;
  await db.query('DELETE FROM parent_student_links WHERE student_id = ?', [studentId]);
  if (!nextId) return;
  const [parents] = await db.query(
    `SELECT id FROM users WHERE id = ? AND role = 'parent' AND STATUS = 'active'`,
    [nextId]
  );
  if (!parents.length) throw studentError(400, 'Select a registered parent account');
  await db.query(
    'INSERT INTO parent_student_links (parent_id, student_id) VALUES (?, ?)',
    [nextId, studentId]
  );
}

async function syncStudentLogin(studentId, firstName, lastName) {
  await ensureStudentRoleSchema();
  const [logins] = await db.query(
    `SELECT id FROM users WHERE student_id = ? AND role = 'student' LIMIT 1`,
    [studentId]
  );
  if (!logins.length) return;
  await db.query(
    'UPDATE users SET first_name = ?, last_name = ? WHERE id = ?',
    [firstName, lastName, logins[0].id]
  );
}

async function studentForLogin(id) {
  await ensureSoftDeleteSchema();
  await ensureStudentRoleSchema();
  const [rows] = await db.query(
    `SELECT id, lrn, first_name, last_name, STATUS as status
     FROM students WHERE id = ? AND deleted_at IS NULL LIMIT 1`,
    [id]
  );
  return rows[0] || null;
}

exports.createStudentLogin = async (req, res) => {
  try {
    const student = await studentForLogin(req.params.id);
    if (!student) return res.status(404).json({ error: 'Student not found' });
    const password = String(req.body?.password || '');
    if (password.length < 6) {
      return res.status(400).json({ error: 'Temporary password must be at least 6 characters.' });
    }
    const issued = await issueStudentLogin(student, password, publicLoginUrl(req));
    res.status(201).json({
      message: `Login created. ${loginNotice(issued.mail, issued.username, password)}`,
      username: issued.username,
      emailSent: issued.mail.sent
    });
  } catch (error) {
    console.error('Create student login error:', error);
    res.status(error.status || 500).json({ error: error.status ? error.message : 'Server error creating login' });
  }
};

exports.resetStudentLogin = async (req, res) => {
  try {
    const student = await studentForLogin(req.params.id);
    if (!student) return res.status(404).json({ error: 'Student not found' });
    const password = String(req.body?.password || '');
    if (password.length < 6) {
      return res.status(400).json({ error: 'Temporary password must be at least 6 characters.' });
    }
    const [logins] = await db.query(
      `SELECT id, email FROM users WHERE student_id = ? AND role = 'student' LIMIT 1`,
      [student.id]
    );
    if (!logins.length) return res.status(404).json({ error: 'This student has no login yet.' });
    const password_hash = await bcrypt.hash(password, 10);
    await ensureAuthColumns();
    await db.query(
      `UPDATE users SET password_hash = ?, must_change_password = 1,
         temp_password_expires_at = DATE_ADD(NOW(), INTERVAL ? MINUTE)
       WHERE id = ?`,
      [password_hash, tempPasswordMinutes, logins[0].id]
    );
    const mail = await notifyParentOfLogin(student, logins[0].email, password, publicLoginUrl(req));
    res.json({
      message: `Temporary password saved. ${loginNotice(mail, logins[0].email, password)}`,
      emailSent: mail.sent
    });
  } catch (error) {
    console.error('Reset student login error:', error);
    res.status(500).json({ error: 'Server error resetting login' });
  }
};

exports.setStudentLoginStatus = async (req, res) => {
  try {
    const student = await studentForLogin(req.params.id);
    if (!student) return res.status(404).json({ error: 'Student not found' });
    const status = String(req.body?.status || '').toLowerCase() === 'inactive' ? 'inactive' : 'active';
    const [logins] = await db.query(
      `SELECT id FROM users WHERE student_id = ? AND role = 'student' LIMIT 1`,
      [student.id]
    );
    if (!logins.length) return res.status(404).json({ error: 'This student has no login yet.' });
    await db.query('UPDATE users SET STATUS = ? WHERE id = ?', [status, logins[0].id]);
    res.json({ message: status === 'active' ? 'Login enabled.' : 'Login disabled.', status });
  } catch (error) {
    console.error('Set student login status error:', error);
    res.status(500).json({ error: 'Server error updating login' });
  }
};

// PATCH /api/admin/students/:id/status
exports.updateStudentStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['active', 'inactive'].includes(status)) {
      return res.status(400).json({ error: 'Status must be active or inactive' });
    }

    await ensureSoftDeleteSchema();
    const [result] = await db.query(
      'UPDATE students SET STATUS = ? WHERE id = ? AND deleted_at IS NULL',
      [status, id]
    );
    if (!result.affectedRows) {
      return res.status(404).json({ error: 'Student not found' });
    }
    res.json({ message: `Student ${status === 'active' ? 're-enrolled' : 'unenrolled'} successfully` });
  } catch (error) {
    console.error('Update status error:', error);
    res.status(500).json({ error: 'Server error updating status' });
  }
};

exports.deleteStudent = async (req, res) => {
  try {
    await ensureSoftDeleteSchema();
    const { id } = req.params;
    const [result] = await db.query(
      `UPDATE students
       SET deleted_at = CURRENT_TIMESTAMP, \`STATUS\` = 'inactive'
       WHERE id = ? AND deleted_at IS NULL`,
      [id]
    );
    if (!result.affectedRows) {
      const [rows] = await db.query('SELECT id FROM students WHERE id = ?', [id]);
      if (!rows.length) return res.status(404).json({ error: 'Student not found' });
      return res.json({ message: 'Student already removed' });
    }
    res.json({ message: 'Student removed. Attendance and scores were kept.' });
  } catch (error) {
    console.error('Delete student error:', error);
    res.status(500).json({ error: 'Server error deleting student' });
  }
};

exports.getSectionsByGrade = async (req, res) => {
  try {
    const { grade } = req.params;
    const [rows] = await db.query(
      `SELECT DISTINCT section FROM teacher_assignments 
       WHERE grade_level = ? AND school_year = '${schoolYear}'
       ORDER BY section`,
      [grade]
    );
    res.json(rows.map(r => r.section));
  } catch (error) {
    console.error('Get sections error:', error);
    res.status(500).json({ error: 'Server error fetching sections' });
  }
};

exports.getParents = async (req, res) => {
  try {
    const [parents] = await db.query(
      `SELECT id, first_name, last_name, email, phone FROM users WHERE role = 'parent' AND STATUS = 'active' ORDER BY last_name`
    );
    res.json(parents);
  } catch (error) {
    res.status(500).json({ error: 'Server error fetching parents' });
  }
};

exports.getTeachers = async (req, res) => {
  try {
    const [teachers] = await db.query(
      `SELECT id, first_name, last_name, email FROM users WHERE role = 'teacher' AND STATUS = 'active' ORDER BY last_name`
    );
    res.json(teachers);
  } catch (error) {
    res.status(500).json({ error: 'Server error fetching teachers' });
  }
};