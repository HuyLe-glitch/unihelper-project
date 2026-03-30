import { apiClient } from './api';

/**
 * Faculty Service - Gọi API cho quản lý Khoa
 * CHỈ gọi API, KHÔNG có business logic
 */
export const facultyService = {
  /**
   * Lấy danh sách tất cả các khoa
   */
  getAllFaculties: async (filters = {}) => {
    const response = await apiClient.get('/faculties', { params: filters });
    return response.data;
  },

  /**
   * Lấy chi tiết một khoa theo ID
   */
  getFacultyById: async (facultyId) => {
    const response = await apiClient.get(`/faculties/${facultyId}`);
    return response.data;
  },

  /**
   * Lấy danh sách chuyên ngành của một khoa
   */
  getMajorsByFaculty: async (facultyId) => {
    const response = await apiClient.get(`/faculties/${facultyId}/majors`);
    return response.data;
  },

  /**
   * Kiểm tra có thể xóa khoa không (đếm số sinh viên)
   */
  checkCanDeleteFaculty: async (facultyId) => {
    const response = await apiClient.get(`/faculties/${facultyId}/check-delete`);
    return response.data;
  },

  /**
   * Tạo khoa mới
   */
  createFaculty: async (facultyData) => {
    const response = await apiClient.post('/faculties', facultyData);
    return response.data;
  },

  /**
   * Cập nhật thông tin khoa
   */
  updateFaculty: async (facultyId, updateData) => {
    const response = await apiClient.patch(`/faculties/${facultyId}`, updateData);
    return response.data;
  },

  /**
   * Xóa khoa (hard delete - cascade xóa tất cả chuyên ngành)
   */
  deleteFaculty: async (facultyId) => {
    const response = await apiClient.delete(`/faculties/${facultyId}`);
    return response.data;
  }
};

export default facultyService;
