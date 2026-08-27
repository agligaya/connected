const express = require('express');
const router = express.Router();
const { verifyToken, requireRole } = require('../middleware/auth');
const studentController = require('../controllers/studentController');

router.post('/students', verifyToken, requireRole('admin'), studentController.createStudent);
router.get('/students', verifyToken, requireRole('admin'), studentController.getStudents);
router.put('/students/:id', verifyToken, requireRole('admin'), studentController.updateStudent);
router.patch('/students/:id/status', verifyToken, requireRole('admin'), studentController.updateStudentStatus);
router.delete('/students/:id', verifyToken, requireRole('admin'), studentController.deleteStudent);
router.get('/parents', verifyToken, requireRole('admin'), studentController.getParents);
router.get('/teachers', verifyToken, requireRole('admin'), studentController.getTeachers);
router.get('/sections/:grade', verifyToken, requireRole('admin'), studentController.getSectionsByGrade);

module.exports = router;