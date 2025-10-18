const authService = require('../services/authService');
const { catchAsync } = require('../utils/appError');

/**
 * Auth Controller - Presentation Layer
 * Xử lý HTTP requests/responses cho Authentication
 */
class AuthController {
  // Add this method to your AuthController class
  loginStudent = catchAsync(async (req, res) => {
    const { studentId, password } = req.body;
    const result = await authService.loginWithStudentId(studentId, password);

    res.status(200).json(result);
  });

  // Đăng nhập
  login = catchAsync(async (req, res) => {
    const { email, password } = req.body;

    const result = await authService.login(email, password);

    res.status(200).json(result);
  });

  // Lấy thông tin user hiện tại
  getCurrentUser = catchAsync(async (req, res) => {
    const result = await authService.getCurrentUser(req.userData.id);

    res.status(200).json(result);
  });

  // Đổi password
  changePassword = catchAsync(async (req, res) => {
    const { currentPassword, newPassword } = req.body;

    const result = await authService.changePassword(
      req.userData.id,
      currentPassword,
      newPassword
    );

    res.status(200).json(result);
  });

  // Xác thực token (middleware sẽ gọi)
  verifyToken = catchAsync(async (req, res) => {
    const result = await authService.verifyToken(req.token);

    res.status(200).json(result);
  });
}

module.exports = new AuthController();
