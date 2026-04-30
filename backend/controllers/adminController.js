const UserModel = require('../models/userModel');
const TeamModel = require('../models/teamModel');
const ProjectModel = require('../models/projectModel');
const ScoreModel = require('../models/scoreModel');
const db = require('../config/db');
const bcrypt = require('bcryptjs');

const getStats = async (req, res) => {
  try {
    const [usersCount] = await db.query('SELECT COUNT(*) AS count FROM users');
    const [teamsCount] = await db.query('SELECT COUNT(*) AS count FROM teams');
    const [projectsCount] = await db.query('SELECT COUNT(*) AS count FROM projects');
    const [scoresCount] = await db.query('SELECT COUNT(*) AS count FROM scores');

    res.json({
      stats: {
        users: usersCount[0].count,
        teams: teamsCount[0].count,
        projects: projectsCount[0].count,
        scores: scoresCount[0].count,
      },
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

const getAllUsers = async (req, res) => {
  try {
    const users = await UserModel.getAll();
    res.json({ users });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

const createUser = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    if (!name || !email || !password || !role) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const existing = await UserModel.findByEmail(email);
    if (existing) return res.status(409).json({ message: 'Email already registered' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const userId = await UserModel.create({ name, email, password: hashedPassword, role });
    const user = await UserModel.findById(userId);

    res.status(201).json({ message: 'User created', user });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

const deleteUser = async (req, res) => {
  try {
    if (parseInt(req.params.id) === req.user.id) {
      return res.status(400).json({ message: 'Cannot delete your own account' });
    }
    const affected = await UserModel.deleteById(req.params.id);
    if (!affected) return res.status(404).json({ message: 'User not found' });
    res.json({ message: 'User deleted successfully' });
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

const getAllProjects = async (req, res) => {
  try {
    const projects = await ProjectModel.getAll();
    res.json({ projects });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

const deleteProject = async (req, res) => {
  try {
    const affected = await ProjectModel.deleteById(req.params.id);
    if (!affected) return res.status(404).json({ message: 'Project not found' });
    res.json({ message: 'Project deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

const getAllScores = async (req, res) => {
  try {
    const scores = await ScoreModel.getAll();
    res.json({ scores });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { getStats, getAllUsers, createUser, deleteUser, getAllTeams, getAllProjects, deleteProject, getAllScores };
