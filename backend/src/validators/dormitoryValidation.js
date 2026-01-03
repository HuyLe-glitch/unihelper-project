const { body, param, query, validationResult } = require('express-validator');
const { AppError } = require('../utils/appError');

/**
 * Middleware để xử lý kết quả validation
 * Pattern: Validation layer chỉ validate format, type - không validate business rules
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
 * Validation rules cho Dormitory Request
 */
const dormitoryValidation = {
  // Validation cho ObjectId trong params
  validateId: [
    param('id')
      .notEmpty()
      .withMessage('ID là bắt buộc')
      .isMongoId()
      .withMessage('ID không hợp lệ'),
    handleValidationErrors
  ],

  // Validation cho tạo yêu cầu KTX
  createRequest: [
    body('category')
      .notEmpty()
      .withMessage('Danh mục là bắt buộc')
      .isMongoId()
      .withMessage('ID danh mục không hợp lệ'),
    body('item')
      .optional()
      .isMongoId()
      .withMessage('ID thiết bị không hợp lệ'),
    body('description')
      .optional()
      .isLength({ max: 1000 })
      .withMessage('Mô tả không được quá 1000 ký tự')
      .trim(),
    handleValidationErrors
  ],

  // Validation cho cập nhật yêu cầu
  updateRequest: [
    param('id')
      .isMongoId()
      .withMessage('ID không hợp lệ'),
    body('category')
      .optional()
      .isMongoId()
      .withMessage('ID danh mục không hợp lệ'),
    body('item')
      .optional()
      .isMongoId()
      .withMessage('ID thiết bị không hợp lệ'),
    body('description')
      .optional()
      .isLength({ max: 1000 })
      .withMessage('Mô tả không được quá 1000 ký tự')
      .trim(),
    handleValidationErrors
  ],

  // Validation cho cập nhật trạng thái (Staff/Admin)
  updateStatus: [
    param('id')
      .isMongoId()
      .withMessage('ID không hợp lệ'),
    body('status')
      .notEmpty()
      .withMessage('Trạng thái là bắt buộc')
      .isIn(['Pending', 'Under Review', 'Approved'])
      .withMessage('Trạng thái không hợp lệ. Cho phép: Pending, Under Review, Approved'),
    handleValidationErrors
  ],

  // Validation cho query parameters
  getRequestsQuery: [
    query('page')
      .optional()
      .isInt({ min: 1 })
      .withMessage('Page phải là số nguyên dương'),
    query('limit')
      .optional()
      .isInt({ min: 1, max: 100 })
      .withMessage('Limit phải từ 1-100'),
    query('status')
      .optional()
      .isIn(['Pending', 'Under Review', 'Approved'])
      .withMessage('Status filter không hợp lệ'),
    handleValidationErrors
  ]
};

module.exports = {
  dormitoryValidation,
  handleValidationErrors
};
