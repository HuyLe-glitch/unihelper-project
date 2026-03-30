const express = require('express');
const studentController = require('../controllers/studentController');
const studentDashboardController = require('../controllers/studentDashboardController');
const { 
  createStudent, 
  updateStudent, 
  idValidation,
  queryValidation,
  bulkDeleteValidation,
  roomTransferValidation 
} = require('../validators/studentValidation');
const { protect, restrictTo } = require('../middleware/authMiddleware');

const router = express.Router();

// Protect all routes
router.use(protect);

// ==========================================
// STUDENT DASHBOARD ROUTE (for STUDENT)
// ==========================================

// GET /api/students/dashboard - Lấy dữ liệu dashboard cho sinh viên
router.get(
  '/dashboard',
  restrictTo('STUDENT'),
  studentDashboardController.getDashboard
);

// ==========================================
// PUBLIC ROUTES (for ADMIN only)
// ==========================================

// GET /api/students/available-rooms - Lấy phòng còn chỗ trống
router.get(
  '/available-rooms',
  restrictTo('ADMIN'),
  studentController.getAvailableRooms
);

// GET /api/students/stats - Lấy thống kê
router.get(
  '/stats',
  restrictTo('ADMIN'),
  studentController.getStats
);

// GET /api/students/export-csv - Xuất danh sách sinh viên ra CSV
router.get(
  '/export-csv',
  restrictTo('ADMIN'),
  studentController.exportStudentsCSV
);

// GET /api/students/dormitory - Lấy sinh viên ở KTX
router.get(
  '/dormitory',
  restrictTo('ADMIN'),
  queryValidation,
  studentController.listDormStudents
);

// ==========================================
// CRUD ROUTES
// ==========================================

// GET /api/students - Lấy danh sách sinh viên
router.get(
  '/',
  restrictTo('ADMIN'),
  queryValidation,
  studentController.listStudents
);

// POST /api/students - Tạo sinh viên mới
router.post(
  '/',
  restrictTo('ADMIN'),
  createStudent,
  studentController.createStudent
);

// ==========================================
// IMPORT CSV ROUTES
// ==========================================

// POST /api/students/import/preview - Preview & Validate CSV data
router.post(
  '/import/preview',
  restrictTo('ADMIN'),
  studentController.previewImport
);

// POST /api/students/import/execute - Execute import (save to DB)
router.post(
  '/import/execute',
  restrictTo('ADMIN'),
  studentController.executeImport
);

// ==========================================
// BULK DELETE ROUTE
// ==========================================

// POST /api/students/bulk-delete-preview - Xem trước dữ liệu sẽ bị xóa hàng loạt
router.post(
  '/bulk-delete-preview',
  restrictTo('ADMIN'),
  bulkDeleteValidation,
  studentController.getBulkDeletePreview
);

// DELETE /api/students/bulk - Xóa nhiều sinh viên cùng lúc
router.delete(
  '/bulk',
  restrictTo('ADMIN'),
  bulkDeleteValidation,
  studentController.bulkDeleteStudents
);

// PATCH /api/students/bulk-remove-dormitory - Xóa nhiều sinh viên khỏi KTX (giữ lại sinh viên)
router.patch(
  '/bulk-remove-dormitory',
  restrictTo('ADMIN'),
  bulkDeleteValidation,
  studentController.bulkRemoveFromDormitory
);

// ==========================================
// ROOM TRANSFER ROUTE
// ==========================================

// POST /api/students/transfer - Chuyển phòng cho nhiều sinh viên
router.post(
  '/transfer',
  restrictTo('ADMIN'),
  roomTransferValidation,
  studentController.transferStudentsRoom
);

// ==========================================
// DELETE PREVIEW & REMOVE FROM DORMITORY
// ==========================================

// GET /api/students/:id/delete-preview - Xem trước dữ liệu sẽ bị xóa
router.get(
  '/:id/delete-preview',
  restrictTo('ADMIN'),
  idValidation,
  studentController.getDeletePreview
);

// PATCH /api/students/:id/remove-dormitory - Chỉ xóa khỏi KTX
router.patch(
  '/:id/remove-dormitory',
  restrictTo('ADMIN'),
  idValidation,
  studentController.removeFromDormitory
);

// ==========================================
// STUDENT BY ID ROUTES
// ==========================================

// GET /api/students/:id - Lấy sinh viên theo ID
router.get(
  '/:id',
  restrictTo('ADMIN'),
  idValidation,
  studentController.getStudentById
);

// PATCH /api/students/:id - Cập nhật sinh viên
router.patch(
  '/:id',
  restrictTo('ADMIN'),
  updateStudent,
  studentController.updateStudent
);

// DELETE /api/students/:id - Xóa sinh viên hoàn toàn
router.delete(
  '/:id',
  restrictTo('ADMIN'),
  idValidation,
  studentController.deleteStudent
);

module.exports = router;
