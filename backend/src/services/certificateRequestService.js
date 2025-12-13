const certificateRequestRepository = require('../repositories/certificateRequestRepository');
const userRepository = require('../repositories/userRepository');
const { AppError } = require('../utils/appError');

/**
 * Certificate Request Service - Business Logic Layer
 */
class CertificateRequestService {

  // Tạo yêu cầu chứng nhận mới
  async createCertificateRequest(userId, requestData) {
    const { certificateType, certificateName, semester, notes } = requestData;

    // Kiểm tra user và lấy student profile
    const user = await userRepository.findById(userId);
    if (!user || user.role !== 'STUDENT') {
      throw new AppError('Chỉ sinh viên mới có thể tạo yêu cầu chứng nhận', 403);
    }

    const studentProfile = await userRepository.getProfileByRole(userId, 'STUDENT');
    if (!studentProfile) {
      throw new AppError('Không tìm thấy thông tin sinh viên', 404);
    }

    // Validation dữ liệu đầu vào
    if (!certificateType || !certificateName || !semester) {
      throw new AppError('Thiếu thông tin bắt buộc: loại chứng nhận, tên chứng nhận, học kỳ', 400);
    }

    // Tạo yêu cầu mới với cấu trúc đúng
    const newRequest = await certificateRequestRepository.createRequest({
      student: studentProfile._id,
      certificateType: certificateType,
      certificateName: certificateName, // Đây là ObjectId của CertificateName
      semester,
      notes: notes || '',
      status: 'PENDING'
    });

    return {
      success: true,
      message: 'Tạo yêu cầu chứng nhận thành công',
      data: newRequest
    };
  }

  // Lấy lịch sử yêu cầu của sinh viên
  async getStudentRequests(userId, page = 1, limit = 10) {
    // Kiểm tra user và lấy student profile
    const user = await userRepository.findById(userId);
    if (!user || user.role !== 'STUDENT') {
      throw new AppError('Chỉ sinh viên mới có thể xem lịch sử yêu cầu', 403);
    }

    const studentProfile = await userRepository.getProfileByRole(userId, 'STUDENT');
    if (!studentProfile) {
      throw new AppError('Không tìm thấy thông tin sinh viên', 404);
    }

    const result = await certificateRequestRepository.getRequestsByStudent(
      studentProfile._id,
      page,
      limit
    );

    return {
      success: true,
      message: 'Lấy lịch sử yêu cầu thành công',
      data: result
    };
  }

  // Lấy chi tiết yêu cầu
  async getRequestDetails(requestId, userId) {
    const request = await certificateRequestRepository.getRequestById(requestId);
    if (!request) {
      throw new AppError('Không tìm thấy yêu cầu', 404);
    }

    // Kiểm tra quyền truy cập
    const user = await userRepository.findById(userId);
    if (user.role === 'STUDENT') {
      const studentProfile = await userRepository.getProfileByRole(userId, 'STUDENT');
      if (!studentProfile || request.student.toString() !== studentProfile._id.toString()) {
        throw new AppError('Bạn không có quyền xem yêu cầu này', 403);
      }
    }

    return {
      success: true,
      data: request
    };
  }

  // Lấy tất cả yêu cầu (cho staff/admin)
  async getAllRequests(filters = {}, page = 1, limit = 10) {
    const result = await certificateRequestRepository.getAllRequests(filters, page, limit);

    return {
      success: true,
      message: 'Lấy danh sách yêu cầu thành công',
      data: result
    };
  }

  // Cập nhật trạng thái yêu cầu (cho staff/admin)
  async updateRequestStatus(requestId, status, staffUserId, notes = '') {
    // Lấy staff profile
    const staffUser = await userRepository.findById(staffUserId);
    if (!staffUser || !['STAFF', 'ADMIN'].includes(staffUser.role)) {
      throw new AppError('Chỉ staff/admin mới có thể cập nhật trạng thái', 403);
    }

    const staffProfile = await userRepository.getProfileByRole(staffUserId, staffUser.role);
    if (!staffProfile) {
      throw new AppError('Không tìm thấy thông tin staff', 404);
    }

    // Validation trạng thái
    const validStatuses = ['PENDING', 'PROCESSING', 'APPROVED', 'REJECTED', 'COMPLETED'];
    if (!validStatuses.includes(status)) {
      throw new AppError('Trạng thái không hợp lệ', 400);
    }

    const updatedRequest = await certificateRequestRepository.updateRequestStatus(
      requestId,
      status,
      staffProfile._id,
      notes
    );

    if (!updatedRequest) {
      throw new AppError('Không tìm thấy yêu cầu', 404);
    }

    return {
      success: true,
      message: 'Cập nhật trạng thái thành công',
      data: updatedRequest
    };
  }

  // Lấy thống kê yêu cầu
  async getRequestStats() {
    const stats = await certificateRequestRepository.getRequestStats();

    return {
      success: true,
      data: stats
    };
  }

  // Lấy yêu cầu theo trạng thái cho dashboard (chỉ thông tin cơ bản)
  async getDashboardRequestsByStatus(userId, status) {
    // Kiểm tra user và lấy student profile
    const user = await userRepository.findById(userId);
    if (!user || user.role !== 'STUDENT') {
      throw new AppError('Chỉ sinh viên mới có thể xem dashboard', 403);
    }

    const studentProfile = await userRepository.getProfileByRole(userId, 'STUDENT');
    if (!studentProfile) {
      throw new AppError('Không tìm thấy thông tin sinh viên', 404);
    }

    // Lấy yêu cầu theo trạng thái với thông tin cơ bản
    const requests = await certificateRequestRepository.getDashboardRequestsByStatus(
      studentProfile._id,
      status
    );

    return {
      success: true,
      message: `Lấy danh sách yêu cầu ${status.toLowerCase()} thành công`,
      data: requests
    };
  }
}

module.exports = new CertificateRequestService();
