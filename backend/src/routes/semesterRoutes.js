const express = require('express');
const router = express.Router();
const semesterController = require('../controllers/semesterController');
const { semesterValidation, idValidation, queryValidation } = require('../validators/semesterValidation');
const { protect, restrictTo } = require('../middleware/authMiddleware');

/**
 * Semester Routes
 * Quản lý học kỳ thực tế
 */

// Tất cả routes yêu cầu đăng nhập
router.use(protect);

// GET /api/semesters - Lấy tất cả semesters (ADMIN, STAFF)
router.get(
  '/',
  restrictTo('ADMIN', 'STAFF'),
  queryValidation,
  semesterController.getAllSemesters
);

// GET /api/semesters/active - Lấy semester đang active (Tất cả roles đều có thể truy cập)
router.get(
  '/active',
  semesterController.getActiveSemester
);

// GET /api/semesters/preview - Preview dates trước khi tạo
router.get(
  '/preview',
  restrictTo('ADMIN'),
  semesterController.previewDates
);

// GET /api/semesters/:id - Lấy semester theo ID
router.get(
  '/:id',
  restrictTo('ADMIN', 'STAFF'),
  idValidation,
  semesterController.getSemesterById
);

// POST /api/semesters - Tạo semester mới (ADMIN only)
router.post(
  '/',
  restrictTo('ADMIN'),
  semesterValidation.create,
  semesterController.createSemester
);

// PATCH /api/semesters/:id - Cập nhật semester (ADMIN only)
router.patch(
  '/:id',
  restrictTo('ADMIN'),
  semesterValidation.update,
  semesterController.updateSemester
);

// DELETE /api/semesters/:id - Xóa semester (ADMIN only)
router.delete(
  '/:id',
  restrictTo('ADMIN'),
  idValidation,
  semesterController.deleteSemester
);

module.exports = router;
