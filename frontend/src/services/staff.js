import { apiClient } from './api';

// Staff specific API services
export const staffService = {
  // Profile management
  getProfile: async () => {
    const response = await apiClient.get('/staff/profile');
    return response.data;
  },

  updateProfile: async (profileData) => {
    const response = await apiClient.put('/staff/profile', profileData);
    return response.data;
  },

  // Request management
  getRequests: async (filters = {}) => {
    const response = await apiClient.get('/staff/requests', { params: filters });
    return response.data;
  },

  getRequestById: async (requestId) => {
    const response = await apiClient.get(`/staff/requests/${requestId}`);
    return response.data;
  },

  processRequest: async (requestId, action, comment = '') => {
    const response = await apiClient.put(`/staff/requests/${requestId}/process`, {
      action,
      comment
    });
    return response.data;
  },

  // Student management
  getStudents: async (filters = {}) => {
    const response = await apiClient.get('/staff/students', { params: filters });
    return response.data;
  },

  getStudentById: async (studentId) => {
    const response = await apiClient.get(`/staff/students/${studentId}`);
    return response.data;
  },

  // Dashboard data
  getDashboardData: async () => {
    const response = await apiClient.get('/staff/dashboard');
    return response.data;
  },

  // Reports
  getReports: async (type, dateRange) => {
    const response = await apiClient.get('/staff/reports', {
      params: { type, ...dateRange }
    });
    return response.data;
  }
};