import axios from 'axios';

const apiUrl = import.meta.env.VITE_API_URL || '/api';
export const API_ORIGIN = /^https?:\/\//i.test(apiUrl)
  ? apiUrl.replace(/\/api\/?$/, '')
  : '';

const api = axios.create({
  baseURL: apiUrl,
  headers: { 'Content-Type': 'application/json' },
});

// Attach JWT token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = error.response?.data?.message || error.message || 'An unexpected API error occurred';
    window.dispatchEvent(new CustomEvent('api-error', { detail: message }));
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getMe: () => api.get('/auth/me'),
};

// Profile
export const profileAPI = {
  get: () => api.get('/profile'),
  update: (data) => api.put('/profile', data),
  updatePassword: (data) => api.put('/profile/password', data),
  uploadAvatar: (formData) =>
    api.post('/profile/avatar', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
};

// Teams
export const teamAPI = {
  create: (data) => api.post('/teams/create', data),
  join: (data) => api.post('/teams/join', data),
  getMyTeam: () => api.get('/teams/my-team'),
  getAll: () => api.get('/teams'),
  getById: (id) => api.get(`/teams/${id}`),
};

// Projects
export const projectAPI = {
  submit: (data) => api.post('/projects/submit', data),
  getAll: () => api.get('/projects'),
  getById: (id) => api.get(`/projects/${id}`),
  getMyProject: () => api.get('/projects/my-project'),
  delete: (id) => api.delete(`/projects/${id}`),
};

// Scores
export const scoreAPI = {
  submit: (data) => api.post('/scores', data),
  getByProject: (projectId) => api.get(`/scores/project/${projectId}`),
  getAll: () => api.get('/scores'),
};

// Leaderboard
export const leaderboardAPI = {
  get: () => api.get('/leaderboard'),
};

// Admin
export const adminAPI = {
  getStats: () => api.get('/admin/stats'),
  getUsers: () => api.get('/admin/users'),
  createUser: (data) => api.post('/admin/users', data),
  deleteUser: (id) => api.delete(`/admin/users/${id}`),
  getTeams: () => api.get('/admin/teams'),
  getProjects: () => api.get('/admin/projects'),
  deleteProject: (id) => api.delete(`/admin/projects/${id}`),
  getScores: () => api.get('/admin/scores'),
};

export default api;
