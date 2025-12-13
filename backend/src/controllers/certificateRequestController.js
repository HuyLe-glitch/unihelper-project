const certificateRequestService = require('../services/certificateRequestService');
const { catchAsync } = require('../utils/appError');

/**
 * Certificate Request Controller - Presentation Layer
 */
class CertificateRequestController {

  // POST /api/certificate-requests - Tạo yêu cầu chứng nhận mới
  createRequest = catchAsync(async (req, res) => {
    const userId = req.userData.id;
    const requestData = req.body;

    const result = await certificateRequestService.createCertificateRequest(userId, requestData);

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
  getAllRequests = catchAsync(async (req, res) => {
    const { page = 1, limit = 10, status, certificateType } = req.query;

    const filters = {};
    if (status) filters.status = status;
    if (certificateType) filters.certificateType = certificateType;

    const result = await certificateRequestService.getAllRequests(
      filters,
      parseInt(page),
      parseInt(limit)
    );

    res.status(200).json(result);
  });

  // PUT /api/certificate-requests/:id/status - Cập nhật trạng thái yêu cầu (Staff/Admin only)
  updateRequestStatus = catchAsync(async (req, res) => {
    const { id } = req.params;
    const { status, notes } = req.body;
    const staffUserId = req.userData.id;

    const result = await certificateRequestService.updateRequestStatus(
      id,
      status,
      staffUserId,
      notes
    );

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
}

module.exports = new CertificateRequestController();
