const ProjectModel = require('../models/projectModel');
const TeamModel = require('../models/teamModel');

const submitProject = async (req, res) => {
  try {
    const { title, description, github_link } = req.body;

    if (!title || !description || !github_link) {
      return res.status(400).json({ message: 'Title, description, and GitHub link are required' });
    }

    // User must be in a team
    const team = await TeamModel.getUserTeam(req.user.id);
    if (!team) {
      return res.status(400).json({ message: 'You must be in a team to submit a project' });
    }

    // One project per team
    const existing = await ProjectModel.findByTeam(team.id);
    if (existing) {
      return res.status(409).json({ message: 'Your team has already submitted a project' });
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
  } catch (err) {
    console.error('Submit project error:', err);
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

const getProjectById = async (req, res) => {
  try {
    const project = await ProjectModel.findById(req.params.id);
    if (!project) return res.status(404).json({ message: 'Project not found' });
    res.json({ project });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

const getMyProject = async (req, res) => {
  try {
    const team = await TeamModel.getUserTeam(req.user.id);
    if (!team) return res.status(404).json({ message: 'You are not in any team' });

    const project = await ProjectModel.findByTeam(team.id);
    if (!project) return res.status(404).json({ message: 'No project submitted yet' });

    res.json({ project });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

const deleteProject = async (req, res) => {
  try {
    const affected = await ProjectModel.deleteById(req.params.id);
    if (!affected) return res.status(404).json({ message: 'Project not found' });
    res.json({ message: 'Project deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { submitProject, getAllProjects, getProjectById, getMyProject, deleteProject };
