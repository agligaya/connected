const db = require('../../db');
const { schoolYear } = require('../config');
const { plainText } = require('../utils/plainText');
const { ensureSoftDeleteSchema } = require('../utils/softDeleteSchema');

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
    await db.query(
      `INSERT INTO teacher_assignments (teacher_id, grade_level, section, school_year)
       VALUES (?, ?, ?, '${schoolYear}')
       ON DUPLICATE KEY UPDATE teacher_id = VALUES(teacher_id)`,
      [homeroom_teacher_id, grade_level, section]
    );
  }

  return { studentId };
}

// POST /api/admin/students
exports.createStudent = async (req, res) => {
  try {
    const { studentId } = await enrollStudentRecord(req.body);
    res.status(201).json({ message: 'Student enrolled successfully', studentId });
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
        await enrollStudentRecord({
          lrn: row.lrn,
          first_name: row.first_name,
          middle_name: row.middle_name,
          last_name: row.last_name,
          grade_level: row.grade_level,
          section: row.section,
          dob: row.dob,
          gender: row.gender,
          parent_id: parentId
        }, { linkHomeroom: false });
        created += 1;
      } catch (error) {
        failed.push({
          row: row.__row,
          name,
          error: error.status ? error.message : 'Server error enrolling student'
        });
      }
    }
    res.json({ created, failed });
  } catch (error) {
    console.error('Bulk enroll students error:', error);
    res.status(error.status || 500).json({ error: error.message || 'Server error importing students' });
  }
};

exports.getStudents = async (req, res) => {
  try {
    await ensureSoftDeleteSchema();
    const [students] = await db.query(
      `SELECT s.id, s.lrn, s.first_name, s.middle_name, s.last_name, s.grade_level, s.section, s.gender, s.dob, s.STATUS as status,
        MAX(psl.parent_id) as parent_id,
        MAX(p.first_name) as parent_first, MAX(p.last_name) as parent_last,
        MAX(t.first_name) as teacher_first, MAX(t.last_name) as teacher_last
       FROM students s
       LEFT JOIN parent_student_links psl ON s.id = psl.student_id
       LEFT JOIN users p ON psl.parent_id = p.id
       LEFT JOIN (
         SELECT teacher_id, grade_level, section
         FROM teacher_assignments
         WHERE subject_id IS NULL AND school_year = '${schoolYear}'
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
        await db.query(
          `INSERT INTO teacher_assignments (teacher_id, grade_level, section, school_year)
           VALUES (?, ?, ?, '${schoolYear}')
           ON DUPLICATE KEY UPDATE teacher_id = VALUES(teacher_id)`,
          [homeroom_teacher_id, grade_level, sectionNorm]
        );
      }
    } else {
      if (parent_id) {
        const [links] = await db.query(
          'SELECT parent_id FROM parent_student_links WHERE student_id = ?',
          [id]
        );
        if (links.length) {
          const already = links.some((row) => Number(row.parent_id) === Number(parent_id));
          if (!already) {
            return res.status(409).json({ error: 'Student is already linked to a parent' });
          }
        } else {
          const [parents] = await db.query(
            `SELECT id FROM users WHERE id = ? AND role = 'parent' AND STATUS = 'active'`,
            [parent_id]
          );
          if (!parents.length) {
            return res.status(400).json({ error: 'Select a registered parent account' });
          }
        }
      }

      await db.query(
        `UPDATE students SET lrn = ?, first_name = ?, middle_name = ?, last_name = ?
         WHERE id = ?`,
        [lrn || null, firstName, middleName || null, lastName, id]
      );

      if (parent_id) {
        const [links] = await db.query(
          'SELECT id FROM parent_student_links WHERE student_id = ? AND parent_id = ?',
          [id, parent_id]
        );
        if (!links.length) {
          await db.query(
            'INSERT INTO parent_student_links (parent_id, student_id) VALUES (?, ?)',
            [parent_id, id]
          );
        }
      }
    }

    res.json({ message: isReenroll ? 'Student re-enrolled successfully' : 'Student updated successfully' });
  } catch (error) {
    console.error('Update student error:', error);
    res.status(500).json({ error: 'Server error updating student' });
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