const test = require('node:test');
const assert = require('node:assert/strict');
const {
  register,
  updateProfile,
  updatePassword,
  createHackathon,
  submitScore,
} = require('./schemas');

const validHackathon = {
  title: 'Test Hackathon',
  description: 'A test event',
  registration_opens_at: '2027-01-01T00:00:00Z',
  registration_closes_at: '2027-01-05T00:00:00Z',
  starts_at: '2027-01-04T00:00:00Z',
  submission_deadline: '2027-01-10T00:00:00Z',
  judging_ends_at: '2027-01-15T00:00:00Z',
  max_team_size: 4,
};

test('public registration rejects privileged role values', () => {
  assert.equal(register.safeParse({
    name: 'Participant',
    email: 'participant@example.com',
    password: 'secure-password',
    role: 'admin',
  }).success, false);
});

test('hackathon schedules enforce ordered dates and bounded team size', () => {
  assert.equal(createHackathon.safeParse(validHackathon).success, true);
  assert.equal(createHackathon.safeParse({
    ...validHackathon,
    registration_closes_at: '2027-01-11T00:00:00Z',
  }).success, false);
  assert.equal(createHackathon.safeParse({ ...validHackathon, max_team_size: 11 }).success, false);
});

test('password update requires a different new password', () => {
  assert.equal(updatePassword.safeParse({
    currentPassword: 'old-password',
    newPassword: 'old-password',
  }).success, false);
  assert.equal(updatePassword.safeParse({
    currentPassword: 'old-password',
    newPassword: 'new-password',
  }).success, true);
});

test('profile skills and GitHub URL are bounded and validated', () => {
  assert.equal(updateProfile.safeParse({
    name: 'Participant',
    skills: 'React, Node.js',
    github_url: 'https://github.com/octocat',
  }).success, true);
  assert.equal(updateProfile.safeParse({
    name: 'Participant',
    skills: ['x'.repeat(30), ...Array.from({ length: 9 }, () => 'y')].join(','),
  }).success, true);
  assert.equal(updateProfile.safeParse({
    name: 'Participant',
    skills: Array.from({ length: 11 }, (_, index) => `Skill${index}`).join(','),
  }).success, false);
  assert.equal(updateProfile.safeParse({
    name: 'Participant',
    skills: 'x'.repeat(31),
  }).success, false);
  assert.equal(updateProfile.safeParse({
    name: 'Participant',
    github_url: 'http://github.com/octocat',
  }).success, false);
  assert.equal(updateProfile.safeParse({
    name: 'Participant',
    github_url: 'https://github.com/octocat/repo',
  }).success, false);
});

test('scores must be integers from 1 to 10 with bounded feedback', () => {
  assert.equal(submitScore.safeParse({ project_id: 1, score: 8, feedback: 'Clear demo' }).success, true);
  assert.equal(submitScore.safeParse({ project_id: 1, score: 8.5 }).success, false);
  assert.equal(submitScore.safeParse({ project_id: 1, score: 8, feedback: 'x'.repeat(1001) }).success, false);
});
