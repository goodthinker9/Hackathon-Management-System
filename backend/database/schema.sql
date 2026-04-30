-- Hackathon Management System - MySQL Schema
-- Run this in MAMP's phpMyAdmin or MySQL client

CREATE DATABASE IF NOT EXISTS hackathon_db;
USE hackathon_db;

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(150) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  role ENUM('admin', 'judge', 'participant') NOT NULL DEFAULT 'participant',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Teams table
CREATE TABLE IF NOT EXISTS teams (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,
  owner_id INT NOT NULL,
  invite_code VARCHAR(20) NOT NULL UNIQUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Team members table
CREATE TABLE IF NOT EXISTS team_members (
  id INT AUTO_INCREMENT PRIMARY KEY,
  team_id INT NOT NULL,
  user_id INT NOT NULL,
  joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY unique_team_member (team_id, user_id),
  FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Projects table
CREATE TABLE IF NOT EXISTS projects (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(200) NOT NULL,
  description TEXT NOT NULL,
  github_link VARCHAR(500) NOT NULL,
  team_id INT NOT NULL,
  submitted_by INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE CASCADE,
  FOREIGN KEY (submitted_by) REFERENCES users(id) ON DELETE CASCADE
);

-- Scores table
CREATE TABLE IF NOT EXISTS scores (
  id INT AUTO_INCREMENT PRIMARY KEY,
  project_id INT NOT NULL,
  judge_id INT NOT NULL,
  score INT NOT NULL CHECK (score >= 1 AND score <= 10),
  feedback TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY unique_judge_project (project_id, judge_id),
  FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
  FOREIGN KEY (judge_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Seed admin user (password: admin123)
-- Hash generated with bcryptjs: bcrypt.hash('admin123', 10)
INSERT INTO users (name, email, password, role) VALUES
('Admin User', 'admin@hackathon.com', '$2a$10$7gDZX9S0WfcDVy.roDTQ6.roRkSWZVRKqGQc4JX7gmj81yetfZ3xe', 'admin')
ON DUPLICATE KEY UPDATE password = '$2a$10$7gDZX9S0WfcDVy.roDTQ6.roRkSWZVRKqGQc4JX7gmj81yetfZ3xe', role = 'admin';
