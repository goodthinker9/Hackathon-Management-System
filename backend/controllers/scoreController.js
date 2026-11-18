const ScoreModel = require('../models/scoreModel');
const ProjectModel = require('../models/projectModel');
const { HttpError } = require('../middleware/errorHandler');

const submitScore = async (req, res) => {
  const { project_id, score, feedback } = req.body;
  if (!(await ProjectModel.findById(project_id))) throw new HttpError(404, 'Project not found');
  if (await ScoreModel.hasJudgeScored(project_id, req.user.id)) {
    throw new HttpError(409, 'You have already scored this project');
  }

  const scoreId = await ScoreModel.create({
    project_id,
    judge_id: req.user.id,
    score,
    feedback,
  });
  res.status(201).json({ message: 'Score submitted successfully', scoreId });
};

const getProjectScores = async (req, res) => {
  res.json({ scores: await ScoreModel.getByProject(req.params.projectId) });
};

const getAllScores = async (_req, res) => {
  res.json({ scores: await ScoreModel.getAll() });
};

module.exports = { submitScore, getProjectScores, getAllScores };
