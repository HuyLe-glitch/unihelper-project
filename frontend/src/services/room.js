import { apiClient } from './api';

/**
 * Room Service - Gọi API cho quản lý Phòng KTX
 * CHỈ gọi API, KHÔNG có business logic
 */

export const roomService = {
  /**
   * Lấy tất cả phòng
   */
  getAllRooms: async (filters = {}) => {
    const response = await apiClient.get('/rooms', { params: filters });
    return response.data;
  },

  /**
   * Lấy phòng theo ID
   */
  getRoomById: async (roomId) => {
    const response = await apiClient.get(`/rooms/${roomId}`);
    return response.data;
  },

  /**
   * Lấy thống kê phòng
   */
  getRoomStats: async () => {
    const response = await apiClient.get('/rooms/stats');
    return response.data;
  },

  /**
   * Lấy phòng còn trống
   */
  getAvailableRooms: async (categoryId = null) => {
    const params = categoryId ? { categoryId } : {};
    const response = await apiClient.get('/rooms/available', { params });
    return response.data;
  },

  /**
   * Tạo phòng mới
   */
  createRoom: async (roomData) => {
    const response = await apiClient.post('/rooms', roomData);
    return response.data;
  },

  /**
   * Cập nhật phòng
   */
  updateRoom: async (roomId, updateData) => {
    const response = await apiClient.patch(`/rooms/${roomId}`, updateData);
    return response.data;
  },

  /**
   * Xóa phòng
   */
  deleteRoom: async (roomId) => {
    const response = await apiClient.delete(`/rooms/${roomId}`);
    return response.data;
  }
};

export default roomService;
