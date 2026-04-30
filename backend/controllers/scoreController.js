const ScoreModel = require('../models/scoreModel');
const ProjectModel = require('../models/projectModel');

const submitScore = async (req, res) => {
  try {
    const { project_id, score, feedback } = req.body;

    if (!project_id || score === undefined) {
      return res.status(400).json({ message: 'Project ID and score are required' });
    }

    if (score < 1 || score > 10) {
      return res.status(400).json({ message: 'Score must be between 1 and 10' });
    }

    // Check project exists
    const project = await ProjectModel.findById(project_id);
    if (!project) return res.status(404).json({ message: 'Project not found' });

    // Prevent duplicate scoring
    const alreadyScored = await ScoreModel.hasJudgeScored(project_id, req.user.id);
    if (alreadyScored) {
      return res.status(409).json({ message: 'You have already scored this project' });
    }

    const scoreId = await ScoreModel.create({
      project_id,
      judge_id: req.user.id,
      score: parseInt(score),
      feedback,
    });

    res.status(201).json({ message: 'Score submitted successfully', scoreId });
  } catch (err) {
    console.error('Score error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

const getProjectScores = async (req, res) => {
  try {
    const scores = await ScoreModel.getByProject(req.params.projectId);
    res.json({ scores });
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

module.exports = { submitScore, getProjectScores, getAllScores };
