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
});

module.exports = { register, login, createTeam, joinTeam, submitProject, submitScore, createUser, updateProfile };
