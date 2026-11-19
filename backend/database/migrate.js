const fs = require('fs');
const path = require('path');
const db = require('../config/db');

async function validateLegacyData(file) {
  if (file !== '001_hackathons.sql') return;

  const [[duplicateProject]] = await db.query(
    `SELECT team_id
     FROM projects
     GROUP BY team_id
     HAVING COUNT(*) > 1
     LIMIT 1`
  );
  if (duplicateProject) {
    throw new Error(
      `Cannot apply ${file}: team ${duplicateProject.team_id} has multiple projects; resolve duplicates first`
    );
  }

  const [[multipleTeams]] = await db.query(
    `SELECT user_id
     FROM team_members
     GROUP BY user_id
     HAVING COUNT(DISTINCT team_id) > 1
     LIMIT 1`
  );
  if (multipleTeams) {
    throw new Error(
      `Cannot apply ${file}: user ${multipleTeams.user_id} belongs to multiple teams; resolve memberships first`
    );
  }
}

async function migrate() {
  const migrationDir = path.join(__dirname, 'migrations');
  await db.query(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      version VARCHAR(255) PRIMARY KEY,
      applied_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `);

  const files = fs.readdirSync(migrationDir)
    .filter((file) => /^\d+.*\.sql$/i.test(file))
    .sort();

  for (const file of files) {
    const [applied] = await db.query('SELECT version FROM schema_migrations WHERE version = ?', [file]);
    if (applied.length) continue;

    try {
      await validateLegacyData(file);
      const sql = fs.readFileSync(path.join(migrationDir, file), 'utf8');
      const statements = sql.split(/;\s*(?:\r?\n|$)/).map((statement) => statement.trim()).filter(Boolean);
      for (const statement of statements) await db.query(statement);
      await db.query('INSERT INTO schema_migrations (version) VALUES (?)', [file]);
      console.log(`Applied migration ${file}`);
    } catch (error) {
      console.error(`Migration failed on file ${file}:`, error);
      throw error;
    }
  }
}

migrate()
  .catch((error) => {
    console.error('Migration failed:', error);
    console.error('MySQL DDL is not transactional. Restore the database from backup before retrying.');
    process.exitCode = 1;
  })
  .finally(() => db.end());
