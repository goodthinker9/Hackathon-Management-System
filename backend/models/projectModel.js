const db = require('../config/db');

const ProjectModel = {
  async create({ title, description, github_link, team_id, submitted_by }) {
    const [result] = await db.query(
      'INSERT INTO projects (title, description, github_link, team_id, submitted_by) VALUES (?, ?, ?, ?, ?)',
      [title, description, github_link, team_id, submitted_by]
    );
    return result.insertId;
  },

  async findById(id) {
    const [rows] = await db.query(
      `SELECT p.*, t.name AS team_name, u.name AS submitter_name 
       FROM projects p 
       JOIN teams t ON p.team_id = t.id 
       JOIN users u ON p.submitted_by = u.id 
       WHERE p.id = ?`,
      [id]
    );
    return rows[0];
  },

  async findByTeam(team_id) {
    const [rows] = await db.query(
      'SELECT * FROM projects WHERE team_id = ?',
      [team_id]
    );
    return rows[0];
  },

  async getAll() {
    const [rows] = await db.query(
      `SELECT p.*, t.name AS team_name, u.name AS submitter_name,
       COALESCE(AVG(s.score), 0) AS avg_score,
       COUNT(s.id) AS score_count
       FROM projects p 
       JOIN teams t ON p.team_id = t.id 
       JOIN users u ON p.submitted_by = u.id 
       LEFT JOIN scores s ON p.id = s.project_id
       GROUP BY p.id
       ORDER BY p.created_at DESC`
    );
    return rows;
  },

  async deleteById(id) {
    const [result] = await db.query('DELETE FROM projects WHERE id = ?', [id]);
    return result.affectedRows;
  },
};

module.exports = ProjectModel;
