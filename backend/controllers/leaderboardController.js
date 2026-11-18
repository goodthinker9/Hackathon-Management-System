const ScoreModel = require('../models/scoreModel');

const getLeaderboard = async (_req, res) => {
  const leaderboard = await ScoreModel.getLeaderboard();
  res.json({ leaderboard });
};

module.exports = { getLeaderboard };
