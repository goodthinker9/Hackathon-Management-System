const express = require('express');
const router = express.Router();
const { getProjectById, deleteProject } = require('../controllers/projectController');
const { protect, requireRole } = require('../middleware/authMiddleware');
const asyncHandler = require('../middleware/asyncHandler');
const validate = require('../middleware/validate');
const { idParam } = require('../validation/schemas');

router.get('/:id', protect, validate(idParam, 'params'), asyncHandler(getProjectById));
router.delete('/:id', protect, requireRole('admin'), validate(idParam, 'params'), asyncHandler(deleteProject));

module.exports = router;
