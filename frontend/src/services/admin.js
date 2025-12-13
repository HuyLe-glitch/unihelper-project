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
    const response = await apiClient.get('/admin/user-management/user-settings', { params: filters });
    return response.data;
  },

  getUserById: async (userId) => {
    const response = await apiClient.get(`/admin/user-management/user-settings/${userId}`);
    return response.data;
  },

  createUser: async (userData) => {
    const response = await apiClient.post('/admin/user-management/user-settings', userData);
    return response.data;
  },

  updateUser: async (userId, userData) => {
    const response = await apiClient.put(`/admin/user-management/user-settings/${userId}`, userData);
    return response.data;
  },

  deleteUser: async (userId) => {
    const response = await apiClient.delete(`/admin/user-management/user-settings/${userId}`);
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