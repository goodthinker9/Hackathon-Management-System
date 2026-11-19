const db = require('../config/db');

const UserModel = {
  async findByEmail(email) {
    const [rows] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
    return rows[0];
  },

  async findById(id) {
    const [rows] = await db.query(
      'SELECT id, name, email, role, bio, avatar, skills, github_url, created_at FROM users WHERE id = ?',
      [id]
    );
    return rows[0];
  },

  async updateProfile(id, { name, bio, skills, github_url }) {
    const [result] = await db.query(
      'UPDATE users SET name = ?, bio = ?, skills = ?, github_url = ? WHERE id = ?',
      [name, bio || null, skills || null, github_url || null, id]
    );
    return result.affectedRows;
  },

  async updateAvatar(id, avatarPath) {
    const [result] = await db.query(
      'UPDATE users SET avatar = ? WHERE id = ?',
      [avatarPath, id]
    );
    return result.affectedRows;
  },

  async updatePassword(id, hashedPassword) {
    const [result] = await db.query(
      'UPDATE users SET password = ? WHERE id = ?',
      [hashedPassword, id]
    );
    return result.affectedRows;
  },

  async create({ name, email, password, role = 'participant' }) {
    const [result] = await db.query(
      'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
      [name, email, password, role]
    );
    return result.insertId;
  },

  async getAll() {
    const [rows] = await db.query(
      'SELECT id, name, email, role, bio, avatar, skills, github_url, created_at FROM users ORDER BY created_at DESC'
    );
    return rows;
  },

  async deleteById(id) {
    const [result] = await db.query('DELETE FROM users WHERE id = ?', [id]);
    return result.affectedRows;
  },
};

module.exports = UserModel;
