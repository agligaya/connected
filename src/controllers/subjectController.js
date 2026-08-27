const db = require('../../db');

exports.getSubjects = async (req, res) => {
  try {
    const [subjects] = await db.query(
      "SELECT id, CODE AS code, NAME AS name, description, applicable_grades FROM subjects ORDER BY CODE"
    );
    res.json(subjects);
  } catch (error) {
    console.error('Get subjects error:', error);
    res.status(500).json({error: 'Server error'});
  }
};

exports.createSubject = async (req, res) => {
  try {
    const { code, name, description, applicable_grades } = req.body;
    if (!code || !name) return res.status(400).json({ error: 'Code and name are required' });

    await db.query(
      "INSERT INTO subjects (CODE, NAME, description, applicable_grades) VALUES (?, ?, ?, ?)",
      [code, name, description || null, applicable_grades || null]
    );
    res.status(201).json({ message: 'Subject added' });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') return res.status(409).json({ error: 'Subject code already exists' });
    res.status(500).json({ error: 'Server error' });
  }
};

exports.updateSubject = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, applicable_grades } = req.body;

    await db.query(
      "UPDATE subjects SET NAME = ?, description = ?, applicable_grades = ? WHERE id = ?",
      [name, description || null, applicable_grades || null, id]
    );
    res.json({ message: 'Subject updated' });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

exports.deleteSubject = async (req, res) => {
  try {
    const { id } = req.params;

    const [[used]] = await db.query(
      `SELECT COUNT(*) as count FROM teacher_assignments WHERE subject_id = ?`,
      [id]
    );
    if (used.count > 0) {
      return res.status(409).json({ error: 'Cannot delete: subject is assigned to teachers' });
    }

    await db.query('DELETE FROM subjects WHERE id = ?', [id]);
    res.json({ message: 'Subject deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};