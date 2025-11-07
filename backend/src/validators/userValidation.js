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
 * Validation rules cho Authentication
 * Chỉ bao gồm login và change password
 */
const authValidation = {
  // Validation cho đăng nhập
  login: [
    body('email')
      .isEmail()
      .withMessage('Email không hợp lệ')
      .normalizeEmail(),
    body('password')
      .notEmpty()
      .withMessage('Password là bắt buộc')
      .isLength({ min: 1 })
      .withMessage('Password không được để trống'),
    handleValidationErrors
  ],

  // Validation cho đổi password
  changePassword: [
    body('currentPassword')
      .notEmpty()
      .withMessage('Password hiện tại là bắt buộc'),
    body('newPassword')
      .isLength({ min: 6 })
      .withMessage('Password mới phải có ít nhất 6 ký tự'),
    handleValidationErrors
  ]
};

/**
 * Validation rules cho User Management
 */
const userValidation = {
  // Validation for creating a new user (Admin)
  // Validation for creating a new user (Admin)
  createUser: [
    body('name')
      .notEmpty()
      .withMessage('Tên là bắt buộc')
      .isLength({ min: 2, max: 50 })
      .withMessage('Tên phải từ 2-50 ký tự')
      .trim(),
    body('email')
      .notEmpty()
      .withMessage('Email là bắt buộc')
      .isEmail()
      .withMessage('Email không hợp lệ')
      .normalizeEmail(),
    body('password')
      .notEmpty()
      .withMessage('Password là bắt buộc')
      .isLength({ min: 6 })
      .withMessage('Password phải có ít nhất 6 ký tự'),
    body('role')
      .optional()
      .isIn(['STUDENT', 'STAFF'])
      .withMessage('Role không hợp lệ'),

    // Nếu vai trò là STUDENT yêu cầu các trường profile của sinh viên
    body('studentId')
      .if(body('role').equals('STUDENT'))
      .notEmpty()
      .withMessage('studentId là bắt buộc cho STUDENT')
      .trim(),
    body('major')
      .if(body('role').equals('STUDENT'))
      .notEmpty()
      .withMessage('major là bắt buộc cho STUDENT')
      .trim(),
    body('faculty')
      .if(body('role').equals('STUDENT'))
      .notEmpty()
      .withMessage('faculty là bắt buộc cho STUDENT')
      .trim(),
    body('academicYear')
      .if(body('role').equals('STUDENT'))
      .notEmpty()
      .withMessage('academicYear là bắt buộc cho STUDENT')
      .trim(),

    // Nếu vai trò là STAFF yêu cầu các trường profile của nhân viên
    body('staffId')
      .if(body('role').equals('STAFF'))
      .notEmpty()
      .withMessage('staffId là bắt buộc cho STAFF')
      .trim(),
    body('department')
      .if(body('role').equals('STAFF'))
      .notEmpty()
      .withMessage('department là bắt buộc cho STAFF')
      .trim(),

    handleValidationErrors
  ],

  // Validation cho cập nhật user
  updateUser: [
    body('name')
      .optional()
      .isLength({ min: 2, max: 50 })
      .withMessage('Tên phải từ 2-50 ký tự')
      .trim(),
    body('email')
      .optional()
      .isEmail()
      .withMessage('Email không hợp lệ')
      .normalizeEmail(),
    handleValidationErrors
  ],

  // Validation cho thay đổi role
  changeRole: [
    body('role')
      .isIn(['STUDENT', 'STAFF', 'ADMIN'])
      .withMessage('Role không hợp lệ'),
    handleValidationErrors
  ],

  // Validation cho query parameters
  getUsersQuery: [
    query('page')
      .optional()
      .isInt({ min: 1 })
      .withMessage('Page phải là số nguyên dương'),
    query('limit')
      .optional()
      .isInt({ min: 1, max: 100 })
      .withMessage('Limit phải từ 1-100'),
    query('role')
      .optional()
      .isIn(['STUDENT', 'STAFF', 'ADMIN'])
      .withMessage('Role filter không hợp lệ'),
    handleValidationErrors
  ],

  // Validation cho tìm kiếm
  searchUsers: [
    query('q')
      .notEmpty()
      .withMessage('Từ khóa tìm kiếm là bắt buộc')
      .isLength({ min: 2 })
      .withMessage('Từ khóa tìm kiếm phải có ít nhất 2 ký tự'),
    query('page')
      .optional()
      .isInt({ min: 1 })
      .withMessage('Page phải là số nguyên dương'),
    query('limit')
      .optional()
      .isInt({ min: 1, max: 100 })
      .withMessage('Limit phải từ 1-100'),
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
  ]
};

module.exports = {
  authValidation,
  userValidation,
  idValidation,
  handleValidationErrors
};
