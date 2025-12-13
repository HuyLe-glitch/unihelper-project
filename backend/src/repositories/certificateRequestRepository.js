const CertificateRequest = require('../models/CertificateRequest');
const CertificateType = require('../models/CertificateType');

/**
 * Certificate Request Repository - Data Access Layer
 */
class CertificateRequestRepository {

  // Tạo yêu cầu chứng nhận mới
  async createRequest(requestData) {
    const request = new CertificateRequest(requestData);
    return await request.save();
  }

  // Lấy danh sách yêu cầu theo student
  async getRequestsByStudent(studentId, page = 1, limit = 10) {
    const skip = (page - 1) * limit;

    const requests = await CertificateRequest.find({ student: studentId })
      .populate('certificateType', 'name description')
      .populate('student', 'studentId')
      .populate('staffAssigned', 'staffId name')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await CertificateRequest.countDocuments({ student: studentId });

    return {
      requests,
      total,
      page,
      totalPages: Math.ceil(total / limit)
    };
  }

  // Lấy yêu cầu theo ID
  async getRequestById(requestId) {
    return await CertificateRequest.findById(requestId)
      .populate('certificateType', 'name description requirements')
      .populate('student', 'studentId user')
      .populate('staffAssigned', 'staffId name department')
      .populate('processingHistory.staffId', 'name');
  }

  // Lấy yêu cầu theo request code
  async getRequestByCode(requestCode) {
    return await CertificateRequest.findOne({ requestCode })
      .populate('certificateType', 'name description')
      .populate('student', 'studentId user')
      .populate('staffAssigned', 'staffId name');
  }

  // Cập nhật trạng thái yêu cầu
  async updateRequestStatus(requestId, status, staffId, notes = '') {
    const request = await CertificateRequest.findById(requestId);
    if (!request) return null;

    // Thêm vào processing history
    request.processingHistory.push({
      status,
      staffId,
      notes,
      timestamp: new Date()
    });

    request.status = status;
    if (status !== 'PENDING') {
      request.responseTime = new Date();
      request.staffAssigned = staffId;
    }
    if (notes) {
      request.notes = notes;
    }

    return await request.save();
  }

  // Lấy danh sách tất cả yêu cầu (cho staff/admin)
  async getAllRequests(filters = {}, page = 1, limit = 10) {
    const skip = (page - 1) * limit;

    const requests = await CertificateRequest.find(filters)
      .populate('certificateType', 'name description')
      .populate('student', 'studentId user')
      .populate('staffAssigned', 'staffId name')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await CertificateRequest.countDocuments(filters);

    return {
      requests,
      total,
      page,
      totalPages: Math.ceil(total / limit)
    };
  }

  // Lấy thống kê yêu cầu
  async getRequestStats() {
    const stats = await CertificateRequest.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    const total = await CertificateRequest.countDocuments();

    return {
      total,
      byStatus: stats.reduce((acc, item) => {
        acc[item._id] = item.count;
        return acc;
      }, {})
    };
  }

  // Lấy yêu cầu theo trạng thái cho dashboard (chỉ thông tin cơ bản)
  async getDashboardRequestsByStatus(studentId, status) {
    return await CertificateRequest.find({
      student: studentId,
      status: status
    })
      .populate('certificateType', 'name')
      .populate('certificateName', 'name')
      .select('requestCode certificateType certificateName requestDate status')
      .sort({ createdAt: -1 });
  }
}

module.exports = new CertificateRequestRepository();
