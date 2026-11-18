require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });

if (process.env.NODE_ENV === 'production') {
  console.error('Demo seeding is disabled when NODE_ENV=production.');
  process.exitCode = 1;
} else {
  const bcrypt = require('bcryptjs');
  const db = require('../config/db');
  const HackathonModel = require('../models/hackathonModel');
  const TeamModel = require('../models/teamModel');
  const ProjectModel = require('../models/projectModel');
  const ScoreModel = require('../models/scoreModel');
  const UserModel = require('../models/userModel');
  const { withTransaction } = require('../config/transaction');

  const DAY = 24 * 60 * 60 * 1000;

  async function ensureUser(name, email, role, passwordHash) {
    let user = await UserModel.findByEmail(email);
    if (!user) {
      const id = await UserModel.create({ name, email, role, password: passwordHash });
      user = await UserModel.findByEmail(email);
      if (!user || user.id !== id) throw new Error(`Could not create demo user ${email}`);
    } else {
      await db.query(
        'UPDATE users SET name = ?, role = ?, password = ? WHERE id = ?',
        [name, role, passwordHash, user.id]
      );
      user = await UserModel.findByEmail(email);
    }
    return user;
  }

  async function ensureHackathon(event) {
    const existing = await HackathonModel.findBySlug(event.slug);
    let id;
    if (existing) {
      id = existing.id;
      await HackathonModel.update(id, event);
    } else {
      id = await HackathonModel.create(event, null);
    }
    await HackathonModel.setPublished(id, true);
    await HackathonModel.setResultsPublished(id, false);
    return id;
  }

  async function ensureRegistration(hackathonId, userId) {
    if (!await HackathonModel.isRegistered(hackathonId, userId)) {
      await HackathonModel.register(hackathonId, userId);
    }
  }

  async function ensureTeam(hackathonId, name, description, ownerId) {
    const [rows] = await db.query(
      'SELECT id FROM teams WHERE hackathon_id = ? AND name = ?',
      [hackathonId, name]
    );
    if (rows[0]) return rows[0].id;
    return withTransaction((connection) => TeamModel.create({
      name,
      description,
      owner_id: ownerId,
      hackathon_id: hackathonId,
    }, connection));
  }

  async function addMemberIfNeeded(teamId, hackathonId, userId) {
    const [rows] = await db.query(
      'SELECT team_id FROM team_members WHERE hackathon_id = ? AND user_id = ?',
      [hackathonId, userId]
    );
    if (rows[0]) {
      if (rows[0].team_id !== teamId) {
        throw new Error(`Demo participant ${userId} belongs to a different team in hackathon ${hackathonId}`);
      }
      return;
    }
    await db.query(
      'INSERT INTO team_members (team_id, user_id, hackathon_id) VALUES (?, ?, ?)',
      [teamId, userId, hackathonId]
    );
  }

  async function ensureProject(teamId, hackathonId, submittedBy, index) {
    const project = {
      title: `Demo Project ${index + 1}`,
      description: `A sample project for team ${index + 1}, seeded for hackathon demonstrations.`,
      github_link: `https://github.com/example/demo-project-${index + 1}`,
    };
    const existing = await ProjectModel.findByTeam(teamId, hackathonId);
    if (existing) {
      await ProjectModel.updateById(existing.id, hackathonId, project);
      return existing.id;
    }
    return ProjectModel.create({
      ...project,
      team_id: teamId,
      submitted_by: submittedBy,
      hackathon_id: hackathonId,
    });
  }

  async function ensureScore(projectId, judgeId, score) {
    if (await ScoreModel.hasJudgeScored(projectId, judgeId)) return;
    await ScoreModel.create({
      project_id: projectId,
      judge_id: judgeId,
      score,
      feedback: 'Clear problem definition and a thoughtful implementation.',
    });
  }

  async function seedDemo() {
    const demoPassword = process.env.DEMO_PASSWORD;
    if (!demoPassword || demoPassword.length < 8) {
      throw new Error('Set DEMO_PASSWORD to a value of at least 8 characters before seeding demo data.');
    }

    const passwordHash = await bcrypt.hash(demoPassword, 10);
    const judge = await ensureUser('Demo Judge', 'judge@demo.hackathon.local', 'judge', passwordHash);
    const participants = [];
    for (let index = 1; index <= 12; index += 1) {
      const serial = String(index).padStart(2, '0');
      participants.push(await ensureUser(
        `Demo Participant ${serial}`,
        `participant${serial}@demo.hackathon.local`,
        'participant',
        passwordHash
      ));
    }

    const now = Date.now();
    const events = [
      {
        title: 'Demo Judging Hackathon',
        slug: 'demo-judging',
        description: 'A sample event currently in judging, with submitted projects and scores.',
        banner_url: null,
        registration_opens_at: new Date(now - 20 * DAY),
        registration_closes_at: new Date(now - 12 * DAY),
        starts_at: new Date(now - 10 * DAY),
        submission_deadline: new Date(now - DAY),
        judging_ends_at: new Date(now + 5 * DAY),
        max_team_size: 4,
      },
      {
        title: 'Demo Upcoming Hackathon',
        slug: 'demo-upcoming',
        description: 'A sample event opening soon, ready for participant registration.',
        banner_url: null,
        registration_opens_at: new Date(now + 3 * DAY),
        registration_closes_at: new Date(now + 10 * DAY),
        starts_at: new Date(now + 14 * DAY),
        submission_deadline: new Date(now + 16 * DAY),
        judging_ends_at: new Date(now + 20 * DAY),
        max_team_size: 4,
      },
    ];

    const [judgingId] = await Promise.all(events.map(ensureHackathon));
    for (const participant of participants) {
      await ensureRegistration(judgingId, participant.id);
    }

    for (let teamIndex = 0; teamIndex < 3; teamIndex += 1) {
      const teamName = `Demo Team ${teamIndex + 1}`;
      const firstParticipant = participants[teamIndex * 4];
      const teamId = await ensureTeam(
        judgingId,
        teamName,
        `Sample team ${teamIndex + 1} for the demo event.`,
        firstParticipant.id
      );
      for (const participant of participants.slice(teamIndex * 4, teamIndex * 4 + 4)) {
        await addMemberIfNeeded(teamId, judgingId, participant.id);
      }
      const projectId = await ensureProject(teamId, judgingId, firstParticipant.id, teamIndex);
      await ensureScore(projectId, judge.id, 7 + teamIndex);
    }

    console.log('Demo data is ready: 2 hackathons, 1 judge, 12 participants, 3 teams, 3 projects, and 3 scores.');
    console.log('Demo accounts use DEMO_PASSWORD; no password values are printed.');
  }

  seedDemo()
    .catch((error) => {
      console.error('Demo seed failed:', error.message);
      process.exitCode = 1;
    })
    .finally(() => db.end());
}
