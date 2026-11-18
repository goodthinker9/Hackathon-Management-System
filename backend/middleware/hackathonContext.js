const HackathonModel = require('../models/hackathonModel');
const { HttpError } = require('./errorHandler');
const asyncHandler = require('./asyncHandler');

const loadHackathon = asyncHandler(async (req, _res, next) => {
  const identifier = req.params.hackathonId || req.params.id;
  const hackathon = await HackathonModel.findByIdOrSlug(identifier, req.user?.id);
  if (!hackathon || (!hackathon.is_published && req.user?.role !== 'admin')) {
    throw new HttpError(404, 'Hackathon not found');
  }
  req.hackathon = hackathon;
  next();
});

const requireRegistration = asyncHandler(async (req, _res, next) => {
  const registered = await HackathonModel.isRegistered(req.hackathon.id, req.user.id);
  if (!registered) throw new HttpError(403, 'Register for this hackathon before managing a team');
  next();
});

const requireSubmissionWindow = (now = () => new Date()) => asyncHandler(async (req, _res, next) => {
  if (now().getTime() > new Date(req.hackathon.submission_deadline).getTime()) {
    throw new HttpError(403, 'Team changes are closed after the submission deadline');
  }
  next();
});

module.exports = { loadHackathon, requireRegistration, requireSubmissionWindow };
