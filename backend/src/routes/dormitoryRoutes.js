const express = require('express');
const router = express.Router();
const dormitoryController = require('../controllers/dormitoryController');
const { protect, restrictTo } = require('../middleware/authMiddleware');

// Protect all dormitory routes
router.use(protect);

// ==================== CATEGORY ROUTES ====================
// GET /api/auth/dormitory/categories - Lấy tất cả categories
router.get('/categories', dormitoryController.getCategories);

// GET /api/auth/dormitory/categories/:id - Lấy category theo ID
router.get('/categories/:id', dormitoryController.getCategoryById);

// POST /api/auth/dormitory/categories - Tạo category mới (STAFF/ADMIN)
router.post('/categories', restrictTo('STAFF', 'ADMIN'), dormitoryController.createCategory);

// PATCH /api/auth/dormitory/categories/:id - Cập nhật category (STAFF/ADMIN)
router.patch('/categories/:id', restrictTo('STAFF', 'ADMIN'), dormitoryController.updateCategory);

// DELETE /api/auth/dormitory/categories/:id - Xóa category (ADMIN)
router.delete('/categories/:id', restrictTo('ADMIN'), dormitoryController.deleteCategory);

// ==================== REQUEST ROUTES ====================
// GET /api/auth/dormitory/requests - Lấy tất cả requests (STAFF/ADMIN)
router.get('/requests', restrictTo('STAFF', 'ADMIN'), dormitoryController.getAllDormitoryRequests);

// POST /api/auth/dormitory/requests - Tạo request mới (STUDENT)
router.post('/requests', restrictTo('STUDENT'), dormitoryController.createDormitoryRequest);

// GET /api/auth/dormitory/requests/:id - Lấy request theo ID
router.get('/requests/:id', restrictTo('STUDENT', 'STAFF', 'ADMIN'), dormitoryController.getRequestById);

// PATCH /api/auth/dormitory/requests/:id - Cập nhật request (STUDENT/STAFF/ADMIN)
// Xem lại logic phương thức này
router.patch('/requests/:id', restrictTo('STUDENT'), dormitoryController.updateDormitoryRequest);

// PATCH /api/auth/dormitory/requests/:id/status - Cập nhật status (STAFF/ADMIN)
router.patch('/requests/:id/status', restrictTo('STAFF', 'ADMIN'), dormitoryController.updateRequestStatus);

// DELETE /api/auth/dormitory/requests/:id - Xóa request
router.delete('/requests/:id', restrictTo('STUDENT', 'STAFF', 'ADMIN'), dormitoryController.deleteDormitoryRequest);

// ==================== STATISTICS ROUTES ====================
// GET /api/auth/dormitory/statistics/by-month - Thống kê requests theo tháng
router.get('/statistics/by-month', restrictTo('STAFF', 'ADMIN'), dormitoryController.getDormitoryRequestsByMonth);

module.exports = router;
