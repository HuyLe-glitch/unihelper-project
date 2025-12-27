const { validationResult } = require('express-validator');
const semesterService = require('../services/semesterService');

/**
 * Semester Controller - Thin Controller
 * Chỉ làm nhiệm vụ: Hứng request -> Gọi service -> Trả response
 * Không chứa business logic
 */

// Helper function để xử lý validation errors
const handleValidationErrors = (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Dữ liệu không hợp lệ',
      errors: errors.array()
    });
  }
  return null;
};

// ==================== SEMESTER TEMPLATE CONTROLLERS ====================

/**
 * GET /api/semester-templates
 * Lấy tất cả templates
 */
exports.getAllTemplates = async (req, res, next) => {
  try {
    const result = await semesterService.getAllTemplates();
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/semester-templates/:id
 * Lấy template theo ID
 */
exports.getTemplateById = async (req, res, next) => {
  try {
    const validationError = handleValidationErrors(req, res);
    if (validationError) return;

    const result = await semesterService.getTemplateById(req.params.id);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/semester-templates
 * Tạo template mới
 */
exports.createTemplate = async (req, res, next) => {
  try {
    const validationError = handleValidationErrors(req, res);
    if (validationError) return;

    const result = await semesterService.createTemplate(req.body);
    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
};

/**
 * PATCH /api/semester-templates/:id
 * Cập nhật template
 */
exports.updateTemplate = async (req, res, next) => {
  try {
    const validationError = handleValidationErrors(req, res);
    if (validationError) return;

    const result = await semesterService.updateTemplate(req.params.id, req.body);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/semester-templates/:id
 * Xóa template
 */
exports.deleteTemplate = async (req, res, next) => {
  try {
    const validationError = handleValidationErrors(req, res);
    if (validationError) return;

    const result = await semesterService.deleteTemplate(req.params.id);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

// ==================== SEMESTER CONTROLLERS ====================

/**
 * GET /api/semesters
 * Lấy tất cả semesters
 */
exports.getAllSemesters = async (req, res, next) => {
  try {
    const validationError = handleValidationErrors(req, res);
    if (validationError) return;

    const result = await semesterService.getAllSemesters(req.query);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/semesters/active
 * Lấy semester đang active
 */
exports.getActiveSemester = async (req, res, next) => {
  try {
    const result = await semesterService.getActiveSemester();
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/semesters/:id
 * Lấy semester theo ID
 */
exports.getSemesterById = async (req, res, next) => {
  try {
    const validationError = handleValidationErrors(req, res);
    if (validationError) return;

    const result = await semesterService.getSemesterById(req.params.id);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/semesters
 * Tạo semester mới
 */
exports.createSemester = async (req, res, next) => {
  try {
    const validationError = handleValidationErrors(req, res);
    if (validationError) return;

    const result = await semesterService.createSemester(req.body);
    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
};

/**
 * PATCH /api/semesters/:id
 * Cập nhật semester
 */
exports.updateSemester = async (req, res, next) => {
  try {
    const validationError = handleValidationErrors(req, res);
    if (validationError) return;

    const result = await semesterService.updateSemester(req.params.id, req.body);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/semesters/:id
 * Xóa semester
 */
exports.deleteSemester = async (req, res, next) => {
  try {
    const validationError = handleValidationErrors(req, res);
    if (validationError) return;

    const result = await semesterService.deleteSemester(req.params.id);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/semesters/preview
 * Preview dates trước khi tạo
 */
exports.previewDates = async (req, res, next) => {
  try {
    const { templateId, year } = req.query;
    
    if (!templateId || !year) {
      return res.status(400).json({
        success: false,
        message: 'templateId và year là bắt buộc'
      });
    }

    const result = await semesterService.previewDates(templateId, parseInt(year));
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};
