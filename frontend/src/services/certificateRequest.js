import { apiClient } from './api';

/**
 * Certificate Request Service - Frontend API Layer
 * Gọi API quản lý yêu cầu chứng nhận CTSV
 * Pattern: Frontend chỉ gọi API, không xử lý logic nghiệp vụ
 */
const certificateRequestService = {
  /**
   * Tạo yêu cầu chứng nhận mới (Student only)
   * @param {Object} requestData - { certificateType, certificateName, semester, notes }
   */
  createRequest: async (requestData) => {
    const response = await apiClient.post('/certificate-requests', requestData);
    return response.data;
  },

  /**
   * Lấy lịch sử yêu cầu của sinh viên hiện tại
   * @param {Object} params - { page, limit }
   */
  getMyRequests: async (params = {}) => {
    const response = await apiClient.get('/certificate-requests/my', { params });
    return response.data;
  },

  /**
   * Lấy chi tiết yêu cầu theo ID
   * @param {string} requestId
   */
  getRequestById: async (requestId) => {
    const response = await apiClient.get(`/certificate-requests/${requestId}`);
    return response.data;
  },

  /**
   * Lấy tất cả yêu cầu (Staff/Admin only)
   * @param {Object} params - { page, limit, status, certificateType }
   */
  getAllRequests: async (params = {}) => {
    const response = await apiClient.get('/certificate-requests', { params });
    return response.data;
  },

  /**
   * Cập nhật trạng thái yêu cầu (Staff/Admin only)
   * @param {string} requestId
   * @param {Object} data - { status, notes }
   */
  updateRequestStatus: async (requestId, data) => {
    const response = await apiClient.put(`/certificate-requests/${requestId}/status`, data);
    return response.data;
  },

  /**
   * Lấy thống kê yêu cầu (Admin only)
   */
  getStats: async () => {
    const response = await apiClient.get('/certificate-requests/stats');
    return response.data;
  },

  // ==================== DASHBOARD APIs ====================

  /**
   * Lấy yêu cầu đang xử lý cho dashboard
   */
  getDashboardProcessing: async () => {
    const response = await apiClient.get('/certificate-requests/dashboard/processing');
    return response.data;
  },

  /**
   * Lấy yêu cầu hợp lệ cho dashboard
   */
  getDashboardValid: async () => {
    const response = await apiClient.get('/certificate-requests/dashboard/valid');
    return response.data;
  },

  /**
   * Lấy yêu cầu không hợp lệ cho dashboard
   */
  getDashboardInvalid: async () => {
    const response = await apiClient.get('/certificate-requests/dashboard/invalid');
    return response.data;
  },

  /**
   * Xuất dữ liệu ra file CSV (Staff/Admin only)
   * @param {Object} filters - { status, semester, startDate, endDate }
   * @returns {Promise<Blob>} - File CSV dạng Blob
   */
  exportCSV: async (filters = {}) => {
    const params = new URLSearchParams();
    
    if (filters.status && filters.status !== 'all') {
      params.append('status', filters.status);
    }
    if (filters.semester && filters.semester !== 'all') {
      params.append('semester', filters.semester);
    }
    if (filters.startDate) {
      params.append('startDate', filters.startDate);
    }
    if (filters.endDate) {
      params.append('endDate', filters.endDate);
    }

    const url = `/certificate-requests/export-csv${params.toString() ? '?' + params.toString() : ''}`;
    
    return await apiClient.get(url, {
      responseType: 'blob'
    });
  }
};

export default certificateRequestService;
