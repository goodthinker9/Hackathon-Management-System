const express = require('express');
const router = express.Router();
const { getTeamById } = require('../controllers/teamController');
const { protect } = require('../middleware/authMiddleware');
const asyncHandler = require('../middleware/asyncHandler');
const validate = require('../middleware/validate');
const { idParam } = require('../validation/schemas');

router.get('/:id', protect, validate(idParam, 'params'), asyncHandler(getTeamById));

module.exports = router;
