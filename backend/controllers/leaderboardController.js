const ScoreModel = require('../models/scoreModel');

const getLeaderboard = async (req, res) => {
  try {
    const leaderboard = await ScoreModel.getLeaderboard();
    res.json({ leaderboard });
  } catch (err) {
    console.error('Leaderboard error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { getLeaderboard };
