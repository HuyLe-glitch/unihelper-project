const Staff = require('../models/Staff');
// StaffRole model đã được xóa - hệ thống chỉ có 2 staff cố định
const CertificateRequest = require('../models/CertificateRequest');

class StaffRepository {
  
  /**
   * Tìm staff theo user ID
   * @param {String} userId 
   * @returns {Object} Staff document
   */
  async findStaffByUserId(userId) {
    try {
      return await Staff.findOne({ user: userId })
        .populate('user', 'username email fullName')
        .exec();
    } catch (error) {
      throw new Error(`Database error: Unable to find staff - ${error.message}`);
    }
  }

  /**
   * Lấy danh sách yêu cầu theo staff type
   * @param {String} staffType - 'CTSV' hoặc 'KTX'
   * @param {Object} options - Pagination và filter options
   * @returns {Array} Danh sách certificate requests
   */
  async getCertificateRequestsByStaffType(staffType, options = {}) {
    try {
      const {
        page = 1,
        limit = 10,
        status,
        sortBy = 'submittedAt',
        sortOrder = 'desc'
      } = options;

      // Build query filter
      let filter = {};
      
      // Lọc theo loại yêu cầu dựa trên staff type
      if (staffType === 'CTSV') {
        // CTSV xử lý các yêu cầu chứng nhận sinh viên - không filter theo certificateType nữa
        // vì trong thực tế, tất cả certificate requests đều có thể được xử lý bởi CTSV hoặc KTX
        // Chúng ta sẽ dựa vào logic khác để phân chia
      } else if (staffType === 'KTX') {
        // KTX xử lý các yêu cầu liên quan đến ký túc xá
        // Tương tự, không filter ở đây mà để tất cả requests
      }

      // Thêm filter theo status nếu có - sử dụng status tiếng Việt từ model
      if (status) {
        const statusMapping = {
          'pending': 'ĐANG XỬ LÝ',
          'processing': 'ĐANG XỬ LÝ', 
          'approved': 'HỢP LỆ',
          'rejected': 'KHÔNG HỢP LỆ',
          'valid': 'HỢP LỆ',
          'invalid': 'KHÔNG HỢP LỆ'
        };
        filter.status = statusMapping[status] || status;
      }

      // Validate sort parameters
      const allowedSortFields = ['requestDate', 'status', 'certificateType'];
      if (!allowedSortFields.includes(sortBy)) {
        sortBy = 'requestDate'; // default fallback
      }

      // Calculate pagination
      const skip = (page - 1) * limit;
      const sortOptions = {};
      sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

      // Execute query with pagination
      const requests = await CertificateRequest.find(filter)
        .populate('student', 'studentId fullName email phone')
        .populate('certificateName', 'name description')
        .populate('certificateType', 'name description')
        .populate('staffAssigned', 'staffId fullName department')
        .sort(sortOptions)
        .skip(skip)
        .limit(parseInt(limit))
        .exec();

      // Get total count for pagination
      const totalCount = await CertificateRequest.countDocuments(filter);
      const totalPages = Math.ceil(totalCount / limit);

      return {
        requests,
        pagination: {
          currentPage: parseInt(page),
          totalPages,
          totalCount,
          hasNext: page < totalPages,
          hasPrev: page > 1
        }
      };
    } catch (error) {
      throw new Error(`Database error: Unable to fetch certificate requests - ${error.message}`);
    }
  }

  /**
   * Lấy thống kê yêu cầu theo staff type
   * @param {String} staffType 
   * @returns {Object} Statistics object
   */
  async getRequestStatsByStaffType(staffType) {
    try {
      let filter = {};
      
      // Tạm thời không filter theo certificateType vì chưa rõ logic phân chia
      // Sẽ lấy tất cả requests và để staff tự quyết định xử lý

      // Thống kê theo status - sử dụng status tiếng Việt
      const stats = await CertificateRequest.aggregate([
        { $match: filter },
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 }
          }
        }
      ]);

      // Thống kê theo ngày hôm nay
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      const todayCount = await CertificateRequest.countDocuments({
        ...filter,
        submittedAt: {
          $gte: today,
          $lt: tomorrow
        }
      });

      // Tổng số yêu cầu
      const totalCount = await CertificateRequest.countDocuments(filter);

      return {
        totalRequests: totalCount,
        todayRequests: todayCount,
        statusBreakdown: stats,
        processingCount: stats.find(s => s._id === 'ĐANG XỬ LÝ')?.count || 0,
        approvedCount: stats.find(s => s._id === 'HỢP LỆ')?.count || 0,
        rejectedCount: stats.find(s => s._id === 'KHÔNG HỢP LỆ')?.count || 0,
        pendingCount: stats.find(s => s._id === 'ĐANG XỬ LÝ')?.count || 0
      };
    } catch (error) {
      throw new Error(`Database error: Unable to fetch request statistics - ${error.message}`);
    }
  }

  /**
   * Cập nhật status của certificate request
   * @param {String} requestId 
   * @param {String} newStatus 
   * @param {String} staffId 
   * @param {String} note 
   * @returns {Object} Updated request
   */
  async updateRequestStatus(requestId, newStatus, staffId, note = '') {
    try {
      // Map English status to Vietnamese status
      const statusMapping = {
        'processing': 'ĐANG XỬ LÝ',
        'approved': 'HỢP LỆ', 
        'rejected': 'KHÔNG HỢP LỆ',
        'valid': 'HỢP LỆ',
        'invalid': 'KHÔNG HỢP LỆ'
      };

      const vietnameseStatus = statusMapping[newStatus] || newStatus;

      const updatedRequest = await CertificateRequest.findByIdAndUpdate(
        requestId,
        {
          status: vietnameseStatus,
          staffAssigned: staffId,
          responseTime: new Date(),
          notes: note,
          'processingInfo.processedBy': staffId,
          'processingInfo.processedAt': new Date()
        },
        { new: true }
      ).populate('student', 'studentId fullName email')
       .populate('certificateName', 'name description')
       .populate('certificateType', 'name description')
       .populate('staffAssigned', 'staffId fullName department');

      return updatedRequest;
    } catch (error) {
      throw new Error(`Database error: Unable to update request status - ${error.message}`);
    }
  }

  /**
   * Tìm certificate request theo ID
   * @param {String} requestId 
   * @returns {Object} Certificate request
   */
  async findRequestById(requestId) {
    try {
      return await CertificateRequest.findById(requestId)
        .populate('student', 'studentId fullName email phone')
        .populate('certificateName', 'name description')
        .populate('certificateType', 'name description')
        .populate('staffAssigned', 'staffId fullName department')
        .exec();
    } catch (error) {
      throw new Error(`Database error: Unable to find request - ${error.message}`);
    }
  }

  /**
   * Lấy danh sách nhân viên theo staffType
   * @param {String} staffType - 'CTSV' hoặc 'KTX'
   * @param {Object} options - Pagination và filter options
   * @returns {Object} Danh sách staff và pagination info
   */
  async getStaffByType(staffType, options = {}) {
    try {
      const {
        page = 1,
        limit = 10,
        status = 'ACTIVE',
        sortBy = 'dateOfJoining',
        sortOrder = 'desc'
      } = options;

      // Build query filter
      const filter = { staffType };
      
      // Filter by status if provided
      if (status && status !== 'all') {
        filter.status = status;
      }

      // Validate sort parameters
      const allowedSortFields = ['dateOfJoining', 'staffId', 'department'];
      const validSortBy = allowedSortFields.includes(sortBy) ? sortBy : 'dateOfJoining';

      // Calculate pagination
      const skip = (page - 1) * limit;
      const sortOptions = {};
      sortOptions[validSortBy] = sortOrder === 'desc' ? -1 : 1;

      // Execute query with population
      // staffRole đã được xóa - không cần populate
      const staffList = await Staff.find(filter)
        .populate('user', 'username email fullName')
        .sort(sortOptions)
        .skip(skip)
        .limit(parseInt(limit))
        .exec();

      // Get total count for pagination
      const totalCount = await Staff.countDocuments(filter);
      const totalPages = Math.ceil(totalCount / limit);

      return {
        staff: staffList,
        pagination: {
          currentPage: parseInt(page),
          totalPages,
          totalCount,
          hasNext: page < totalPages,
          hasPrev: page > 1
        }
      };
    } catch (error) {
      throw new Error(`Database error: Unable to get staff by type - ${error.message}`);
    }
  }
}

module.exports = new StaffRepository();