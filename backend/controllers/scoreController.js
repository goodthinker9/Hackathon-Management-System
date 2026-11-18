const ScoreModel = require('../models/scoreModel');
const ProjectModel = require('../models/projectModel');
const HackathonModel = require('../models/hackathonModel');
const { getPhase } = require('../utils/hackathonPhase');
const { HttpError } = require('../middleware/errorHandler');

const submitScore = async (req, res) => {
  const { project_id, score, feedback } = req.body;
  const project = await ProjectModel.findById(project_id);
  if (!project) throw new HttpError(404, 'Project not found');
  const hackathon = await HackathonModel.getById(project.hackathon_id);
  if (!hackathon || getPhase(hackathon) !== 'judging') {
    throw new HttpError(403, 'Scores can only be submitted during the judging phase');
  }
  if (await ScoreModel.hasJudgeScored(project_id, req.user.id)) {
    throw new HttpError(409, 'You have already scored this project');
  }

  let scoreId;
  try {
    scoreId = await ScoreModel.create({
      project_id,
      judge_id: req.user.id,
      score,
      feedback,
    });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      throw new HttpError(409, 'You have already scored this project');
    }
    throw error;
  }
  res.status(201).json({ message: 'Score submitted successfully', scoreId });
};

const getProjectScores = async (req, res) => {
  const project = await ProjectModel.findById(req.params.projectId);
  if (!project) throw new HttpError(404, 'Project not found');
  const hackathon = await HackathonModel.getById(project.hackathon_id);
  if (!hackathon || (!hackathon.is_published && req.user.role !== 'admin')) {
    throw new HttpError(404, 'Project not found');
  }
  if (!hackathon.results_published_at && !['admin', 'judge'].includes(req.user.role)) {
    throw new HttpError(403, 'Results have not been published');
  }
  res.json({ scores: await ScoreModel.getByProject(req.params.projectId) });
};

const getAllScores = async (_req, res) => {
  res.json({ scores: await ScoreModel.getAll() });
};

module.exports = { submitScore, getProjectScores, getAllScores };
