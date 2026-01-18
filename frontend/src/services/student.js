import { apiClient } from './api';

/**
 * Student Service - Frontend API Layer
 * Gọi API quản lý Sinh viên
 * Pattern: Frontend chỉ gọi API, không xử lý logic nghiệp vụ
 */
const studentService = {
  // ==========================================
  // STUDENT CRUD APIs
  // ==========================================

  /**
   * Lấy danh sách sinh viên
   * @param {Object} params - { page, limit, major, status, isDormResident }
   */
  getAll: async (params = {}) => {
    const queryParams = new URLSearchParams();
    if (params.page) queryParams.append('page', params.page);
    if (params.limit) queryParams.append('limit', params.limit);
    if (params.major) queryParams.append('major', params.major);
    if (params.status) queryParams.append('status', params.status);
    if (params.isDormResident !== undefined) {
      queryParams.append('isDormResident', params.isDormResident);
    }
    
    const queryString = queryParams.toString();
    const url = `/students${queryString ? `?${queryString}` : ''}`;
    
    const response = await apiClient.get(url);
    return response.data;
  },

  /**
   * Lấy sinh viên theo ID
   * @param {string} id
   */
  getById: async (id) => {
    const response = await apiClient.get(`/students/${id}`);
    return response.data;
  },

  /**
   * Tạo sinh viên mới
   * @param {Object} studentData
   */
  create: async (studentData) => {
    const response = await apiClient.post('/students', studentData);
    return response.data;
  },

  /**
   * Cập nhật sinh viên
   * @param {string} id
   * @param {Object} updateData
   */
  update: async (id, updateData) => {
    const response = await apiClient.patch(`/students/${id}`, updateData);
    return response.data;
  },

  /**
   * Xóa sinh viên
   * @param {string} id
   */
  delete: async (id) => {
    const response = await apiClient.delete(`/students/${id}`);
    return response.data;
  },

  // ==========================================
  // DORMITORY APIs
  // ==========================================

  /**
   * Lấy danh sách sinh viên ở KTX
   * @param {Object} params - { page, limit, roomId }
   */
  getDormStudents: async (params = {}) => {
    const queryParams = new URLSearchParams();
    if (params.page) queryParams.append('page', params.page);
    if (params.limit) queryParams.append('limit', params.limit);
    if (params.roomId) queryParams.append('roomId', params.roomId);
    
    const queryString = queryParams.toString();
    const url = `/students/dormitory${queryString ? `?${queryString}` : ''}`;
    
    const response = await apiClient.get(url);
    return response.data;
  },

  /**
   * Lấy danh sách phòng còn chỗ trống
   */
  getAvailableRooms: async () => {
    const response = await apiClient.get('/students/available-rooms');
    return response.data;
  },

  // ==========================================
  // STATS API
  // ==========================================

  /**
   * Lấy thống kê sinh viên
   */
  getStats: async () => {
    const response = await apiClient.get('/students/stats');
    return response.data;
  },

  // ==========================================
  // IMPORT CSV APIs
  // ==========================================

  /**
   * Preview Import - Validate dữ liệu CSV (không lưu DB)
   * @param {Object[]} rows - Mảng dữ liệu từ CSV
   * @param {string} majorId - ID chuyên ngành
   * @returns {Object} - Kết quả validation với thống kê
   */
  previewImport: async (rows, majorId) => {
    const response = await apiClient.post('/students/import/preview', {
      rows,
      majorId
    });
    return response.data;
  },

  /**
   * Execute Import - Lưu dữ liệu hợp lệ vào DB
   * @param {Object[]} validRows - Mảng dữ liệu hợp lệ
   * @param {string} majorId - ID chuyên ngành
   * @returns {Object} - Kết quả import
   */
  executeImport: async (validRows, majorId) => {
    const response = await apiClient.post('/students/import/execute', {
      validRows,
      majorId
    });
    return response.data;
  },

  // ==========================================
  // BULK DELETE API
  // ==========================================

  /**
   * Xóa nhiều sinh viên cùng lúc
   * @param {string[]} ids - Mảng ID sinh viên cần xóa
   * @returns {Object} - Kết quả xóa
   */
  bulkDelete: async (ids) => {
    const response = await apiClient.delete('/students/bulk', {
      data: { ids }
    });
    return response.data;
  },

  // ==========================================
  // ROOM TRANSFER API
  // ==========================================

  /**
   * Chuyển phòng cho nhiều sinh viên
   * @param {string[]} studentIds - Mảng ID sinh viên cần chuyển
   * @param {string} targetRoomId - ID phòng đích
   * @returns {Object} - Kết quả chuyển phòng
   */
  transferRoom: async (studentIds, targetRoomId) => {
    const response = await apiClient.post('/students/transfer', {
      studentIds,
      targetRoomId
    });
    return response.data;
  },

  // ==========================================
  // ROOMS API (for transfer dialog)
  // ==========================================

  /**
   * Lấy tất cả phòng KTX (kèm thông tin sức chứa)
   * @returns {Object} - Danh sách phòng
   */
  getAllRooms: async () => {
    const response = await apiClient.get('/rooms');
    return response.data;
  },

  // ==========================================
  // STUDENT PROFILE API (for logged-in student)
  // ==========================================

  /**
   * Lấy thông tin sinh viên đang đăng nhập (luôn gọi API để có dữ liệu mới nhất với đầy đủ populate)
   * @returns {Object} - Thông tin sinh viên
   */
  getMyProfile: async () => {
    // Luôn gọi API để đảm bảo có dữ liệu mới nhất với đầy đủ populate (major, faculty, roomId)
    const response = await apiClient.get('/auth/me');
    // API /auth/me trả về { success, data: { id, email, role, profile } }
    // Chúng ta cần trả về profile
    if (response.data.success && response.data.data?.profile) {
      return { success: true, data: response.data.data.profile };
    }
    return response.data;
  },

  // ==========================================
  // DASHBOARD API
  // ==========================================

  /**
   * Lấy dữ liệu dashboard cho sinh viên
   * @returns {Object} - { isDormResident, stats, recentRequests }
   */
  getDashboard: async () => {
    const response = await apiClient.get('/students/dashboard');
    return response.data;
  },

  // ==========================================
  // EXPORT CSV API
  // ==========================================

  /**
   * Xuất danh sách sinh viên ra file CSV
   * @param {Object} filters - { isDormResident, faculty, major, roomId }
   * @returns {Blob} - CSV file blob
   */
  exportCSV: async (filters = {}) => {
    const queryParams = new URLSearchParams();
    if (filters.isDormResident !== undefined) {
      queryParams.append('isDormResident', filters.isDormResident);
    }
    if (filters.faculty && filters.faculty !== 'all') {
      queryParams.append('faculty', filters.faculty);
    }
    if (filters.major && filters.major !== 'all') {
      queryParams.append('major', filters.major);
    }
    if (filters.roomId && filters.roomId !== 'all') {
      queryParams.append('roomId', filters.roomId);
    }
    
    const queryString = queryParams.toString();
    const url = `/students/export-csv${queryString ? `?${queryString}` : ''}`;
    
    const response = await apiClient.get(url, {
      responseType: 'blob'
    });
    return response;
  }
};

export default studentService;
