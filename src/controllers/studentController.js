const db = require('../../db');
const { schoolYear } = require('../config');

// POST /api/admin/students
exports.createStudent = async (req, res) => {
  try {
    const {
      lrn, first_name, middle_name, last_name, grade_level, section,
      dob, gender, parent_id, homeroom_teacher_id
    } = req.body;

    if (!first_name || !last_name || !grade_level || !section) {
      return res.status(400).json({ error: 'First name, last name, grade, and section are required' });
    }

    // Validate LRN if provided
    if (lrn && !/^\d{12}$/.test(lrn)) {
      return res.status(400).json({ error: 'LRN must be exactly 12 digits' });
    }

    // Check duplicate LRN if provided
    if (lrn) {
      const [existing] = await db.query('SELECT id FROM students WHERE lrn = ?', [lrn]);
      if (existing.length > 0) {
        return res.status(409).json({ error: 'LRN already exists' });
      }
    }

    const [result] = await db.query(
      `INSERT INTO students (lrn, first_name, middle_name, last_name, grade_level, section, dob, gender, STATUS) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'active')`,
      [lrn || null, first_name, middle_name || null, last_name, grade_level, section, dob || null, gender || null]
    );
    const studentId = result.insertId;

    if (parent_id) {
      await db.query(
        'INSERT INTO parent_student_links (parent_id, student_id) VALUES (?, ?)',
        [parent_id, studentId]
      );
    }

    if (homeroom_teacher_id) {
      await db.query(
        `INSERT INTO teacher_assignments (teacher_id, grade_level, section, school_year) 
         VALUES (?, ?, ?, '${schoolYear}')
         ON DUPLICATE KEY UPDATE teacher_id = VALUES(teacher_id)`,
        [homeroom_teacher_id, grade_level, section]
      );
    }

    res.status(201).json({ message: 'Student enrolled successfully', studentId });

  } catch (error) {
    console.error('Create student error:', error);
    res.status(500).json({ error: 'Server error enrolling student' });
  }
};

exports.getStudents = async (req, res) => {
  try {
    const [students] = await db.query(
      `SELECT s.id, s.lrn, s.first_name, s.middle_name, s.last_name, s.grade_level, s.section, s.gender, s.dob, s.STATUS as status, 
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
    const { lrn, first_name, middle_name, last_name, status } = req.body;

    if (!first_name || !last_name) {
      return res.status(400).json({ error: 'First name and last name are required' });
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

    await db.query(
      'UPDATE students SET lrn = ?, first_name = ?, middle_name = ?, last_name = ?, status = ? WHERE id = ?',
      [lrn || null, first_name, middle_name || null, last_name, status || 'active', id]
    );

    res.json({ message: 'Student updated successfully' });
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

    await db.query('UPDATE students SET status = ? WHERE id = ?', [status, id]);
    res.json({ message: `Student ${status === 'active' ? 're-enrolled' : 'unenrolled'} successfully` });
  } catch (error) {
    console.error('Update status error:', error);
    res.status(500).json({ error: 'Server error updating status' });
  }
};

exports.deleteStudent = async (req, res) => {
  try {
    const { id } = req.params;
    await db.query('DELETE FROM students WHERE id = ?', [id]);
    res.json({ message: 'Student deleted successfully' });
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