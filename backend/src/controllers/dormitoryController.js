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
const studentNotificationService = require('../services/studentNotificationService');
const userRepository = require('../repositories/userRepository');

// ==================== DORMITORY REQUEST ENDPOINTS ====================

/**
 * POST /api/dormitory/requests
 * Sinh viên tạo yêu cầu sự cố KTX mới
 */
const createDormitoryRequest = catchAsync(async (req, res) => {
  const { category, item, description } = req.body;
  const userId = req.userData.id;

  const { request, roomId, realtimePayload } = await dormitoryRequestService.createRequest(
    { category, item, description },
    userId
  );

  // ==========================================
  // SOCKET.IO: Emit events sau khi tạo thành công
  // 1. Emit đến room cho các bạn cùng phòng
  // 2. Emit broadcast DORMITORY_REQUEST_CREATED để cập nhật trang lịch sử
  // ==========================================
  if (req.io) {
    // Emit vào room cho các bạn cùng phòng
    if (roomId) {
      req.io.to(roomId).emit('NEW_REQUEST_CREATED', realtimePayload);
      console.log(`📡 Emitted NEW_REQUEST_CREATED to room: ${roomId}`);
    }
    // Emit broadcast để student thấy yêu cầu vừa tạo trong lịch sử
    req.io.emit('DORMITORY_REQUEST_CREATED', {
      requestId: request._id,
      request: realtimePayload,
      studentId: userId,
      message: 'Yêu cầu KTX mới đã được tạo'
    });
    console.log(`📡 Emitted DORMITORY_REQUEST_CREATED broadcast`);
  }

  // Tạo thông báo cho sinh viên (In-app + Email)
  try {
    // Lấy email của sinh viên
    const user = await userRepository.findById(userId);
    const studentEmail = user?.email || null;

    const requestCode = request.requestCode;
    const equipmentName = realtimePayload?.item?.name || null;
    const categoryName = realtimePayload?.category?.name || 'Danh mục';
    const roomName = realtimePayload?.student?.roomId?.name || 'Phòng KTX';
    
    // Gọi service - sẽ tạo In-app notification + gửi Email song song
    await studentNotificationService.createKtxRequestCreated(userId, {
      requestCode,
      requestId: request._id,
      category: categoryName,
      item: equipmentName,
      description: request.description,
      roomName: roomName
    }, studentEmail);
    
    console.log('📬 Created notification for KTX request:', requestCode);
    
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

  return res.status(201).json({
    success: true,
    data: request
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
  const { page = 1, limit = 50, status, student } = req.query;

  const result = await dormitoryRequestService.getAllRequests({
    page: parseInt(page),
    limit: parseInt(limit),
    status,
    student
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

  // ==========================================
  // SOCKET.IO: Emit khi staff duyệt/từ chối yêu cầu
  // Chỉ emit khi status là Approved hoặc Rejected
  // ==========================================
  if (req.io && (status === 'Approved' || status === 'Rejected')) {
    req.io.emit('DORMITORY_REQUEST_UPDATED', {
      requestId: id,
      requestCode: result.requestCode, // Thêm requestCode để frontend match được
      request: result,
      status: status,
      message: status === 'Approved' ? 'Yêu cầu KTX đã được duyệt' : 'Yêu cầu KTX đã bị từ chối'
    });
    console.log(`📡 Emitted DORMITORY_REQUEST_UPDATED - status: ${status}`);

    // Tạo thông báo cho sinh viên (In-app + Email)
    try {
      // Get User ID and Email from populated student
      const student = result.student;
      const userId = student?.user?._id || student?.user;
      const studentEmail = student?.user?.email || null;
      const requestCode = result.requestCode;
      const categoryName = result.category?.name || 'Danh mục';
      const itemName = result.item?.name || null;

      if (userId) {
        if (status === 'Approved') {
          // Gọi service - sẽ tạo In-app notification + gửi Email song song
          await studentNotificationService.createKtxRequestApproved(userId, {
            requestCode,
            requestId: id,
            category: categoryName,
            item: itemName,
            staffNote: result.staffNote || ''
          }, studentEmail);
        } else if (status === 'Rejected') {
          // Gọi service - sẽ tạo In-app notification + gửi Email song song
          await studentNotificationService.createKtxRequestRejected(userId, {
            requestCode,
            requestId: id,
            category: categoryName,
            item: itemName,
            reason: result.rejectionReason || 'Yêu cầu bị từ chối'
          }, studentEmail);
        }
        console.log('📬 Created notification for KTX status update:', requestCode, status);
        
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

  return res.status(200).json({
    success: true,
    data: result
  });
});

/**
 * PATCH /api/dormitory/requests/:id/accept
 * Staff tiếp nhận yêu cầu (Pending -> Under Review)
 * Tuân thủ: Controller chỉ nhận request, gọi service, trả response
 * Business logic nằm trong Service layer
 */
const acceptRequest = catchAsync(async (req, res) => {
  const { id } = req.params;
  const staffId = req.userData.id;

  // Gọi Service xử lý business logic
  const result = await dormitoryRequestService.acceptRequest(id, staffId);

  // ==========================================
  // SOCKET.IO: Emit khi staff tiếp nhận yêu cầu
  // Broadcast để cập nhật realtime ở trang student và staff
  // ==========================================
  if (req.io) {
    req.io.emit('DORMITORY_REQUEST_UPDATED', {
      requestId: id,
      requestCode: result.requestCode,
      request: result,
      status: 'Under Review',
      message: 'Yêu cầu KTX đã được tiếp nhận'
    });
    console.log(`📡 Emitted DORMITORY_REQUEST_UPDATED (accept) - requestId: ${id}`);
  }

  return res.status(200).json({
    success: true,
    message: 'Đã tiếp nhận yêu cầu thành công',
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

/**
 * PATCH /api/dormitory/requests/:id/confirm-repair
 * Sinh viên xác nhận đã sửa chữa xong
 */
const confirmRepair = catchAsync(async (req, res) => {
  const { id } = req.params;
  const userId = req.userData.id;

  const result = await dormitoryRequestService.confirmRepair(id, userId);

  // ==========================================
  // SOCKET.IO: Emit khi sinh viên xác nhận sửa chữa
  // Broadcast để cập nhật realtime ở trang staff
  // ==========================================
  if (req.io) {
    req.io.emit('DORMITORY_REQUEST_UPDATED', {
      requestId: id,
      requestCode: result.requestCode,
      request: result,
      status: 'Approved',
      message: 'Sinh viên đã xác nhận sửa chữa hoàn tất'
    });
    console.log(`📡 Emitted DORMITORY_REQUEST_UPDATED (confirm repair) - requestId: ${id}`);
  }

  return res.status(200).json({
    success: true,
    message: 'Đã xác nhận sửa chữa thành công',
    data: result
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

// ==================== EXPORT CSV ====================

/**
 * GET /api/dormitory/requests/export-csv
 * Export danh sách yêu cầu ra file CSV
 * Chỉ Staff/Admin mới được phép export
 */
const exportRequestsCSV = catchAsync(async (req, res) => {
  const { 
    jsonToCSV, 
    dormitoryRequestCSVFields,
    generateCSVFilename 
  } = require('../utils/csvExporter');

  // Lấy filters từ query params
  const filters = {
    status: req.query.status,
    semester: req.query.semester,
    startDate: req.query.startDate,
    endDate: req.query.endDate,
    roomId: req.query.roomId
  };

  // Lấy dữ liệu từ Service (đã transform sẵn)
  const data = await dormitoryRequestService.getDataForCSVExport(filters);

  // Convert sang CSV
  const csv = jsonToCSV(data, dormitoryRequestCSVFields);

  // Tạo tên file
  const filename = generateCSVFilename('DS_SuCo_KTX');

  // Set headers để browser tải file
  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

  return res.status(200).send(csv);
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
  acceptRequest,
  deleteDormitoryRequest,
  confirmRepair,
  
  // Statistics
  getDormitoryRequestsByMonth,
  
  // Export
  exportRequestsCSV
};
