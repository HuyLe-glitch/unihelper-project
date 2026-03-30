const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');
const { protect, restrictTo } = require('../middleware/authMiddleware');

// Tất cả routes cần đăng nhập
router.use(protect);

// ==================== SEMESTER ROUTES ====================

// Lấy danh sách học kỳ cho filter
router.get('/semesters', restrictTo('ADMIN', 'STAFF'), reportController.getAllSemesters);

// Lấy học kỳ hiện tại
router.get('/semesters/current', restrictTo('ADMIN', 'STAFF'), reportController.getCurrentSemester);

// ==================== CTSV REPORT ROUTES ====================

// Lấy báo cáo tổng hợp CTSV
// Query: startDate, endDate, granularity (day|week|month)
router.get('/ctsv', restrictTo('ADMIN', 'STAFF'), reportController.getCTSVReport);

// ==================== KTX REPORT ROUTES ====================

// Lấy báo cáo tổng hợp KTX
// Query: startDate, endDate, granularity (day|week|month)
router.get('/ktx', restrictTo('ADMIN', 'STAFF'), reportController.getKTXReport);

module.exports = router;

