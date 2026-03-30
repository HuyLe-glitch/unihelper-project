const { body, param, query } = require('express-validator');
const mongoose = require('mongoose');

/**
 * Equipment Validation - Validate input đầu vào
 */

// ==========================================
// CATEGORY VALIDATION
// ==========================================
const categoryValidation = {
  create: [
    body('name')
      .trim()
      .notEmpty().withMessage('Tên danh mục là bắt buộc')
      .isLength({ max: 100 }).withMessage('Tên danh mục không được vượt quá 100 ký tự'),
    
    body('description')
      .optional()
      .trim()
      .isLength({ max: 500 }).withMessage('Mô tả không được vượt quá 500 ký tự')
  ],

  update: [
    param('id')
      .notEmpty().withMessage('ID danh mục là bắt buộc')
      .custom((value) => mongoose.Types.ObjectId.isValid(value))
      .withMessage('ID danh mục không hợp lệ'),
    
    body('name')
      .optional()
      .trim()
      .isLength({ max: 100 }).withMessage('Tên danh mục không được vượt quá 100 ký tự'),
    
    body('description')
      .optional()
      .trim()
      .isLength({ max: 500 }).withMessage('Mô tả không được vượt quá 500 ký tự')
  ]
};

// ==========================================
// ITEM VALIDATION
// ==========================================
const itemValidation = {
  create: [
    body('name')
      .trim()
      .notEmpty().withMessage('Tên thiết bị là bắt buộc')
      .isLength({ max: 100 }).withMessage('Tên thiết bị không được vượt quá 100 ký tự'),
    
    body('category')
      .notEmpty().withMessage('Danh mục là bắt buộc')
      .custom((value) => mongoose.Types.ObjectId.isValid(value))
      .withMessage('ID danh mục không hợp lệ'),
    
    body('description')
      .optional()
      .trim()
      .isLength({ max: 500 }).withMessage('Mô tả không được vượt quá 500 ký tự')
  ],

  update: [
    param('id')
      .notEmpty().withMessage('ID thiết bị là bắt buộc')
      .custom((value) => mongoose.Types.ObjectId.isValid(value))
      .withMessage('ID thiết bị không hợp lệ'),
    
    body('name')
      .optional()
      .trim()
      .isLength({ max: 100 }).withMessage('Tên thiết bị không được vượt quá 100 ký tự'),
    
    body('category')
      .optional()
      .custom((value) => mongoose.Types.ObjectId.isValid(value))
      .withMessage('ID danh mục không hợp lệ'),
    
    body('description')
      .optional()
      .trim()
      .isLength({ max: 500 }).withMessage('Mô tả không được vượt quá 500 ký tự')
  ],

  // Batch create validation
  createBatch: [
    body('categoryId')
      .notEmpty().withMessage('ID danh mục là bắt buộc')
      .custom((value) => mongoose.Types.ObjectId.isValid(value))
      .withMessage('ID danh mục không hợp lệ'),
    
    body('items')
      .isArray({ min: 1 }).withMessage('Danh sách thiết bị phải là mảng và có ít nhất 1 phần tử'),
    
    body('items.*.name')
      .trim()
      .notEmpty().withMessage('Tên thiết bị là bắt buộc')
      .isLength({ max: 100 }).withMessage('Tên thiết bị không được vượt quá 100 ký tự'),
    
    body('items.*.description')
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

// Query Validation
const queryValidation = [
  query('category')
    .optional()
    .custom((value) => mongoose.Types.ObjectId.isValid(value))
    .withMessage('ID danh mục không hợp lệ')
];

module.exports = {
  categoryValidation,
  itemValidation,
  idValidation,
  queryValidation
};
