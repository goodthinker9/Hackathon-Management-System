const UserModel = require('../models/userModel');
const TeamModel = require('../models/teamModel');
const ProjectModel = require('../models/projectModel');
const ScoreModel = require('../models/scoreModel');
const db = require('../config/db');
const bcrypt = require('bcryptjs');
const { HttpError } = require('../middleware/errorHandler');

const getStats = async (_req, res) => {
  const [[usersCount]] = await db.query('SELECT COUNT(*) AS count FROM users');
  const [[teamsCount]] = await db.query('SELECT COUNT(*) AS count FROM teams');
  const [[projectsCount]] = await db.query('SELECT COUNT(*) AS count FROM projects');
  const [[scoresCount]] = await db.query('SELECT COUNT(*) AS count FROM scores');
  res.json({
    stats: {
      users: usersCount.count,
      teams: teamsCount.count,
      projects: projectsCount.count,
      scores: scoresCount.count,
    },
  });
};

const getAllUsers = async (_req, res) => res.json({ users: await UserModel.getAll() });

const createUser = async (req, res) => {
  const { name, email, password, role } = req.body;
  if (await UserModel.findByEmail(email)) throw new HttpError(409, 'Email already registered');
  const hashedPassword = await bcrypt.hash(password, 10);
  const userId = await UserModel.create({ name, email, password: hashedPassword, role });
  const user = await UserModel.findById(userId);
  res.status(201).json({ message: 'User created', user });
};

const deleteUser = async (req, res) => {
  if (Number.parseInt(req.params.id, 10) === req.user.id) {
    throw new HttpError(400, 'Cannot delete your own account');
  }
  if (!(await UserModel.deleteById(req.params.id))) throw new HttpError(404, 'User not found');
  res.json({ message: 'User deleted successfully' });
};

const getAllTeams = async (_req, res) => res.json({ teams: await TeamModel.getAll() });
const getAllProjects = async (_req, res) => res.json({ projects: await ProjectModel.getAll() });

const deleteProject = async (req, res) => {
  if (!(await ProjectModel.deleteById(req.params.id))) throw new HttpError(404, 'Project not found');
  res.json({ message: 'Project deleted' });
};

const getAllScores = async (_req, res) => res.json({ scores: await ScoreModel.getAll() });

module.exports = { getStats, getAllUsers, createUser, deleteUser, getAllTeams, getAllProjects, deleteProject, getAllScores };
