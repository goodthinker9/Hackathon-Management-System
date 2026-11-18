const express = require('express');
const router = express.Router();
const { submitProject, getAllProjects, getProjectById, getMyProject, deleteProject } = require('../controllers/projectController');
const { protect, requireRole } = require('../middleware/authMiddleware');
const asyncHandler = require('../middleware/asyncHandler');
const validate = require('../middleware/validate');
const { submitProject: submitProjectSchema } = require('../validation/schemas');

router.get('/', protect, asyncHandler(getAllProjects));
router.post('/submit', protect, requireRole('participant'), validate(submitProjectSchema), asyncHandler(submitProject));
router.get('/my-project', protect, requireRole('participant'), asyncHandler(getMyProject));
router.get('/:id', protect, asyncHandler(getProjectById));
router.delete('/:id', protect, requireRole('admin'), asyncHandler(deleteProject));

module.exports = router;
