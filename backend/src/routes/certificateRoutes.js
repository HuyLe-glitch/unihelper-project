const express = require('express');
const certificateController = require('../controllers/certificateController');
const { certificateTypeValidation, certificateTemplateValidation, certificateQueryValidation, idValidation } = require('../validators/certificateValidation');
const { protect, restrictTo } = require('../middleware/authMiddleware');

const router = express.Router();

/**
 * Certificate Routes - Các endpoint cho Certificate Management
 */

// Middleware bảo vệ tất cả routes
router.use(protect);

// =============== CERTIFICATE TYPES ROUTES ===============

// GET /api/certificates/types - Lấy danh sách certificate types
router.get('/types', certificateQueryValidation.getTypesQuery, certificateController.getCertificateTypes);

// POST /api/certificates/types - Tạo certificate type mới (Admin/Staff only)
router.post('/types', restrictTo('ADMIN', 'STAFF'), certificateTypeValidation.createType, certificateController.createCertificateType);

// patch /api/certificates/types/:id - Cập nhật certificate type (Admin/Staff only)
router.patch('/types/:id', restrictTo('ADMIN', 'STAFF'), idValidation.validateObjectId, certificateTypeValidation.updateType, certificateController.updateCertificateType);

// DELETE /api/certificates/types/:id - Xóa certificate type (Admin only)
router.delete('/types/:id', restrictTo('ADMIN'), idValidation.validateObjectId, certificateController.deleteCertificateType);

// =============== CERTIFICATE TEMPLATES ROUTES ===============

// GET /api/certificates/templates - Lấy danh sách certificate templates
router.get('/templates', certificateQueryValidation.getTemplatesQuery, certificateController.getCertificateTemplates);

// GET /api/certificates/templates/:id - Lấy template theo ID
router.get('/templates/:id', idValidation.validateObjectId, certificateController.getCertificateTemplateById);

// POST /api/certificates/templates - Tạo certificate template mới (Admin/Staff only)
router.post('/templates', restrictTo('ADMIN', 'STAFF'), certificateTemplateValidation.createTemplate, certificateController.createCertificateTemplate);

// patch /api/certificates/templates/:id - Cập nhật certificate template (Admin/Staff only)
router.patch('/templates/:id', restrictTo('ADMIN', 'STAFF'), idValidation.validateObjectId, certificateTemplateValidation.updateTemplate, certificateController.updateCertificateTemplate);

// DELETE /api/certificates/templates/:id - Xóa certificate template (Admin only)
router.delete('/templates/:id', restrictTo('ADMIN'), idValidation.validateObjectId, certificateController.deleteCertificateTemplate);

// patch /api/certificates/templates/:id/toggle - Toggle trạng thái template (Admin/Staff only)
router.patch('/templates/:id/toggle', restrictTo('ADMIN', 'STAFF'), idValidation.validateObjectId, certificateController.toggleTemplateStatus);

// =============== NESTED ROUTES ===============

// GET /api/certificates/types/:typeId/templates - Lấy templates theo type
router.get('/types/:typeId/templates', idValidation.validateTypeId, certificateController.getTemplatesByType);

// GET /api/certificates/types/:typeId/templates/active - Lấy active templates theo type
router.get('/types/:typeId/templates/active', idValidation.validateTypeId, certificateController.getActiveTemplatesByType);

module.exports = router;
