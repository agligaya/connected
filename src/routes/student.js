const express = require('express');
const router = express.Router();
const { verifyToken, requireRole } = require('../middleware/auth');
const studentPortal = require('../controllers/studentPortalController');

router.get('/me', verifyToken, requireRole('student'), studentPortal.me);
router.get('/subjects', verifyToken, requireRole('student'), studentPortal.subjects);
router.get('/subjects/:subjectId', verifyToken, requireRole('student'), studentPortal.subjectDetail);

module.exports = router;
