const db = require('../config/db');
const crypto = require('crypto');

const TeamModel = {
  generateInviteCode() {
    return crypto.randomBytes(4).toString('hex').toUpperCase();
  },

  async create({ name, description, owner_id, hackathon_id }, connection = db) {
    const invite_code = this.generateInviteCode();
    const [result] = await connection.query(
      'INSERT INTO teams (name, description, owner_id, invite_code, hackathon_id) VALUES (?, ?, ?, ?, ?)',
      [name, description, owner_id, invite_code, hackathon_id]
    );
    await connection.query(
      'INSERT INTO team_members (team_id, user_id, hackathon_id) VALUES (?, ?, ?)',
      [result.insertId, owner_id, hackathon_id]
    );
    return result.insertId;
  },

  async findById(id, hackathonId = null) {
    const [rows] = await db.query(
      `SELECT t.*, u.name AS owner_name, h.max_team_size,
        (SELECT COUNT(*) FROM team_members tm WHERE tm.team_id = t.id) AS member_count
       FROM teams t
       JOIN users u ON t.owner_id = u.id
       JOIN hackathons h ON h.id = t.hackathon_id
       WHERE t.id = ? AND (? IS NULL OR t.hackathon_id = ?)`,
      [id, hackathonId, hackathonId]
    );
    return rows[0];
  },

  async findByInviteCode(code, hackathonId) {
    const [rows] = await db.query(
      'SELECT * FROM teams WHERE invite_code = ? AND hackathon_id = ?',
      [code, hackathonId]
    );
    return rows[0];
  },

  async findByInviteCodeForUpdate(code, hackathonId, connection) {
    const [rows] = await connection.query(
      `SELECT t.*, h.max_team_size
       FROM teams t
       JOIN hackathons h ON h.id = t.hackathon_id
       WHERE t.invite_code = ? AND t.hackathon_id = ?
       FOR UPDATE`,
      [code, hackathonId]
    );
    return rows[0];
  },

  async getMembers(teamId, requesterId, requesterRole) {
    const includeEmail = requesterRole === 'admin'
      || (requesterId != null && await this.isMember(teamId, requesterId));
    const emailColumn = includeEmail ? ', u.email' : '';
    const [rows] = await db.query(
      `SELECT u.id, u.name${emailColumn}, u.role, tm.joined_at
       FROM team_members tm
       JOIN users u ON tm.user_id = u.id
       WHERE tm.team_id = ?
       ORDER BY tm.joined_at`,
      [teamId]
    );
    return rows;
  },

  async countMembers(teamId, connection = db) {
    const [[row]] = await connection.query(
      'SELECT COUNT(*) AS count FROM team_members WHERE team_id = ?',
      [teamId]
    );
    return row.count;
  },

  async addMember(teamId, userId, hackathonId, connection = db) {
    const [result] = await connection.query(
      'INSERT INTO team_members (team_id, user_id, hackathon_id) VALUES (?, ?, ?)',
      [teamId, userId, hackathonId]
    );
    return result.insertId;
  },

  async getUserTeam(userId, hackathonId = null, connection = db) {
    const [rows] = await connection.query(
      `SELECT t.*, u.name AS owner_name
       FROM teams t
       JOIN team_members tm ON t.id = tm.team_id
       JOIN users u ON t.owner_id = u.id
       WHERE tm.user_id = ? AND (? IS NULL OR t.hackathon_id = ?)
       LIMIT 1`,
      [userId, hackathonId, hackathonId]
    );
    return rows[0];
  },

  async isMember(teamId, userId) {
    const [rows] = await db.query(
      'SELECT 1 FROM team_members WHERE team_id = ? AND user_id = ? LIMIT 1',
      [teamId, userId]
    );
    return rows.length > 0;
  },

  async getPublicList(hackathonId) {
    const [rows] = await db.query(
      `SELECT t.id, t.name, t.description, t.created_at, u.name AS owner_name,
        (SELECT COUNT(*) FROM team_members tm WHERE tm.team_id = t.id) AS member_count
       FROM teams t
       JOIN users u ON t.owner_id = u.id
       WHERE t.hackathon_id = ?
       ORDER BY t.created_at`,
      [hackathonId]
    );
    return rows;
  },

  async getAll(hackathonId = null) {
    const [rows] = await db.query(
      `SELECT t.*, u.name AS owner_name,
        (SELECT COUNT(*) FROM team_members tm WHERE tm.team_id = t.id) AS member_count
       FROM teams t
       JOIN users u ON t.owner_id = u.id
       WHERE (? IS NULL OR t.hackathon_id = ?)
       ORDER BY t.created_at DESC`,
      [hackathonId, hackathonId]
    );
    return rows;
  },
};

module.exports = TeamModel;
