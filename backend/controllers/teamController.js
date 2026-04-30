const TeamModel = require('../models/teamModel');

const createTeam = async (req, res) => {
  try {
    const { name, description } = req.body;
    if (!name) return res.status(400).json({ message: 'Team name is required' });

    // Check if user already has a team
    const existing = await TeamModel.getUserTeam(req.user.id);
    if (existing) {
      return res.status(409).json({ message: 'You are already in a team' });
    }

    const teamId = await TeamModel.create({ name, description, owner_id: req.user.id });
    const team = await TeamModel.findById(teamId);

    res.status(201).json({ message: 'Team created successfully', team });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ message: 'Team name already taken' });
    }
    console.error('Create team error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

const joinTeam = async (req, res) => {
  try {
    const { invite_code } = req.body;
    if (!invite_code) return res.status(400).json({ message: 'Invite code is required' });

    // Check if user already has a team
    const existing = await TeamModel.getUserTeam(req.user.id);
    if (existing) {
      return res.status(409).json({ message: 'You are already in a team' });
    }

    const team = await TeamModel.findByInviteCode(invite_code);
    if (!team) return res.status(404).json({ message: 'Invalid invite code' });

    await TeamModel.addMember(team.id, req.user.id);
    res.json({ message: 'Joined team successfully', team });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ message: 'Already a member of this team' });
    }
    console.error('Join team error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

const getMyTeam = async (req, res) => {
  try {
    const team = await TeamModel.getUserTeam(req.user.id);
    if (!team) return res.status(404).json({ message: 'You are not in any team' });

    const members = await TeamModel.getMembers(team.id);
    res.json({ team: { ...team, members } });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

const getTeamById = async (req, res) => {
  try {
    const team = await TeamModel.findById(req.params.id);
    if (!team) return res.status(404).json({ message: 'Team not found' });

    const members = await TeamModel.getMembers(team.id);
    res.json({ team: { ...team, members } });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

const getAllTeams = async (req, res) => {
  try {
    const teams = await TeamModel.getAll();
    res.json({ teams });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { createTeam, joinTeam, getMyTeam, getTeamById, getAllTeams };
