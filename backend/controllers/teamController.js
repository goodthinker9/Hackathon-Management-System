const TeamModel = require('../models/teamModel');
const { HttpError } = require('../middleware/errorHandler');

const createTeam = async (req, res) => {
  const { name, description } = req.body;
  const existing = await TeamModel.getUserTeam(req.user.id);
  if (existing) throw new HttpError(409, 'You are already in a team');

  const teamId = await TeamModel.create({ name, description: description || null, owner_id: req.user.id });
  const team = await TeamModel.findById(teamId);
  res.status(201).json({ message: 'Team created successfully', team });
};

const joinTeam = async (req, res) => {
  const { invite_code } = req.body;
  const existing = await TeamModel.getUserTeam(req.user.id);
  if (existing) throw new HttpError(409, 'You are already in a team');

  const team = await TeamModel.findByInviteCode(invite_code);
  if (!team) throw new HttpError(404, 'Invalid invite code');
  await TeamModel.addMember(team.id, req.user.id);
  res.json({ message: 'Joined team successfully', team });
};

const getMyTeam = async (req, res) => {
  const team = await TeamModel.getUserTeam(req.user.id);
  if (!team) throw new HttpError(404, 'You are not in any team');
  const members = await TeamModel.getMembers(team.id);
  res.json({ team: { ...team, members } });
};

const getTeamById = async (req, res) => {
  const team = await TeamModel.findById(req.params.id);
  if (!team) throw new HttpError(404, 'Team not found');
  const members = await TeamModel.getMembers(team.id);
  res.json({ team: { ...team, members } });
};

const getAllTeams = async (_req, res) => {
  res.json({ teams: await TeamModel.getAll() });
};

module.exports = { createTeam, joinTeam, getMyTeam, getTeamById, getAllTeams };
