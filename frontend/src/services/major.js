import { apiClient } from './api';

/**
 * Major Service - Gọi API cho quản lý Chuyên ngành
 * CHỈ gọi API, KHÔNG có business logic
 */
export const majorService = {
  /**
   * Lấy danh sách tất cả chuyên ngành
   */
  getAllMajors: async (filters = {}) => {
    const response = await apiClient.get('/majors', { params: filters });
    return response.data;
  },

  /**
   * Lấy chi tiết một chuyên ngành theo ID
   */
  getMajorById: async (majorId) => {
    const response = await apiClient.get(`/majors/${majorId}`);
    return response.data;
  },

  /**
   * Tạo chuyên ngành mới
   */
  createMajor: async (majorData) => {
    const response = await apiClient.post('/majors', majorData);
    return response.data;
  },

  /**
   * Tạo nhiều chuyên ngành cùng lúc (batch)
   * Business logic xử lý ở Backend
   */
  createBatchMajors: async (facultyId, majorsData) => {
    const response = await apiClient.post('/majors/batch', {
      faculty: facultyId,
      majors: majorsData
    });
    return response.data;
  },

  /**
   * Cập nhật thông tin chuyên ngành
   */
  updateMajor: async (majorId, updateData) => {
    const response = await apiClient.patch(`/majors/${majorId}`, updateData);
    return response.data;
  },

  /**
   * Xóa chuyên ngành (hard delete)
   */
  deleteMajor: async (majorId) => {
    const response = await apiClient.delete(`/majors/${majorId}`);
    return response.data;
  },

  /**
   * Lấy danh sách chuyên ngành theo Khoa
   * @param {string} facultyId - ID của khoa
   */
  getMajorsByFaculty: async (facultyId) => {
    const response = await apiClient.get('/majors', { 
      params: { faculty: facultyId } 
    });
    return response.data;
  }
};

export default majorService;
