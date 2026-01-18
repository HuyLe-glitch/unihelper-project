/**
 * Student Dashboard Repository
 * Truy vấn database cho dashboard sinh viên
 */
const CertificateRequest = require('../models/CertificateRequest');
const DormitoryRequest = require('../models/DormitoryRequest');
const Student = require('../models/Student');

class StudentDashboardRepository {
  /**
   * Lấy thống kê yêu cầu CTSV của sinh viên
   * @param {string} studentId - ID sinh viên
   * @returns {Object} - { pending, completed, rejected }
   */
  async getCTSVStats(studentId) {
    const [pending, completed, rejected] = await Promise.all([
      CertificateRequest.countDocuments({ student: studentId, status: 'ĐANG XỬ LÝ' }),
      CertificateRequest.countDocuments({ student: studentId, status: 'HỢP LỆ' }),
      CertificateRequest.countDocuments({ student: studentId, status: 'KHÔNG HỢP LỆ' })
    ]);
    
    return { pending, completed, rejected };
  }

  /**
   * Lấy thống kê yêu cầu KTX của sinh viên
   * @param {string} studentId - ID sinh viên
   * @returns {Object} - { pending, completed, rejected }
   */
  async getKTXStats(studentId) {
    const [pending, completed, rejected] = await Promise.all([
      DormitoryRequest.countDocuments({ student: studentId, status: { $in: ['Pending', 'Under Review'] } }),
      DormitoryRequest.countDocuments({ student: studentId, status: 'Approved' }),
      DormitoryRequest.countDocuments({ student: studentId, status: 'Rejected' })
    ]);
    
    return { pending, completed, rejected };
  }

  /**
   * Lấy yêu cầu CTSV gần đây của sinh viên
   * @param {string} studentId - ID sinh viên
   * @param {number} limit - Số lượng yêu cầu tối đa
   * @returns {Array} - Danh sách yêu cầu
   */
  async getRecentCTSVRequests(studentId, limit = 3) {
    return await CertificateRequest.find({ student: studentId })
      .populate('certificateType', 'name')
      .populate('certificateName', 'name')
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();
  }

  /**
   * Lấy yêu cầu KTX gần đây của sinh viên
   * @param {string} studentId - ID sinh viên
   * @param {number} limit - Số lượng yêu cầu tối đa
   * @returns {Array} - Danh sách yêu cầu
   */
  async getRecentKTXRequests(studentId, limit = 3) {
    return await DormitoryRequest.find({ student: studentId })
      .populate('category', 'name')
      .populate('item', 'name')
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();
  }

  /**
   * Kiểm tra sinh viên có ở KTX không
   * @param {string} studentId - ID sinh viên
   * @returns {boolean}
   */
  async isStudentInDormitory(studentId) {
    const student = await Student.findById(studentId).select('isDormResident roomId').lean();
    return student ? (student.isDormResident === true && student.roomId !== null) : false;
  }

  /**
   * Lấy thông tin sinh viên từ userId
   * @param {string} userId - ID user
   * @returns {Object} - Student document
   */
  async getStudentByUserId(userId) {
    return await Student.findOne({ user: userId })
      .populate('roomId', 'name building')
      .lean();
  }
}

module.exports = new StudentDashboardRepository();
