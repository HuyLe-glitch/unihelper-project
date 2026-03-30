const certificateRequestService = require('../services/certificateRequestService');
const studentNotificationService = require('../services/studentNotificationService');
const userRepository = require('../repositories/userRepository');
const { catchAsync } = require('../utils/appError');
const { 
  jsonToCSV, 
  certificateRequestCSVFields, 
  mapCertificateStatus, 
  formatDateVN, 
  generateCSVFilename 
} = require('../utils/csvExporter');

/**
 * Certificate Request Controller - Presentation Layer
 */
class CertificateRequestController {

  // POST /api/certificate-requests - Tạo yêu cầu chứng nhận mới
  createRequest = catchAsync(async (req, res) => {
    const userId = req.userData.id;
    const requestData = req.body;

    const result = await certificateRequestService.createCertificateRequest(userId, requestData);

    // Emit socket event để thông báo cho Staff CTSV
    if (req.io && result.success) {
      req.io.emit('CERTIFICATE_REQUEST_CREATED', {
        request: result.data,
        message: 'Có yêu cầu CTSV mới'
      });
    }

    // Tạo thông báo cho sinh viên (In-app + Email)
    if (result.success) {
      try {
        // Lấy email của sinh viên
        const user = await userRepository.findById(userId);
        const studentEmail = user?.email || null;

        const requestCode = result.data.requestCode;
        const certificateTypeName = result.data.certificateType?.name || 'Giấy tờ CTSV';
        const certificateName = result.data.certificateName?.name || certificateTypeName;
        const semester = requestData.semester || '';
        
        // Gọi service - sẽ tạo In-app notification + gửi Email song song
        await studentNotificationService.createCtsvRequestCreated(userId, {
          requestCode,
          requestId: result.data._id,
          certificateType: certificateTypeName,
          certificateName: certificateName,
          semester: semester
        }, studentEmail);
        
        console.log('📬 Created notification for CTSV request:', requestCode);
        
        // Emit socket event để cập nhật realtime thông báo ở frontend
        if (req.io) {
          req.io.emit('STUDENT_NOTIFICATION_CREATED', {
            userId: userId,
            message: 'Có thông báo mới'
          });
        }
      } catch (notifyError) {
        console.error('Error creating notification:', notifyError);
      }
    }

    res.status(201).json(result);
  });

  // GET /api/certificate-requests/my - Lấy lịch sử yêu cầu của sinh viên hiện tại
  getMyRequests = catchAsync(async (req, res) => {
    const userId = req.userData.id;
    const { page = 1, limit = 10 } = req.query;

    const result = await certificateRequestService.getStudentRequests(
      userId,
      parseInt(page),
      parseInt(limit)
    );

    res.status(200).json(result);
  });

  // GET /api/certificate-requests/:id - Lấy chi tiết yêu cầu
  getRequestDetails = catchAsync(async (req, res) => {
    const { id } = req.params;
    const userId = req.userData.id;

    const result = await certificateRequestService.getRequestDetails(id, userId);

    res.status(200).json(result);
  });

  // GET /api/certificate-requests - Lấy tất cả yêu cầu (Staff/Admin only)
  // Hỗ trợ infinite scroll với pagination
  getAllRequests = catchAsync(async (req, res) => {
    // Default limit = 50 cho infinite scroll, tối đa 200
    const { page = 1, limit = 50, status, certificateType } = req.query;
    const safeLimit = Math.min(parseInt(limit), 200);

    const filters = {};
    if (status) filters.status = status;
    if (certificateType) filters.certificateType = certificateType;

    const result = await certificateRequestService.getAllRequests(
      filters,
      parseInt(page),
      safeLimit
    );

    res.status(200).json(result);
  });

  // PUT /api/certificate-requests/:id/status - Cập nhật trạng thái yêu cầu (Staff/Admin only)
  updateRequestStatus = catchAsync(async (req, res) => {
    const { id } = req.params;
    const { status, notes, staffFile } = req.body;
    const staffUserId = req.userData.id;

    const result = await certificateRequestService.updateRequestStatus(
      id,
      status,
      staffUserId,
      notes,
      staffFile
    );

    // Chỉ emit socket event khi DUYỆT hoặc TỪ CHỐI (không emit khi chỉ cập nhật file/note)
    if (req.io && result.success && (status === 'HỢP LỆ' || status === 'KHÔNG HỢP LỆ')) {
      req.io.emit('CERTIFICATE_REQUEST_UPDATED', {
        requestId: id,
        requestCode: result.data.requestCode, // Thêm requestCode để frontend match được
        request: result.data,
        status: status,
        message: status === 'HỢP LỆ' ? 'Yêu cầu đã được duyệt' : 'Yêu cầu đã bị từ chối'
      });

      // Tạo thông báo cho sinh viên (In-app + Email)
      try {
        // Get User ID and Email from populated student
        const student = result.data.student;
        const userId = student?.user?._id || student?.user;
        const studentEmail = student?.user?.email || null;
        const requestCode = result.data.requestCode;
        const certificateTypeName = result.data.certificateType?.name || 'Giấy tờ CTSV';
        const certificateName = result.data.certificateName?.name || certificateTypeName;

        if (userId) {
          if (status === 'HỢP LỆ') {
            // Gọi service - sẽ tạo In-app notification + gửi Email song song
            await studentNotificationService.createCtsvRequestApproved(userId, {
              requestCode,
              requestId: id,
              certificateType: certificateTypeName,
              certificateName: certificateName
            }, studentEmail);
          } else if (status === 'KHÔNG HỢP LỆ') {
            // Gọi service - sẽ tạo In-app notification + gửi Email song song
            await studentNotificationService.createCtsvRequestRejected(userId, {
              requestCode,
              requestId: id,
              certificateType: certificateTypeName,
              certificateName: certificateName,
              reason: notes || 'Không hợp lệ'
            }, studentEmail);
          }
          console.log('📬 Created notification for CTSV status update:', requestCode, status);
          
          // Emit socket event để cập nhật realtime thông báo ở frontend
          if (req.io) {
            req.io.emit('STUDENT_NOTIFICATION_CREATED', {
              userId: userId,
              message: 'Có thông báo mới'
            });
          }
        }
      } catch (notifyError) {
        console.error('Error creating notification:', notifyError);
      }
    }

    res.status(200).json(result);
  });

  // GET /api/certificate-requests/stats - Lấy thống kê yêu cầu (Admin only)
  getRequestStats = catchAsync(async (req, res) => {
    const result = await certificateRequestService.getRequestStats();

    res.status(200).json(result);
  });

  // GET /api/certificate-requests/dashboard/processing - Lấy yêu cầu đang xử lý cho dashboard
  getDashboardProcessingRequests = catchAsync(async (req, res) => {
    const userId = req.userData.id;

    const result = await certificateRequestService.getDashboardRequestsByStatus(userId, 'ĐANG XỬ LÝ');

    res.status(200).json(result);
  });

  // GET /api/certificate-requests/dashboard/valid - Lấy yêu cầu hợp lệ cho dashboard
  getDashboardValidRequests = catchAsync(async (req, res) => {
    const userId = req.userData.id;

    const result = await certificateRequestService.getDashboardRequestsByStatus(userId, 'HỢP LỆ');

    res.status(200).json(result);
  });

  // GET /api/certificate-requests/dashboard/invalid - Lấy yêu cầu không hợp lệ cho dashboard
  getDashboardInvalidRequests = catchAsync(async (req, res) => {
    const userId = req.userData.id;

    const result = await certificateRequestService.getDashboardRequestsByStatus(userId, 'KHÔNG HỢP LỆ');

    res.status(200).json(result);
  });

  /**
   * GET /api/certificate-requests/export-csv - Xuất dữ liệu ra file CSV
   * Staff/Admin only
   */
  exportRequestsCSV = catchAsync(async (req, res) => {
    const { status, semester, startDate, endDate } = req.query;

    // Lấy dữ liệu từ service
    const result = await certificateRequestService.getDataForCSVExport({
      status,
      semester,
      startDate,
      endDate
    });

    // Transform dữ liệu cho CSV
    const csvData = result.data.map(request => ({
      requestCode: request.requestCode || '',
      studentId: request.student?.studentId || '',
      studentName: request.student?.fullName || '',
      studentEmail: request.student?.user?.email || '',
      studentPhone: request.student?.phone || '',
      facultyName: request.student?.major?.faculty?.name || '',
      majorName: request.student?.major?.name || '',
      certificateType: request.certificateType?.name || '',
      certificateName: request.certificateName?.name || '',
      note: request.notes || '',
      status: mapCertificateStatus(request.status),
      requestDate: formatDateVN(request.createdAt),
      processedDate: formatDateVN(request.responseTime),
      createdAt: formatDateVN(request.createdAt),
      updatedAt: formatDateVN(request.updatedAt)
    }));

    // Tạo CSV string
    const csvString = jsonToCSV(csvData, certificateRequestCSVFields);
    const filename = generateCSVFilename('DS_YeuCau_CTSV');

    // Set headers và trả về file
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.status(200).send(csvString);
  });
}

module.exports = new CertificateRequestController();
