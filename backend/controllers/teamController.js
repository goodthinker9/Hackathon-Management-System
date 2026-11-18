const TeamModel = require('../models/teamModel');
const HackathonModel = require('../models/hackathonModel');
const { withTransaction } = require('../config/transaction');
const { HttpError } = require('../middleware/errorHandler');

const getAllTeams = async (req, res) => {
  res.json({ teams: await TeamModel.getPublicList(req.hackathon.id) });
};

const createTeam = async (req, res) => {
  let teamId;
  try {
    teamId = await withTransaction(async (connection) => {
      if (await TeamModel.getUserTeam(req.user.id, req.hackathon.id, connection)) {
        throw new HttpError(409, 'You are already in a team for this hackathon');
      }
      return TeamModel.create({
        name: req.body.name,
        description: req.body.description || null,
        owner_id: req.user.id,
        hackathon_id: req.hackathon.id,
      }, connection);
    });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      if (error.message.includes('uq_teams_hackathon_name')) {
        throw new HttpError(409, 'A team with this name already exists in this hackathon');
      }
      throw new HttpError(409, 'You are already in a team for this hackathon');
    }
    throw error;
  }
  const team = await TeamModel.findById(teamId, req.hackathon.id);
  res.status(201).json({
    message: 'Team created successfully',
    team: { ...team, members: await TeamModel.getMembers(teamId) },
  });
};

const joinTeam = async (req, res) => {
  try {
    const teamId = await withTransaction(async (connection) => {
      if (await TeamModel.getUserTeam(req.user.id, req.hackathon.id, connection)) {
        throw new HttpError(409, 'You are already in a team for this hackathon');
      }
      const team = await TeamModel.findByInviteCodeForUpdate(
        req.body.invite_code,
        req.hackathon.id,
        connection
      );
      if (!team) throw new HttpError(404, 'Invalid invite code for this hackathon');

      const memberCount = await TeamModel.countMembers(team.id, connection);
      if (memberCount >= team.max_team_size) {
        throw new HttpError(409, 'This team has reached its maximum size');
      }

      await TeamModel.addMember(team.id, req.user.id, req.hackathon.id, connection);
      return team.id;
    });
    const team = await TeamModel.findById(teamId, req.hackathon.id);
    res.json({
      message: 'Joined team successfully',
      team: { ...team, members: await TeamModel.getMembers(teamId) },
    });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      throw new HttpError(409, 'You are already in a team for this hackathon');
    }
    throw error;
  }
};

const getMyTeam = async (req, res) => {
  const team = await TeamModel.getUserTeam(req.user.id, req.hackathon.id);
  if (!team) return res.json({ team: null });
  const members = await TeamModel.getMembers(team.id);
  res.json({ team: { ...team, members } });
};

const getTeamById = async (req, res) => {
  const team = await TeamModel.findById(req.params.id);
  if (!team) throw new HttpError(404, 'Team not found');
  const hackathon = await HackathonModel.findByIdOrSlug(team.hackathon_id, req.user.id);
  if (!hackathon || (!hackathon.is_published && req.user.role !== 'admin')) {
    throw new HttpError(404, 'Team not found');
  }
  const members = await TeamModel.getMembers(team.id);
  res.json({ team: { ...team, members } });
};

module.exports = { createTeam, joinTeam, getMyTeam, getTeamById, getAllTeams };
