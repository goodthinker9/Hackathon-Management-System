const express = require('express');
const router = express.Router();
const {
  getStats, getAllUsers, createUser, deleteUser,
  getAllTeams, getAllProjects, deleteProject, getAllScores
} = require('../controllers/adminController');
const { protect, requireRole } = require('../middleware/authMiddleware');

// All admin routes require admin role
router.use(protect, requireRole('admin'));

router.get('/stats', getStats);
router.get('/users', getAllUsers);
router.post('/users', createUser);
router.delete('/users/:id', deleteUser);
router.get('/teams', getAllTeams);
router.get('/projects', getAllProjects);
router.delete('/projects/:id', deleteProject);
router.get('/scores', getAllScores);

module.exports = router;
