const express = require('express');
const router = express.Router();
const hackathonController = require('../controllers/hackathonController');
const teamController = require('../controllers/teamController');
const projectController = require('../controllers/projectController');
const { protect, optionalProtect, requireRole } = require('../middleware/authMiddleware');
const { loadHackathon, requireRegistration, requireSubmissionWindow } = require('../middleware/hackathonContext');
const asyncHandler = require('../middleware/asyncHandler');
const validate = require('../middleware/validate');
const {
  createHackathon, updateHackathon, hackathonListQuery, hackathonParam, hackathonIdPath,
  hackathonProjectParam, forceQuery, publishHackathon, publishResults, emptyBody,
  createTeam, joinTeam, submitProject,
} = require('../validation/schemas');

const eventAdmin = [protect, requireRole('admin')];
const eventParticipant = [protect, requireRole('participant')];

router.get('/me', protect, validate(emptyBody), asyncHandler(hackathonController.getMine));
router.get('/', optionalProtect, validate(hackathonListQuery, 'query'), asyncHandler(hackathonController.list));
router.post('/', ...eventAdmin, validate(createHackathon), asyncHandler(hackathonController.create));

router.get('/:id', optionalProtect, validate(hackathonIdPath, 'params'), loadHackathon, asyncHandler(hackathonController.getById));
router.put('/:id', ...eventAdmin, validate(hackathonIdPath, 'params'), loadHackathon, validate(updateHackathon), asyncHandler(hackathonController.update));
router.delete('/:id', ...eventAdmin, validate(hackathonIdPath, 'params'), validate(forceQuery, 'query'), loadHackathon, asyncHandler(hackathonController.remove));
router.patch('/:id/publish', ...eventAdmin, validate(hackathonIdPath, 'params'), loadHackathon, validate(publishHackathon), asyncHandler(hackathonController.setPublished));
router.patch('/:id/results', ...eventAdmin, validate(hackathonIdPath, 'params'), loadHackathon, validate(publishResults), asyncHandler(hackathonController.setResultsPublished));

router.post('/:id/register', ...eventParticipant, validate(hackathonIdPath, 'params'), validate(emptyBody), loadHackathon, asyncHandler(hackathonController.register));
router.delete('/:id/register', ...eventParticipant, validate(hackathonIdPath, 'params'), validate(emptyBody), loadHackathon, asyncHandler(hackathonController.unregister));

router.get('/:hackathonId/teams', optionalProtect, validate(hackathonParam, 'params'), loadHackathon, asyncHandler(teamController.getAllTeams));
router.post('/:hackathonId/teams', ...eventParticipant, validate(hackathonParam, 'params'), validate(createTeam), loadHackathon, requireRegistration, requireSubmissionWindow(), asyncHandler(teamController.createTeam));
router.post('/:hackathonId/teams/join', ...eventParticipant, validate(hackathonParam, 'params'), validate(joinTeam), loadHackathon, requireRegistration, requireSubmissionWindow(), asyncHandler(teamController.joinTeam));
router.get('/:hackathonId/teams/my-team', ...eventParticipant, validate(hackathonParam, 'params'), loadHackathon, asyncHandler(teamController.getMyTeam));

router.get('/:hackathonId/projects', optionalProtect, validate(hackathonParam, 'params'), loadHackathon, asyncHandler(projectController.getAllProjects));
router.post('/:hackathonId/projects/submit', ...eventParticipant, validate(hackathonParam, 'params'), validate(submitProject), loadHackathon, requireRegistration, asyncHandler(projectController.submitProject));
router.put('/:hackathonId/projects/:id', ...eventParticipant, validate(hackathonProjectParam, 'params'), validate(submitProject), loadHackathon, requireRegistration, asyncHandler(projectController.updateProject));
router.get('/:hackathonId/projects/my-project', ...eventParticipant, validate(hackathonParam, 'params'), loadHackathon, asyncHandler(projectController.getMyProject));
router.get('/:hackathonId/leaderboard', optionalProtect, validate(hackathonParam, 'params'), loadHackathon, asyncHandler(hackathonController.getLeaderboard));

module.exports = router;
