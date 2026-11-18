/**
 * Seed script — creates/resets the admin user
 * Run with: node database/seed.js
 */
const bcrypt = require('bcryptjs');
const db = require('../config/db');

async function seed() {
  try {
    const email = process.env.ADMIN_EMAIL;
    const password = process.env.ADMIN_PASSWORD;
    if (!email || !password) {
      throw new Error('ADMIN_EMAIL and ADMIN_PASSWORD must be set to seed the admin user.');
    }
    const hash = await bcrypt.hash(password, 10);

    await db.query(
      `INSERT INTO users (name, email, password, role)
       VALUES (?, ?, ?, 'admin')
       ON DUPLICATE KEY UPDATE password = ?, role = 'admin'`,
      ['Admin User', email, hash, hash]
    );

    console.log('✅ Admin user seeded successfully');
  } catch (err) {
    console.error('❌ Seed failed:', err.message);
    process.exitCode = 1;
  } finally {
    await db.end();
  }
}

seed();
