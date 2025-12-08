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

