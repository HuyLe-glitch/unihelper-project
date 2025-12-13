const { body, param, query } = require('express-validator');

class StaffValidator {

  /**
   * Validator cho cập nhật trạng thái yêu cầu
   */
  updateRequestStatusValidator = [
    // Validate requestId trong params
    param('requestId')
      .notEmpty()
      .withMessage('Request ID is required')
      .isMongoId()
      .withMessage('Invalid request ID format'),

    // Validate status trong body
    body('status')
      .notEmpty()
      .withMessage('Status is required')
      .isIn(['processing', 'approved', 'rejected', 'valid', 'invalid'])
      .withMessage('Invalid status. Allowed values: processing, approved, rejected, valid, invalid'),

    // Validate note trong body (optional)
    body('note')
      .optional()
      .isString()
      .withMessage('Note must be a string')
      .isLength({ max: 500 })
      .withMessage('Note cannot exceed 500 characters')
      .trim()
  ];

  /**
   * Validator cho lấy danh sách yêu cầu
   */
  getRequestsValidator = [
    // Validate page
    query('page')
      .optional()
      .isInt({ min: 1 })
      .withMessage('Page must be a positive integer')
      .toInt(),

    // Validate limit
    query('limit')
      .optional()
      .isInt({ min: 1, max: 100 })
      .withMessage('Limit must be between 1 and 100')
      .toInt(),

    // Validate status
    query('status')
      .optional()
      .isIn(['pending', 'processing', 'approved', 'rejected', 'valid', 'invalid'])
      .withMessage('Invalid status filter'),

    // Validate sortBy
    query('sortBy')
      .optional()
      .isIn(['requestDate', 'status', 'certificateType'])
      .withMessage('Invalid sort field. Allowed values: requestDate, status, certificateType'),

    // Validate sortOrder
    query('sortOrder')
      .optional()
      .isIn(['asc', 'desc'])
      .withMessage('Invalid sort order. Allowed values: asc, desc')
  ];

  /**
   * Validator cho lấy chi tiết yêu cầu
   */
  getRequestByIdValidator = [
    param('requestId')
      .notEmpty()
      .withMessage('Request ID is required')
      .isMongoId()
      .withMessage('Invalid request ID format')
  ];

  /**
   * Custom validation middleware cho business rules
   */
  validateStatusTransition = async (req, res, next) => {
    try {
      const { status } = req.body;
      const { requestId } = req.params;

      // Lấy thông tin yêu cầu hiện tại để kiểm tra transition hợp lệ
      // Ví dụ: không thể chuyển từ 'approved' sang 'pending'
      const allowedTransitions = {
        'pending': ['processing', 'rejected'],
        'processing': ['approved', 'rejected', 'needs-update'],
        'needs-update': ['processing', 'rejected'],
        'approved': [], // Không thể thay đổi khi đã approved
        'rejected': ['processing'] // Có thể xem xét lại
      };

      // TODO: Implement actual status transition validation
      // Hiện tại chỉ check basic validation
      
      next();
    } catch (error) {
      res.status(400).json({
        status: false,
        message: 'Error validating status transition'
      });
    }
  };

  /**
   * Validate staff permissions
   */
  validateStaffPermissions = async (req, res, next) => {
    try {
      // TODO: Implement permission validation based on staff type
      // Ví dụ: CTSV staff chỉ có thể xử lý CTSV requests
      
      next();
    } catch (error) {
      res.status(403).json({
        status: false,
        message: 'Insufficient permissions'
      });
    }
  };

  /**
   * Validator cho lấy danh sách nhân viên theo phòng ban
   */
  getDepartmentStaffValidator = [
    // Validate staffType trong params
    param('staffType')
      .notEmpty()
      .withMessage('Staff type is required')
      .isIn(['CTSV', 'KTX'])
      .withMessage('Invalid staff type. Must be CTSV or KTX')
      .toUpperCase(),

    // Validate page
    query('page')
      .optional()
      .isInt({ min: 1 })
      .withMessage('Page must be a positive integer')
      .toInt(),

    // Validate limit
    query('limit')
      .optional()
      .isInt({ min: 1, max: 50 })
      .withMessage('Limit must be between 1 and 50')
      .toInt(),

    // Validate status (cho staff, không phải request)
    query('status')
      .optional()
      .isIn(['ACTIVE', 'INACTIVE', 'SUSPENDED', 'all'])
      .withMessage('Invalid status filter. Allowed values: ACTIVE, INACTIVE, SUSPENDED, all'),

    // Validate sortBy
    query('sortBy')
      .optional()
      .isIn(['dateOfJoining', 'staffId', 'department'])
      .withMessage('Invalid sort field. Allowed values: dateOfJoining, staffId, department'),

    // Validate sortOrder
    query('sortOrder')
      .optional()
      .isIn(['asc', 'desc'])
      .withMessage('Invalid sort order. Allowed values: asc, desc')
  ];
}

module.exports = new StaffValidator();
const { body, query, param, validationResult } = require('express-validator');
const { AppError } = require('../utils/appError');
const StaffRole = require('../models/StaffRole');
const Department = require('../models/Department');

/* ----------------------------------------------
   HANDLE VALIDATION ERRORS
------------------------------------------------ */
const handleValidationErrors = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const msg = errors.array().map(e => e.msg).join(', ');
        throw new AppError(msg, 400);
    }
    next();

};
// custom validator: ensure role belongs to department (deptId may be from body.department or req.currentStaff.department)
const roleMatchesDepartment = async (roleId, { req }) => {
  if (!roleId) return true;

  // Lấy deptId dạng string: ưu tiên body.department, nếu không lấy từ req.currentStaff.department._id
  let deptId = null;
  if (req.body && req.body.department) {
    deptId = String(req.body.department);
  } else if (req.currentStaff && req.currentStaff.department) {
    // req.currentStaff.department có thể là ObjectId hoặc populated document
    const d = req.currentStaff.department;
    deptId = (d && (d._id || d)) ? String(d._id || d) : null;
  }

  if (!deptId) {
    throw new Error('Department is required to validate staff role');
  }

  const role = await StaffRole.findById(roleId);
  if (!role) throw new Error('StaffRole không tồn tại');

  const allowed = (role.departments || []).map(d => String(d));
  if (!allowed.includes(String(deptId))) {
    throw new Error(`StaffRole "${role.name}" không thuộc phòng ban được chỉ định`);
  }
  return true;
};
const validateStaffTypeWithDepartment = async (staffType, { req }) => {
  // Lấy deptId từ body hoặc từ staff hiện tại
  let deptId = req.body.department;
  
  // Nếu không có department trong body, lấy từ staff hiện tại
  if (!deptId && req.currentStaff && req.currentStaff.department) {
    deptId = req.currentStaff.department._id || req.currentStaff.department;
  }

  if (!deptId) {
    throw new Error('Department is required to validate staffType');
  }

  const dept = await Department.findById(deptId);
  if (!dept) throw new Error('Department does not exist');

  if (dept.staffType !== staffType) {
    throw new Error(`Phòng ban: ${dept.name} thuộc ${dept.staffType}, không khớp staffType: ${staffType}`);
  }

  return true;
};

/* ----------------------------------------------
   BUSINESS LOGIC VALIDATION:
   - Check StaffRole belongs to Department
------------------------------------------------ */
const validateRoleAndDepartment = async (roleId, deptId) => {
    // 1. Check department exists
    const dept = await Department.findById(deptId);
    if (!dept) throw new AppError('Department ${deptId} does not exist', 400);

    // 2. Check staff role exists
    const role = await StaffRole.findById(roleId);
    if (!role) throw new AppError('StaffRole ${roleId} does not exist', 400);

    // 3. Kiểm tra role có thuộc department không
    const roleDeptIds = role.departments.map(d => d.toString());
    if (!roleDeptIds.includes(deptId.toString())) {
        throw new AppError(
            `StaffRole: ${role.name} không thuộc phòng ban: ${dept.name}`, 400
        );
    }
    return true;
};
/* ----------------------------------------------
   VALIDATION FOR CREATE STAFF
------------------------------------------------ */
const createStaff = [
    body('email').notEmpty().isEmail().withMessage('Invalid email'),
    body('password').notEmpty().isLength({ min: 6 }),
    body('fullName').notEmpty().isLength({ min: 2, max: 100 }),

    body('staffId')
        .notEmpty()
        .withMessage('staffId is required')
        .isLength({ min: 4 }),

    body('staffType')
        .notEmpty()
        .isIn(['CTSV', 'KTX'])
        .custom(validateStaffTypeWithDepartment)
        .withMessage('StaffType must be CTSV | KTX and match Department'),

    body('department')
        .notEmpty()
        .withMessage('Department is required')
        .isMongoId()
        .withMessage('Department must be valid MongoId'),

    body('staffRole')
        .notEmpty()
        .withMessage('Staff role is required')
        .isMongoId(),

    // Custom validator — kiểm tra role có thuộc department không
    body('staffRole').custom(async (value, { req }) => {
        const deptId = req.body.department;
        await validateRoleAndDepartment(value, deptId);
    }),

    handleValidationErrors
];

/* ----------------------------------------------
   VALIDATION FOR UPDATE STAFF (PATCH)
------------------------------------------------ */
const updateStaff = [
    param('id').isMongoId().withMessage('Invalid staff id'),

    // Nếu người dùng sửa department (Sửa lại khúc này)
   body('department')
    .optional()
    .isMongoId().withMessage('Invalid department id')
    .bail()
    .custom(async (deptId) => {
      const dept = await Department.findById(deptId);
      if (!dept) throw new Error('Department không tồn tại');
      return true;
    }),

    // Nếu sửa staffType - validate với department
    body('staffType')
        .optional()
        .isIn(['CTSV', 'KTX'])
        .withMessage('StaffType must be CTSV or KTX')
        .bail()
        .custom(validateStaffTypeWithDepartment),

    // Nếu sửa role (Sửa lại khúc này)
    body('staffRole')
    .optional()
    .isMongoId().withMessage('Invalid staffRole id')
    .bail()
    .custom(roleMatchesDepartment),

    handleValidationErrors
];

module.exports = {
    createStaff,
    updateStaff,
    roleMatchesDepartment,
    validateStaffTypeWithDepartment,
    validateRoleAndDepartment
};

