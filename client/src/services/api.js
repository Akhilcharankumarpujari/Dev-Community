const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

import axios from 'axios';

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add authorization token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Auth endpoints
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  logout: () => api.post('/auth/logout'),
  getMe: () => api.get('/auth/me'),
};

// Users endpoints
export const usersAPI = {
  getProfile: (username) => api.get(`/users/${username}`),
  updateProfile: (data) => api.put('/users/profile', data),
  follow: (id) => api.post(`/users/follow/${id}`),
  getAll: () => api.get('/users'),
  delete: (id) => api.delete(`/users/${id}`),
};

// Posts endpoints
export const postsAPI = {
  getAll: (params) => api.get('/posts', { params }),
  getTrending: () => api.get('/posts/trending'),
  getBySlug: (slug) => api.get(`/posts/${slug}`),
  create: (data) => api.post('/posts', data),
  update: (id, data) => api.put(`/posts/${id}`, data),
  delete: (id) => api.delete(`/posts/${id}`),
  like: (id) => api.post(`/posts/like/${id}`),
  bookmark: (id) => api.post(`/posts/bookmark/${id}`),
  getSummary: (id) => api.post(`/posts/${id}/ai-summary`),
};

// Comments endpoints
export const commentsAPI = {
  add: (postId, data) => api.post(`/comments/${postId}`, data),
  getByPost: (postId) => api.get(`/comments/${postId}`),
  delete: (id) => api.delete(`/comments/${id}`),
  like: (id) => api.post(`/comments/${id}/like`),
};

// Notifications endpoints
export const notificationsAPI = {
  getAll: () => api.get('/notifications'),
  markAsRead: () => api.put('/notifications/read'),
  delete: (id) => api.delete(`/notifications/${id}`),
};

export default api;
