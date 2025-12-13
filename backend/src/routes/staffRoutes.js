const express = require('express');
const router = express.Router();

// Import controllers, middlewares, và validators
const staffController = require('../controllers/staffController');
const authMiddleware = require('../middleware/authMiddleware');
const staffMiddleware = require('../middleware/staffMiddleware');
const staffValidator = require('../validators/staffValidation');

// Apply common middlewares cho tất cả staff routes
router.use(authMiddleware.protect); // Require authentication
router.use(staffMiddleware.ensureStaff); // Ensure user is staff
router.use(staffMiddleware.sanitizeInput); // Sanitize input
router.use(staffMiddleware.formatResponse); // Format response
router.use(staffMiddleware.rateLimitStaffActions()); // Rate limiting

// [GET] /staff/profile - Lấy thông tin profile staff
router.get('/profile',
  staffMiddleware.logStaffActivity('GET_PROFILE'),
  staffController.getProfile
);

// [GET] /staff/dashboard - Lấy dữ liệu dashboard
router.get('/dashboard',
  staffMiddleware.logStaffActivity('GET_DASHBOARD'),
  staffController.getDashboard
);

// [GET] /staff/requests - Lấy danh sách yêu cầu cho staff
router.get('/requests',
  staffValidator.getRequestsValidator,
  staffMiddleware.handleValidationErrors,
  staffMiddleware.logStaffActivity('GET_REQUESTS'),
  staffController.getRequests
);

// [GET] /staff/requests/stats - Lấy thống kê yêu cầu
router.get('/requests/stats',
  staffMiddleware.logStaffActivity('GET_REQUEST_STATS'),
  staffController.getRequestStats
);

// [GET] /staff/requests/:requestId - Lấy chi tiết một yêu cầu
router.get('/requests/:requestId',
  staffValidator.getRequestByIdValidator,
  staffMiddleware.handleValidationErrors,
  staffMiddleware.logStaffActivity('GET_REQUEST_DETAIL'),
  staffController.getRequestById
);

// [PUT] /staff/requests/:requestId/status - Cập nhật trạng thái yêu cầu
router.put('/requests/:requestId/status',
  staffValidator.updateRequestStatusValidator,
  staffMiddleware.handleValidationErrors,
  staffValidator.validateStatusTransition,
  staffValidator.validateStaffPermissions,
  staffMiddleware.logStaffActivity('UPDATE_REQUEST_STATUS'),
  staffController.updateRequestStatus
);

// Routes cho CTSV staff only
router.get('/ctsv/requests',
  staffMiddleware.checkStaffTypePermission(['CTSV']),
  staffValidator.getRequestsValidator,
  staffMiddleware.handleValidationErrors,
  staffMiddleware.logStaffActivity('GET_CTSV_REQUESTS'),
  (req, res, next) => {
    req.query.staffType = 'CTSV';
    next();
  },
  staffController.getRequests
);

// Routes cho KTX staff only
router.get('/ktx/requests',
  staffMiddleware.checkStaffTypePermission(['KTX']),
  staffValidator.getRequestsValidator,
  staffMiddleware.handleValidationErrors,
  staffMiddleware.logStaffActivity('GET_KTX_REQUESTS'),
  (req, res, next) => {
    req.query.staffType = 'KTX';
    next();
  },
  staffController.getRequests
);

// [GET] /staff/department/:staffType - Lấy danh sách nhân viên theo phòng ban
router.get('/department/:staffType',
  staffValidator.getDepartmentStaffValidator, // Use proper validator
  staffMiddleware.handleValidationErrors,
  staffMiddleware.logStaffActivity('GET_DEPARTMENT_STAFF'),
  staffController.getStaffByDepartment
);

// Error handling middleware cho staff routes
router.use((error, req, res, next) => {
  console.error('Staff route error:', error);
  
  // Log error details
  const errorLog = {
    timestamp: new Date().toISOString(),
    userId: req.userData?._id,
    route: req.originalUrl,
    method: req.method,
    error: error.message,
    stack: error.stack
  };
  
  console.error('Staff Error Log:', errorLog);
  
  res.status(500).json({
    status: false,
    message: 'Internal server error in staff operations',
    ...(process.env.NODE_ENV === 'development' && { error: error.message })
  });
});

module.exports = router;