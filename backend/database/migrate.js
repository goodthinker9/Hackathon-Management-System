const fs = require('fs');
const path = require('path');
const db = require('../config/db');

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

    const sql = fs.readFileSync(path.join(migrationDir, file), 'utf8');
    const statements = sql.split(/;\s*(?:\r?\n|$)/).map((statement) => statement.trim()).filter(Boolean);
    for (const statement of statements) await db.query(statement);
    await db.query('INSERT INTO schema_migrations (version) VALUES (?)', [file]);
    console.log(`Applied migration ${file}`);
  }
}

migrate()
  .catch((error) => {
    console.error('Migration failed:', error);
    process.exitCode = 1;
  })
  .finally(() => db.end());
