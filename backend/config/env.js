const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: path.join(__dirname, '..', '.env') });

const required = ['DB_HOST', 'DB_PORT', 'DB_USER', 'DB_NAME', 'JWT_SECRET'];
const missing = required.filter((name) => !process.env[name] || !process.env[name].trim());

if (missing.length) {
  throw new Error(`Missing required environment variables: ${missing.join(', ')}. See backend/.env.example.`);
}

if (!/^\d+$/.test(process.env.DB_PORT)) {
  throw new Error('DB_PORT must be a valid port number.');
}

process.env.PORT = process.env.PORT || '5000';
if (!/^\d+$/.test(process.env.PORT) || Number(process.env.PORT) < 1 || Number(process.env.PORT) > 65535) {
  throw new Error('PORT must be a valid port number between 1 and 65535.');
}
if (Number(process.env.DB_PORT) < 1 || Number(process.env.DB_PORT) > 65535) {
  throw new Error('DB_PORT must be a valid port number between 1 and 65535.');
}
process.env.JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '1d';
process.env.CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';
process.env.RATE_LIMIT_MAX = process.env.RATE_LIMIT_MAX || '300';
if (!/^[1-9]\d*$/.test(process.env.RATE_LIMIT_MAX) || !Number.isSafeInteger(Number(process.env.RATE_LIMIT_MAX))) {
  throw new Error('RATE_LIMIT_MAX must be a positive integer.');
}

module.exports = {
  port: Number(process.env.PORT),
  clientOrigins: process.env.CLIENT_URL.split(',').map((url) => url.trim()).filter(Boolean),
  rateLimitMax: Number(process.env.RATE_LIMIT_MAX),
};
