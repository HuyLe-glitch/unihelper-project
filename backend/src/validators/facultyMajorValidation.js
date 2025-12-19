const { body, param, query, validationResult } = require('express-validator');

/**
 * Middleware xử lý kết quả validation
 */
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map(error => ({
      field: error.path,
      message: error.msg
    }));
    // Trả về lỗi với format phù hợp cho frontend hiển thị inline
    return res.status(400).json({
      status: 'fail',
      message: 'Dữ liệu không hợp lệ',
      errors: errorMessages
    });
  }
  next();
};

/**
 * Validation rules cho Faculty
 */
const facultyValidation = {
  // Validation cho tạo Faculty
  createFaculty: [
    body('name')
      .notEmpty()
      .withMessage('Tên khoa là bắt buộc')
      .isLength({ min: 2, max: 100 })
      .withMessage('Tên khoa phải từ 2-100 ký tự')
      .trim(),
    
    body('code')
      .notEmpty()
      .withMessage('Mã khoa là bắt buộc')
      .isLength({ min: 2, max: 10 })
      .withMessage('Mã khoa phải từ 2-10 ký tự')
      .matches(/^[A-Z0-9]+$/)
      .withMessage('Mã khoa chỉ chứa chữ in hoa và số')
      .trim()
      .toUpperCase(),
    
    body('description')
      .optional()
      .isLength({ max: 500 })
      .withMessage('Mô tả không được vượt quá 500 ký tự')
      .trim(),
    
    handleValidationErrors
  ],

  // Validation cho cập nhật Faculty
  updateFaculty: [
    body('name')
      .optional()
      .isLength({ min: 2, max: 100 })
      .withMessage('Tên khoa phải từ 2-100 ký tự')
      .trim(),
    
    body('code')
      .optional()
      .isLength({ min: 2, max: 10 })
      .withMessage('Mã khoa phải từ 2-10 ký tự')
      .matches(/^[A-Z0-9]+$/)
      .withMessage('Mã khoa chỉ chứa chữ in hoa và số')
      .trim()
      .toUpperCase(),
    
    body('description')
      .optional()
      .isLength({ max: 500 })
      .withMessage('Mô tả không được vượt quá 500 ký tự')
      .trim(),
    
    handleValidationErrors
  ]
};

/**
 * Validation rules cho Major
 */
const majorValidation = {
  // Validation cho tạo Major
  createMajor: [
    body('name')
      .notEmpty()
      .withMessage('Tên chuyên ngành là bắt buộc')
      .isLength({ min: 2, max: 100 })
      .withMessage('Tên chuyên ngành phải từ 2-100 ký tự')
      .trim(),
    
    body('code')
      .notEmpty()
      .withMessage('Mã chuyên ngành là bắt buộc')
      .isLength({ min: 2, max: 10 })
      .withMessage('Mã chuyên ngành phải từ 2-10 ký tự')
      .matches(/^[A-Z0-9]+$/)
      .withMessage('Mã chuyên ngành chỉ chứa chữ in hoa và số')
      .trim()
      .toUpperCase(),
    
    body('faculty')
      .notEmpty()
      .withMessage('Khoa là bắt buộc')
      .isMongoId()
      .withMessage('ID khoa không hợp lệ'),
    
    body('description')
      .optional()
      .isLength({ max: 500 })
      .withMessage('Mô tả không được vượt quá 500 ký tự')
      .trim(),
    
    handleValidationErrors
  ],

  // Validation cho cập nhật Major
  updateMajor: [
    body('name')
      .optional()
      .isLength({ min: 2, max: 100 })
      .withMessage('Tên chuyên ngành phải từ 2-100 ký tự')
      .trim(),
    
    body('code')
      .optional()
      .isLength({ min: 2, max: 10 })
      .withMessage('Mã chuyên ngành phải từ 2-10 ký tự')
      .matches(/^[A-Z0-9]+$/)
      .withMessage('Mã chuyên ngành chỉ chứa chữ in hoa và số')
      .trim()
      .toUpperCase(),
    
    body('faculty')
      .optional()
      .isMongoId()
      .withMessage('ID khoa không hợp lệ'),
    
    body('description')
      .optional()
      .isLength({ max: 500 })
      .withMessage('Mô tả không được vượt quá 500 ký tự')
      .trim(),
    
    handleValidationErrors
  ],

  // Validation cho batch create majors
  createBatchMajors: [
    body('faculty')
      .notEmpty()
      .withMessage('Khoa là bắt buộc')
      .isMongoId()
      .withMessage('ID khoa không hợp lệ'),
    
    body('majors')
      .notEmpty()
      .withMessage('Danh sách chuyên ngành là bắt buộc')
      .isArray({ min: 1 })
      .withMessage('Phải có ít nhất 1 chuyên ngành'),
    
    body('majors.*.name')
      .notEmpty()
      .withMessage('Tên chuyên ngành là bắt buộc')
      .isLength({ min: 2, max: 100 })
      .withMessage('Tên chuyên ngành phải từ 2-100 ký tự')
      .trim(),
    
    body('majors.*.code')
      .notEmpty()
      .withMessage('Mã chuyên ngành là bắt buộc')
      .isLength({ min: 2, max: 10 })
      .withMessage('Mã chuyên ngành phải từ 2-10 ký tự')
      .matches(/^[A-Z0-9]+$/i)
      .withMessage('Mã chuyên ngành chỉ chứa chữ cái và số')
      .trim(),
    
    body('majors.*.description')
      .optional()
      .isLength({ max: 500 })
      .withMessage('Mô tả không được vượt quá 500 ký tự')
      .trim(),
    
    handleValidationErrors
  ]
};

/**
 * Validation cho ID params
 */
const idValidation = {
  validateObjectId: [
    param('id')
      .isMongoId()
      .withMessage('ID không hợp lệ'),
    handleValidationErrors
  ]
};

/**
 * Validation cho query params
 */
const queryValidation = {
  getFaculties: [
    handleValidationErrors
  ],
  
  getMajors: [
    query('faculty')
      .optional()
      .isMongoId()
      .withMessage('Faculty ID không hợp lệ'),
    handleValidationErrors
  ]
};

module.exports = {
  facultyValidation,
  majorValidation,
  idValidation,
  queryValidation
};
