const db = require('../config/db');
const crypto = require('crypto');

const TeamModel = {
  generateInviteCode() {
    return crypto.randomBytes(4).toString('hex').toUpperCase();
  },

  async create({ name, description, owner_id }) {
    const invite_code = this.generateInviteCode();
    const [result] = await db.query(
      'INSERT INTO teams (name, description, owner_id, invite_code) VALUES (?, ?, ?, ?)',
      [name, description, owner_id, invite_code]
    );
    // Auto-add owner as member
    await db.query('INSERT INTO team_members (team_id, user_id) VALUES (?, ?)', [
      result.insertId,
      owner_id,
    ]);
    return result.insertId;
  },

  async findById(id) {
    const [rows] = await db.query(
      `SELECT t.*, u.name AS owner_name 
       FROM teams t 
       JOIN users u ON t.owner_id = u.id 
       WHERE t.id = ?`,
      [id]
    );
    return rows[0];
  },

  async findByInviteCode(code) {
    const [rows] = await db.query('SELECT * FROM teams WHERE invite_code = ?', [code]);
    return rows[0];
  },

  async getMembers(team_id) {
    const [rows] = await db.query(
      `SELECT u.id, u.name, u.email, u.role, tm.joined_at 
       FROM team_members tm 
       JOIN users u ON tm.user_id = u.id 
       WHERE tm.team_id = ?`,
      [team_id]
    );
    return rows;
  },

  async addMember(team_id, user_id) {
    const [result] = await db.query(
      'INSERT INTO team_members (team_id, user_id) VALUES (?, ?)',
      [team_id, user_id]
    );
    return result.insertId;
  },

  async isMember(team_id, user_id) {
    const [rows] = await db.query(
      'SELECT id FROM team_members WHERE team_id = ? AND user_id = ?',
      [team_id, user_id]
    );
    return rows.length > 0;
  },

  async getUserTeam(user_id) {
    const [rows] = await db.query(
      `SELECT t.* FROM teams t 
       JOIN team_members tm ON t.id = tm.team_id 
       WHERE tm.user_id = ?`,
      [user_id]
    );
    return rows[0];
  },

  async getAll() {
    const [rows] = await db.query(
      `SELECT t.*, u.name AS owner_name,
       (SELECT COUNT(*) FROM team_members WHERE team_id = t.id) AS member_count
       FROM teams t 
       JOIN users u ON t.owner_id = u.id 
       ORDER BY t.created_at DESC`
    );
    return rows;
  },
};

module.exports = TeamModel;
