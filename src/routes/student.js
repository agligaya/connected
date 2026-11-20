const express = require('express');
const router = express.Router();
const { verifyToken, requireRole } = require('../middleware/auth');
const studentPortal = require('../controllers/studentPortalController');

router.get('/me', verifyToken, requireRole('student'), studentPortal.me);
router.get('/subjects', verifyToken, requireRole('student'), studentPortal.subjects);
router.get('/subjects/:subjectId', verifyToken, requireRole('student'), studentPortal.subjectDetail);
router.get('/records/:assessmentId/work', verifyToken, requireRole('student'), studentPortal.submission);
router.get('/announcements', verifyToken, requireRole('student'), studentPortal.announcements);
router.get('/notifications', verifyToken, requireRole('student'), studentPortal.notifications);
router.post('/notifications/mark-all-read', verifyToken, requireRole('student'), studentPortal.markAllNotificationsRead);
router.post('/announcements/mark-all-read', verifyToken, requireRole('student'), studentPortal.markAllAnnouncementsRead);
router.post('/announcements/:id/read', verifyToken, requireRole('student'), studentPortal.setAnnouncementRead);
router.delete('/announcements/:id/read', verifyToken, requireRole('student'), studentPortal.setAnnouncementRead);
module.exports = router;
