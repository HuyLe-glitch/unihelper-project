const express = require('express');
const studentController = require('../controllers/studentController');
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

// DELETE /api/students/bulk - Xóa nhiều sinh viên cùng lúc
router.delete(
  '/bulk',
  restrictTo('ADMIN'),
  bulkDeleteValidation,
  studentController.bulkDeleteStudents
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

// DELETE /api/students/:id - Xóa sinh viên
router.delete(
  '/:id',
  restrictTo('ADMIN'),
  idValidation,
  studentController.deleteStudent
);

module.exports = router;
