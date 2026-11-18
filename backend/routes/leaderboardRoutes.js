const express = require('express');
const router = express.Router();
const { getLeaderboard } = require('../controllers/leaderboardController');
const asyncHandler = require('../middleware/asyncHandler');
const { optionalProtect } = require('../middleware/authMiddleware');

// Public leaderboard
router.get('/', optionalProtect, asyncHandler(getLeaderboard));

module.exports = router;
