const express = require('express');
const router = express.Router();
const { createTeam, joinTeam, getMyTeam, getTeamById, getAllTeams } = require('../controllers/teamController');
const { protect, requireRole } = require('../middleware/authMiddleware');
const asyncHandler = require('../middleware/asyncHandler');
const validate = require('../middleware/validate');
const { createTeam: createTeamSchema, joinTeam: joinTeamSchema } = require('../validation/schemas');

router.get('/', protect, asyncHandler(getAllTeams));
router.post('/create', protect, requireRole('participant'), validate(createTeamSchema), asyncHandler(createTeam));
router.post('/join', protect, requireRole('participant'), validate(joinTeamSchema), asyncHandler(joinTeam));
router.get('/my-team', protect, asyncHandler(getMyTeam));
router.get('/:id', protect, asyncHandler(getTeamById));

module.exports = router;
