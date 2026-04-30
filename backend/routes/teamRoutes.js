const express = require('express');
const router = express.Router();
const { createTeam, joinTeam, getMyTeam, getTeamById, getAllTeams } = require('../controllers/teamController');
const { protect, requireRole } = require('../middleware/authMiddleware');

router.get('/', protect, getAllTeams);
router.post('/create', protect, requireRole('participant'), createTeam);
router.post('/join', protect, requireRole('participant'), joinTeam);
router.get('/my-team', protect, getMyTeam);
router.get('/:id', protect, getTeamById);

module.exports = router;
