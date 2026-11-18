import React from 'react';

const paths = {
  award: <>
    <circle cx="12" cy="8" r="6" />
    <path d="m8.2 13.5-1.4 8L12 19l5.2 2.5-1.4-8" />
  </>,
  arrowLeft: <>
    <path d="m12 19-7-7 7-7" />
    <path d="M19 12H5" />
  </>,
  calendar: <>
    <rect x="3" y="5" width="18" height="16" rx="2" />
    <path d="M16 3v4M8 3v4M3 11h18" />
  </>,
  camera: <>
    <path d="M14 5h-4L8 7H5a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3z" />
    <circle cx="12" cy="13" r="3" />
  </>,
  chart: <>
    <path d="M3 3v18h18" />
    <path d="m19 9-5 5-4-4-5 5" />
  </>,
  check: <path d="m5 12 4 4L19 6" />,
  chevronRight: <path d="m9 18 6-6-6-6" />,
  clipboard: <>
    <rect x="5" y="4" width="14" height="17" rx="2" />
    <path d="M9 4.5V3h6v1.5M9 10h6M9 14h6M9 18h3" />
  </>,
  compass: <>
    <circle cx="12" cy="12" r="10" />
    <path d="m16.2 7.8-2.8 6.4-6.4 2.8 2.8-6.4z" />
  </>,
  externalLink: <>
    <path d="M14 3h7v7M10 14 21 3" />
    <path d="M19 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h6" />
  </>,
  grid: <>
    <rect x="3" y="3" width="8" height="8" rx="1" />
    <rect x="13" y="3" width="8" height="8" rx="1" />
    <rect x="3" y="13" width="8" height="8" rx="1" />
    <rect x="13" y="13" width="8" height="8" rx="1" />
  </>,
  home: <>
    <path d="m3 10 9-7 9 7" />
    <path d="M5 9v12h14V9M9 21v-7h6v7" />
  </>,
  hourglass: <>
    <path d="M5 3h14M5 21h14M7 3v4l5 5-5 5v4M17 3v4l-5 5 5 5v4" />
  </>,
  inbox: <>
    <path d="M4 4h16l2 11v5H2v-5z" />
    <path d="M2 14h6l2 3h4l2-3h6" />
  </>,
  key: <>
    <circle cx="8" cy="15" r="5" />
    <path d="m11.5 11.5 9-9M17 6l3 3M14 9l3 3" />
  </>,
  laptop: <>
    <rect x="4" y="4" width="16" height="12" rx="2" />
    <path d="M2 20h20l-2-4H4z" />
  </>,
  link: <>
    <path d="M10 13a5 5 0 0 0 7.1 0l3-3A5 5 0 0 0 13 2.9l-1.7 1.7" />
    <path d="M14 11a5 5 0 0 0-7.1 0l-3 3A5 5 0 0 0 11 21.1l1.7-1.7" />
  </>,
  lock: <>
    <rect x="4" y="10" width="16" height="11" rx="2" />
    <path d="M8 10V7a4 4 0 1 1 8 0v3M12 14v3" />
  </>,
  logOut: <>
    <path d="M10 17l5-5-5-5M15 12H3" />
    <path d="M12 3h6a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-6" />
  </>,
  medal: <>
    <circle cx="12" cy="8" r="6" />
    <path d="m8.2 13.5-1.4 8L12 19l5.2 2.5-1.4-8" />
    <path d="m12 5 1 2h2l-1.5 1.5.5 2L12 9.4 10 10.5l.5-2L9 7h2z" />
  </>,
  pencil: <>
    <path d="m16 4 4 4M4 20l4-.8L19 8a2.8 2.8 0 0 0-4-4L4 15z" />
  </>,
  puzzle: <>
    <path d="M4 4h5a3 3 0 1 1 6 0h5v5a3 3 0 1 0 0 6v5h-5a3 3 0 1 0-6 0H4v-5a3 3 0 1 0 0-6z" />
  </>,
  rocket: <>
    <path d="M4.5 16.5c-1.5 1.3-2 4-2 4s2.7-.5 4-2c.8-.8 1-2 0-3s-2.2-.8-3 0Z" />
    <path d="m12 15-3-3a22 22 0 0 1 2-3.5C14 4 19 2 22 2c0 3-2 8-6.5 11A22 22 0 0 1 12 15Z" />
    <path d="M9 12H4l-2 5 7-2M12 15v5l5 2-2-7" />
  </>,
  save: <>
    <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
    <path d="M17 21v-8H7v8M7 3v5h8" />
  </>,
  scale: <>
    <path d="M12 3v18M5 7h14M8 21h8" />
    <path d="m5 7-3 6h6zM19 7l-3 6h6z" />
  </>,
  search: <>
    <circle cx="11" cy="11" r="7" />
    <path d="m20 20-4-4" />
  </>,
  settings: <>
    <path d="M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8z" />
    <path d="m19.4 15 .1.1 1.4 1.1-1.4 2.4-1.7-.6a8 8 0 0 1-1.7 1l-.3 1.8h-2.8l-.3-1.8a8 8 0 0 1-1.7-1l-1.7.6-1.4-2.4 1.4-1.1a7 7 0 0 1 0-2l-1.4-1.1 1.4-2.4 1.7.6a8 8 0 0 1 1.7-1l.3-1.8h2.8l.3 1.8a8 8 0 0 1 1.7 1l1.7-.6 1.4 2.4-1.4 1.1a7 7 0 0 1 0 2z" />
  </>,
  shield: <>
    <path d="M12 22s8-4 8-11V5l-8-3-8 3v6c0 7 8 11 8 11z" />
    <path d="m9 12 2 2 4-4" />
  </>,
  sparkles: <>
    <path d="m12 3 1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z" />
    <path d="m19 14 .9 2.1L22 17l-2.1.9L19 20l-.9-2.1L16 17l2.1-.9zM5 3l.7 1.3L7 5l-1.3.7L5 7l-.7-1.3L3 5l1.3-.7z" />
  </>,
  star: <path d="m12 3 2.8 5.7 6.2.9-4.5 4.4 1.1 6.2-5.6-3-5.6 3 1.1-6.2L3 9.6l6.2-.9z" />,
  trophy: <>
    <path d="M8 21h8M12 17v4M7 4h10v7a5 5 0 0 1-10 0z" />
    <path d="M7 7H4v2a4 4 0 0 0 4 4M17 7h3v2a4 4 0 0 1-4 4" />
  </>,
  user: <>
    <circle cx="12" cy="8" r="4" />
    <path d="M5 21a7 7 0 0 1 14 0" />
  </>,
  userPlus: <>
    <circle cx="9" cy="8" r="4" />
    <path d="M2 21a7 7 0 0 1 14 0M19 8v6M22 11h-6" />
  </>,
  users: <>
    <path d="M16 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="10" cy="7" r="4" />
    <path d="M20 21v-2a4 4 0 0 0-3-3.9M16 3.1a4 4 0 0 1 0 7.8" />
  </>,
  zap: <path d="m13 2-3 9H5l6 11 3-9h5z" />,
};

export default function Icon({ name, size = 20, className = '', strokeWidth = 1.8 }) {
  return (
    <svg
      aria-hidden="true"
      className={`app-icon ${className}`.trim()}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      focusable="false"
    >
      {paths[name] || paths.sparkles}
    </svg>
  );
}
