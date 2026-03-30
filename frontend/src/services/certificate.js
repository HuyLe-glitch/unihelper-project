import { apiClient } from './api';

/**
 * Certificate Service - Frontend API Layer
 * Gọi API quản lý Loại chứng nhận và Chứng nhận
 * Pattern: Frontend chỉ gọi API, không xử lý logic nghiệp vụ
 */
const certificateService = {
  // ==========================================
  // CERTIFICATE TYPE APIs
  // ==========================================

  /**
   * Lấy tất cả loại chứng nhận
   */
  getAllTypes: async () => {
    const response = await apiClient.get('/certificates/types');
    return response.data;
  },

  /**
   * Lấy loại chứng nhận theo ID
   * @param {string} typeId
   */
  getTypeById: async (typeId) => {
    const response = await apiClient.get(`/certificates/types/${typeId}`);
    return response.data;
  },

  /**
   * Tạo loại chứng nhận mới
   * @param {Object} typeData - { name, description }
   */
  createType: async (typeData) => {
    const response = await apiClient.post('/certificates/types', typeData);
    return response.data;
  },

  /**
   * Cập nhật loại chứng nhận
   * @param {string} typeId
   * @param {Object} updateData - { name?, description? }
   */
  updateType: async (typeId, updateData) => {
    const response = await apiClient.patch(`/certificates/types/${typeId}`, updateData);
    return response.data;
  },

  /**
   * Xóa loại chứng nhận (xóa kèm tất cả chứng nhận trong đó)
   * @param {string} typeId
   */
  deleteType: async (typeId) => {
    const response = await apiClient.delete(`/certificates/types/${typeId}`);
    return response.data;
  },

  /**
   * Kiểm tra có thể xóa loại chứng nhận không
   * @param {string} typeId
   */
  checkCanDeleteType: async (typeId) => {
    const response = await apiClient.get(`/certificates/types/${typeId}/check-delete`);
    return response.data;
  },

  // ==========================================
  // CERTIFICATE APIs
  // ==========================================

  /**
   * Lấy tất cả chứng nhận
   * @param {Object} filters - { certificateType }
   */
  getAllCertificates: async (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.certificateType) params.append('certificateType', filters.certificateType);
    
    const queryString = params.toString();
    const url = `/certificates${queryString ? `?${queryString}` : ''}`;
    
    const response = await apiClient.get(url);
    return response.data;
  },

  /**
   * Lấy chứng nhận theo ID
   * @param {string} certificateId
   */
  getCertificateById: async (certificateId) => {
    const response = await apiClient.get(`/certificates/${certificateId}`);
    return response.data;
  },

  /**
   * Lấy chứng nhận theo loại
   * @param {string} typeId
   */
  getCertificatesByType: async (typeId) => {
    const response = await apiClient.get(`/certificates/by-type/${typeId}`);
    return response.data;
  },

  /**
   * Tạo chứng nhận đơn lẻ
   * @param {Object} certificateData - { name, certificateType, description }
   */
  createCertificate: async (certificateData) => {
    const response = await apiClient.post('/certificates', certificateData);
    return response.data;
  },

  /**
   * Tạo nhiều chứng nhận cùng lúc (batch)
   * @param {string} typeId - ID loại chứng nhận
   * @param {Array} certificates - [{ name, description }, ...]
   */
  createCertificatesBatch: async (typeId, certificates) => {
    const response = await apiClient.post('/certificates/batch', { typeId, certificates });
    return response.data;
  },

  /**
   * Cập nhật chứng nhận
   * @param {string} certificateId
   * @param {Object} updateData - { name?, certificateType?, description? }
   */
  updateCertificate: async (certificateId, updateData) => {
    const response = await apiClient.patch(`/certificates/${certificateId}`, updateData);
    return response.data;
  },

  /**
   * Xóa chứng nhận
   * @param {string} certificateId
   */
  deleteCertificate: async (certificateId) => {
    const response = await apiClient.delete(`/certificates/${certificateId}`);
    return response.data;
  },

  /**
   * Kiểm tra có thể xóa chứng nhận không
   * @param {string} certificateId
   */
  checkCanDeleteCertificate: async (certificateId) => {
    const response = await apiClient.get(`/certificates/${certificateId}/check-delete`);
    return response.data;
  },

  // ==========================================
  // STATS API
  // ==========================================

  /**
   * Lấy thống kê
   */
  getStats: async () => {
    const response = await apiClient.get('/certificates/stats');
    return response.data;
  }
};

export default certificateService;
