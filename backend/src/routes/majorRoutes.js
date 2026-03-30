const express = require('express');
const majorController = require('../controllers/majorController');
const { protect, restrictTo } = require('../middleware/authMiddleware');
const { 
  majorValidation, 
  idValidation, 
  queryValidation 
} = require('../validators/facultyMajorValidation');

const router = express.Router();

/**
 * Major Routes
 * Base path: /api/majors
 */

// Tất cả routes đều yêu cầu đăng nhập
router.use(protect);

// =============== PUBLIC ROUTES (Authenticated) ===============

// GET /api/majors - Lấy danh sách chuyên ngành
router.get('/', 
  queryValidation.getMajors, 
  majorController.getMajors
);

// GET /api/majors/:id - Lấy chi tiết chuyên ngành
router.get('/:id', 
  idValidation.validateObjectId, 
  majorController.getMajorById
);

// GET /api/majors/:id/check-delete - Kiểm tra có thể xóa chuyên ngành không
router.get('/:id/check-delete', 
  restrictTo('ADMIN'),
  idValidation.validateObjectId, 
  majorController.checkCanDeleteMajor
);

// =============== ADMIN ROUTES ===============

// POST /api/majors - Tạo chuyên ngành mới
router.post('/', 
  restrictTo('ADMIN'),
  majorValidation.createMajor, 
  majorController.createMajor
);

// POST /api/majors/batch - Tạo nhiều chuyên ngành cùng lúc
router.post('/batch', 
  restrictTo('ADMIN'),
  majorValidation.createBatchMajors, 
  majorController.createBatchMajors
);

// PATCH /api/majors/:id - Cập nhật chuyên ngành
router.patch('/:id', 
  restrictTo('ADMIN'),
  idValidation.validateObjectId,
  majorValidation.updateMajor, 
  majorController.updateMajor
);

// DELETE /api/majors/:id - Xóa chuyên ngành
router.delete('/:id', 
  restrictTo('ADMIN'),
  idValidation.validateObjectId, 
  majorController.deleteMajor
);

module.exports = router;
