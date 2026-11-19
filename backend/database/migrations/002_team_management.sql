ALTER TABLE teams
  ADD COLUMN is_open TINYINT(1) NOT NULL DEFAULT 1,
  ADD COLUMN looking_for VARCHAR(255) NULL;

ALTER TABLE users
  ADD COLUMN skills VARCHAR(255) NULL,
  ADD COLUMN github_url VARCHAR(255) NULL;

CREATE TABLE team_join_requests (
  id INT AUTO_INCREMENT PRIMARY KEY,
  team_id INT NOT NULL,
  hackathon_id INT NOT NULL,
  user_id INT NOT NULL,
  message VARCHAR(500) NULL,
  status ENUM('pending', 'approved', 'rejected', 'cancelled') NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  decided_at TIMESTAMP NULL DEFAULT NULL,
  decided_by INT NULL,
  KEY idx_team_join_requests_team_status (team_id, status),
  KEY idx_team_join_requests_user_hackathon (user_id, hackathon_id),
  CONSTRAINT fk_team_join_requests_team FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE CASCADE,
  CONSTRAINT fk_team_join_requests_hackathon FOREIGN KEY (hackathon_id) REFERENCES hackathons(id) ON DELETE CASCADE,
  CONSTRAINT fk_team_join_requests_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_team_join_requests_decided_by FOREIGN KEY (decided_by) REFERENCES users(id) ON DELETE SET NULL
);

CREATE TABLE team_activity (
  id INT AUTO_INCREMENT PRIMARY KEY,
  team_id INT NOT NULL,
  actor_id INT NOT NULL,
  action VARCHAR(50) NOT NULL,
  target_user_id INT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  KEY idx_team_activity_team_created (team_id, created_at),
  KEY idx_team_activity_actor (actor_id),
  KEY idx_team_activity_target_user (target_user_id),
  CONSTRAINT fk_team_activity_team FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE CASCADE,
  CONSTRAINT fk_team_activity_actor FOREIGN KEY (actor_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_team_activity_target_user FOREIGN KEY (target_user_id) REFERENCES users(id) ON DELETE SET NULL
);
