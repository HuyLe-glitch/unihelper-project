const staffRepository = require('../repositories/staffRepository');
const { STAFF_TYPES } = require('../constants/modelConstants');

/**
 * Staff Service - Business Logic Layer
 * 
 * Đơn giản hóa cho 2 tài khoản staff CỐ ĐỊNH:
 * - Staff CTSV: Xử lý yêu cầu Công tác Sinh viên
 * - Staff KTX: Xử lý yêu cầu Ký túc xá
 * 
 * Mỗi staff chỉ thấy và xử lý yêu cầu thuộc phạm vi của mình
 */
class StaffService {

  /**
   * Lấy thông tin staff từ user ID
   */
  async getStaffByUserId(userId) {
    if (!userId) {
      throw new Error('User ID is required');
    }

    const staff = await staffRepository.findStaffByUserId(userId);
    
    if (!staff) {
      throw new Error('Staff not found');
    }

    return staff;
  }

  /**
   * Lấy danh sách yêu cầu dành cho staff
   * Tự động filter theo staffType (CTSV hoặc KTX)
   */
  async getRequestsForStaff(userId, options = {}) {
    if (!userId) {
      throw new Error('User ID is required');
    }

    // Lấy thông tin staff để xác định loại yêu cầu cần xử lý
    const staff = await this.getStaffByUserId(userId);
    
    if (!staff) {
      throw new Error('Staff not found');
    }

    // Validate staffType - chỉ có CTSV hoặc KTX
    if (!Object.values(STAFF_TYPES).includes(staff.staffType)) {
      throw new Error('Invalid staff type. Must be CTSV or KTX');
    }

    // Validate options
    const {
      page = 1,
      limit = 10,
      status,
      sortBy = 'requestDate',
      sortOrder = 'desc'
    } = options;

    if (page < 1 || limit < 1 || limit > 100) {
      throw new Error('Invalid pagination parameters');
    }

    const allowedSortFields = ['requestDate', 'status', 'certificateType'];
    if (!allowedSortFields.includes(sortBy)) {
      throw new Error('Invalid sort field');
    }

    if (!['asc', 'desc'].includes(sortOrder)) {
      throw new Error('Invalid sort order');
    }

    if (status) {
      const allowedStatuses = ['pending', 'processing', 'approved', 'rejected', 'completed'];
      if (!allowedStatuses.includes(status)) {
        throw new Error('Invalid status value');
      }
    }

    // Lấy danh sách yêu cầu theo staff type (tự động filter)
    const result = await staffRepository.getCertificateRequestsByStaffType(
      staff.staffType, 
      { page, limit, status, sortBy, sortOrder }
    );

    return {
      staff: {
        id: staff._id,
        staffId: staff.staffId,
        staffType: staff.staffType,
        department: staff.department,
        fullName: staff.user?.name || 'N/A'
      },
      ...result
    };
  }

  /**
   * Lấy thống kê yêu cầu cho staff (theo staffType)
   */
  async getRequestStatsForStaff(userId) {
    if (!userId) {
      throw new Error('User ID is required');
    }

    const staff = await this.getStaffByUserId(userId);
    
    if (!staff) {
      throw new Error('Staff not found');
    }

    const stats = await staffRepository.getRequestStatsByStaffType(staff.staffType);

    return {
      staffType: staff.staffType,
      department: staff.department,
      ...stats
    };
  }

  /**
   * Cập nhật trạng thái yêu cầu
   * Staff chỉ có thể cập nhật yêu cầu thuộc phạm vi của mình
   */
  async updateRequestStatus(userId, requestId, newStatus, note = '') {
    if (!userId || !requestId || !newStatus) {
      throw new Error('User ID, Request ID, and new status are required');
    }

    const allowedStatuses = ['processing', 'approved', 'rejected', 'completed'];
    if (!allowedStatuses.includes(newStatus)) {
      throw new Error('Invalid status value');
    }

    const staff = await this.getStaffByUserId(userId);
    
    if (!staff) {
      throw new Error('Staff not found');
    }

    // Kiểm tra request tồn tại
    const request = await staffRepository.findRequestById(requestId);
    if (!request) {
      throw new Error('Certificate request not found');
    }

    // Kiểm tra quyền xử lý
    const hasPermission = this.checkStaffPermissionForRequest(staff, request);
    if (!hasPermission) {
      throw new Error('You do not have permission to process this request');
    }

    // Cập nhật status
    const updatedRequest = await staffRepository.updateRequestStatus(
      requestId, 
      newStatus, 
      staff._id, 
      note
    );

    return updatedRequest;
  }

  /**
   * Lấy chi tiết một yêu cầu
   */
  async getRequestById(userId, requestId) {
    if (!userId || !requestId) {
      throw new Error('User ID and Request ID are required');
    }

    const staff = await this.getStaffByUserId(userId);
    
    if (!staff) {
      throw new Error('Staff not found');
    }

    const request = await staffRepository.findRequestById(requestId);
    
    if (!request) {
      throw new Error('Certificate request not found');
    }

    // Kiểm tra quyền xem
    const hasPermission = this.checkStaffPermissionForRequest(staff, request);
    
    if (!hasPermission) {
      throw new Error('You do not have permission to view this request');
    }

    return request;
  }

  /**
   * Kiểm tra quyền của staff với yêu cầu cụ thể
   * - CTSV staff chỉ xử lý yêu cầu CTSV/certificate
   * - KTX staff chỉ xử lý yêu cầu KTX/dormitory
   */
  checkStaffPermissionForRequest(staff, request) {
    if (!staff || !request) return false;

    // Xác định loại request
    const requestType = request.requestType || 
                        (request.certificateType?.category) || 
                        'CTSV';

    // CTSV staff xử lý yêu cầu CTSV
    if (staff.staffType === STAFF_TYPES.CTSV) {
      return requestType === 'CTSV' || 
             requestType === 'certificate' || 
             !requestType.includes('KTX');
    }

    // KTX staff xử lý yêu cầu KTX
    if (staff.staffType === STAFF_TYPES.KTX) {
      return requestType === 'KTX' || 
             requestType === 'dormitory';
    }

    return false;
  }

  /**
   * Lấy thông tin dashboard cho staff
   */
  async getDashboardData(userId) {
    if (!userId) {
      throw new Error('User ID is required');
    }

    const staff = await this.getStaffByUserId(userId);
    
    if (!staff) {
      throw new Error('Staff not found');
    }

    // Lấy thống kê
    const stats = await this.getRequestStatsForStaff(userId);

    // Lấy yêu cầu pending gần đây
    const pendingRequests = await staffRepository.getCertificateRequestsByStaffType(
      staff.staffType,
      { page: 1, limit: 5, status: 'pending', sortBy: 'requestDate', sortOrder: 'desc' }
    );

    return {
      staff: {
        id: staff._id,
        staffId: staff.staffId,
        staffType: staff.staffType,
        department: staff.department,
        name: staff.user?.name || 'N/A'
      },
      stats,
      recentPendingRequests: pendingRequests.requests || []
    };
  }
}

module.exports = new StaffService();
