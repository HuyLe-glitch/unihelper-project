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
 * Validation rules cho Certificate Request
 */
const certificateRequestValidation = {
  // Validation cho tạo yêu cầu chứng nhận
  createRequest: [
    body('certificateType')
      .notEmpty()
      .withMessage('Loại chứng nhận là bắt buộc')
      .isMongoId()
      .withMessage('ID loại chứng nhận không hợp lệ'),
    body('certificateName')
      .notEmpty()
      .withMessage('Tên chứng nhận là bắt buộc')
      .isMongoId()
      .withMessage('ID tên chứng nhận không hợp lệ'),
    body('semester')
      .notEmpty()
      .withMessage('Học kỳ là bắt buộc')
      .matches(/^(HK[1-3]|Học kỳ [1-3]|HKH|Học kỳ Hè)\s*[(-]\s*\d{4}(-\d{4})?\)?$/)
      .withMessage('Học kỳ phải có định dạng hợp lệ, ví dụ: HK1 (2024-2025) hoặc HK1 - 2024'),
    handleValidationErrors
  ],

  // Validation cho cập nhật trạng thái
  updateStatus: [
    body('status')
      .notEmpty()
      .withMessage('Trạng thái là bắt buộc')
      .isIn(['ĐANG XỬ LÝ', 'HỢP LỆ', 'KHÔNG HỢP LỆ'])
      .withMessage('Trạng thái không hợp lệ. Cho phép: ĐANG XỬ LÝ, HỢP LỆ, KHÔNG HỢP LỆ'),
    body('notes')
      .optional()
      .isLength({ max: 500 })
      .withMessage('Ghi chú không được quá 500 ký tự')
      .trim(),
    body('staffFile')
      .optional(),
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
      .isIn(['ĐANG XỬ LÝ', 'HỢP LỆ', 'KHÔNG HỢP LỆ'])
      .withMessage('Status filter không hợp lệ'),
    query('certificateType')
      .optional()
      .isMongoId()
      .withMessage('Certificate type ID không hợp lệ'),
    handleValidationErrors
  ]
};

/**
 * Validation cho ObjectId parameters
 */
const idValidation = {
  validateObjectId: [
    param('id')
      .isMongoId()
      .withMessage('ID không hợp lệ'),
    handleValidationErrors
  ]
};

module.exports = {
  certificateRequestValidation,
  idValidation,
  handleValidationErrors
};
