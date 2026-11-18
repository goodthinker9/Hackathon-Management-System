const db = require('../config/db');

const ProjectModel = {
  async create({ title, description, github_link, team_id, submitted_by, hackathon_id }) {
    const [result] = await db.query(
      `INSERT INTO projects (title, description, github_link, team_id, submitted_by, hackathon_id)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [title, description, github_link, team_id, submitted_by, hackathon_id]
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

  async findByTeam(teamId, hackathonId = null) {
    const [rows] = await db.query(
      'SELECT * FROM projects WHERE team_id = ? AND (? IS NULL OR hackathon_id = ?)',
      [teamId, hackathonId, hackathonId]
    );
    return rows[0];
  },

  async getAll(hackathonId = null, includeScores = true) {
    const [rows] = await db.query(
      `SELECT p.*, t.name AS team_name, u.name AS submitter_name,
        IF(? = 1, COALESCE(AVG(s.score), 0), NULL) AS avg_score,
        IF(? = 1, COUNT(s.id), 0) AS score_count
       FROM projects p
       JOIN teams t ON p.team_id = t.id
       JOIN users u ON p.submitted_by = u.id
       LEFT JOIN scores s ON p.id = s.project_id
       WHERE (? IS NULL OR p.hackathon_id = ?)
       GROUP BY p.id
       ORDER BY p.created_at DESC`,
      [includeScores ? 1 : 0, includeScores ? 1 : 0, hackathonId, hackathonId]
    );
    return rows;
  },

  async updateById(id, hackathonId, { title, description, github_link }) {
    const [result] = await db.query(
      `UPDATE projects
       SET title = ?, description = ?, github_link = ?
       WHERE id = ? AND hackathon_id = ?`,
      [title, description, github_link, id, hackathonId]
    );
    return result.affectedRows;
  },

  async deleteById(id) {
    const [result] = await db.query('DELETE FROM projects WHERE id = ?', [id]);
    return result.affectedRows;
  },
};

module.exports = ProjectModel;
