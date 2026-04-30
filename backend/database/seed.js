/**
 * Seed script — creates/resets the admin user
 * Run with: node database/seed.js
 */
const bcrypt = require('bcryptjs');
const db = require('../config/db');

async function seed() {
  try {
    const password = 'admin123';
    const hash = await bcrypt.hash(password, 10);

    // Upsert admin user
    await db.query(
      `INSERT INTO users (name, email, password, role)
       VALUES (?, ?, ?, 'admin')
       ON DUPLICATE KEY UPDATE password = ?, role = 'admin'`,
      ['Admin User', 'admin@hackathon.com', hash, hash]
    );

    console.log('✅ Admin user seeded successfully');
    console.log('   Email:    admin@hackathon.com');
    console.log('   Password: admin123');
    process.exit(0);
  } catch (err) {
    console.error('❌ Seed failed:', err.message);
    process.exit(1);
  }
}

seed();
