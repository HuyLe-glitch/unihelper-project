const { validationResult } = require('express-validator');

class StaffMiddleware {

  /**
   * Middleware logging cho staff endpoints
   */
  logStaffActivity = (action) => {
    return (req, res, next) => {
      const timestamp = new Date().toISOString();
      const userId = req.userData?.id; // Use .id
      const ip = req.ip || req.connection.remoteAddress;
      
      console.log(`[${timestamp}] Staff ${action} - User: ${userId}, IP: ${ip}`);
      
      // Có thể lưu log vào database hoặc file
      // TODO: Implement proper logging mechanism
      
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
   */
  ensureStaff = async (req, res, next) => {
    try {
      const userId = req.userData.id; // Use .id instead of ._id
      
      // Check if user role is STAFF
      if (!req.userData.role || req.userData.role !== 'STAFF') {
        return res.status(403).json({
          status: false,
          message: 'Access denied. Staff privileges required.'
        });
      }
      
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
   */
  checkStaffTypePermission = (allowedTypes = []) => {
    return async (req, res, next) => {
      try {
        // TODO: Get staff type from database based on userId
        const staffType = req.userData.staffType; // Giả sử có trong JWT
        
        if (allowedTypes.length > 0 && !allowedTypes.includes(staffType)) {
          return res.status(403).json({
            status: false,
            message: `Access denied. Required staff type: ${allowedTypes.join(' or ')}`
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
   * Middleware rate limiting cho staff actions
   */
  rateLimitStaffActions = (maxRequests = 100, windowMs = 15 * 60 * 1000) => {
    const requests = new Map();
    
    return (req, res, next) => {
      const userId = req.userData.id; // Use .id
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
      
      return originalJson.call(this, data);
    };
    
    next();
  };
}

module.exports = new StaffMiddleware();