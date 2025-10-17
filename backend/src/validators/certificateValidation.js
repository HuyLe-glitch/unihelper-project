const { body, param, query, validationResult } = require('express-validator');
const { AppError } = require('../utils/appError');

/**
 * Middleware để xử lý kết quả validation
 */
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map(error => error.msg);
    throw new AppError(errorMessages.join(', '), 400);
  }
  next();
};

/**
 * Validation rules cho Certificate Types
 */
const certificateTypeValidation = {
  // Validation cho tạo certificate type
  createType: [
    body('name')
      .notEmpty()
      .withMessage('Tên certificate type là bắt buộc')
      .isLength({ min: 2, max: 100 })
      .withMessage('Tên phải từ 2-100 ký tự')
      .trim(),
    body('description')
      .optional()
      .isLength({ max: 500 })
      .withMessage('Mô tả không được vượt quá 500 ký tự')
      .trim(),
    body('requirements')
      .optional()
      .isArray()
      .withMessage('Requirements phải là một mảng'),
    handleValidationErrors
  ],

  // Validation cho cập nhật certificate type
  updateType: [
    body('name')
      .optional()
      .isLength({ min: 2, max: 100 })
      .withMessage('Tên phải từ 2-100 ký tự')
      .trim(),
    body('description')
      .optional()
      .isLength({ max: 500 })
      .withMessage('Mô tả không được vượt quá 500 ký tự')
      .trim(),
    body('requirements')
      .optional()
      .isArray()
      .withMessage('Requirements phải là một mảng'),
    handleValidationErrors
  ]
};

/**
 * Validation rules cho Certificate Templates
 */
const certificateTemplateValidation = {
  // Validation cho tạo certificate template
  createTemplate: [
    body('name')
      .notEmpty()
      .withMessage('Tên template là bắt buộc')
      .isLength({ min: 2, max: 100 })
      .withMessage('Tên phải từ 2-100 ký tự')
      .trim(),
    body('content')
      .notEmpty()
      .withMessage('Nội dung template là bắt buộc')
      .isLength({ min: 10 })
      .withMessage('Nội dung phải có ít nhất 10 ký tự'),
    body('certificateType')
      .notEmpty()
      .withMessage('Certificate type là bắt buộc')
      .isMongoId()
      .withMessage('Certificate type ID không hợp lệ'),
    body('isActive')
      .optional()
      .isBoolean()
      .withMessage('isActive phải là boolean'),
    handleValidationErrors
  ],

  // Validation cho cập nhật certificate template
  updateTemplate: [
    body('name')
      .optional()
      .isLength({ min: 2, max: 100 })
      .withMessage('Tên phải từ 2-100 ký tự')
      .trim(),
    body('content')
      .optional()
      .isLength({ min: 10 })
      .withMessage('Nội dung phải có ít nhất 10 ký tự'),
    body('certificateType')
      .optional()
      .isMongoId()
      .withMessage('Certificate type ID không hợp lệ'),
    body('isActive')
      .optional()
      .isBoolean()
      .withMessage('isActive phải là boolean'),
    handleValidationErrors
  ]
};

/**
 * Validation rules cho query parameters
 */
const certificateQueryValidation = {
  // Validation cho lấy danh sách templates
  getTemplatesQuery: [
    query('certificateType')
      .optional()
      .isMongoId()
      .withMessage('Certificate type ID không hợp lệ'),
    query('isActive')
      .optional()
      .isBoolean()
      .withMessage('isActive filter phải là boolean'),
    handleValidationErrors
  ],

  // Validation cho lấy danh sách types
  getTypesQuery: [
    query('search')
      .optional()
      .isLength({ min: 2 })
      .withMessage('Từ khóa tìm kiếm phải có ít nhất 2 ký tự'),
    handleValidationErrors
  ]
};

/**
 * Validation rules cho MongoDB ObjectId
 */
const idValidation = {
  validateObjectId: [
    param('id')
      .isMongoId()
      .withMessage('ID không hợp lệ'),
    handleValidationErrors
  ],

  validateTypeId: [
    param('typeId')
      .isMongoId()
      .withMessage('Type ID không hợp lệ'),
    handleValidationErrors
  ]
};

module.exports = {
  certificateTypeValidation,
  certificateTemplateValidation,
  certificateQueryValidation,
  idValidation,
  handleValidationErrors
};
