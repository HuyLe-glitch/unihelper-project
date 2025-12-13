const staffRepository = require('../repositories/staffRepository');

class StaffService {

  /**
   * Lấy thông tin staff từ user ID
   * @param {String} userId 
   * @returns {Object} Staff information
   */
  async getStaffByUserId(userId) {
    try {
      if (!userId) {
        throw new Error('User ID is required');
      }

      const staff = await staffRepository.findStaffByUserId(userId);
      
      if (!staff) {
        throw new Error('Staff not found');
      }

      return staff;
    } catch (error) {
      throw new Error(`Error fetching staff information: ${error.message}`);
    }
  }

  /**
   * Lấy danh sách yêu cầu dành cho staff
   * @param {String} userId - ID của user staff
   * @param {Object} options - Filter và pagination options
   * @returns {Object} Danh sách yêu cầu và thông tin pagination
   */
  async getRequestsForStaff(userId, options = {}) {
    try {
      if (!userId) {
        throw new Error('User ID is required');
      }

      // Lấy thông tin staff để xác định loại yêu cầu cần xử lý
      const staff = await this.getStaffByUserId(userId);
      
      if (!staff) {
        throw new Error('Staff not found');
      }

      if (!['CTSV', 'KTX'].includes(staff.staffType)) {
        throw new Error('Invalid staff type');
      }

      // Validate options
      const {
        page = 1,
        limit = 10,
        status,
        sortBy = 'requestDate',
        sortOrder = 'desc'
      } = options;

      // Validate pagination parameters
      if (page < 1 || limit < 1 || limit > 100) {
        throw new Error('Invalid pagination parameters');
      }

      // Validate sort parameters
      const allowedSortFields = ['requestDate', 'status', 'certificateType'];
      if (!allowedSortFields.includes(sortBy)) {
        throw new Error('Invalid sort field');
      }

      if (!['asc', 'desc'].includes(sortOrder)) {
        throw new Error('Invalid sort order');
      }

      // Validate status if provided
      if (status) {
        const allowedStatuses = ['pending', 'processing', 'approved', 'rejected', 'valid', 'invalid'];
        if (!allowedStatuses.includes(status)) {
          throw new Error('Invalid status value');
        }
      }

      // Lấy danh sách yêu cầu theo staff type
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
          fullName: staff.user.fullName
        },
        ...result
      };
    } catch (error) {
      throw new Error(`Error fetching requests for staff: ${error.message}`);
    }
  }

  /**
   * Lấy thống kê yêu cầu cho staff
   * @param {String} userId 
   * @returns {Object} Statistics
   */
  async getRequestStatsForStaff(userId) {
    try {
      if (!userId) {
        throw new Error('User ID is required');
      }

      // Lấy thông tin staff
      const staff = await this.getStaffByUserId(userId);
      
      if (!staff) {
        throw new Error('Staff not found');
      }

      // Lấy thống kê theo staff type
      const stats = await staffRepository.getRequestStatsByStaffType(staff.staffType);

      return {
        staffType: staff.staffType,
        department: staff.department,
        ...stats
      };
    } catch (error) {
      throw new Error(`Error fetching request statistics: ${error.message}`);
    }
  }

  /**
   * Cập nhật trạng thái yêu cầu
   * @param {String} userId - ID của staff user
   * @param {String} requestId - ID của certificate request
   * @param {String} newStatus - Trạng thái mới
   * @param {String} note - Ghi chú (optional)
   * @returns {Object} Updated request
   */
  async updateRequestStatus(userId, requestId, newStatus, note = '') {
    try {
      if (!userId || !requestId || !newStatus) {
        throw new Error('User ID, Request ID, and new status are required');
      }

      // Validate new status
      const allowedStatuses = ['processing', 'approved', 'rejected', 'valid', 'invalid'];
      if (!allowedStatuses.includes(newStatus)) {
        throw new Error('Invalid status value');
      }

      // Lấy thông tin staff
      const staff = await this.getStaffByUserId(userId);
      
      if (!staff) {
        throw new Error('Staff not found');
      }

      // Cập nhật status
      const updatedRequest = await staffRepository.updateRequestStatus(
        requestId, 
        newStatus, 
        staff._id, 
        note
      );

      if (!updatedRequest) {
        throw new Error('Certificate request not found');
      }

      return updatedRequest;
    } catch (error) {
      throw new Error(`Error updating request status: ${error.message}`);
    }
  }

  /**
   * Lấy chi tiết một yêu cầu cụ thể
   * @param {String} userId - ID của staff user
   * @param {String} requestId - ID của certificate request
   * @returns {Object} Request details
   */
  async getRequestById(userId, requestId) {
    try {
      if (!userId || !requestId) {
        throw new Error('User ID and Request ID are required');
      }

      // Verify staff permissions
      const staff = await this.getStaffByUserId(userId);
      
      if (!staff) {
        throw new Error('Staff not found');
      }

      // Tìm request và kiểm tra quyền truy cập
      const request = await staffRepository.findRequestById(requestId);
      
      if (!request) {
        throw new Error('Certificate request not found');
      }

      // Kiểm tra xem staff có quyền xem request này không
      const hasPermission = this.checkStaffPermissionForRequest(staff.staffType, request.certificateType);
      
      if (!hasPermission) {
        throw new Error('You do not have permission to view this request');
      }

      return request;
    } catch (error) {
      throw new Error(`Error fetching request details: ${error.message}`);
    }
  }

  /**
   * Kiểm tra quyền của staff với loại yêu cầu
   * @param {String} staffType 
   * @param {Object|String} certificateType - Có thể là ObjectId string hoặc populated object
   * @returns {Boolean}
   */
  checkStaffPermissionForRequest(staffType, certificateType) {
    // Tạm thời cho phép tất cả staff xem tất cả requests
    // Vì chưa có logic rõ ràng để phân chia theo certificateType
    return true;
    
    /* 
    // Logic cũ (comment lại):
    const ctsvTypes = ['hoc_phi', 'sinh_vien', 'tot_nghiep', 'ket_qua_hoc_tap'];
    const ktxTypes = ['ktx_confirmation', 'ktx_registration', 'ktx_checkout'];

    // Lấy tên certificateType để so sánh
    let typeName = '';
    if (typeof certificateType === 'string') {
      typeName = certificateType;
    } else if (certificateType && certificateType.name) {
      typeName = certificateType.name.toLowerCase();
    }

    if (staffType === 'CTSV') {
      return ctsvTypes.includes(typeName);
    } else if (staffType === 'KTX') {
      return ktxTypes.includes(typeName);
    }

    return false;
    */
  }

  /**
   * Lấy danh sách nhân viên theo staffType
   * @param {String} staffType - 'CTSV' hoặc 'KTX'
   * @param {Object} options - Filter và pagination options
   * @returns {Object} Danh sách staff và thông tin pagination
   */
  async getStaffByType(staffType, options = {}) {
    try {
      // Validate staffType
      if (!staffType) {
        throw new Error('Staff type is required');
      }

      if (!['CTSV', 'KTX'].includes(staffType)) {
        throw new Error('Invalid staff type. Must be CTSV or KTX');
      }

      // Validate options
      const validatedOptions = {
        page: Math.max(1, parseInt(options.page) || 1),
        limit: Math.min(50, Math.max(1, parseInt(options.limit) || 10)),
        status: options.status || 'ACTIVE',
        sortBy: options.sortBy || 'dateOfJoining',
        sortOrder: ['asc', 'desc'].includes(options.sortOrder) ? options.sortOrder : 'desc'
      };

      // Get staff list from repository
      const result = await staffRepository.getStaffByType(staffType, validatedOptions);

      if (!result || !result.staff) {
        return {
          staff: [],
          pagination: {
            currentPage: 1,
            totalPages: 0,
            totalCount: 0,
            hasNext: false,
            hasPrev: false
          }
        };
      }

      // Format response data
      const formattedStaff = result.staff.map(staff => ({
        _id: staff._id,
        staffId: staff.staffId,
        staffType: staff.staffType,
        department: staff.department,
        email: staff.email,
        hometown: staff.hometown,
        phone: staff.phone,
        dateOfJoining: staff.dateOfJoining,
        status: staff.status,
        user: staff.user ? {
          username: staff.user.username,
          fullName: staff.user.fullName,
          email: staff.user.email
        } : null,
        staffRole: staff.staffRole ? {
          name: staff.staffRole.name,
          description: staff.staffRole.description
        } : null
      }));

      return {
        staff: formattedStaff,
        pagination: result.pagination,
        summary: {
          departmentType: staffType,
          totalStaff: result.pagination.totalCount,
          activeStaff: formattedStaff.filter(s => s.status === 'ACTIVE').length
        }
      };

    } catch (error) {
      throw new Error(`Error getting staff by type: ${error.message}`);
    }
  }
}

module.exports = new StaffService();