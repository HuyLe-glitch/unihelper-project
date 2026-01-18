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

  // Dashboard data (legacy)
  getDashboardData: async () => {
    const response = await apiClient.get('/staff/dashboard');
    return response.data;
  },

  // ============================================
  // NEW: Dashboard CTSV và KTX
  // ============================================

  /**
   * Lấy dashboard CTSV (stats + recent requests)
   * @param {Object} options - { limit, status }
   */
  getCtsvDashboard: async (options = {}) => {
    const response = await apiClient.get('/staff/dashboard/ctsv', { params: options });
    return response.data;
  },

  /**
   * Lấy dashboard KTX (stats + recent requests)
   * @param {Object} options - { limit, status }
   */
  getKtxDashboard: async (options = {}) => {
    const response = await apiClient.get('/staff/dashboard/ktx', { params: options });
    return response.data;
  },

  /**
   * Lấy thống kê CTSV
   */
  getCtsvStats: async () => {
    const response = await apiClient.get('/staff/dashboard/ctsv/stats');
    return response.data;
  },

  /**
   * Lấy thống kê KTX
   */
  getKtxStats: async () => {
    const response = await apiClient.get('/staff/dashboard/ktx/stats');
    return response.data;
  },

  /**
   * Lấy yêu cầu CTSV gần đây
   * @param {Object} options - { limit, status }
   */
  getRecentCtsvRequests: async (options = {}) => {
    const response = await apiClient.get('/staff/dashboard/ctsv/requests', { params: options });
    return response.data;
  },

  /**
   * Lấy yêu cầu KTX gần đây
   * @param {Object} options - { limit, status }
   */
  getRecentKtxRequests: async (options = {}) => {
    const response = await apiClient.get('/staff/dashboard/ktx/requests', { params: options });
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