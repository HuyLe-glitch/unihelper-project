const CertificateRequest = require('../models/CertificateRequest');
const CertificateType = require('../models/CertificateType');

/**
 * Certificate Request Repository - Data Access Layer
 */
class CertificateRequestRepository {

  /**
   * Lấy mã yêu cầu tiếp theo (CTSV1, CTSV2, ..., CTSV999, CTSV1000, ...)
   * @returns {Promise<string>} Mã yêu cầu mới
   */
  async getNextRequestCode() {
    // Lấy tất cả requestCode hiện có và tìm số lớn nhất
    const requests = await CertificateRequest.find({
      requestCode: { $exists: true, $ne: null, $regex: /^CTSV\d+$/ }
    }).select('requestCode').lean();

    let maxNumber = 0;
    for (const req of requests) {
      const match = req.requestCode.match(/^CTSV(\d+)$/);
      if (match) {
        const num = parseInt(match[1], 10);
        if (num > maxNumber) maxNumber = num;
      }
    }

    return `CTSV${maxNumber + 1}`;
  }

  // Tạo yêu cầu chứng nhận mới
  async createRequest(requestData) {
    const request = new CertificateRequest(requestData);
    const savedRequest = await request.save();
    
    // Populate đầy đủ thông tin để trả về (bao gồm student với user, major, faculty)
    await savedRequest.populate([
      { path: 'certificateType', select: 'name description' },
      { path: 'certificateName', select: 'name' },
      {
        path: 'student',
        select: 'fullName phone user major',
        populate: [
          { path: 'user', select: 'email' },
          { 
            path: 'major', 
            select: 'name faculty',
            populate: { path: 'faculty', select: 'name' }
          }
        ]
      }
    ]);
    
    return savedRequest;
  }

  // Lấy danh sách yêu cầu theo student
  async getRequestsByStudent(studentId, page = 1, limit = 10) {
    const skip = (page - 1) * limit;

    const requests = await CertificateRequest.find({ student: studentId })
      .populate('certificateType', 'name description')
      .populate('certificateName', 'name')
      .populate('student', 'fullName user')
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
      .populate('student', 'fullName user')
      .populate('staffAssigned', 'staffId name department')
      .populate('processingHistory.staffId', 'name');
  }

  // Lấy yêu cầu theo request code
  async getRequestByCode(requestCode) {
    return await CertificateRequest.findOne({ requestCode })
      .populate('certificateType', 'name description')
      .populate('student', 'fullName user')
      .populate('staffAssigned', 'staffId name');
  }

  // Cập nhật trạng thái yêu cầu
  async updateRequestStatus(requestId, status, staffId, notes = '', staffFile = null) {
    const request = await CertificateRequest.findById(requestId);
    if (!request) return null;

    // Track activity log
    const activities = [];
    const hadFile = request.staffFile && request.staffFile.fileName;
    const hadNote = request.notes && request.notes.trim();

    // Chỉ thêm vào processing history khi status thay đổi thành HỢP LỆ hoặc KHÔNG HỢP LỆ
    // (không thêm khi chỉ cập nhật file/note mà giữ nguyên status ĐANG XỬ LÝ)
    if (status !== 'ĐANG XỬ LÝ' && status !== request.status) {
      request.processingHistory.push({
        status,
        staffId,
        notes,
        timestamp: new Date()
      });
      request.responseTime = new Date();
      request.staffAssigned = staffId;
      
      // Log activity: APPROVE hoặc REJECT
      activities.push({
        action: status === 'HỢP LỆ' ? 'APPROVE' : 'REJECT',
        staffId,
        details: notes || (status === 'HỢP LỆ' ? 'Duyệt yêu cầu' : 'Từ chối yêu cầu'),
        timestamp: new Date()
      });
    }

    request.status = status;
    
    // Cập nhật ghi chú và log activity
    if (notes !== undefined && notes !== null) {
      if (!hadNote && notes.trim()) {
        // Thêm ghi chú mới
        activities.push({
          action: 'ADD_NOTE',
          staffId,
          details: notes,
          timestamp: new Date()
        });
      } else if (hadNote && notes.trim() && notes !== request.notes) {
        // Cập nhật ghi chú
        activities.push({
          action: 'UPDATE_NOTE',
          staffId,
          details: notes,
          timestamp: new Date()
        });
      }
      request.notes = notes;
    }
    
    // Cập nhật file từ staff nếu có (Firebase Storage)
    if (staffFile) {
      if (!hadFile) {
        // Thêm file mới
        activities.push({
          action: 'ADD_FILE',
          staffId,
          details: staffFile.fileName,
          timestamp: new Date()
        });
      } else {
        // Cập nhật file
        activities.push({
          action: 'UPDATE_FILE',
          staffId,
          details: staffFile.fileName,
          timestamp: new Date()
        });
      }
      request.staffFile = {
        fileName: staffFile.fileName,
        storedName: staffFile.storedName,
        fileUrl: staffFile.fileUrl,
        fileType: staffFile.fileType,
        fileSize: staffFile.fileSize,
        uploadDate: new Date()
      };
    }
    
    // Xóa file nếu staffFile = null và đã có file trước đó
    if (staffFile === null && hadFile) {
      activities.push({
        action: 'DELETE_FILE',
        staffId,
        details: request.staffFile.fileName,
        timestamp: new Date()
      });
      request.staffFile = null;
    }

    // Thêm activities vào log (chỉ khi có thay đổi thực sự)
    if (activities.length > 0) {
      request.activityLog = request.activityLog || [];
      request.activityLog.push(...activities);
    }

    const savedRequest = await request.save();
    
    // Populate staffId trong activityLog và processingHistory
    // Và student với user để lấy email gửi thông báo
    await savedRequest.populate([
      {
        path: 'student',
        select: 'studentId user',
        populate: { path: 'user', select: 'name email' }
      },
      {
        path: 'certificateType',
        select: 'name description'
      },
      {
        path: 'certificateName',
        select: 'name'
      },
      {
        path: 'processingHistory.staffId',
        select: 'staffId staffType user',
        populate: { path: 'user', select: 'name email' }
      },
      {
        path: 'activityLog.staffId',
        select: 'staffId staffType user',
        populate: { path: 'user', select: 'name email' }
      }
    ]);

    return savedRequest;
  }

  // Lấy danh sách tất cả yêu cầu (cho staff/admin)
  async getAllRequests(filters = {}, page = 1, limit = 10) {
    const skip = (page - 1) * limit;

    const requests = await CertificateRequest.find(filters)
      .populate('certificateType', 'name description')
      .populate('certificateName', 'name')
      .populate({
        path: 'student',
        select: 'fullName phone user major',
        populate: [
          { path: 'user', select: 'email' },
          { 
            path: 'major', 
            select: 'name faculty',
            populate: { path: 'faculty', select: 'name' }
          }
        ]
      })
      .populate('staffAssigned', 'staffId staffType user')
      .populate({
        path: 'processingHistory.staffId',
        select: 'staffId staffType user',
        populate: { path: 'user', select: 'name email' }
      })
      .populate({
        path: 'activityLog.staffId',
        select: 'staffId staffType user',
        populate: { path: 'user', select: 'name email' }
      })
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
