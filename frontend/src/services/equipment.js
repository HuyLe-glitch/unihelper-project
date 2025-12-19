import { apiClient } from './api';

/**
 * Equipment Service - Frontend API Layer
 * Gọi API quản lý Danh mục và Thiết bị KTX
 * Pattern: Frontend chỉ gọi API, không xử lý logic nghiệp vụ
 */
const equipmentService = {
  // ==========================================
  // CATEGORY APIs
  // ==========================================

  /**
   * Lấy tất cả danh mục
   * @param {Object} filters - { search }
   */
  getAllCategories: async (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.search) params.append('search', filters.search);
    
    const queryString = params.toString();
    const url = `/equipment/categories${queryString ? `?${queryString}` : ''}`;
    
    const response = await apiClient.get(url);
    return response.data;
  },

  /**
   * Lấy danh mục theo ID
   * @param {string} categoryId
   */
  getCategoryById: async (categoryId) => {
    const response = await apiClient.get(`/equipment/categories/${categoryId}`);
    return response.data;
  },

  /**
   * Tạo danh mục mới
   * @param {Object} categoryData - { name, description, icon }
   */
  createCategory: async (categoryData) => {
    const response = await apiClient.post('/equipment/categories', categoryData);
    return response.data;
  },

  /**
   * Cập nhật danh mục
   * @param {string} categoryId
   * @param {Object} updateData - { name?, description?, icon? }
   */
  updateCategory: async (categoryId, updateData) => {
    const response = await apiClient.patch(`/equipment/categories/${categoryId}`, updateData);
    return response.data;
  },

  /**
   * Xóa danh mục (xóa kèm tất cả thiết bị trong đó)
   * @param {string} categoryId
   */
  deleteCategory: async (categoryId) => {
    const response = await apiClient.delete(`/equipment/categories/${categoryId}`);
    return response.data;
  },

  // ==========================================
  // ITEM APIs
  // ==========================================

  /**
   * Lấy tất cả thiết bị
   * @param {Object} filters - { search, category }
   */
  getAllItems: async (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.search) params.append('search', filters.search);
    if (filters.category) params.append('category', filters.category);
    
    const queryString = params.toString();
    const url = `/equipment/items${queryString ? `?${queryString}` : ''}`;
    
    const response = await apiClient.get(url);
    return response.data;
  },

  /**
   * Lấy thiết bị theo ID
   * @param {string} itemId
   */
  getItemById: async (itemId) => {
    const response = await apiClient.get(`/equipment/items/${itemId}`);
    return response.data;
  },

  /**
   * Lấy thiết bị theo danh mục
   * @param {string} categoryId
   */
  getItemsByCategory: async (categoryId) => {
    const response = await apiClient.get(`/equipment/categories/${categoryId}/items`);
    return response.data;
  },

  /**
   * Tạo thiết bị đơn lẻ
   * @param {Object} itemData - { name, category, description }
   */
  createItem: async (itemData) => {
    const response = await apiClient.post('/equipment/items', itemData);
    return response.data;
  },

  /**
   * Tạo nhiều thiết bị cùng lúc (batch)
   * @param {string} categoryId - ID danh mục
   * @param {Array} items - [{ name, description }, ...]
   */
  createItemsBatch: async (categoryId, items) => {
    const response = await apiClient.post(`/equipment/categories/${categoryId}/items/batch`, { items });
    return response.data;
  },

  /**
   * Cập nhật thiết bị
   * @param {string} itemId
   * @param {Object} updateData - { name?, category?, description? }
   */
  updateItem: async (itemId, updateData) => {
    const response = await apiClient.patch(`/equipment/items/${itemId}`, updateData);
    return response.data;
  },

  /**
   * Xóa thiết bị
   * @param {string} itemId
   */
  deleteItem: async (itemId) => {
    const response = await apiClient.delete(`/equipment/items/${itemId}`);
    return response.data;
  },

  // ==========================================
  // STATS API
  // ==========================================

  /**
   * Lấy thống kê
   */
  getStats: async () => {
    const response = await apiClient.get('/equipment/stats');
    return response.data;
  }
};

export default equipmentService;
