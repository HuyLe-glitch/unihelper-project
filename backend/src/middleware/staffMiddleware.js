const { validationResult } = require('express-validator');
const Staff = require('../models/Staff');
const { STAFF_TYPES } = require('../constants/modelConstants');

/**
 * Staff Middleware
 * 
 * Lưu ý: Hệ thống chỉ có 2 staff cố định:
 * - Staff CTSV: Xử lý yêu cầu Công tác Sinh viên
 * - Staff KTX: Xử lý yêu cầu Ký túc xá
 */
class StaffMiddleware {

  /**
   * Middleware logging cho staff endpoints
   */
  logStaffActivity = (action) => {
    return (req, res, next) => {
      const timestamp = new Date().toISOString();
      const userId = req.userData?.id;
      const staffType = req.staffData?.staffType || 'UNKNOWN';
      const ip = req.ip || req.connection.remoteAddress;
      
      console.log(`[${timestamp}] Staff[${staffType}] ${action} - User: ${userId}, IP: ${ip}`);
      
      next();
    };
  };

  /**
   * Middleware xử lý validation errors
   */
  handleValidationErrors = (req, res, next) => {
    const errors = validationResult(req);
    
    if (!errors.isEmpty()) {
      const errorMessages = errors.array().map(error => ({
        field: error.param,
        message: error.msg,
        value: error.value
      }));

      return res.status(400).json({
        status: false,
        message: 'Validation failed',
        errors: errorMessages
      });
    }
    
    next();
  };

  /**
   * Middleware kiểm tra xem user có phải là staff không
   * Đồng thời load thông tin staff vào request
   */
  ensureStaff = async (req, res, next) => {
    try {
      const userId = req.userData?.id;
      
      // Check if user role is STAFF
      if (!req.userData?.role || req.userData.role !== 'STAFF') {
        return res.status(403).json({
          status: false,
          message: 'Access denied. Staff privileges required.'
        });
      }

      // Load staff data
      const staff = await Staff.findOne({ user: userId }).populate('user', 'name email');
      
      if (!staff) {
        return res.status(403).json({
          status: false,
          message: 'Staff profile not found.'
        });
      }

      // Kiểm tra staff có active không
      if (staff.status !== 'ACTIVE') {
        return res.status(403).json({
          status: false,
          message: 'Staff account is not active.'
        });
      }

      // Attach staff data to request
      req.staffData = {
        id: staff._id,
        staffId: staff.staffId,
        staffType: staff.staffType,
        department: staff.department,
        status: staff.status
      };
      
      next();
    } catch (error) {
      console.error('Error in ensureStaff middleware:', error);
      res.status(500).json({
        status: false,
        message: 'Error verifying staff credentials'
      });
    }
  };

  /**
   * Middleware kiểm tra staff type permissions
   * Chỉ cho phép staff type được chỉ định
   */
  checkStaffTypePermission = (allowedTypes = []) => {
    return async (req, res, next) => {
      try {
        const staffType = req.staffData?.staffType;
        
        if (!staffType) {
          return res.status(403).json({
            status: false,
            message: 'Staff type not found in request.'
          });
        }

        // Validate staff type
        if (!Object.values(STAFF_TYPES).includes(staffType)) {
          return res.status(403).json({
            status: false,
            message: 'Invalid staff type.'
          });
        }
        
        if (allowedTypes.length > 0 && !allowedTypes.includes(staffType)) {
          return res.status(403).json({
            status: false,
            message: `Access denied. This action is only for: ${allowedTypes.join(' or ')} staff.`,
            yourType: staffType,
            requiredTypes: allowedTypes
          });
        }
        
        next();
      } catch (error) {
        console.error('Error in checkStaffTypePermission middleware:', error);
        res.status(500).json({
          status: false,
          message: 'Error checking staff permissions'
        });
      }
    };
  };

  /**
   * Middleware đảm bảo chỉ CTSV staff có thể truy cập
   */
  ensureCTSVStaff = async (req, res, next) => {
    if (req.staffData?.staffType !== STAFF_TYPES.CTSV) {
      return res.status(403).json({
        status: false,
        message: 'Access denied. CTSV staff only.'
      });
    }
    next();
  };

  /**
   * Middleware đảm bảo chỉ KTX staff có thể truy cập
   */
  ensureKTXStaff = async (req, res, next) => {
    if (req.staffData?.staffType !== STAFF_TYPES.KTX) {
      return res.status(403).json({
        status: false,
        message: 'Access denied. KTX staff only.'
      });
    }
    next();
  };

  /**
   * Middleware rate limiting cho staff actions
   */
  rateLimitStaffActions = (maxRequests = 100, windowMs = 15 * 60 * 1000) => {
    const requests = new Map();
    
    return (req, res, next) => {
      const userId = req.userData?.id;
      if (!userId) return next();

      const now = Date.now();
      const windowStart = now - windowMs;
      
      if (!requests.has(userId)) {
        requests.set(userId, []);
      }
      
      const userRequests = requests.get(userId);
      
      // Loại bỏ requests cũ
      const validRequests = userRequests.filter(time => time > windowStart);
      
      if (validRequests.length >= maxRequests) {
        return res.status(429).json({
          status: false,
          message: 'Too many requests. Please try again later.',
          retryAfter: Math.ceil(windowMs / 1000)
        });
      }
      
      validRequests.push(now);
      requests.set(userId, validRequests);
      
      next();
    };
  };

  /**
   * Middleware sanitize input data
   */
  sanitizeInput = (req, res, next) => {
    // Sanitize các field input để tránh XSS
    if (req.body) {
      for (const key in req.body) {
        if (typeof req.body[key] === 'string') {
          req.body[key] = req.body[key].trim();
        }
      }
    }
    
    if (req.query) {
      for (const key in req.query) {
        if (typeof req.query[key] === 'string') {
          req.query[key] = req.query[key].trim();
        }
      }
    }
    
    next();
  };

  /**
   * Middleware xử lý response format chuẩn
   */
  formatResponse = (req, res, next) => {
    const originalJson = res.json;
    
    res.json = function(data) {
      // Ensure consistent response format
      if (!data.hasOwnProperty('status')) {
        data.status = true;
      }
      
      if (!data.hasOwnProperty('timestamp')) {
        data.timestamp = new Date().toISOString();
      }

      // Add staff info to response if available
      if (req.staffData && !data.staffInfo) {
        data.staffInfo = {
          staffType: req.staffData.staffType,
          department: req.staffData.department
        };
      }
      
      return originalJson.call(this, data);
    };
    
    next();
  };
}

module.exports = new StaffMiddleware();
