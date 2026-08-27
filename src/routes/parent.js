const express = require('express');
const router = express.Router();
const { verifyToken, requireRole } = require('../middleware/auth');
const parentController = require('../controllers/parentController');

router.get('/me', verifyToken, requireRole('parent'), parentController.getProfile);
router.get('/children', verifyToken, requireRole('parent'), parentController.getChildren);
router.get('/child/:id/attendance', verifyToken, requireRole('parent'), parentController.getChildAttendance);
router.get('/child/:id/stats', verifyToken, requireRole('parent'), parentController.getChildStats);
router.get('/child/:id/progress', verifyToken, requireRole('parent'), parentController.getChildProgress);
router.get('/inbox', verifyToken, requireRole('parent'), parentController.getParentInbox);
router.post('/messages/:id/read', verifyToken, requireRole('parent'), parentController.markMessageRead);
router.delete('/messages/:id/read', verifyToken, requireRole('parent'), parentController.markMessageRead);
router.get('/child/:id/teachers', verifyToken, requireRole('parent'), parentController.getChildTeachers);
router.get('/concerns', verifyToken, requireRole('parent'), parentController.getMyConcerns);
router.post('/concerns', verifyToken, requireRole('parent'), parentController.createConcern);
router.post('/concerns/:id/reply', verifyToken, requireRole('parent'), parentController.replyToConcern);

module.exports = router;