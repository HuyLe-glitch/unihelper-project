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