const ScoreModel = require('../models/scoreModel');
const HackathonModel = require('../models/hackathonModel');
const { HttpError } = require('../middleware/errorHandler');

const getLeaderboard = async (_req, res) => {
  const hackathon = await HackathonModel.findByIdOrSlug('legacy-hackathon');
  if (!hackathon) throw new HttpError(404, 'Legacy leaderboard is unavailable');
  if (!hackathon.results_published_at) throw new HttpError(403, 'Results have not been published');
  const leaderboard = await ScoreModel.getLeaderboard(hackathon.id);
  res.json({ leaderboard });
};

module.exports = { getLeaderboard };
