const { body, param, query } = require('express-validator');
const mongoose = require('mongoose');

/**
 * Semester Validation - Validate input đầu vào
 * Sử dụng express-validator
 */

// ==================== SEMESTER TEMPLATE VALIDATION ====================

const templateValidation = {
  /**
   * Validate tạo template mới
   */
  create: [
    body('code')
      .trim()
      .notEmpty().withMessage('Mã template là bắt buộc')
      .isLength({ max: 10 }).withMessage('Mã template không được vượt quá 10 ký tự')
      .matches(/^[A-Za-z0-9]+$/).withMessage('Mã template chỉ được chứa chữ cái và số'),
    
    body('name')
      .trim()
      .notEmpty().withMessage('Tên template là bắt buộc')
      .isLength({ max: 100 }).withMessage('Tên template không được vượt quá 100 ký tự'),
    
    body('description')
      .optional()
      .trim()
      .isLength({ max: 500 }).withMessage('Mô tả không được vượt quá 500 ký tự'),
    
    body('startMonth')
      .notEmpty().withMessage('Tháng bắt đầu là bắt buộc')
      .isInt({ min: 1, max: 12 }).withMessage('Tháng bắt đầu phải từ 1-12'),
    
    body('startDay')
      .notEmpty().withMessage('Ngày bắt đầu là bắt buộc')
      .isInt({ min: 1, max: 31 }).withMessage('Ngày bắt đầu phải từ 1-31'),
    
    body('endMonth')
      .notEmpty().withMessage('Tháng kết thúc là bắt buộc')
      .isInt({ min: 1, max: 12 }).withMessage('Tháng kết thúc phải từ 1-12'),
    
    body('endDay')
      .notEmpty().withMessage('Ngày kết thúc là bắt buộc')
      .isInt({ min: 1, max: 31 }).withMessage('Ngày kết thúc phải từ 1-31'),
    
    body('displayOrder')
      .optional()
      .isInt({ min: 0 }).withMessage('Thứ tự hiển thị phải là số không âm')
  ],

  /**
   * Validate cập nhật template
   */
  update: [
    param('id')
      .notEmpty().withMessage('ID template là bắt buộc')
      .custom((value) => mongoose.Types.ObjectId.isValid(value))
      .withMessage('ID template không hợp lệ'),
    
    body('code')
      .optional()
      .trim()
      .isLength({ max: 10 }).withMessage('Mã template không được vượt quá 10 ký tự')
      .matches(/^[A-Za-z0-9]+$/).withMessage('Mã template chỉ được chứa chữ cái và số'),
    
    body('name')
      .optional()
      .trim()
      .isLength({ max: 100 }).withMessage('Tên template không được vượt quá 100 ký tự'),
    
    body('description')
      .optional()
      .trim()
      .isLength({ max: 500 }).withMessage('Mô tả không được vượt quá 500 ký tự'),
    
    body('startMonth')
      .optional()
      .isInt({ min: 1, max: 12 }).withMessage('Tháng bắt đầu phải từ 1-12'),
    
    body('startDay')
      .optional()
      .isInt({ min: 1, max: 31 }).withMessage('Ngày bắt đầu phải từ 1-31'),
    
    body('endMonth')
      .optional()
      .isInt({ min: 1, max: 12 }).withMessage('Tháng kết thúc phải từ 1-12'),
    
    body('endDay')
      .optional()
      .isInt({ min: 1, max: 31 }).withMessage('Ngày kết thúc phải từ 1-31'),
    
    body('displayOrder')
      .optional()
      .isInt({ min: 0 }).withMessage('Thứ tự hiển thị phải là số không âm')
  ]
};

// ==================== SEMESTER VALIDATION ====================

const semesterValidation = {
  /**
   * Validate tạo semester mới
   */
  create: [
    body('templateId')
      .notEmpty().withMessage('Template học kỳ là bắt buộc')
      .custom((value) => mongoose.Types.ObjectId.isValid(value))
      .withMessage('Template ID không hợp lệ'),
    
    body('year')
      .notEmpty().withMessage('Năm học kỳ là bắt buộc')
      .isInt({ min: 2000, max: 2100 }).withMessage('Năm phải từ 2000 đến 2100'),
    
    body('name')
      .trim()
      .notEmpty().withMessage('Tên học kỳ là bắt buộc')
      .isLength({ max: 100 }).withMessage('Tên học kỳ không được vượt quá 100 ký tự'),
    
    body('isActive')
      .optional()
      .isBoolean().withMessage('isActive phải là boolean'),
    
    body('note')
      .optional()
      .trim()
      .isLength({ max: 500 }).withMessage('Ghi chú không được vượt quá 500 ký tự')
  ],

  /**
   * Validate cập nhật semester
   */
  update: [
    param('id')
      .notEmpty().withMessage('ID học kỳ là bắt buộc')
      .custom((value) => mongoose.Types.ObjectId.isValid(value))
      .withMessage('ID học kỳ không hợp lệ'),
    
    body('name')
      .optional()
      .trim()
      .isLength({ max: 100 }).withMessage('Tên học kỳ không được vượt quá 100 ký tự'),
    
    body('isActive')
      .optional()
      .isBoolean().withMessage('isActive phải là boolean'),
    
    body('note')
      .optional()
      .trim()
      .isLength({ max: 500 }).withMessage('Ghi chú không được vượt quá 500 ký tự')
  ]
};

// ==================== COMMON VALIDATION ====================

const idValidation = [
  param('id')
    .notEmpty().withMessage('ID là bắt buộc')
    .custom((value) => mongoose.Types.ObjectId.isValid(value))
    .withMessage('ID không hợp lệ')
];

const queryValidation = [
  query('year')
    .optional()
    .isInt({ min: 2000, max: 2100 }).withMessage('Năm phải từ 2000 đến 2100'),
  
  query('templateId')
    .optional()
    .custom((value) => mongoose.Types.ObjectId.isValid(value))
    .withMessage('Template ID không hợp lệ'),
  
  query('isActive')
    .optional()
    .isIn(['true', 'false']).withMessage('isActive phải là true hoặc false')
];

module.exports = {
  templateValidation,
  semesterValidation,
  idValidation,
  queryValidation
};
