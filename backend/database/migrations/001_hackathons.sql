CREATE TABLE IF NOT EXISTS hackathons (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(200) NOT NULL,
  slug VARCHAR(200) NOT NULL UNIQUE,
  description TEXT NOT NULL,
  banner_url VARCHAR(500) DEFAULT NULL,
  registration_opens_at DATETIME NOT NULL,
  registration_closes_at DATETIME NOT NULL,
  starts_at DATETIME NOT NULL,
  submission_deadline DATETIME NOT NULL,
  judging_ends_at DATETIME NOT NULL,
  results_published_at DATETIME DEFAULT NULL,
  max_team_size INT NOT NULL DEFAULT 4,
  is_published TINYINT(1) NOT NULL DEFAULT 0,
  created_by INT DEFAULT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  KEY idx_hackathons_is_published (is_published),
  CONSTRAINT fk_hackathons_created_by FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS hackathon_registrations (
  id INT AUTO_INCREMENT PRIMARY KEY,
  hackathon_id INT NOT NULL,
  user_id INT NOT NULL,
  registered_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_hackathon_registration (hackathon_id, user_id),
  KEY idx_hackathon_registrations_user_id (user_id),
  CONSTRAINT fk_hackathon_registrations_hackathon FOREIGN KEY (hackathon_id) REFERENCES hackathons(id) ON DELETE CASCADE,
  CONSTRAINT fk_hackathon_registrations_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

ALTER TABLE teams ADD COLUMN hackathon_id INT DEFAULT NULL;

ALTER TABLE projects ADD COLUMN hackathon_id INT DEFAULT NULL;

ALTER TABLE team_members ADD COLUMN hackathon_id INT DEFAULT NULL;

INSERT INTO hackathons (
  title, slug, description, registration_opens_at, registration_closes_at,
  starts_at, submission_deadline, judging_ends_at, results_published_at,
  max_team_size, is_published, created_by
)
SELECT
  'Legacy Hackathon', 'legacy-hackathon', 'Migrated event containing records from the original single-event installation.',
  '2020-01-01 00:00:00', '2020-01-05 00:00:00', '2020-01-05 00:00:00',
  '2020-01-06 00:00:00', '2020-01-10 00:00:00', '2020-01-10 00:00:00',
  4, 1, (SELECT MIN(id) FROM users WHERE role = 'admin')
WHERE NOT EXISTS (SELECT 1 FROM hackathons WHERE slug = 'legacy-hackathon');

UPDATE teams
SET hackathon_id = (SELECT id FROM hackathons WHERE slug = 'legacy-hackathon')
WHERE hackathon_id IS NULL;

UPDATE projects
SET hackathon_id = (SELECT id FROM hackathons WHERE slug = 'legacy-hackathon')
WHERE hackathon_id IS NULL;

UPDATE team_members tm
JOIN teams t ON t.id = tm.team_id
SET tm.hackathon_id = t.hackathon_id
WHERE tm.hackathon_id IS NULL;

INSERT IGNORE INTO hackathon_registrations (hackathon_id, user_id)
SELECT DISTINCT tm.hackathon_id, tm.user_id
FROM team_members tm
WHERE tm.hackathon_id IS NOT NULL;

ALTER TABLE teams
  MODIFY hackathon_id INT NOT NULL,
  DROP INDEX name,
  ADD UNIQUE KEY uq_teams_hackathon_name (hackathon_id, name),
  ADD KEY idx_teams_hackathon_id (hackathon_id),
  ADD CONSTRAINT fk_teams_hackathon FOREIGN KEY (hackathon_id) REFERENCES hackathons(id) ON DELETE CASCADE;

ALTER TABLE team_members
  MODIFY hackathon_id INT NOT NULL,
  ADD UNIQUE KEY uq_team_members_hackathon_user (hackathon_id, user_id),
  ADD KEY idx_team_members_hackathon_id (hackathon_id),
  ADD CONSTRAINT fk_team_members_hackathon FOREIGN KEY (hackathon_id) REFERENCES hackathons(id) ON DELETE CASCADE;

ALTER TABLE projects
  MODIFY hackathon_id INT NOT NULL,
  ADD UNIQUE KEY uq_projects_team_id (team_id),
  ADD KEY idx_projects_hackathon_id (hackathon_id),
  ADD CONSTRAINT fk_projects_hackathon FOREIGN KEY (hackathon_id) REFERENCES hackathons(id) ON DELETE CASCADE;
