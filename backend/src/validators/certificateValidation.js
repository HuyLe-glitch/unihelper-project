const { body, param, query } = require('express-validator');
const mongoose = require('mongoose');

/**
 * Certificate Validation - Validate input đầu vào
 */

// ==========================================
// TYPE VALIDATION
// ==========================================
const typeValidation = {
  create: [
    body('name')
      .trim()
      .notEmpty().withMessage('Tên loại chứng nhận là bắt buộc')
      .isLength({ max: 100 }).withMessage('Tên loại chứng nhận không được vượt quá 100 ký tự'),
    
    body('description')
      .optional()
      .trim()
      .isLength({ max: 500 }).withMessage('Mô tả không được vượt quá 500 ký tự')
  ],

  update: [
    param('id')
      .notEmpty().withMessage('ID loại chứng nhận là bắt buộc')
      .custom((value) => mongoose.Types.ObjectId.isValid(value))
      .withMessage('ID loại chứng nhận không hợp lệ'),
    
    body('name')
      .optional()
      .trim()
      .isLength({ max: 100 }).withMessage('Tên loại chứng nhận không được vượt quá 100 ký tự'),
    
    body('description')
      .optional()
      .trim()
      .isLength({ max: 500 }).withMessage('Mô tả không được vượt quá 500 ký tự')
  ]
};

// ==========================================
// CERTIFICATE VALIDATION
// ==========================================
const certificateValidation = {
  create: [
    body('name')
      .trim()
      .notEmpty().withMessage('Tên chứng nhận là bắt buộc')
      .isLength({ max: 100 }).withMessage('Tên chứng nhận không được vượt quá 100 ký tự'),
    
    body('certificateType')
      .notEmpty().withMessage('Loại chứng nhận là bắt buộc')
      .custom((value) => mongoose.Types.ObjectId.isValid(value))
      .withMessage('ID loại chứng nhận không hợp lệ'),
    
    body('description')
      .optional()
      .trim()
      .isLength({ max: 500 }).withMessage('Mô tả không được vượt quá 500 ký tự')
  ],

  update: [
    param('id')
      .notEmpty().withMessage('ID chứng nhận là bắt buộc')
      .custom((value) => mongoose.Types.ObjectId.isValid(value))
      .withMessage('ID chứng nhận không hợp lệ'),
    
    body('name')
      .optional()
      .trim()
      .isLength({ max: 100 }).withMessage('Tên chứng nhận không được vượt quá 100 ký tự'),
    
    body('certificateType')
      .optional()
      .custom((value) => mongoose.Types.ObjectId.isValid(value))
      .withMessage('ID loại chứng nhận không hợp lệ'),
    
    body('description')
      .optional()
      .trim()
      .isLength({ max: 500 }).withMessage('Mô tả không được vượt quá 500 ký tự')
  ],

  // Batch create validation
  createBatch: [
    body('typeId')
      .notEmpty().withMessage('ID loại chứng nhận là bắt buộc')
      .custom((value) => mongoose.Types.ObjectId.isValid(value))
      .withMessage('ID loại chứng nhận không hợp lệ'),
    
    body('certificates')
      .isArray({ min: 1 }).withMessage('Danh sách chứng nhận phải là mảng và có ít nhất 1 phần tử'),
    
    body('certificates.*.name')
      .trim()
      .notEmpty().withMessage('Tên chứng nhận là bắt buộc')
      .isLength({ max: 100 }).withMessage('Tên chứng nhận không được vượt quá 100 ký tự'),
    
    body('certificates.*.description')
      .optional()
      .trim()
      .isLength({ max: 500 }).withMessage('Mô tả không được vượt quá 500 ký tự')
  ]
};

// ID Validation
const idValidation = [
  param('id')
    .notEmpty().withMessage('ID là bắt buộc')
    .custom((value) => mongoose.Types.ObjectId.isValid(value))
    .withMessage('ID không hợp lệ')
];

// TypeId Validation
const typeIdValidation = [
  param('typeId')
    .notEmpty().withMessage('ID loại chứng nhận là bắt buộc')
    .custom((value) => mongoose.Types.ObjectId.isValid(value))
    .withMessage('ID loại chứng nhận không hợp lệ')
];

// Query Validation
const queryValidation = [
  query('certificateType')
    .optional()
    .custom((value) => mongoose.Types.ObjectId.isValid(value))
    .withMessage('ID loại chứng nhận không hợp lệ')
];

module.exports = {
  typeValidation,
  certificateValidation,
  idValidation,
  typeIdValidation,
  queryValidation
};
