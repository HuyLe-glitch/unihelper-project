const express = require('express');
const certificateController = require('../controllers/certificateController');
const { 
  typeValidation, 
  certificateValidation, 
  idValidation, 
  typeIdValidation,
  queryValidation 
} = require('../validators/certificateValidation');
const { protect, restrictTo } = require('../middleware/authMiddleware');

const router = express.Router();

/**
 * Certificate Routes
 * Quản lý loại chứng nhận và chứng nhận
 */

// Protect all routes
router.use(protect);

// ==========================================
// CERTIFICATE TYPE ROUTES
// ==========================================

// GET /api/certificates/types - Lấy tất cả loại chứng nhận
router.get('/types', certificateController.getAllTypes);

// GET /api/certificates/types/:id - Lấy loại chứng nhận theo ID
router.get('/types/:id', idValidation, certificateController.getTypeById);

// POST /api/certificates/types - Tạo loại chứng nhận mới (Admin/Staff)
router.post(
  '/types', 
  restrictTo('ADMIN', 'STAFF'), 
  typeValidation.create, 
  certificateController.createType
);

// PATCH /api/certificates/types/:id - Cập nhật loại chứng nhận (Admin/Staff)
router.patch(
  '/types/:id', 
  restrictTo('ADMIN', 'STAFF'), 
  typeValidation.update, 
  certificateController.updateType
);

// GET /api/certificates/types/:id/check-delete - Kiểm tra có thể xóa loại chứng nhận (Admin only)
router.get(
  '/types/:id/check-delete',
  restrictTo('ADMIN'),
  idValidation,
  certificateController.checkCanDeleteType
);

// DELETE /api/certificates/types/:id - Xóa loại chứng nhận (Admin only)
router.delete(
  '/types/:id', 
  restrictTo('ADMIN'), 
  idValidation, 
  certificateController.deleteType
);

// ==========================================
// CERTIFICATE ROUTES
// ==========================================

// GET /api/certificates/stats - Lấy thống kê (đặt trước route có :id)
router.get('/stats', certificateController.getStats);

// GET /api/certificates - Lấy tất cả chứng nhận
router.get('/', queryValidation, certificateController.getAllCertificates);

// GET /api/certificates/by-type/:typeId - Lấy chứng nhận theo loại
router.get('/by-type/:typeId', typeIdValidation, certificateController.getCertificatesByType);

// GET /api/certificates/:id - Lấy chứng nhận theo ID
router.get('/:id', idValidation, certificateController.getCertificateById);

// POST /api/certificates - Tạo chứng nhận mới (Admin/Staff)
router.post(
  '/', 
  restrictTo('ADMIN', 'STAFF'), 
  certificateValidation.create, 
  certificateController.createCertificate
);

// POST /api/certificates/batch - Tạo nhiều chứng nhận (Admin/Staff)
router.post(
  '/batch', 
  restrictTo('ADMIN', 'STAFF'), 
  certificateValidation.createBatch, 
  certificateController.createCertificatesBatch
);

// PATCH /api/certificates/:id - Cập nhật chứng nhận (Admin/Staff)
router.patch(
  '/:id', 
  restrictTo('ADMIN', 'STAFF'), 
  certificateValidation.update, 
  certificateController.updateCertificate
);

// GET /api/certificates/:id/check-delete - Kiểm tra có thể xóa chứng nhận (Admin only)
router.get(
  '/:id/check-delete',
  restrictTo('ADMIN'),
  idValidation,
  certificateController.checkCanDeleteCertificate
);

// DELETE /api/certificates/:id - Xóa chứng nhận (Admin only)
router.delete(
  '/:id', 
  restrictTo('ADMIN'), 
  idValidation, 
  certificateController.deleteCertificate
);

module.exports = router;
