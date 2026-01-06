/**
 * Student Notification Service
 * Gọi API thông báo sinh viên
 */
import { apiClient } from './api';

const studentNotificationService = {
  /**
   * Lấy danh sách thông báo
   */
  getNotifications: async (options = {}) => {
    const { page = 1, limit = 20, isRead } = options;
    const params = new URLSearchParams({ page, limit });
    if (isRead !== undefined) {
      params.append('isRead', isRead);
    }
    
    const response = await apiClient.get(`/student-notifications?${params.toString()}`);
    return response.data;
  },

  /**
   * Lấy số thông báo chưa đọc
   */
  getUnreadCount: async () => {
    const response = await apiClient.get('/student-notifications/unread-count');
    return response.data;
  },

  /**
   * Đánh dấu thông báo đã đọc
   */
  markAsRead: async (notificationId) => {
    const response = await apiClient.patch(`/student-notifications/${notificationId}/read`);
    return response.data;
  },

  /**
   * Đánh dấu tất cả thông báo đã đọc
   */
  markAllAsRead: async () => {
    const response = await apiClient.patch('/student-notifications/mark-all-read');
    return response.data;
  },

  /**
   * Xóa thông báo
   */
  deleteNotification: async (notificationId) => {
    const response = await apiClient.delete(`/student-notifications/${notificationId}`);
    return response.data;
  }
};

export default studentNotificationService;
