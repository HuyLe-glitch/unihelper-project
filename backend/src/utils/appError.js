/**
 * Custom Error Class cho ứng dụng
 * Kế thừa từ Error để tạo ra các lỗi có thể kiểm soát được
 */
class AppError extends Error {
  constructor(message, statusCode) {
    super(message);

    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true; // Đánh dấu đây là lỗi có thể xử lý được

    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Async error handler wrapper
 * Bọc các async function để tự động catch lỗi
 */
const catchAsync = (fn) => {
  return (req, res, next) => {
    fn(req, res, next).catch(next);
  };
};

module.exports = {
  AppError,
  catchAsync
};
