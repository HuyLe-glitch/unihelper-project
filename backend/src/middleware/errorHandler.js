const { AppError } = require('../utils/appError');

/**
 * Global Error Handler Middleware
 * Xử lý tất cả các lỗi trong ứng dụng
 */

// Xử lý lỗi CastError của MongoDB (ObjectId không hợp lệ)
const handleCastErrorDB = (err) => {
  const message = `Invalid ${err.path}: ${err.value}`;
  return new AppError(message, 400);
};

// Xử lý lỗi Duplicate field của MongoDB
const handleDuplicateFieldsDB = (err) => {
  const value = err.errmsg.match(/(["'])(\\?.)*?\1/)[0];
  const message = `Duplicate field value: ${value}. Please use another value!`;
  return new AppError(message, 400);
};

// Xử lý lỗi Validation của MongoDB
const handleValidationErrorDB = (err) => {
  const errors = Object.values(err.errors).map(el => el.message);
  const message = `Invalid input data. ${errors.join('. ')}`;
  return new AppError(message, 400);
};

// Xử lý lỗi JWT
const handleJWTError = () =>
  new AppError('Token không hợp lệ. Vui lòng đăng nhập lại!', 401);

const handleJWTExpiredError = () =>
  new AppError('Token đã hết hạn! Vui lòng đăng nhập lại.', 401);

// Gửi lỗi trong môi trường development
const sendErrorDev = (err, res) => {
  res.status(err.statusCode).json({
    status: err.status,
    error: err,
    message: err.message,
    stack: err.stack
  });
};

// Gửi lỗi trong môi trường production
const sendErrorProd = (err, res) => {
  // Lỗi có thể kiểm soát được: gửi message cho client
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message
    });
  } else {
    // Lỗi programming: không tiết lộ chi tiết cho client
    console.error('ERROR 💥', err);

    res.status(500).json({
      status: 'error',
      message: 'Something went wrong!'
    });
  }
};

// Main error handler
module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, res);
  } else {
    let error = { ...err };
    error.message = err.message;

    // MongoDB CastError
    if (error.name === 'CastError') error = handleCastErrorDB(error);

    // MongoDB duplicate fields
    if (error.code === 11000) error = handleDuplicateFieldsDB(error);

    // MongoDB validation error
    if (error.name === 'ValidationError') error = handleValidationErrorDB(error);

    // JWT errors
    if (error.name === 'JsonWebTokenError') error = handleJWTError();
    if (error.name === 'TokenExpiredError') error = handleJWTExpiredError();

    sendErrorProd(error, res);
  }
};
