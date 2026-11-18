const express = require('express');
const router = express.Router();
const { submitScore, getProjectScores, getAllScores } = require('../controllers/scoreController');
const { protect, requireRole } = require('../middleware/authMiddleware');
const asyncHandler = require('../middleware/asyncHandler');
const validate = require('../middleware/validate');
const { submitScore: submitScoreSchema } = require('../validation/schemas');

router.post('/', protect, requireRole('judge'), validate(submitScoreSchema), asyncHandler(submitScore));
router.get('/project/:projectId', protect, asyncHandler(getProjectScores));
router.get('/', protect, requireRole('admin'), asyncHandler(getAllScores));

module.exports = router;
