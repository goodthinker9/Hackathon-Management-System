const express = require('express');
const router = express.Router();
const {
  getStats, getAllUsers, createUser, deleteUser,
  getAllTeams, getAllProjects, deleteProject, getAllScores
} = require('../controllers/adminController');
const { protect, requireRole } = require('../middleware/authMiddleware');
const asyncHandler = require('../middleware/asyncHandler');
const validate = require('../middleware/validate');
const { createUser: createUserSchema, adminStatsQuery } = require('../validation/schemas');

// All admin routes require admin role
router.use(protect, requireRole('admin'));

router.get('/stats', validate(adminStatsQuery, 'query'), asyncHandler(getStats));
router.get('/users', asyncHandler(getAllUsers));
router.post('/users', validate(createUserSchema), asyncHandler(createUser));
router.delete('/users/:id', asyncHandler(deleteUser));
router.get('/teams', asyncHandler(getAllTeams));
router.get('/projects', asyncHandler(getAllProjects));
router.delete('/projects/:id', asyncHandler(deleteProject));
router.get('/scores', asyncHandler(getAllScores));

module.exports = router;
