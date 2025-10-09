import { apiClient } from './api';

// Admin specific API services
export const adminService = {
  // Profile management
  getProfile: async () => {
    const response = await apiClient.get('/admin/profile');
    return response.data;
  },

  updateProfile: async (profileData) => {
    const response = await apiClient.put('/admin/profile', profileData);
    return response.data;
  },

  // User management
  getUsers: async (filters = {}) => {
    const response = await apiClient.get('/admin/users', { params: filters });
    return response.data;
  },

  getUserById: async (userId) => {
    const response = await apiClient.get(`/admin/users/${userId}`);
    return response.data;
  },

  createUser: async (userData) => {
    const response = await apiClient.post('/admin/users', userData);
    return response.data;
  },

  updateUser: async (userId, userData) => {
    const response = await apiClient.put(`/admin/users/${userId}`, userData);
    return response.data;
  },

  deleteUser: async (userId) => {
    const response = await apiClient.delete(`/admin/users/${userId}`);
    return response.data;
  },

  // System settings
  getSettings: async () => {
    const response = await apiClient.get('/admin/settings');
    return response.data;
  },

  updateSettings: async (settings) => {
    const response = await apiClient.put('/admin/settings', settings);
    return response.data;
  },

  // Dashboard data
  getDashboardData: async () => {
    const response = await apiClient.get('/admin/dashboard');
    return response.data;
  },

  // System reports
  getSystemReports: async (type, dateRange) => {
    const response = await apiClient.get('/admin/reports', {
      params: { type, ...dateRange }
    });
    return response.data;
  },

  // All requests (across all users)
  getAllRequests: async (filters = {}) => {
    const response = await apiClient.get('/admin/requests', { params: filters });
    return response.data;
  }
};