/**
 * Socket Middleware - Dependency Injection cho Socket.IO
 * 
 * Gắn instance io vào req để Controller có thể emit event
 * mà không cần import trực tiếp (tránh Circular Dependency)
 */

/**
 * Middleware gắn Socket.IO instance vào request
 * @param {Object} app - Express app instance
 * @returns {Function} Express middleware
 */
const attachSocketIO = (req, res, next) => {
  // Lấy io từ app settings (được set trong server.js)
  req.io = req.app.get('io');
  next();
};

module.exports = { attachSocketIO };
