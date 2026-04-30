const express = require('express');
const router = express.Router();
const { submitProject, getAllProjects, getProjectById, getMyProject, deleteProject } = require('../controllers/projectController');
const { protect, requireRole } = require('../middleware/authMiddleware');

router.get('/', protect, getAllProjects);
router.post('/submit', protect, requireRole('participant'), submitProject);
router.get('/my-project', protect, requireRole('participant'), getMyProject);
router.get('/:id', protect, getProjectById);
router.delete('/:id', protect, requireRole('admin'), deleteProject);

module.exports = router;
