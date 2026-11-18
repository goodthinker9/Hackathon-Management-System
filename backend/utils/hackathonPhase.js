const phases = ['draft', 'upcoming', 'registration', 'hacking', 'judging', 'completed'];

function getPhase(hackathon, now = new Date()) {
  if (!hackathon || !hackathon.is_published) return 'draft';

  const currentTime = now instanceof Date ? now.getTime() : new Date(now).getTime();
  const registrationOpens = new Date(hackathon.registration_opens_at).getTime();
  const startsAt = new Date(hackathon.starts_at).getTime();
  const submissionDeadline = new Date(hackathon.submission_deadline).getTime();
  const judgingEndsAt = new Date(hackathon.judging_ends_at).getTime();

  if ([currentTime, registrationOpens, startsAt, submissionDeadline, judgingEndsAt].some(Number.isNaN)) {
    throw new TypeError('Hackathon phase dates and current time must be valid dates');
  }
  if (currentTime < registrationOpens) return 'upcoming';
  if (currentTime < startsAt) return 'registration';
  if (currentTime < submissionDeadline) return 'hacking';
  if (currentTime < judgingEndsAt) return 'judging';
  return 'completed';
}

module.exports = { getPhase, phases };
