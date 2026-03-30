const { body, param, query } = require('express-validator');
const mongoose = require('mongoose');

/**
 * Room Validation - Validate input đầu vào
 * Sử dụng express-validator
 */

const roomValidation = {
  /**
   * Validate tạo phòng mới
   */
  create: [
    body('name')
      .trim()
      .notEmpty().withMessage('Tên phòng là bắt buộc')
      .isLength({ max: 20 }).withMessage('Tên phòng không được vượt quá 20 ký tự')
      .matches(/^[A-Za-z0-9\-_]+$/).withMessage('Tên phòng chỉ được chứa chữ cái, số, dấu gạch ngang và gạch dưới'),
    
    body('capacity')
      .notEmpty().withMessage('Sức chứa là bắt buộc')
      .isInt({ min: 1, max: 20 }).withMessage('Sức chứa phải từ 1-20 người'),
    
    body('occupied')
      .optional()
      .isInt({ min: 0 }).withMessage('Số người đang ở không thể âm'),
    
    body('categoryId')
      .optional()
      .custom((value) => {
        if (value && !mongoose.Types.ObjectId.isValid(value)) {
          throw new Error('Category ID không hợp lệ');
        }
        return true;
      }),
    
    body('description')
      .optional()
      .trim()
      .isLength({ max: 500 }).withMessage('Mô tả không được vượt quá 500 ký tự'),
    
    body('status')
      .optional()
      .isIn(['AVAILABLE', 'FULL', 'MAINTENANCE'])
      .withMessage('Trạng thái không hợp lệ')
  ],

  /**
   * Validate cập nhật phòng
   */
  update: [
    param('id')
      .notEmpty().withMessage('ID phòng là bắt buộc')
      .custom((value) => mongoose.Types.ObjectId.isValid(value))
      .withMessage('ID phòng không hợp lệ'),
    
    body('name')
      .optional()
      .trim()
      .isLength({ max: 20 }).withMessage('Tên phòng không được vượt quá 20 ký tự')
      .matches(/^[A-Za-z0-9\-_]+$/).withMessage('Tên phòng chỉ được chứa chữ cái, số, dấu gạch ngang và gạch dưới'),
    
    body('capacity')
      .optional()
      .isInt({ min: 1, max: 20 }).withMessage('Sức chứa phải từ 1-20 người'),
    
    body('occupied')
      .optional()
      .isInt({ min: 0 }).withMessage('Số người đang ở không thể âm'),
    
    body('categoryId')
      .optional()
      .custom((value) => {
        if (value && !mongoose.Types.ObjectId.isValid(value)) {
          throw new Error('Category ID không hợp lệ');
        }
        return true;
      }),
    
    body('description')
      .optional()
      .trim()
      .isLength({ max: 500 }).withMessage('Mô tả không được vượt quá 500 ký tự'),
    
    body('status')
      .optional()
      .isIn(['AVAILABLE', 'FULL', 'MAINTENANCE'])
      .withMessage('Trạng thái không hợp lệ')
  ]
};

// Validate ID trong params
const idValidation = [
  param('id')
    .notEmpty().withMessage('ID là bắt buộc')
    .custom((value) => mongoose.Types.ObjectId.isValid(value))
    .withMessage('ID không hợp lệ')
];

// Validate query parameters
const queryValidation = [
  query('status')
    .optional()
    .isIn(['AVAILABLE', 'FULL', 'MAINTENANCE'])
    .withMessage('Trạng thái không hợp lệ'),
  
  query('categoryId')
    .optional()
    .custom((value) => mongoose.Types.ObjectId.isValid(value))
    .withMessage('Category ID không hợp lệ')
];

module.exports = {
  roomValidation,
  idValidation,
  queryValidation
};
