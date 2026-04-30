const db = require('../config/db');

const ScoreModel = {
  async create({ project_id, judge_id, score, feedback }) {
    const [result] = await db.query(
      'INSERT INTO scores (project_id, judge_id, score, feedback) VALUES (?, ?, ?, ?)',
      [project_id, judge_id, score, feedback || null]
    );
    return result.insertId;
  },

  async hasJudgeScored(project_id, judge_id) {
    const [rows] = await db.query(
      'SELECT id FROM scores WHERE project_id = ? AND judge_id = ?',
      [project_id, judge_id]
    );
    return rows.length > 0;
  },

  async getByProject(project_id) {
    const [rows] = await db.query(
      `SELECT s.*, u.name AS judge_name 
       FROM scores s 
       JOIN users u ON s.judge_id = u.id 
       WHERE s.project_id = ?`,
      [project_id]
    );
    return rows;
  },

  async getLeaderboard() {
    const [rows] = await db.query(
      `SELECT p.id, p.title, p.github_link, t.name AS team_name,
       ROUND(AVG(s.score), 2) AS avg_score,
       COUNT(s.id) AS judge_count
       FROM projects p
       JOIN teams t ON p.team_id = t.id
       LEFT JOIN scores s ON p.id = s.project_id
       GROUP BY p.id
       ORDER BY avg_score DESC, judge_count DESC`
    );
    return rows;
  },

  async getAll() {
    const [rows] = await db.query(
      `SELECT s.*, u.name AS judge_name, p.title AS project_title
       FROM scores s
       JOIN users u ON s.judge_id = u.id
       JOIN projects p ON s.project_id = p.id
       ORDER BY s.created_at DESC`
    );
    return rows;
  },
};

module.exports = ScoreModel;
