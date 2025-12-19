const express = require('express');
const router = express.Router();
const semesterController = require('../controllers/semesterController');
const { templateValidation, idValidation } = require('../validators/semesterValidation');
const { protect, restrictTo } = require('../middleware/authMiddleware');

/**
 * Semester Template Routes
 * Quản lý cấu hình mẫu học kỳ (HK1, HK2, HK3...)
 */

// Tất cả routes yêu cầu đăng nhập
router.use(protect);

// GET /api/semester-templates - Lấy tất cả templates (ADMIN, STAFF)
router.get(
  '/',
  restrictTo('ADMIN', 'STAFF'),
  semesterController.getAllTemplates
);

// GET /api/semester-templates/:id - Lấy template theo ID
router.get(
  '/:id',
  restrictTo('ADMIN', 'STAFF'),
  idValidation,
  semesterController.getTemplateById
);

// POST /api/semester-templates - Tạo template mới (ADMIN only)
router.post(
  '/',
  restrictTo('ADMIN'),
  templateValidation.create,
  semesterController.createTemplate
);

// PATCH /api/semester-templates/:id - Cập nhật template (ADMIN only)
router.patch(
  '/:id',
  restrictTo('ADMIN'),
  templateValidation.update,
  semesterController.updateTemplate
);

// DELETE /api/semester-templates/:id - Xóa template (ADMIN only)
router.delete(
  '/:id',
  restrictTo('ADMIN'),
  idValidation,
  semesterController.deleteTemplate
);

module.exports = router;
