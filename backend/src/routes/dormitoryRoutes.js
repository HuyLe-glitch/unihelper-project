const express = require('express');
const router = express.Router();
const dormitoryController = require('../controllers/dormitoryController');
const { protect, restrictTo } = require('../middleware/authMiddleware');
const { dormitoryValidation } = require('../validators/dormitoryValidation');

// Protect all dormitory routes
router.use(protect);

// ==================== REQUEST ROUTES ====================
// Sinh viên gửi yêu cầu sự cố KTX, sử dụng EquipmentCategory từ /api/equipment

// GET /api/dormitory/requests/my - Lấy yêu cầu của sinh viên đang đăng nhập (STUDENT)
router.get('/requests/my', restrictTo('STUDENT'), dormitoryController.getMyDormitoryRequests);

// GET /api/dormitory/requests - Lấy tất cả requests (STAFF/ADMIN)
router.get('/requests', restrictTo('STAFF', 'ADMIN'), dormitoryController.getAllDormitoryRequests);

// POST /api/dormitory/requests - Tạo request mới (STUDENT)
router.post('/requests', restrictTo('STUDENT'), dormitoryValidation.createRequest, dormitoryController.createDormitoryRequest);

// GET /api/dormitory/requests/:id - Lấy request theo ID
router.get('/requests/:id', restrictTo('STUDENT', 'STAFF', 'ADMIN'), dormitoryValidation.validateId, dormitoryController.getRequestById);

// PATCH /api/dormitory/requests/:id - Cập nhật request (STUDENT - chỉ khi Pending)
router.patch('/requests/:id', restrictTo('STUDENT'), dormitoryValidation.updateRequest, dormitoryController.updateDormitoryRequest);

// PATCH /api/dormitory/requests/:id/accept - Staff tiếp nhận yêu cầu (Pending -> Under Review)
router.patch('/requests/:id/accept', restrictTo('STAFF', 'ADMIN'), dormitoryValidation.validateId, dormitoryController.acceptRequest);

// PATCH /api/dormitory/requests/:id/confirm-repair - Sinh viên xác nhận đã sửa chữa (STUDENT)
router.patch('/requests/:id/confirm-repair', restrictTo('STUDENT'), dormitoryValidation.validateId, dormitoryController.confirmRepair);

// PATCH /api/dormitory/requests/:id/status - Cập nhật status (STAFF/ADMIN) - Dùng cho các trường hợp khác
router.patch('/requests/:id/status', restrictTo('STAFF', 'ADMIN'), dormitoryValidation.updateStatus, dormitoryController.updateRequestStatus);

// DELETE /api/dormitory/requests/:id - Xóa request
router.delete('/requests/:id', restrictTo('STUDENT', 'STAFF', 'ADMIN'), dormitoryValidation.validateId, dormitoryController.deleteDormitoryRequest);

// ==================== STATISTICS ROUTES ====================
// GET /api/dormitory/statistics/by-month - Thống kê requests theo tháng
router.get('/statistics/by-month', restrictTo('STAFF', 'ADMIN'), dormitoryController.getDormitoryRequestsByMonth);

module.exports = router;
