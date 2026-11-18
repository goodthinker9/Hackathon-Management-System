const express = require('express');
const router = express.Router();
const { getLeaderboard } = require('../controllers/leaderboardController');
const asyncHandler = require('../middleware/asyncHandler');

// Public leaderboard
router.get('/', asyncHandler(getLeaderboard));

module.exports = router;
