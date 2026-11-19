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
    const requestUrl = error.config?.url || '';
    const isAuthSubmission = /(?:^|\/)auth\/(?:login|register)(?:[/?#]|$)/.test(requestUrl);
    if (error.response?.status === 401 && !isAuthSubmission) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      if (window.location.pathname !== '/login') window.location.href = '/login';
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
  createForHackathon: (hackathonId, data) =>
    api.post(`/hackathons/${encodeURIComponent(hackathonId)}/teams`, data),
  joinForHackathon: (hackathonId, data) =>
    api.post(`/hackathons/${encodeURIComponent(hackathonId)}/teams/join`, data),
  getMyTeamForHackathon: (hackathonId) =>
    api.get(`/hackathons/${encodeURIComponent(hackathonId)}/teams/my-team`),
  getAllForHackathon: (hackathonId) =>
    api.get(`/hackathons/${encodeURIComponent(hackathonId)}/teams`),
  getById: (id) => api.get(`/teams/${id}`),
};

// Projects
export const projectAPI = {
  submitForHackathon: (hackathonId, data) =>
    api.post(`/hackathons/${encodeURIComponent(hackathonId)}/projects/submit`, data),
  updateForHackathon: (hackathonId, projectId, data) =>
    api.put(`/hackathons/${encodeURIComponent(hackathonId)}/projects/${projectId}`, data),
  getAllForHackathon: (hackathonId) =>
    api.get(`/hackathons/${encodeURIComponent(hackathonId)}/projects`),
  getMyProjectForHackathon: (hackathonId) =>
    api.get(`/hackathons/${encodeURIComponent(hackathonId)}/projects/my-project`),
  getById: (id) => api.get(`/projects/${id}`),
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
  getForHackathon: (hackathonId) =>
    api.get(`/hackathons/${encodeURIComponent(hackathonId)}/leaderboard`),
};

// Hackathons
export const hackathonAPI = {
  list: (params = {}) => api.get('/hackathons', { params }),
  get: (idOrSlug) => api.get(`/hackathons/${encodeURIComponent(idOrSlug)}`),
  getMine: () => api.get('/hackathons/me'),
  register: (idOrSlug) => api.post(`/hackathons/${encodeURIComponent(idOrSlug)}/register`),
  unregister: (idOrSlug) => api.delete(`/hackathons/${encodeURIComponent(idOrSlug)}/register`),
  create: (data) => api.post('/hackathons', data),
  update: (idOrSlug, data) => api.put(`/hackathons/${encodeURIComponent(idOrSlug)}`, data),
  delete: (idOrSlug, force = false) =>
    api.delete(`/hackathons/${encodeURIComponent(idOrSlug)}`, { params: force ? { force: true } : {} }),
  setPublished: (idOrSlug, is_published) =>
    api.patch(`/hackathons/${encodeURIComponent(idOrSlug)}/publish`, { is_published }),
  setResultsPublished: (idOrSlug, published) =>
    api.patch(`/hackathons/${encodeURIComponent(idOrSlug)}/results`, { published }),
};

// Admin
export const adminAPI = {
  getStats: (hackathonId) => api.get('/admin/stats', {
    params: hackathonId ? { hackathon_id: hackathonId } : {},
  }),
  getUsers: () => api.get('/admin/users'),
  createUser: (data) => api.post('/admin/users', data),
  deleteUser: (id) => api.delete(`/admin/users/${id}`),
  getTeams: () => api.get('/admin/teams'),
  getProjects: () => api.get('/admin/projects'),
  deleteProject: (id) => api.delete(`/admin/projects/${id}`),
  getScores: () => api.get('/admin/scores'),
};

export default api;
