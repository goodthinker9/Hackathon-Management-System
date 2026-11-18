const db = require('../config/db');

const summaryColumns = `
  h.*,
  (SELECT COUNT(*) FROM hackathon_registrations r WHERE r.hackathon_id = h.id) AS registration_count,
  (SELECT COUNT(*) FROM teams t WHERE t.hackathon_id = h.id) AS team_count
`;

const phaseFilter = `(
  ? IS NULL
  OR (? = 'draft' AND h.is_published = 0)
  OR (? = 'upcoming' AND h.is_published = 1 AND UTC_TIMESTAMP() < h.registration_opens_at)
  OR (? = 'registration' AND h.is_published = 1 AND UTC_TIMESTAMP() >= h.registration_opens_at AND UTC_TIMESTAMP() < h.starts_at)
  OR (? = 'hacking' AND h.is_published = 1 AND UTC_TIMESTAMP() >= h.starts_at AND UTC_TIMESTAMP() < h.submission_deadline)
  OR (? = 'judging' AND h.is_published = 1 AND UTC_TIMESTAMP() >= h.submission_deadline AND UTC_TIMESTAMP() < h.judging_ends_at)
  OR (? = 'completed' AND h.is_published = 1 AND UTC_TIMESTAMP() >= h.judging_ends_at)
)`;

const phaseValues = (phase) => [phase, phase, phase, phase, phase, phase, phase];

const HackathonModel = {
  async list({ admin, phase, search, page, limit, userId }) {
    const visibility = admin ? 1 : 0;
    const searchValue = search ? `%${search}%` : '';
    const offset = (page - 1) * limit;
    const [rows] = await db.query(
      `SELECT ${summaryColumns},
        EXISTS(SELECT 1 FROM hackathon_registrations r
          WHERE r.hackathon_id = h.id AND r.user_id = ?) AS is_registered,
        EXISTS(SELECT 1 FROM team_members tm
          WHERE tm.hackathon_id = h.id AND tm.user_id = ?) AS is_in_team
       FROM hackathons h
       WHERE (? = 1 OR h.is_published = 1)
         AND ${phaseFilter}
         AND (? = '' OR h.title LIKE CONCAT('%', ?, '%') OR h.slug LIKE CONCAT('%', ?, '%'))
       ORDER BY h.starts_at DESC
       LIMIT ? OFFSET ?`,
      [
        userId || null,
        userId || null,
        visibility,
        ...phaseValues(phase || null),
        searchValue,
        searchValue,
        searchValue,
        limit,
        offset,
      ]
    );
    const [countRows] = await db.query(
      `SELECT COUNT(*) AS total
       FROM hackathons h
       WHERE (? = 1 OR h.is_published = 1)
         AND ${phaseFilter}
         AND (? = '' OR h.title LIKE CONCAT('%', ?, '%') OR h.slug LIKE CONCAT('%', ?, '%'))`,
      [visibility, ...phaseValues(phase || null), searchValue, searchValue, searchValue]
    );
    return { rows, total: countRows[0].total };
  },

  async findByIdOrSlug(value, userId = null) {
    const isId = /^\d+$/.test(String(value));
    const lookup = isId ? 'h.id = ?' : 'h.slug = ?';
    const [rows] = await db.query(
      `SELECT ${summaryColumns},
        EXISTS(SELECT 1 FROM hackathon_registrations r
          WHERE r.hackathon_id = h.id AND r.user_id = ?) AS is_registered,
        EXISTS(SELECT 1 FROM team_members tm
          WHERE tm.hackathon_id = h.id AND tm.user_id = ?) AS is_in_team
       FROM hackathons h
       WHERE ${lookup}
       LIMIT 1`,
      [userId || null, userId || null, isId ? Number(value) : value]
    );
    return rows[0];
  },

  async getForUser(userId) {
    const [rows] = await db.query(
      `SELECT ${summaryColumns},
        EXISTS(SELECT 1 FROM team_members tm
          WHERE tm.hackathon_id = h.id AND tm.user_id = ?) AS is_in_team,
        EXISTS(SELECT 1
          FROM team_members tm
          JOIN projects p ON p.team_id = tm.team_id
          WHERE tm.hackathon_id = h.id AND tm.user_id = ?) AS has_project
       FROM hackathon_registrations r
       JOIN hackathons h ON h.id = r.hackathon_id
       WHERE r.user_id = ? AND h.is_published = 1
       ORDER BY h.starts_at DESC`,
      [userId, userId, userId]
    );
    return rows;
  },

  async findBySlug(slug) {
    const [rows] = await db.query('SELECT id FROM hackathons WHERE slug = ?', [slug]);
    return rows[0];
  },

  async create(event, createdBy) {
    const [result] = await db.query(
      `INSERT INTO hackathons (
        title, slug, description, banner_url, registration_opens_at, registration_closes_at,
        starts_at, submission_deadline, judging_ends_at, max_team_size, created_by
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        event.title,
        event.slug,
        event.description,
        event.banner_url || null,
        event.registration_opens_at,
        event.registration_closes_at,
        event.starts_at,
        event.submission_deadline,
        event.judging_ends_at,
        event.max_team_size,
        createdBy,
      ]
    );
    return result.insertId;
  },

  async update(id, event) {
    const [result] = await db.query(
      `UPDATE hackathons
       SET title = ?, slug = ?, description = ?, banner_url = ?, registration_opens_at = ?,
           registration_closes_at = ?, starts_at = ?, submission_deadline = ?,
           judging_ends_at = ?, max_team_size = ?
       WHERE id = ?`,
      [
        event.title,
        event.slug,
        event.description,
        event.banner_url || null,
        event.registration_opens_at,
        event.registration_closes_at,
        event.starts_at,
        event.submission_deadline,
        event.judging_ends_at,
        event.max_team_size,
        id,
      ]
    );
    return result.affectedRows;
  },

  async setPublished(id, published) {
    const [result] = await db.query('UPDATE hackathons SET is_published = ? WHERE id = ?', [published, id]);
    return result.affectedRows;
  },

  async setResultsPublished(id, published) {
    const [result] = await db.query(
      'UPDATE hackathons SET results_published_at = ? WHERE id = ?',
      [published ? new Date() : null, id]
    );
    return result.affectedRows;
  },

  async hasRegistrations(id) {
    const [rows] = await db.query(
      'SELECT 1 FROM hackathon_registrations WHERE hackathon_id = ? LIMIT 1',
      [id]
    );
    return rows.length > 0;
  },

  async delete(id) {
    const [result] = await db.query('DELETE FROM hackathons WHERE id = ?', [id]);
    return result.affectedRows;
  },

  async isRegistered(hackathonId, userId) {
    const [rows] = await db.query(
      'SELECT 1 FROM hackathon_registrations WHERE hackathon_id = ? AND user_id = ?',
      [hackathonId, userId]
    );
    return rows.length > 0;
  },

  async register(hackathonId, userId) {
    await db.query(
      'INSERT INTO hackathon_registrations (hackathon_id, user_id) VALUES (?, ?)',
      [hackathonId, userId]
    );
  },

  async unregister(hackathonId, userId) {
    const [result] = await db.query(
      'DELETE FROM hackathon_registrations WHERE hackathon_id = ? AND user_id = ?',
      [hackathonId, userId]
    );
    return result.affectedRows;
  },

  async getStats(id) {
    const [[registrations]] = await db.query(
      'SELECT COUNT(*) AS count FROM hackathon_registrations WHERE hackathon_id = ?',
      [id]
    );
    const [[teams]] = await db.query('SELECT COUNT(*) AS count FROM teams WHERE hackathon_id = ?', [id]);
    const [[projects]] = await db.query('SELECT COUNT(*) AS count FROM projects WHERE hackathon_id = ?', [id]);
    const [[scores]] = await db.query(
      `SELECT COUNT(*) AS count FROM scores s
       JOIN projects p ON p.id = s.project_id
       WHERE p.hackathon_id = ?`,
      [id]
    );
    return { registrations: registrations.count, teams: teams.count, projects: projects.count, scores: scores.count };
  },

  async getById(id) {
    const [rows] = await db.query('SELECT * FROM hackathons WHERE id = ?', [id]);
    return rows[0];
  },
};

module.exports = HackathonModel;
