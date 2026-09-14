const db = require('../../db');
const { schoolYear } = require('../config');
const {
  attachReplies,
  attachConcernReadState,
  markConcernRead,
  addConcernReply
} = require('../utils/concernReplies');
const { audienceSql } = require('../utils/announcements');
const { logActivity } = require('../utils/activityLog');
const { ensureAttendanceSchema, manilaISODate } = require('../utils/attendanceSchema');

// GET /api/parent/children
exports.getChildren = async (req, res) => {
  try {
    const parentId = req.user.id;

    const [children] = await db.query(
      `SELECT s.id, s.lrn, s.first_name, s.last_name, s.grade_level, s.section, s.gender, s.dob
       FROM students s
       JOIN parent_student_links psl ON s.id = psl.student_id
       WHERE psl.parent_id = ? AND s.status = 'active'
       ORDER BY s.grade_level, s.section, s.last_name`,
      [parentId]
    );

    res.json(children);
  } catch (error) {
    console.error('Get children error:', error);
    res.status(500).json({ error: 'Server error fetching children' });
  }
};

// GET /api/parent/child/:id/attendance
exports.getChildAttendance = async (req, res) => {
  try {
    await ensureAttendanceSchema();
    const parentId = req.user.id;
    const { id: studentId } = req.params;

    const [links] = await db.query(
      'SELECT id FROM parent_student_links WHERE parent_id = ? AND student_id = ?',
      [parentId, studentId]
    );

    if (links.length === 0) {
      return res.status(403).json({ error: 'You do not have access to this student' });
    }

    const [records] = await db.query(
      `SELECT a.\`DATE\` as date, a.session, a.\`STATUS\` as status, a.created_at,
              a.subject_id, sub.NAME as subject_name
       FROM attendance a
       LEFT JOIN subjects sub ON sub.id = a.subject_id
       WHERE a.student_id = ?
       ORDER BY a.\`DATE\` DESC, a.session ASC, sub.NAME ASC
       LIMIT 500`,
      [studentId]
    );

    res.json(records);
  } catch (error) {
    console.error('Get attendance error:', error);
    res.status(500).json({ error: 'Server error fetching attendance' });
  }
};

// GET /api/parent/child/:id/stats
exports.getChildStats = async (req, res) => {
  try {
    const parentId = req.user.id;
    const { id: studentId } = req.params;

    const [links] = await db.query(
      'SELECT id FROM parent_student_links WHERE parent_id = ? AND student_id = ?',
      [parentId, studentId]
    );

    if (links.length === 0) {
      return res.status(403).json({ error: 'Access denied' });
    }

    await ensureAttendanceSchema();
    const today = manilaISODate();
    const monthAgo = manilaISODate(new Date(Date.now() - 30 * 86400000));

    const [[totalDays]] = await db.query(
      `SELECT COUNT(DISTINCT \`DATE\`) as count FROM attendance WHERE student_id = ? AND \`DATE\` >= ?`,
      [studentId, monthAgo]
    );

    const [[present]] = await db.query(
      `SELECT COUNT(*) as count FROM attendance WHERE student_id = ? AND \`STATUS\` = 'Present' AND \`DATE\` >= ?`,
      [studentId, monthAgo]
    );

    const [[absent]] = await db.query(
      `SELECT COUNT(*) as count FROM attendance WHERE student_id = ? AND \`STATUS\` = 'Absent' AND \`DATE\` >= ?`,
      [studentId, monthAgo]
    );

    const [[late]] = await db.query(
      `SELECT COUNT(*) as count FROM attendance WHERE student_id = ? AND \`STATUS\` = 'Late' AND \`DATE\` >= ?`,
      [studentId, monthAgo]
    );

    const [todayRecords] = await db.query(
      `SELECT \`STATUS\` as status, session, subject_id FROM attendance WHERE student_id = ? AND \`DATE\` = ?`,
      [studentId, today]
    );

    let todayStatus = 'Not recorded';
    if (todayRecords.length === 1) {
      todayStatus = todayRecords[0].status;
    } else if (todayRecords.length > 1) {
      todayStatus = todayRecords.map((r) => `${r.session}: ${r.status}`).join(', ');
    }

    res.json({
      totalDays: totalDays.count,
      present: present.count,
      absent: absent.count,
      late: late.count,
      attendanceRate: totalDays.count > 0 ? Math.round((present.count / totalDays.count) * 100) : 0,
      todayStatus
    });

  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ error: 'Server error fetching stats' });
  }
};

exports.getChildProgress = async (req, res) => {
  try {
    const parentId = req.user.id;
    const { id: studentId } = req.params;

    const [links] = await db.query(
      'SELECT id FROM parent_student_links WHERE parent_id = ? AND student_id = ?',
      [parentId, studentId]
    );
    if (links.length === 0) {
      return res.status(403).json({ error: 'You do not have access to this student' });
    }

    const [records] = await db.query(
      `SELECT a.id, a.title, a.TYPE as type, a.max_score, a.created_at,
              a.grade_level, a.section, s.NAME as subject_name, sc.score,
              CONCAT(u.first_name, ' ', u.last_name) as teacher_name
       FROM assessment_scores sc
       JOIN assessments a ON sc.assessment_id = a.id
       LEFT JOIN subjects s ON a.subject_id = s.id
       LEFT JOIN users u ON a.created_by = u.id
       WHERE sc.student_id = ?
       ORDER BY a.created_at DESC`,
      [studentId]
    );

    const withPct = records.map(r => {
      const max = Number(r.max_score) || 100;
      const score = Number(r.score);
      return {
        ...r,
        percent: max > 0 ? Math.round((score / max) * 100) : 0
      };
    });

    const avg = withPct.length
      ? Math.round(withPct.reduce((sum, r) => sum + r.percent, 0) / withPct.length)
      : 0;

    res.json({ records: withPct, average: avg });
  } catch (error) {
    console.error('Get child progress error:', error);
    res.status(500).json({ error: 'Server error fetching progress', details: error.message });
  }
};

// GET /api/parent/me
exports.getProfile = async (req, res) => {
  try {
    const [users] = await db.query(
      `SELECT id, first_name, last_name, email, phone, avatar_url FROM users WHERE id = ?`,
      [req.user.id]
    );
    if (users.length === 0) return res.status(404).json({ error: 'User not found' });
    res.json(users[0]);
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// GET /api/parent/inbox
exports.getParentInbox = async (req, res) => {
  try {
    const parentId = req.user.id;

    // Get linked children to determine relevant grades/sections
    const [children] = await db.query(
      `SELECT s.grade_level, s.section 
       FROM students s
       JOIN parent_student_links psl ON s.id = psl.student_id
       WHERE psl.parent_id = ? AND s.STATUS = 'active'`,
      [parentId]
    );

    if (children.length === 0) {
      const [notices] = await db.query(
        `SELECT m.id, m.SUBJECT as subject, m.message, m.is_read, m.created_at, m.student_id,
                CONCAT(u.first_name, ' ', u.last_name) as sender_name,
                u.role as sender_role,
                CONCAT(s.first_name, ' ', s.last_name) as student_name
         FROM messages m
         JOIN users u ON u.id = m.sender_id
         LEFT JOIN students s ON s.id = m.student_id
         WHERE m.receiver_id = ?
         ORDER BY m.created_at DESC`,
        [parentId]
      );
      return res.json({ announcements: [], messages: notices });
    }

    const grades = [...new Set(children.map(c => c.grade_level))];
    const classes = children.map(c => `${c.grade_level}-${c.section}`);

    let sql = `SELECT a.*, CONCAT(u.first_name, ' ', u.last_name) as sender_name,
                 u.role as sender_role,
                 ar.read_at IS NOT NULL as is_read
               FROM announcements a
               JOIN users u ON a.sender_id = u.id
               LEFT JOIN announcement_reads ar ON a.id = ar.announcement_id AND ar.user_id = ?
               WHERE (a.scope = 'school_wide'`;
    const params = [parentId];

    if (grades.length > 0) {
      sql += ` OR (a.scope = 'grade_wide' AND a.target_grade IN (${grades.map(() => '?').join(',')}))`;
      params.push(...grades);
    }

    if (classes.length > 0) {
      const conds = classes.map(() => '(a.target_grade = ? AND a.target_section = ?)');
      sql += ` OR (a.scope = 'class_specific' AND (${conds.join(' OR ')}))`;
      classes.forEach(cls => { const [g, sec] = cls.split('-'); params.push(g, sec); });
    }

    sql += `)${audienceSql('parent')} ORDER BY a.created_at DESC`;

    const [announcements] = await db.query(sql, params);

    const [notices] = await db.query(
      `SELECT m.id, m.SUBJECT as subject, m.message, m.is_read, m.created_at, m.student_id,
              CONCAT(u.first_name, ' ', u.last_name) as sender_name,
              u.role as sender_role,
              CONCAT(s.first_name, ' ', s.last_name) as student_name
       FROM messages m
       JOIN users u ON u.id = m.sender_id
       LEFT JOIN students s ON s.id = m.student_id
       WHERE m.receiver_id = ?
       ORDER BY m.created_at DESC`,
      [parentId]
    );

    res.json({ announcements, messages: notices });

  } catch (error) {
    console.error('Get parent inbox error:', error);
    res.status(500).json({ error: 'Server error fetching inbox' });
  }
};

exports.markMessageRead = async (req, res) => {
  try {
    const parentId = req.user.id;
    const { id } = req.params;
    const unread = req.method === 'DELETE';
    const [result] = await db.query(
      'UPDATE messages SET is_read = ? WHERE id = ? AND receiver_id = ?',
      [unread ? 0 : 1, id, parentId]
    );
    if (!result.affectedRows) {
      return res.status(404).json({ error: 'Message not found' });
    }
    res.json({ message: unread ? 'Marked unread' : 'Marked read' });
  } catch (error) {
    console.error('Mark message read error:', error);
    res.status(500).json({ error: 'Server error updating message' });
  }
};

exports.getChildTeachers = async (req, res) => {
  try {
    const parentId = req.user.id;
    const { id: studentId } = req.params;

    const [students] = await db.query(
      `SELECT s.id, s.grade_level, s.section
       FROM students s
       JOIN parent_student_links psl ON s.id = psl.student_id
       WHERE psl.parent_id = ? AND s.id = ? AND s.STATUS = 'active'`,
      [parentId, studentId]
    );
    if (!students.length) {
      return res.status(403).json({ error: 'You do not have access to this student' });
    }

    const student = students[0];
    const [teachers] = await db.query(
      `SELECT u.id, u.first_name, u.last_name,
              MAX(CASE WHEN ta.subject_id IS NULL THEN 1 ELSE 0 END) as is_adviser,
              GROUP_CONCAT(DISTINCT s.NAME ORDER BY s.NAME SEPARATOR ', ') as subjects
       FROM teacher_assignments ta
       JOIN users u ON u.id = ta.teacher_id
       LEFT JOIN subjects s ON s.id = ta.subject_id
       WHERE ta.grade_level = ?
         AND TRIM(UPPER(ta.section)) = TRIM(UPPER(?))
         AND ta.school_year = '${schoolYear}'
         AND u.role = 'teacher'
         AND COALESCE(u.STATUS, u.status, 'active') != 'inactive'
       GROUP BY u.id, u.first_name, u.last_name
       ORDER BY is_adviser DESC, u.last_name, u.first_name`,
      [student.grade_level, student.section]
    );

    const grade = Number(student.grade_level);
    const labeled = teachers.map(t => {
      let role_label = 'Subject Teacher';
      if (t.is_adviser) {
        role_label = grade >= 1 && grade <= 3
          ? 'Class Adviser (all subjects)'
          : 'Class Adviser';
      } else if (t.subjects) {
        role_label = `Subject Teacher · ${t.subjects}`;
      }
      return {
        id: t.id,
        first_name: t.first_name,
        last_name: t.last_name,
        role_label,
        subjects: t.subjects || null,
        is_adviser: !!t.is_adviser
      };
    });

    res.json(labeled);
  } catch (error) {
    console.error('Get child teachers error:', error);
    res.status(500).json({ error: 'Server error fetching teachers', details: error.message });
  }
};

exports.createConcern = async (req, res) => {
  try {
    const parentId = req.user.id;
    const { teacher_id, student_id, subject, message } = req.body;

    if (!teacher_id || !student_id || !message || !String(message).trim()) {
      return res.status(400).json({ error: 'Teacher, student, and message are required' });
    }

    const [links] = await db.query(
      'SELECT id FROM parent_student_links WHERE parent_id = ? AND student_id = ?',
      [parentId, student_id]
    );
    if (!links.length) {
      return res.status(403).json({ error: 'You can only send concerns for your linked children' });
    }

    const [teachers] = await db.query(
      "SELECT id FROM users WHERE id = ? AND role = 'teacher'",
      [teacher_id]
    );
    if (!teachers.length) {
      return res.status(400).json({ error: 'Selected teacher was not found' });
    }

    const [result] = await db.query(
      `INSERT INTO concerns (parent_id, teacher_id, student_id, SUBJECT, message, STATUS, priority)
       VALUES (?, ?, ?, ?, ?, 'open', 'normal')`,
      [parentId, teacher_id, student_id, subject || 'General', String(message).trim()]
    );

    const [[student]] = await db.query(
      'SELECT first_name, last_name FROM students WHERE id = ?',
      [student_id]
    );
    const studentLabel = student
      ? `${student.first_name} ${student.last_name}`
      : `Student #${student_id}`;
    await logActivity(
      db,
      parentId,
      'Sent concern',
      'concern',
      subject || 'General',
      studentLabel
    );

    res.status(201).json({ id: result.insertId, message: 'Concern sent to the teacher' });
  } catch (error) {
    console.error('Create concern error:', error);
    res.status(500).json({ error: 'Server error sending concern', details: error.message });
  }
};

exports.getMyConcerns = async (req, res) => {
  try {
    const parentId = req.user.id;
    const studentId = req.query.student_id ? parseInt(req.query.student_id, 10) : null;

    if (studentId) {
      const [owned] = await db.query(
        'SELECT id FROM parent_student_links WHERE parent_id = ? AND student_id = ?',
        [parentId, studentId]
      );
      if (!owned.length) {
        return res.status(403).json({ error: 'You can only view concerns for your linked children' });
      }
    }

    const params = [parentId];
    let sql = `SELECT c.id, c.student_id, c.SUBJECT as subject, c.message, c.STATUS as status, c.priority,
              c.created_at, c.updated_at, c.teacher_reply, c.replied_at,
              CONCAT(t.first_name, ' ', t.last_name) as teacher_name,
              CONCAT(s.first_name, ' ', s.last_name) as student_name
       FROM concerns c
       LEFT JOIN users t ON c.teacher_id = t.id
       LEFT JOIN students s ON c.student_id = s.id
       WHERE c.parent_id = ?`;
    if (studentId) {
      sql += ' AND c.student_id = ?';
      params.push(studentId);
    }
    sql += ' ORDER BY c.created_at DESC';

    const [rows] = await db.query(sql, params);
    res.json(await attachConcernReadState(await attachReplies(rows), parentId));
  } catch (error) {
    console.error('Get parent concerns error:', error);
    res.status(500).json({ error: 'Server error fetching concerns', details: error.message });
  }
};

exports.markConcernRead = async (req, res) => {
  try {
    const parentId = req.user.id;
    const { id } = req.params;
    const [owned] = await db.query(
      'SELECT id FROM concerns WHERE id = ? AND parent_id = ?',
      [id, parentId]
    );
    if (!owned.length) return res.status(404).json({ error: 'Concern not found' });
    await markConcernRead(id, parentId);
    res.json({ message: 'Marked as read' });
  } catch (error) {
    console.error('Parent mark concern read error:', error);
    res.status(500).json({ error: 'Server error marking concern read', details: error.message });
  }
};

exports.replyToConcern = async (req, res) => {
  try {
    const parentId = req.user.id;
    const { id } = req.params;
    const { message } = req.body;

    const [owned] = await db.query(
      'SELECT id FROM concerns WHERE id = ? AND parent_id = ?',
      [id, parentId]
    );
    if (!owned.length) {
      return res.status(404).json({ error: 'Concern not found' });
    }

    const result = await addConcernReply({
      concernId: id,
      senderId: parentId,
      senderRole: 'parent',
      message
    });

    const [[concern]] = await db.query(
      'SELECT SUBJECT as subject FROM concerns WHERE id = ?',
      [id]
    );
    await logActivity(
      db,
      parentId,
      'Replied to concern',
      'concern',
      concern?.subject || `Concern #${id}`,
      null
    );

    res.status(201).json({ id: result.id, message: 'Reply sent to the teacher' });
  } catch (error) {
    console.error('Parent reply concern error:', error);
    const status = error.status || 500;
    res.status(status).json({
      error: error.status ? error.message : 'Server error sending reply',
      details: error.message
    });
  }
};