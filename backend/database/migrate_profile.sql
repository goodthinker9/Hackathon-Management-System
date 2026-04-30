-- Profile migration: add bio and avatar columns to users
-- Run this in phpMyAdmin or MySQL client
-- Note: IF NOT EXISTS for columns requires MySQL 8.0+
-- For older versions, run each ALTER separately only if the column doesn't exist

USE hackathon_db;

ALTER TABLE users ADD COLUMN bio TEXT DEFAULT NULL;
ALTER TABLE users ADD COLUMN avatar VARCHAR(500) DEFAULT NULL;
