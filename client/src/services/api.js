import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor: attach JWT token if present
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('ecotrack_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: handle token expiration
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // If token expired or invalid, clear local auth
      const currentPath = window.location.pathname;
      if (!currentPath.includes('/login') && !currentPath.includes('/register') && currentPath !== '/') {
        localStorage.removeItem('ecotrack_token');
        localStorage.removeItem('ecotrack_user');
        window.location.href = '/login?expired=true';
      }
    }
    return Promise.reject(error);
  }
);

// Auth endpoints
export const authService = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getMe: () => api.get('/auth/me')
};

// User profile endpoints
export const userService = {
  getProfile: () => api.get('/users/me'),
  updateProfile: (data) => api.patch('/users/me', data),
  changePassword: (data) => api.post('/users/change-password', data)
};

// Waste reports endpoints
export const reportService = {
  create: (formData) => api.post('/reports', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  getMyReports: (params) => api.get('/reports', { params }),
  getById: (id) => api.get(`/reports/${id}`),
  update: (id, formData) => api.patch(`/reports/${id}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  delete: (id) => api.delete(`/reports/${id}`)
};

// Pickups endpoints
export const pickupService = {
  create: (data) => api.post('/pickups', data),
  getMyPickups: (params) => api.get('/pickups', { params }),
  getById: (id) => api.get(`/pickups/${id}`),
  update: (id, data) => api.patch(`/pickups/${id}`, data)
};

// Rewards endpoints
export const rewardService = {
  getMyRewards: () => api.get('/rewards/me'),
  getLeaderboard: () => api.get('/rewards/leaderboard')
};

// Admin endpoints
export const adminService = {
  getDashboardStats: () => api.get('/admin/dashboard'),
  getReports: (params) => api.get('/admin/reports', { params }),
  updateReportStatus: (id, data) => api.patch(`/admin/reports/${id}/status`, data),
  getUsers: (params) => api.get('/admin/users', { params }),
  toggleUserStatus: (id) => api.patch(`/admin/users/${id}/status`)
};

// Health endpoint
export const healthService = {
  checkHealth: () => api.get('/health')
};

export default api;
