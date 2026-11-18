const ProjectModel = require('../models/projectModel');
const TeamModel = require('../models/teamModel');
const HackathonModel = require('../models/hackathonModel');
const { getPhase } = require('../utils/hackathonPhase');
const { HttpError } = require('../middleware/errorHandler');

function assertSubmissionWindow(hackathon) {
  const now = Date.now();
  if (now < new Date(hackathon.starts_at).getTime() || now > new Date(hackathon.submission_deadline).getTime()) {
    throw new HttpError(403, 'Project submissions are not open');
  }
}

const getAllProjects = async (req, res) => {
  const canViewLiveScores = ['admin', 'judge'].includes(req.user?.role)
    || Boolean(req.hackathon.results_published_at);
  res.json({ projects: await ProjectModel.getAll(req.hackathon.id, canViewLiveScores) });
};

const submitProject = async (req, res) => {
  assertSubmissionWindow(req.hackathon);
  const team = await TeamModel.getUserTeam(req.user.id, req.hackathon.id);
  if (!team) throw new HttpError(409, 'Join a team in this hackathon before submitting a project');

  if (await ProjectModel.findByTeam(team.id, req.hackathon.id)) {
    throw new HttpError(409, 'Your team has already submitted a project');
  }

  let projectId;
  try {
    projectId = await ProjectModel.create({
      ...req.body,
      team_id: team.id,
      submitted_by: req.user.id,
      hackathon_id: req.hackathon.id,
    });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') throw new HttpError(409, 'Your team has already submitted a project');
    throw error;
  }
  const project = await ProjectModel.findById(projectId);
  res.status(201).json({ message: 'Project submitted successfully', project });
};

const updateProject = async (req, res) => {
  assertSubmissionWindow(req.hackathon);
  const team = await TeamModel.getUserTeam(req.user.id, req.hackathon.id);
  if (!team) throw new HttpError(404, 'Project not found for your team');
  const project = await ProjectModel.findByTeam(team.id, req.hackathon.id);
  const target = await ProjectModel.findById(req.params.id);
  if (!target || target.hackathon_id !== req.hackathon.id || !project || target.id !== project.id) {
    throw new HttpError(404, 'Project not found for your team');
  }
  if (!(await TeamModel.isMember(target.team_id, req.user.id))) {
    throw new HttpError(403, 'Only team members can edit this project');
  }
  await ProjectModel.updateById(target.id, req.hackathon.id, req.body);
  res.json({ message: 'Project updated successfully', project: await ProjectModel.findById(target.id) });
};

const getMyProject = async (req, res) => {
  const team = await TeamModel.getUserTeam(req.user.id, req.hackathon.id);
  if (!team) {
    return res.json({ project: null, message: 'Join a team in this hackathon before submitting a project' });
  }
  const project = await ProjectModel.findByTeam(team.id, req.hackathon.id);
  if (!project) {
    const phase = getPhase(req.hackathon);
    const starts = new Date(req.hackathon.starts_at).toLocaleString();
    const message = phase === 'upcoming' || phase === 'registration'
      ? `Submissions open on ${starts}`
      : 'No project submitted yet';
    return res.json({ project: null, message });
  }
  res.json({ project });
};

const getProjectById = async (req, res) => {
  const project = await ProjectModel.findById(req.params.id);
  if (!project) throw new HttpError(404, 'Project not found');
  const hackathon = await HackathonModel.findByIdOrSlug(project.hackathon_id, req.user.id);
  if (!hackathon || (!hackathon.is_published && req.user.role !== 'admin')) {
    throw new HttpError(404, 'Project not found');
  }
  res.json({ project });
};

const deleteProject = async (req, res) => {
  const affected = await ProjectModel.deleteById(req.params.id);
  if (!affected) throw new HttpError(404, 'Project not found');
  res.json({ message: 'Project deleted successfully' });
};

module.exports = {
  getAllProjects, submitProject, updateProject, getMyProject, getProjectById, deleteProject,
};
