import { apiClient } from './api';

/**
 * Dormitory Request Service - Frontend API Layer
 * Gọi API quản lý yêu cầu KTX
 * Pattern: Frontend chỉ gọi API, không xử lý logic nghiệp vụ
 */
const dormitoryRequestService = {
  // ==========================================
  // CATEGORY APIs (Danh mục thiết bị) - Dùng Equipment API
  // ==========================================

  /**
   * Lấy tất cả danh mục KTX (từ EquipmentCategory)
   */
  getAllCategories: async () => {
    const response = await apiClient.get('/equipment/categories');
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
   * Lấy thiết bị theo danh mục (từ EquipmentItem)
   * @param {string} categoryId
   */
  getItemsByCategory: async (categoryId) => {
    const response = await apiClient.get(`/equipment/items?category=${categoryId}`);
    return response.data;
  },

  // ==========================================
  // REQUEST APIs (Yêu cầu KTX)
  // ==========================================

  /**
   * Tạo yêu cầu KTX mới
   * @param {Object} requestData - { category: [categoryIds], description }
   */
  createRequest: async (requestData) => {
    const response = await apiClient.post('/dormitory/requests', requestData);
    return response.data;
  },

  /**
   * Lấy yêu cầu của sinh viên đang đăng nhập
   * @param {Object} filters - { status, page, limit }
   */
  getMyRequests: async (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.status) params.append('status', filters.status);
    if (filters.page) params.append('page', filters.page);
    if (filters.limit) params.append('limit', filters.limit);

    const queryString = params.toString();
    const url = `/dormitory/requests/my${queryString ? `?${queryString}` : ''}`;

    const response = await apiClient.get(url);
    return response.data;
  },

  /**
   * Lấy yêu cầu theo ID
   * @param {string} requestId
   */
  getRequestById: async (requestId) => {
    const response = await apiClient.get(`/dormitory/requests/${requestId}`);
    return response.data;
  },

  /**
   * Cập nhật yêu cầu (sinh viên chỉ được sửa nếu chưa duyệt)
   * @param {string} requestId
   * @param {Object} updateData
   */
  updateRequest: async (requestId, updateData) => {
    const response = await apiClient.patch(`/dormitory/requests/${requestId}`, updateData);
    return response.data;
  },

  /**
   * Xác nhận sửa chữa - Sinh viên xác nhận đã sửa xong (STUDENT)
   * @param {string} requestId - ID yêu cầu
   */
  confirmRepair: async (requestId) => {
    const response = await apiClient.patch(`/dormitory/requests/${requestId}/confirm-repair`);
    return response.data;
  },

  /**
   * Xóa yêu cầu
   * @param {string} requestId
   */
  deleteRequest: async (requestId) => {
    const response = await apiClient.delete(`/dormitory/requests/${requestId}`);
    return response.data;
  },

  // ==========================================
  // STAFF/ADMIN APIs
  // ==========================================

  /**
   * Lấy tất cả yêu cầu (STAFF/ADMIN)
   * @param {Object} filters - { status, student, page, limit }
   */
  getAllRequests: async (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.status) params.append('status', filters.status);
    if (filters.student) params.append('student', filters.student);
    if (filters.page) params.append('page', filters.page);
    if (filters.limit) params.append('limit', filters.limit);

    const queryString = params.toString();
    const url = `/dormitory/requests${queryString ? `?${queryString}` : ''}`;

    const response = await apiClient.get(url);
    return response.data;
  },

  /**
   * Tiếp nhận yêu cầu KTX (STAFF/ADMIN)
   * Chuyển status từ 'Pending' -> 'Under Review'
   * @param {string} requestId - ID yêu cầu
   */
  acceptRequest: async (requestId) => {
    const response = await apiClient.patch(`/dormitory/requests/${requestId}/accept`);
    return response.data;
  },

  /**
   * Cập nhật status yêu cầu (STAFF/ADMIN)
   * @param {string} requestId
   * @param {string} status - 'Pending' | 'Under Review' | 'Approved' | 'Rejected'
   */
  updateRequestStatus: async (requestId, status) => {
    const response = await apiClient.patch(`/dormitory/requests/${requestId}/status`, { status });
    return response.data;
  }
};

export default dormitoryRequestService;
