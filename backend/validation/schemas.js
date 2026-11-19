const { z } = require('zod');

const name = z.string().trim().min(1, 'Name is required').max(100, 'Must be 100 characters or fewer');
const email = z.string().trim().email('Enter a valid email address').max(150, 'Must be 150 characters or fewer');
const password = z.string().min(6, 'Must be at least 6 characters').max(128, 'Must be 128 characters or fewer');

const register = z.object({
  name,
  email,
  password,
  role: z.enum(['participant']).optional(),
});

const login = z.object({
  email,
  password: z.string().min(1, 'Password is required'),
});

const createTeam = z.object({
  name: z.string().trim().min(1, 'Team name is required').max(100, 'Must be 100 characters or fewer'),
  description: z.string().max(5000, 'Must be 5000 characters or fewer').optional().or(z.literal('')),
});

const joinTeam = z.object({
  invite_code: z.string().trim().min(1, 'Invite code is required').max(20, 'Must be 20 characters or fewer'),
});

const submitProject = z.object({
  title: z.string().trim().min(1, 'Title is required').max(200, 'Must be 200 characters or fewer'),
  description: z.string().trim().min(1, 'Description is required'),
  github_link: z.string().max(500, 'Must be 500 characters or fewer').url('Enter a valid GitHub URL').refine((value) => {
    try {
      const url = new URL(value);
      const pathParts = url.pathname.split('/').filter(Boolean);
      return url.protocol === 'https:'
        && ['github.com', 'www.github.com'].includes(url.hostname)
        && pathParts.length >= 2;
    } catch {
      return false;
    }
  }, 'Must be an HTTPS URL on github.com'),
});

const submitScore = z.object({
  project_id: z.coerce.number().int().positive('Project ID must be a positive integer'),
  score: z.number().int().min(1, 'Score must be from 1 to 10').max(10, 'Score must be from 1 to 10'),
  feedback: z.string().max(1000, 'Feedback must be 1000 characters or fewer').optional().or(z.literal('')),
});

const createUser = z.object({
  name,
  email,
  password,
  role: z.enum(['admin', 'judge', 'participant']),
});

const updateProfile = z.object({
  name,
  bio: z.string().max(300, 'Bio must be 300 characters or fewer').optional().or(z.literal('')),
  skills: z.string().trim().max(255, 'Skills must be 255 characters or fewer').optional().or(z.literal('')).superRefine((value, context) => {
    if (!value) return;
    const items = value.split(',').map((item) => item.trim());
    if (items.length > 10) {
      context.addIssue({ code: 'custom', message: 'Enter no more than 10 skills' });
    }
    items.forEach((item, index) => {
      if (!item) {
        context.addIssue({ code: 'custom', path: [index], message: 'Skills must not contain empty items' });
      } else if (item.length > 30) {
        context.addIssue({ code: 'custom', path: [index], message: 'Each skill must be 30 characters or fewer' });
      }
    });
  }),
  github_url: z.string().trim().max(255, 'GitHub profile URL must be 255 characters or fewer').optional().or(z.literal('')).refine((value) => {
    if (!value) return true;
    try {
      const url = new URL(value);
      const pathParts = url.pathname.split('/').filter(Boolean);
      return url.protocol === 'https:'
        && url.hostname === 'github.com'
        && !url.port
        && !url.username
        && !url.password
        && !url.search
        && !url.hash
        && pathParts.length === 1
        && /^\/[a-z\d](?:[a-z\d-]{0,37}[a-z\d])?\/?$/i.test(url.pathname);
    } catch {
      return false;
    }
  }, 'Enter an HTTPS GitHub profile URL (https://github.com/username)'),
});

const updatePassword = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(8, 'New password must be at least 8 characters').max(128, 'New password must be 128 characters or fewer'),
}).superRefine(({ currentPassword, newPassword }, context) => {
  if (currentPassword === newPassword) {
    context.addIssue({
      code: 'custom',
      path: ['newPassword'],
      message: 'New password must differ from current password',
    });
  }
});

const eventSlug = z.string()
  .trim()
  .min(1, 'Slug is required')
  .max(200, 'Slug must be 200 characters or fewer')
  .regex(/^(?=.*[a-z])[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug must contain lowercase letters, numbers, and hyphens');

const hackathonFields = {
  title: z.string().trim().min(1, 'Title is required').max(200, 'Title must be 200 characters or fewer'),
  slug: eventSlug.optional().or(z.literal('')),
  description: z.string().trim().min(1, 'Description is required').max(10000, 'Description must be 10000 characters or fewer'),
  banner_url: z.string().url('Banner must be a valid URL').max(500).nullable().optional().or(z.literal('')),
  registration_opens_at: z.coerce.date(),
  registration_closes_at: z.coerce.date(),
  starts_at: z.coerce.date(),
  submission_deadline: z.coerce.date(),
  judging_ends_at: z.coerce.date(),
  max_team_size: z.coerce.number().int().min(1).max(10),
};

const hackathonSchedule = (schema) => schema.superRefine((event, context) => {
  const { registration_opens_at: opens, registration_closes_at: closes,
    starts_at: starts, submission_deadline: deadline, judging_ends_at: judgingEnds } = event;
  if (opens >= closes) {
    context.addIssue({ code: 'custom', path: ['registration_closes_at'], message: 'Registration must close after it opens' });
  }
  if (closes > deadline) {
    context.addIssue({ code: 'custom', path: ['registration_closes_at'], message: 'Registration must close by the submission deadline' });
  }
  if (starts >= deadline) {
    context.addIssue({ code: 'custom', path: ['starts_at'], message: 'Hackathon must start before the submission deadline' });
  }
  if (deadline >= judgingEnds) {
    context.addIssue({ code: 'custom', path: ['judging_ends_at'], message: 'Judging must end after the submission deadline' });
  }
});

const createHackathon = hackathonSchedule(z.object(hackathonFields));
const updateHackathon = createHackathon;

const hackathonListQuery = z.object({
  phase: z.enum(['draft', 'upcoming', 'registration', 'hacking', 'judging', 'completed']).optional(),
  search: z.string().trim().max(100, 'Search must be 100 characters or fewer').optional().default(''),
  page: z.coerce.number().int().min(1).max(10000).optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(12),
});

const hackathonParam = z.object({
  hackathonId: z.string().trim().min(1).max(200),
});

const hackathonIdPath = z.object({
  id: z.string().trim().min(1).max(200),
});

const hackathonProjectParam = z.object({
  hackathonId: z.string().trim().min(1).max(200),
  id: z.string().regex(/^[1-9]\d*$/, 'ID must be a positive integer'),
});

const idParam = z.object({
  id: z.string().regex(/^[1-9]\d*$/, 'ID must be a positive integer'),
});

const adminStatsQuery = z.object({
  hackathon_id: z.coerce.number().int().positive().optional(),
});

const forceQuery = z.object({
  force: z.enum(['true', 'false']).optional(),
});

const publishHackathon = z.object({
  is_published: z.boolean(),
});

const publishResults = z.object({
  published: z.boolean(),
});

const emptyBody = z.object({}).default({});

module.exports = {
  register, login, createTeam, joinTeam, submitProject, submitScore, createUser, updateProfile,
  updatePassword, createHackathon, updateHackathon, hackathonListQuery, hackathonParam, idParam,
  hackathonIdPath, hackathonProjectParam, adminStatsQuery,
  forceQuery, publishHackathon, publishResults, emptyBody,
};
