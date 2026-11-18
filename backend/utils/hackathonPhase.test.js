const test = require('node:test');
const assert = require('node:assert/strict');
const { getPhase } = require('./hackathonPhase');

const hackathon = {
  is_published: 1,
  registration_opens_at: '2026-01-01T00:00:00Z',
  registration_closes_at: '2026-01-10T00:00:00Z',
  starts_at: '2026-01-05T00:00:00Z',
  submission_deadline: '2026-01-20T00:00:00Z',
  judging_ends_at: '2026-01-25T00:00:00Z',
};

test('draft remains hidden from the lifecycle until published', () => {
  assert.equal(getPhase({ ...hackathon, is_published: 0 }, new Date('2027-01-01T00:00:00Z')), 'draft');
});

test('upcoming ends exactly when registration opens', () => {
  assert.equal(getPhase(hackathon, new Date('2025-12-31T23:59:59Z')), 'upcoming');
  assert.equal(getPhase(hackathon, new Date('2026-01-01T00:00:00Z')), 'registration');
});

test('registration ends exactly when hacking starts', () => {
  assert.equal(getPhase(hackathon, new Date('2026-01-04T23:59:59Z')), 'registration');
  assert.equal(getPhase(hackathon, new Date('2026-01-05T00:00:00Z')), 'hacking');
});

test('hacking ends exactly when judging starts', () => {
  assert.equal(getPhase(hackathon, new Date('2026-01-19T23:59:59Z')), 'hacking');
  assert.equal(getPhase(hackathon, new Date('2026-01-20T00:00:00Z')), 'judging');
});

test('judging ends exactly when the event completes', () => {
  assert.equal(getPhase(hackathon, new Date('2026-01-24T23:59:59Z')), 'judging');
  assert.equal(getPhase(hackathon, new Date('2026-01-25T00:00:00Z')), 'completed');
});
