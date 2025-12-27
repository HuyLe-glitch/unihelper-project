import { apiClient } from './api';

/**
 * Semester Service - Gọi API cho quản lý Học kỳ
 * CHỈ gọi API, KHÔNG có business logic
 */

// ==================== SEMESTER TEMPLATE API ====================

export const semesterTemplateService = {
  /**
   * Lấy tất cả templates
   */
  getAllTemplates: async () => {
    const response = await apiClient.get('/semester-templates');
    return response.data;
  },

  /**
   * Lấy template theo ID
   */
  getTemplateById: async (templateId) => {
    const response = await apiClient.get(`/semester-templates/${templateId}`);
    return response.data;
  },

  /**
   * Tạo template mới
   */
  createTemplate: async (templateData) => {
    const response = await apiClient.post('/semester-templates', templateData);
    return response.data;
  },

  /**
   * Cập nhật template
   */
  updateTemplate: async (templateId, updateData) => {
    const response = await apiClient.patch(`/semester-templates/${templateId}`, updateData);
    return response.data;
  },

  /**
   * Xóa template
   */
  deleteTemplate: async (templateId) => {
    const response = await apiClient.delete(`/semester-templates/${templateId}`);
    return response.data;
  }
};

// ==================== SEMESTER API ====================

export const semesterService = {
  /**
   * Lấy tất cả semesters
   */
  getAllSemesters: async (filters = {}) => {
    const response = await apiClient.get('/semesters', { params: filters });
    return response.data;
  },

  /**
   * Lấy semester theo ID
   */
  getSemesterById: async (semesterId) => {
    const response = await apiClient.get(`/semesters/${semesterId}`);
    return response.data;
  },

  /**
   * Lấy semester đang active
   */
  getActiveSemester: async () => {
    const response = await apiClient.get('/semesters/active');
    return response.data;
  },

  /**
   * Preview dates trước khi tạo
   */
  previewDates: async (templateId, year) => {
    const response = await apiClient.get('/semesters/preview', {
      params: { templateId, year }
    });
    return response.data;
  },

  /**
   * Tạo semester mới
   */
  createSemester: async (semesterData) => {
    const response = await apiClient.post('/semesters', semesterData);
    return response.data;
  },

  /**
   * Cập nhật semester
   */
  updateSemester: async (semesterId, updateData) => {
    const response = await apiClient.patch(`/semesters/${semesterId}`, updateData);
    return response.data;
  },

  // Học kỳ được tự động kích hoạt bởi Backend dựa trên ngày hiện tại
  // Không cần API activateSemester thủ công

  /**
   * Xóa semester
   */
  deleteSemester: async (semesterId) => {
    const response = await apiClient.delete(`/semesters/${semesterId}`);
    return response.data;
  }
};

export default semesterService;
