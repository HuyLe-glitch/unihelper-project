/**
 * Staff Dashboard Repository
 * Data Access Layer cho Staff Dashboard
 */
const CertificateRequest = require('../models/CertificateRequest');
const DormitoryRequest = require('../models/DormitoryRequest');

class StaffDashboardRepository {
  /**
   * Lấy thống kê yêu cầu CTSV
   */
  async getCtsvStats() {
    // Đếm theo từng trạng thái
    const [total, processing, approved, rejected] = await Promise.all([
      CertificateRequest.countDocuments(),
      CertificateRequest.countDocuments({ 
        status: { $in: ['ĐANG XỬ LÝ', 'CHỜ XỬ LÝ', 'Pending', 'Processing'] } 
      }),
      CertificateRequest.countDocuments({ 
        status: { $in: ['ĐÃ DUYỆT', 'HOÀN THÀNH', 'Approved', 'Completed', 'HỢP LỆ'] } 
      }),
      CertificateRequest.countDocuments({ 
        status: { $in: ['TỪ CHỐI', 'ĐÃ TỪ CHỐI', 'Rejected', 'KHÔNG HỢP LỆ'] } 
      })
    ]);

    return {
      total,
      processing,
      approved,
      rejected
    };
  }

  /**
   * Lấy yêu cầu CTSV gần đây
   */
  async getRecentCtsvRequests(limit = 10, status = null) {
    const query = {};
    
    if (status && status !== 'all') {
      switch (status) {
        case 'processing':
          query.status = { $in: ['ĐANG XỬ LÝ', 'CHỜ XỬ LÝ', 'Pending', 'Processing'] };
          break;
        case 'approved':
          query.status = { $in: ['ĐÃ DUYỆT', 'HOÀN THÀNH', 'Approved', 'Completed', 'HỢP LỆ'] };
          break;
        case 'rejected':
          query.status = { $in: ['TỪ CHỐI', 'ĐÃ TỪ CHỐI', 'Rejected', 'KHÔNG HỢP LỆ'] };
          break;
      }
    }

    const requests = await CertificateRequest.find(query)
      .populate({
        path: 'student',
        select: 'fullName user',
        populate: {
          path: 'user',
          select: 'email'
        }
      })
      .populate('certificateType', 'name')
      .populate('certificateName', 'name')
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();

    return requests.map(req => ({
      id: req.requestCode || `CTSV-${req._id.toString().slice(-6).toUpperCase()}`,
      _id: req._id,
      student: req.student?.fullName || 'N/A',
      studentEmail: req.student?.user?.email || 'N/A',
      certificateType: req.certificateType?.name || 'N/A',
      certificateName: req.certificateName?.name || 'N/A',
      status: this.normalizeCtsvStatus(req.status),
      statusOriginal: req.status,
      submittedAt: req.createdAt ? new Date(req.createdAt).toLocaleDateString('vi-VN') : 'N/A'
    }));
  }

  /**
   * Chuẩn hóa trạng thái CTSV
   */
  normalizeCtsvStatus(status) {
    const statusLower = (status || '').toLowerCase();
    
    if (['đang xử lý', 'chờ xử lý', 'pending', 'processing'].some(s => statusLower.includes(s.toLowerCase()))) {
      return 'processing';
    }
    if (['đã duyệt', 'hoàn thành', 'approved', 'completed', 'hợp lệ'].some(s => statusLower.includes(s.toLowerCase()))) {
      return 'approved';
    }
    if (['từ chối', 'rejected', 'không hợp lệ'].some(s => statusLower.includes(s.toLowerCase()))) {
      return 'rejected';
    }
    
    return 'processing';
  }

  /**
   * Lấy thống kê yêu cầu KTX
   */
  async getKtxStats() {
    const [total, processing, approved, rejected] = await Promise.all([
      DormitoryRequest.countDocuments(),
      DormitoryRequest.countDocuments({ 
        status: { $in: ['Pending', 'Under Review', 'ĐANG XỬ LÝ', 'CHỜ XỬ LÝ'] } 
      }),
      DormitoryRequest.countDocuments({ 
        status: { $in: ['Approved', 'Completed', 'ĐÃ DUYỆT', 'HOÀN THÀNH', 'Đã sửa'] } 
      }),
      DormitoryRequest.countDocuments({ 
        status: { $in: ['Rejected', 'TỪ CHỐI', 'ĐÃ TỪ CHỐI', 'Cancelled'] } 
      })
    ]);

    return {
      total,
      processing,
      approved,
      rejected
    };
  }

  /**
   * Lấy yêu cầu KTX gần đây
   */
  async getRecentKtxRequests(limit = 10, status = null) {
    const query = {};
    
    if (status && status !== 'all') {
      switch (status) {
        case 'processing':
          query.status = { $in: ['Pending', 'Under Review', 'ĐANG XỬ LÝ', 'CHỜ XỬ LÝ'] };
          break;
        case 'approved':
          query.status = { $in: ['Approved', 'Completed', 'ĐÃ DUYỆT', 'HOÀN THÀNH', 'Đã sửa'] };
          break;
        case 'rejected':
          query.status = { $in: ['Rejected', 'TỪ CHỐI', 'ĐÃ TỪ CHỐI', 'Cancelled'] };
          break;
      }
    }

    const requests = await DormitoryRequest.find(query)
      .populate({
        path: 'student',
        select: 'fullName user roomId',
        populate: [
          { path: 'user', select: 'email' },
          { path: 'roomId', select: 'name' }
        ]
      })
      .populate('roomId', 'name') // Populate roomId từ request (phòng lúc tạo yêu cầu)
      .populate('category', 'name')
      .populate('item', 'name')
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();

    return requests.map(req => ({
      id: req.requestCode || `KTX-${req._id.toString().slice(-6).toUpperCase()}`,
      _id: req._id,
      student: req.student?.fullName || 'N/A',
      studentEmail: req.student?.user?.email || 'N/A',
      category: req.category?.name || 'N/A',
      item: req.item?.name || 'N/A',
      // Ưu tiên roomId từ request, fallback về student.roomId
      room: req.roomId?.name || req.student?.roomId?.name || 'N/A',
      description: req.description || '',
      status: this.normalizeKtxStatus(req.status),
      statusOriginal: req.status,
      submittedAt: req.createdAt ? new Date(req.createdAt).toLocaleDateString('vi-VN') : 'N/A'
    }));
  }

  /**
   * Chuẩn hóa trạng thái KTX
   */
  normalizeKtxStatus(status) {
    const statusLower = (status || '').toLowerCase();
    
    if (['pending', 'under review', 'đang xử lý', 'chờ xử lý'].some(s => statusLower.includes(s.toLowerCase()))) {
      return 'processing';
    }
    if (['approved', 'completed', 'đã duyệt', 'hoàn thành', 'đã sửa'].some(s => statusLower.includes(s.toLowerCase()))) {
      return 'approved';
    }
    if (['rejected', 'từ chối', 'cancelled'].some(s => statusLower.includes(s.toLowerCase()))) {
      return 'rejected';
    }
    
    return 'processing';
  }
}

module.exports = new StaffDashboardRepository();
