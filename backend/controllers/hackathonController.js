const HackathonModel = require('../models/hackathonModel');
const TeamModel = require('../models/teamModel');
const ScoreModel = require('../models/scoreModel');
const { getPhase } = require('../utils/hackathonPhase');
const { HttpError } = require('../middleware/errorHandler');

const createSlug = (title) => {
  const normalized = title.toLowerCase().normalize('NFKD').replace(/[\u0300-\u036f]/g, '');
  const slug = normalized.replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  return /[a-z]/.test(slug) ? slug : `hackathon-${slug || 'event'}`;
};

async function uniqueSlug(title, requestedSlug, exceptId = null) {
  const base = requestedSlug || createSlug(title);
  let candidate = base;
  let suffix = 2;
  while (true) {
    const existing = await HackathonModel.findBySlug(candidate);
    if (!existing || existing.id === exceptId) return candidate;
    if (requestedSlug) throw new HttpError(409, 'Hackathon slug is already in use');
    candidate = `${base}-${suffix}`;
    suffix += 1;
  }
}

function withPhase(hackathon, now = new Date()) {
  return { ...hackathon, phase: getPhase(hackathon, now) };
}

const list = async (req, res) => {
  const { rows, total } = await HackathonModel.list({
    admin: req.user?.role === 'admin',
    phase: req.validated.query.phase,
    search: req.validated.query.search,
    page: req.validated.query.page,
    limit: req.validated.query.limit,
    userId: req.user?.id,
  });
  res.json({
    hackathons: rows.map((hackathon) => withPhase(hackathon)),
    pagination: {
      page: req.validated.query.page,
      limit: req.validated.query.limit,
      total,
      pages: Math.ceil(total / req.validated.query.limit),
    },
  });
};

const getById = async (req, res) => {
  res.json({ hackathon: withPhase(req.hackathon) });
};

const getMine = async (req, res) => {
  const hackathons = await HackathonModel.getForUser(req.user.id);
  res.json({ hackathons: hackathons.map((hackathon) => withPhase(hackathon)) });
};

const create = async (req, res) => {
  const event = {
    ...req.body,
    slug: await uniqueSlug(req.body.title, req.body.slug || null),
  };
  const id = await HackathonModel.create(event, req.user.id);
  const hackathon = await HackathonModel.findByIdOrSlug(id, req.user.id);
  res.status(201).json({ message: 'Hackathon created', hackathon: withPhase(hackathon) });
};

const update = async (req, res) => {
  const event = {
    ...req.body,
    slug: await uniqueSlug(req.body.title, req.body.slug || null, req.hackathon.id),
  };
  await HackathonModel.update(req.hackathon.id, event);
  const hackathon = await HackathonModel.findByIdOrSlug(req.hackathon.id, req.user.id);
  res.json({ message: 'Hackathon updated', hackathon: withPhase(hackathon) });
};

const remove = async (req, res) => {
  if (req.validated.query.force !== 'true' && await HackathonModel.hasRegistrations(req.hackathon.id)) {
    throw new HttpError(409, 'Hackathon has registrations; retry with ?force=true to delete its data');
  }
  await HackathonModel.delete(req.hackathon.id);
  res.json({ message: 'Hackathon deleted' });
};

const setPublished = async (req, res) => {
  await HackathonModel.setPublished(req.hackathon.id, req.body.is_published);
  const hackathon = await HackathonModel.findByIdOrSlug(req.hackathon.id, req.user.id);
  res.json({ message: req.body.is_published ? 'Hackathon published' : 'Hackathon unpublished', hackathon: withPhase(hackathon) });
};

const setResultsPublished = async (req, res) => {
  if (Date.now() < new Date(req.hackathon.submission_deadline).getTime()) {
    throw new HttpError(403, 'Results can only be published after the submission deadline');
  }
  await HackathonModel.setResultsPublished(req.hackathon.id, req.body.published);
  const hackathon = await HackathonModel.findByIdOrSlug(req.hackathon.id, req.user.id);
  res.json({
    message: req.body.published ? 'Results published' : 'Results unpublished',
    hackathon: withPhase(hackathon),
  });
};

const register = async (req, res) => {
  const now = Date.now();
  const opensAt = new Date(req.hackathon.registration_opens_at).getTime();
  const closesAt = new Date(req.hackathon.registration_closes_at).getTime();
  if (now < opensAt || now > closesAt) {
    throw new HttpError(403, 'Registration is not open for this hackathon');
  }
  if (await HackathonModel.isRegistered(req.hackathon.id, req.user.id)) {
    throw new HttpError(409, 'You are already registered for this hackathon');
  }
  try {
    await HackathonModel.register(req.hackathon.id, req.user.id);
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      throw new HttpError(409, 'You are already registered for this hackathon');
    }
    throw error;
  }
  res.status(201).json({ message: 'Registered for hackathon' });
};

const unregister = async (req, res) => {
  if (await TeamModel.getUserTeam(req.user.id, req.hackathon.id)) {
    throw new HttpError(409, 'Leave your team before unregistering from this hackathon');
  }
  if (!(await HackathonModel.unregister(req.hackathon.id, req.user.id))) {
    throw new HttpError(404, 'You are not registered for this hackathon');
  }
  res.json({ message: 'Unregistered from hackathon' });
};

const getLeaderboard = async (req, res) => {
  const canViewLive = ['admin', 'judge'].includes(req.user?.role);
  if (!req.hackathon.results_published_at && !canViewLive) {
    throw new HttpError(403, 'Results have not been published');
  }
  res.json({ leaderboard: await ScoreModel.getLeaderboard(req.hackathon.id) });
};

module.exports = {
  list, getById, getMine, create, update, remove, setPublished, setResultsPublished,
  register, unregister, getLeaderboard,
};
