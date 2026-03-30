/**
 * File Service - Frontend API calls cho file operations
 * Sử dụng Firebase Storage để lưu trữ file
 */
import { apiClient } from './api';

const fileService = {
  /**
   * Upload file lên Firebase Storage
   * @param {File} file - File object để upload
   * @param {String} folder - Thư mục lưu trữ (vd: 'certificate-requests')
   * @returns {Promise} - Response với thông tin file đã upload
   */
  uploadFile: async (file, folder = 'uploads') => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('folder', folder);

    const response = await apiClient.post('/files/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  },

  /**
   * Lấy URL để preview file
   * Với Firebase Storage, dùng trực tiếp fileUrl (public URL)
   * @param {String} fileUrl - URL public của file từ Firebase
   * @returns {String} - URL để preview file
   */
  getPreviewUrl: (fileUrl) => {
    // Firebase Storage URL đã là public, dùng trực tiếp
    return fileUrl || null;
  },

  /**
   * Xóa file từ Firebase Storage
   * @param {String} storedName - Path file trên Firebase
   * @returns {Promise} - Response
   */
  deleteFile: async (storedName) => {
    const response = await apiClient.delete(`/files/${encodeURIComponent(storedName)}`);
    return response.data;
  }
};

export default fileService;
