/**
 * Dormitory Controller - Xử lý yêu cầu sự cố KTX
 * 
 * CHỈ chứa các endpoint liên quan đến DormitoryRequest
 * Danh mục và Thiết bị được quản lý qua equipmentController.js
 * 
 * Tuân thủ: Controller chỉ nhận request và trả response
 * Business logic nằm trong Service layer
 */

const { catchAsync } = require('../utils/appError');
const dormitoryRequestService = require('../services/dormitoryRequestService');

// ==================== DORMITORY REQUEST ENDPOINTS ====================

/**
 * POST /api/dormitory/requests
 * Sinh viên tạo yêu cầu sự cố KTX mới
 */
const createDormitoryRequest = catchAsync(async (req, res) => {
  const { category, item, description } = req.body;
  const userId = req.userData.id;

  const result = await dormitoryRequestService.createRequest(
    { category, item, description },
    userId
  );

  return res.status(201).json({
    success: true,
    data: result
  });
});

/**
 * GET /api/dormitory/requests/my
 * Sinh viên xem danh sách yêu cầu của mình
 */
const getMyDormitoryRequests = catchAsync(async (req, res) => {
  const { page = 1, limit = 50, status } = req.query;
  const userId = req.userData.id;

  const result = await dormitoryRequestService.getStudentRequests(userId, {
    page: parseInt(page),
    limit: parseInt(limit),
    status
  });

  return res.status(200).json({
    success: true,
    ...result
  });
});

/**
 * GET /api/dormitory/requests
 * Staff/Admin xem tất cả yêu cầu
 */
const getAllDormitoryRequests = catchAsync(async (req, res) => {
  const { page = 1, limit = 50, status, studentId } = req.query;

  const result = await dormitoryRequestService.getAllRequests({
    page: parseInt(page),
    limit: parseInt(limit),
    status,
    studentId
  });

  return res.status(200).json({
    success: true,
    ...result
  });
});

/**
 * GET /api/dormitory/requests/:id
 * Xem chi tiết yêu cầu theo ID
 */
const getRequestById = catchAsync(async (req, res) => {
  const { id } = req.params;
  const userId = req.userData.id;
  const userRole = req.userData.role;

  const result = await dormitoryRequestService.getRequestById(id, userId, userRole);

  return res.status(200).json({
    success: true,
    data: result
  });
});

/**
 * PATCH /api/dormitory/requests/:id
 * Sinh viên cập nhật yêu cầu (chỉ khi status = Pending)
 */
const updateDormitoryRequest = catchAsync(async (req, res) => {
  const { id } = req.params;
  const updateData = req.body;
  const userId = req.userData.id;

  const result = await dormitoryRequestService.updateRequest(id, updateData, userId);

  return res.status(200).json({
    success: true,
    data: result
  });
});

/**
 * PATCH /api/dormitory/requests/:id/status
 * Staff/Admin cập nhật status yêu cầu
 */
const updateRequestStatus = catchAsync(async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  const updaterId = req.userData.id;

  const result = await dormitoryRequestService.updateRequestStatus(id, status, updaterId);

  return res.status(200).json({
    success: true,
    data: result
  });
});

/**
 * DELETE /api/dormitory/requests/:id
 * Xóa yêu cầu
 */
const deleteDormitoryRequest = catchAsync(async (req, res) => {
  const { id } = req.params;
  const userId = req.userData.id;
  const userRole = req.userData.role;

  await dormitoryRequestService.deleteRequest(id, userId, userRole);

  return res.status(200).json({
    success: true,
    message: 'Đã xóa yêu cầu thành công'
  });
});

// ==================== STATISTICS ENDPOINTS ====================

/**
 * GET /api/dormitory/statistics/by-month
 * Thống kê yêu cầu theo tháng
 */
const getDormitoryRequestsByMonth = catchAsync(async (req, res) => {
  const result = await dormitoryRequestService.getRequestStatsByMonth();

  return res.status(200).json({
    success: true,
    data: result
  });
});

// ==================== EXPORTS ====================

module.exports = {
  // Request CRUD
  createDormitoryRequest,
  getMyDormitoryRequests,
  getAllDormitoryRequests,
  getRequestById,
  updateDormitoryRequest,
  updateRequestStatus,
  deleteDormitoryRequest,
  
  // Statistics
  getDormitoryRequestsByMonth
};
