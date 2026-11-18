import React from 'react';

const labels = {
  draft: 'Draft',
  upcoming: 'Upcoming',
  registration: 'Registration',
  hacking: 'Hacking',
  judging: 'Judging',
  completed: 'Completed',
};

export default function HackathonPhaseBadge({ phase }) {
  return <span className={`phase-badge phase-${phase}`}>{labels[phase] || phase}</span>;
}
