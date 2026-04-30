const express = require('express');
const router = express.Router();
const { submitScore, getProjectScores, getAllScores } = require('../controllers/scoreController');
const { protect, requireRole } = require('../middleware/authMiddleware');

router.post('/', protect, requireRole('judge'), submitScore);
router.get('/project/:projectId', protect, getProjectScores);
router.get('/', protect, requireRole('admin'), getAllScores);

module.exports = router;
