const jwt = require('jsonwebtoken');
const userRepository = require('../repositories/userRepository');
const { AppError, catchAsync } = require('../utils/appError');
// THis file?
/**
 * Middleware xác thực token
 * Kiểm tra JWT token và lưu thông tin user vào req.userData
 */
exports.protect = catchAsync(async (req, res, next) => {
  // Lấy token từ header
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    throw new AppError('Vui lòng đăng nhập để truy cập', 401);
  }

  // Xác thực token
  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      throw new AppError('Token không hợp lệ', 401);
    }
    if (error.name === 'TokenExpiredError') {
      throw new AppError('Token đã hết hạn', 401);
    }
    throw new AppError('Xác thực token thất bại', 401);
  }

  // Compatibility: token may carry id, _id, sub or nested user object
  const userIdFromToken = decoded.id || decoded._id || decoded.sub || (decoded.user && (decoded.user.id || decoded.user._id));
  if (!userIdFromToken) {
    throw new AppError('Token payload không chứa user id', 401);
  }

  // Kiểm tra user còn tồn tại không
  //const user = await userRepository.findById(decoded.id);
  const user = await userRepository.findById(userIdFromToken);
  if (!user) {
    throw new AppError('User không tồn tại', 401);
  }

  // Lưu thông tin user vào request
  req.userData = {
    id: user._id,
    email: user.email,
    name: user.name,
    role: user.role
  };

  // compatibility alias for code expecting req.user
  req.user = user;
  req.token = token;
  next();
});

/**
 * Middleware phân quyền
 * Kiểm tra role của user có quyền truy cập không
 */
exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!req.userData) {
      throw new AppError('Vui lòng đăng nhập trước', 401);
    }

    if (!roles.includes(req.userData.role)) {
      throw new AppError('Bạn không có quyền thực hiện hành động này', 403);
    }

    next();
  };
};

/**
 * Middleware kiểm tra user có phải là chính mình không
 * Cho phép user truy cập thông tin của chính mình hoặc admin truy cập tất cả
 */
exports.restrictToOwnerOrAdmin = (req, res, next) => {
  const userId = req.params.id;
  const currentUser = req.userData;

  if (currentUser.role === 'ADMIN' || currentUser.id.toString() === userId) {
    return next();
  }

  throw new AppError('Bạn chỉ có thể truy cập thông tin của chính mình', 403);
};
