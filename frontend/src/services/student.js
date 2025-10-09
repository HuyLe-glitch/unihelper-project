import { apiClient } from './api';

// Student specific API services
export const studentService = {
  // Profile management
  getProfile: async () => {
    const response = await apiClient.get('/student/profile');
    return response.data;
  },

  updateProfile: async (profileData) => {
    const response = await apiClient.put('/student/profile', profileData);
    return response.data;
  },

  // Request management
  submitRequest: async (requestData) => {
    const response = await apiClient.post('/student/requests', requestData);
    return response.data;
  },

  getRequests: async () => {
    const response = await apiClient.get('/student/requests');
    return response.data;
  },

  getRequestById: async (requestId) => {
    const response = await apiClient.get(`/student/requests/${requestId}`);
    return response.data;
  },

  // Dashboard data
  getDashboardData: async () => {
    const response = await apiClient.get('/student/dashboard');
    return response.data;
  },

  // Schedule
  getSchedule: async () => {
    const response = await apiClient.get('/student/schedule');
    return response.data;
  }
};