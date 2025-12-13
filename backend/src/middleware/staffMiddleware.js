const { validationResult } = require('express-validator');
const Staff = require('../models/Staff');
const { STAFF_TYPES } = require('../constants/modelConstants');

/**
 * Staff Middleware
 * 
 * Hệ thống chỉ có 2 staff CỐ ĐỊNH:
 * - Staff CTSV: Xử lý yêu cầu Công tác Sinh viên
 * - Staff KTX: Xử lý yêu cầu Ký túc xá
 */
class StaffMiddleware {

  /**
   * Middleware logging
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
   * Middleware kiểm tra user là staff và load staff data
   */
  ensureStaff = async (req, res, next) => {
    try {
      const userId = req.userData?.id;
      
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

      if (staff.status !== 'ACTIVE') {
        return res.status(403).json({
          status: false,
          message: 'Staff account is not active.'
        });
      }

      // Attach staff data
      req.staffData = {
        id: staff._id,
        staffId: staff.staffId,
        staffType: staff.staffType,
        department: staff.department,
        status: staff.status
      };
      
      next();
    } catch (error) {
      console.error('Error in ensureStaff:', error);
      res.status(500).json({
        status: false,
        message: 'Error verifying staff credentials'
      });
    }
  };

  /**
   * Middleware kiểm tra staff type
   */
  checkStaffTypePermission = (allowedTypes = []) => {
    return async (req, res, next) => {
      try {
        const staffType = req.staffData?.staffType;
        
        if (!staffType) {
          return res.status(403).json({
            status: false,
            message: 'Staff type not found.'
          });
        }

        if (!Object.values(STAFF_TYPES).includes(staffType)) {
          return res.status(403).json({
            status: false,
            message: 'Invalid staff type.'
          });
        }
        
        if (allowedTypes.length > 0 && !allowedTypes.includes(staffType)) {
          return res.status(403).json({
            status: false,
            message: `Access denied. This action is for ${allowedTypes.join(' or ')} staff only.`,
            yourType: staffType
          });
        }
        
        next();
      } catch (error) {
        console.error('Error in checkStaffTypePermission:', error);
        res.status(500).json({
          status: false,
          message: 'Error checking staff permissions'
        });
      }
    };
  };

  /**
   * Rate limiting
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
   * Sanitize input
   */
  sanitizeInput = (req, res, next) => {
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
   * Format response
   */
  formatResponse = (req, res, next) => {
    const originalJson = res.json;
    
    res.json = function(data) {
      if (!data.hasOwnProperty('status')) {
        data.status = true;
      }
      
      if (!data.hasOwnProperty('timestamp')) {
        data.timestamp = new Date().toISOString();
      }

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
