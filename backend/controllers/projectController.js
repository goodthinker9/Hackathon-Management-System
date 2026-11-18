const ProjectModel = require('../models/projectModel');
const TeamModel = require('../models/teamModel');
const { HttpError } = require('../middleware/errorHandler');

const submitProject = async (req, res) => {
  const { title, description, github_link } = req.body;
  const team = await TeamModel.getUserTeam(req.user.id);
  if (!team) throw new HttpError(400, 'You must be in a team to submit a project');

  if (await ProjectModel.findByTeam(team.id)) {
    throw new HttpError(409, 'Your team has already submitted a project');
  }

  const projectId = await ProjectModel.create({
    title,
    description,
    github_link,
    team_id: team.id,
    submitted_by: req.user.id,
  });
  const project = await ProjectModel.findById(projectId);
  res.status(201).json({ message: 'Project submitted successfully', project });
};

const getAllProjects = async (_req, res) => {
  res.json({ projects: await ProjectModel.getAll() });
};

const getProjectById = async (req, res) => {
  const project = await ProjectModel.findById(req.params.id);
  if (!project) throw new HttpError(404, 'Project not found');
  res.json({ project });
};

const getMyProject = async (req, res) => {
  const team = await TeamModel.getUserTeam(req.user.id);
  if (!team) throw new HttpError(404, 'You are not in any team');
  const project = await ProjectModel.findByTeam(team.id);
  if (!project) throw new HttpError(404, 'No project submitted yet');
  res.json({ project });
};

const deleteProject = async (req, res) => {
  const affected = await ProjectModel.deleteById(req.params.id);
  if (!affected) throw new HttpError(404, 'Project not found');
  res.json({ message: 'Project deleted successfully' });
};

module.exports = { submitProject, getAllProjects, getProjectById, getMyProject, deleteProject };
