const { body, param, query, validationResult } = require('express-validator');
const { AppError } = require('../utils/appError');

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const msg = errors.array().map(e => e.msg).join(', ');
    throw new AppError(msg, 400);
  }
  next();
};

const createStudent = [
  // Email validation
  body('email')
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Email must be valid')
    .normalizeEmail(),

  // Password validation  
  body('password')
    .notEmpty()
    .withMessage('Password is required')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters'),

  // Full name validation
  body('fullName')
    .notEmpty()
    .withMessage('Full name is required')
    .isLength({ min: 2, max: 100 })
    .withMessage('Full name must be between 2-100 characters')
    .trim(),

  // Student ID validation
  body('studentId')
    .notEmpty()
    .withMessage('Student ID is required')
    .isLength({ min: 6, max: 20 })
    .withMessage('Student ID must be between 6-20 characters')
    .trim(),

  // Major validation
  body('major')
    .notEmpty()
    .withMessage('Major is required')
    .trim(),

  // Academic year validation
  body('academicYear')
    .notEmpty()
    .withMessage('Academic year is required')
    .isNumeric()
    .withMessage('Academic year must be a number'),

  // Optional fields
  body('citizenId')
    .optional()
    .isLength({ min: 9, max: 12 })
    .withMessage('Citizen ID must be between 9-12 characters'),

  body('dateOfBirth')
    .optional()
    .isISO8601()
    .toDate()
    .withMessage('Date of birth must be a valid date'),

  body('phone')
    .optional()
    .isMobilePhone('vi-VN')
    .withMessage('Phone must be a valid Vietnamese phone number'),

  body('address')
    .optional()
    .isLength({ max: 200 })
    .withMessage('Address must not exceed 200 characters'),

  body('gpa')
    .optional()
    .isFloat({ min: 0, max: 4 })
    .withMessage('GPA must be between 0 and 4'),

  body('status')
    .optional()
    .isIn(['ACTIVE', 'INACTIVE', 'GRADUATED', 'SUSPENDED'])
    .withMessage('Status must be ACTIVE, INACTIVE, GRADUATED, or SUSPENDED'),

  handleValidationErrors
];


const updateStudent = [
  param('id').isMongoId().withMessage('Invalid student id'),
  // allow partial updates; validate specific fields if present
  body('major').optional().isMongoId().withMessage('major must be a MongoId'),
  body('dateOfBirth').optional().isISO8601().toDate(),
  handleValidationErrors
];

const idValidation = [
  param('id').isMongoId().withMessage('Invalid id'),
  handleValidationErrors
];

module.exports = {
  createStudent,
  updateStudent,
  idValidation
};