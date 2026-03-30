const express = require('express');
const facultyController = require('../controllers/facultyController');
const { protect, restrictTo } = require('../middleware/authMiddleware');
const { 
  facultyValidation, 
  idValidation, 
  queryValidation 
} = require('../validators/facultyMajorValidation');

const router = express.Router();

/**
 * Faculty Routes
 * Base path: /api/faculties
 */

// Tất cả routes đều yêu cầu đăng nhập
router.use(protect);

// =============== PUBLIC ROUTES (Authenticated) ===============

// GET /api/faculties - Lấy danh sách khoa
router.get('/', 
  queryValidation.getFaculties, 
  facultyController.getAllFaculties
);

// GET /api/faculties/:id - Lấy chi tiết khoa
router.get('/:id', 
  idValidation.validateObjectId, 
  facultyController.getFacultyById
);

// GET /api/faculties/:id/majors - Lấy chuyên ngành theo khoa
router.get('/:id/majors', 
  idValidation.validateObjectId, 
  facultyController.getMajorsByFaculty
);

// GET /api/faculties/:id/check-delete - Kiểm tra có thể xóa khoa không
router.get('/:id/check-delete', 
  restrictTo('ADMIN'),
  idValidation.validateObjectId, 
  facultyController.checkCanDeleteFaculty
);

// =============== ADMIN ROUTES ===============

// POST /api/faculties - Tạo khoa mới
router.post('/', 
  restrictTo('ADMIN'),
  facultyValidation.createFaculty, 
  facultyController.createFaculty
);

// PATCH /api/faculties/:id - Cập nhật khoa
router.patch('/:id', 
  restrictTo('ADMIN'),
  idValidation.validateObjectId,
  facultyValidation.updateFaculty, 
  facultyController.updateFaculty
);

// DELETE /api/faculties/:id - Xóa khoa
router.delete('/:id', 
  restrictTo('ADMIN'),
  idValidation.validateObjectId, 
  facultyController.deleteFaculty
);

module.exports = router;
