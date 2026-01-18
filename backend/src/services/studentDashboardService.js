/**
 * Student Dashboard Service
 * Business logic cho dashboard sinh viên
 */
const studentDashboardRepository = require('../repositories/studentDashboardRepository');

class StudentDashboardService {
  /**
   * Lấy dữ liệu dashboard đầy đủ cho sinh viên
   * @param {string} userId - ID user đang đăng nhập
   * @returns {Object} - Dashboard data
   */
  async getDashboardData(userId) {
    // Lấy thông tin sinh viên từ userId
    const student = await studentDashboardRepository.getStudentByUserId(userId);
    
    if (!student) {
      throw new Error('Không tìm thấy thông tin sinh viên');
    }

    const studentId = student._id;

    // Kiểm tra sinh viên có ở KTX không
    const isDormResident = student.isDormResident === true && student.roomId !== null;

    // Lấy thống kê CTSV
    const ctsvStats = await studentDashboardRepository.getCTSVStats(studentId);
    
    // Lấy yêu cầu CTSV gần đây
    const recentCTSVRequests = await studentDashboardRepository.getRecentCTSVRequests(studentId, 3);
    
    // Format CTSV requests
    const formattedCTSVRequests = recentCTSVRequests.map(req => this._formatCTSVRequest(req));

    // Nếu sinh viên ở KTX, lấy thêm thống kê và yêu cầu KTX
    let ktxStats = null;
    let recentKTXRequests = [];
    let formattedKTXRequests = [];

    if (isDormResident) {
      ktxStats = await studentDashboardRepository.getKTXStats(studentId);
      recentKTXRequests = await studentDashboardRepository.getRecentKTXRequests(studentId, 3);
      formattedKTXRequests = recentKTXRequests.map(req => this._formatKTXRequest(req));
    }

    // Tính tổng thống kê (CTSV + KTX nếu có)
    const totalStats = {
      pending: ctsvStats.pending + (ktxStats?.pending || 0),
      completed: ctsvStats.completed + (ktxStats?.completed || 0),
      rejected: ctsvStats.rejected + (ktxStats?.rejected || 0)
    };

    return {
      success: true,
      data: {
        isDormResident,
        roomInfo: isDormResident ? {
          name: student.roomId?.name,
          building: student.roomId?.building
        } : null,
        stats: {
          total: totalStats,
          ctsv: ctsvStats,
          ktx: ktxStats
        },
        recentRequests: {
          ctsv: formattedCTSVRequests,
          ktx: formattedKTXRequests
        }
      }
    };
  }

  /**
   * Format yêu cầu CTSV cho frontend
   * @private
   */
  _formatCTSVRequest(request) {
    return {
      id: request.requestCode || request._id.toString(),
      _id: request._id,
      certificateType: request.certificateType?.name || 'N/A',
      certificateName: request.certificateName?.name || 'N/A',
      semester: request.semester || 'N/A',
      requestDate: this._formatDate(request.createdAt),
      status: this._mapCTSVStatus(request.status),
      rawStatus: request.status
    };
  }

  /**
   * Format yêu cầu KTX cho frontend
   * @private
   */
  _formatKTXRequest(request) {
    return {
      id: request.requestCode || request._id.toString(),
      _id: request._id,
      category: request.category?.name || 'N/A',
      item: request.item?.name || 'N/A',
      description: request.description || '',
      semester: request.semester || 'N/A',
      requestDate: this._formatDate(request.createdAt),
      status: this._mapKTXStatus(request.status),
      rawStatus: request.status
    };
  }

  /**
   * Format date to dd/mm/yyyy
   * @private
   */
  _formatDate(date) {
    if (!date) return 'N/A';
    const d = new Date(date);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  }

  /**
   * Map CTSV status to frontend format
   * @private
   */
  _mapCTSVStatus(status) {
    const statusMap = {
      'ĐANG XỬ LÝ': 'processing',
      'HỢP LỆ': 'valid',
      'KHÔNG HỢP LỆ': 'invalid'
    };
    return statusMap[status] || 'processing';
  }

  /**
   * Map KTX status to frontend format
   * @private
   */
  _mapKTXStatus(status) {
    const statusMap = {
      'Pending': 'pending',
      'Under Review': 'processing',
      'Approved': 'valid',
      'Rejected': 'invalid'
    };
    return statusMap[status] || 'pending';
  }
}

module.exports = new StudentDashboardService();
