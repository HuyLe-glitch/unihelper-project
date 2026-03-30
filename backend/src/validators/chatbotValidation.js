/**
 * Chatbot Validation - Input Validation
 * Validate input data cho chatbot endpoints
 */
const { body, query, validationResult } = require('express-validator');
const { AppError } = require('../utils/appError');

/**
 * Middleware xử lý kết quả validation
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
 * Validation rules cho Chatbot
 */
const chatbotValidation = {
  // Validation cho gửi tin nhắn
  sendMessage: [
    body('message')
      .notEmpty()
      .withMessage('Tin nhắn không được để trống')
      .isLength({ min: 1, max: 1000 })
      .withMessage('Tin nhắn phải từ 1-1000 ký tự')
      .trim(),
    
    body('sessionId')
      .optional()
      .isString()
      .withMessage('Session ID không hợp lệ'),
    
    handleValidationErrors
  ],

  // Validation cho lấy lịch sử
  getHistory: [
    query('page')
      .optional()
      .isInt({ min: 1 })
      .withMessage('Page phải là số nguyên dương'),
    
    query('limit')
      .optional()
      .isInt({ min: 1, max: 50 })
      .withMessage('Limit phải từ 1-50'),
    
    handleValidationErrors
  ]
};

module.exports = { chatbotValidation };

