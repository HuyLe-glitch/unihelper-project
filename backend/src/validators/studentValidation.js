const { body, param, query } = require('express-validator');
const mongoose = require('mongoose');

/**
 * Student Validation - Validate input đầu vào
 * Chỉ kiểm tra định dạng dữ liệu, KHÔNG kiểm tra nghiệp vụ (trùng lặp...)
 */

// ==========================================
// CREATE VALIDATION
// ==========================================
const createStudent = [
  // Họ tên
  body('fullName')
    .trim()
    .notEmpty().withMessage('Họ tên sinh viên là bắt buộc')
    .isLength({ min: 2, max: 100 }).withMessage('Họ tên phải từ 2-100 ký tự'),

  // studentId sẽ được tự động sinh bởi backend, không cần validate

  // Email
  body('email')
    .trim()
    .notEmpty().withMessage('Email là bắt buộc')
    .isEmail().withMessage('Email không hợp lệ')
    .normalizeEmail(),

  // Mật khẩu - Không cần validate vì sẽ tự động tạo mặc định

  // Số điện thoại - BẮT BUỘC
  body('phone')
    .trim()
    .notEmpty().withMessage('Số điện thoại là bắt buộc')
    .matches(/^(0[3|5|7|8|9])+([0-9]{8})$/).withMessage('Số điện thoại không hợp lệ'),

  // CCCD
  body('citizenId')
    .trim()
    .notEmpty().withMessage('CCCD là bắt buộc')
    .isLength({ min: 9, max: 12 }).withMessage('CCCD phải từ 9-12 số'),

  // Ngày sinh
  body('dateOfBirth')
    .notEmpty().withMessage('Ngày sinh là bắt buộc')
    .isISO8601().withMessage('Ngày sinh không hợp lệ'),

  // Địa chỉ
  body('address')
    .trim()
    .notEmpty().withMessage('Địa chỉ là bắt buộc')
    .isLength({ max: 500 }).withMessage('Địa chỉ không được vượt quá 500 ký tự'),

  // Chuyên ngành
  body('major')
    .notEmpty().withMessage('Chuyên ngành là bắt buộc')
    .custom((value) => mongoose.Types.ObjectId.isValid(value))
    .withMessage('ID chuyên ngành không hợp lệ'),

  // KTX
  body('isDormResident')
    .optional()
    .isBoolean().withMessage('isDormResident phải là boolean'),

  body('roomId')
    .optional()
    .custom((value) => !value || mongoose.Types.ObjectId.isValid(value))
    .withMessage('ID phòng không hợp lệ')
];

// ==========================================
// UPDATE VALIDATION
// ==========================================
const updateStudent = [
  // ID param
  param('id')
    .notEmpty().withMessage('ID sinh viên là bắt buộc')
    .custom((value) => mongoose.Types.ObjectId.isValid(value))
    .withMessage('ID sinh viên không hợp lệ'),

  // Email (optional)
  body('email')
    .optional()
    .trim()
    .isEmail().withMessage('Email không hợp lệ')
    .normalizeEmail(),

  // Số điện thoại (optional)
  body('phone')
    .optional()
    .trim()
    .matches(/^(0[3|5|7|8|9])+([0-9]{8})$/).withMessage('Số điện thoại không hợp lệ'),

  // CCCD (optional)
  body('citizenId')
    .optional()
    .trim()
    .isLength({ min: 9, max: 12 }).withMessage('CCCD phải từ 9-12 số'),

  // Ngày sinh (optional)
  body('dateOfBirth')
    .optional()
    .isISO8601().withMessage('Ngày sinh không hợp lệ'),

  // Địa chỉ (optional)
  body('address')
    .optional()
    .trim()
    .isLength({ max: 500 }).withMessage('Địa chỉ không được vượt quá 500 ký tự'),

  // Chuyên ngành (optional)
  body('major')
    .optional()
    .custom((value) => mongoose.Types.ObjectId.isValid(value))
    .withMessage('ID chuyên ngành không hợp lệ'),

  // KTX
  body('isDormResident')
    .optional()
    .isBoolean().withMessage('isDormResident phải là boolean'),

  body('roomId')
    .optional()
    .custom((value) => !value || mongoose.Types.ObjectId.isValid(value))
    .withMessage('ID phòng không hợp lệ')
];

// ==========================================
// ID VALIDATION
// ==========================================
const idValidation = [
  param('id')
    .notEmpty().withMessage('ID là bắt buộc')
    .custom((value) => mongoose.Types.ObjectId.isValid(value))
    .withMessage('ID không hợp lệ')
];

// ==========================================
// QUERY VALIDATION
// ==========================================
const queryValidation = [
  query('page')
    .optional()
    .isInt({ min: 1 }).withMessage('Page phải là số nguyên dương'),
  
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 }).withMessage('Limit phải từ 1-100'),

  query('major')
    .optional()
    .custom((value) => mongoose.Types.ObjectId.isValid(value))
    .withMessage('ID chuyên ngành không hợp lệ'),

  query('isDormResident')
    .optional()
    .isIn(['true', 'false']).withMessage('isDormResident phải là true hoặc false')
];

// ==========================================
// BULK DELETE VALIDATION
// ==========================================
const bulkDeleteValidation = [
  body('ids')
    .isArray({ min: 1 })
    .withMessage('Danh sách ID phải là mảng và có ít nhất 1 phần tử'),
  
  body('ids.*')
    .custom((value) => mongoose.Types.ObjectId.isValid(value))
    .withMessage('ID không hợp lệ - phải đúng định dạng MongoDB ObjectId')
];

// ==========================================
// ROOM TRANSFER VALIDATION
// ==========================================
const roomTransferValidation = [
  body('studentIds')
    .isArray({ min: 1 })
    .withMessage('Danh sách sinh viên phải là mảng và có ít nhất 1 phần tử'),
  
  body('studentIds.*')
    .custom((value) => mongoose.Types.ObjectId.isValid(value))
    .withMessage('ID sinh viên không hợp lệ'),
  
  body('targetRoomId')
    .notEmpty()
    .withMessage('ID phòng đích là bắt buộc')
    .custom((value) => mongoose.Types.ObjectId.isValid(value))
    .withMessage('ID phòng đích không hợp lệ')
];

module.exports = {
  createStudent,
  updateStudent,
  idValidation,
  queryValidation,
  bulkDeleteValidation,
  roomTransferValidation
};
