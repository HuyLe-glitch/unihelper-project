const userRepository = require('../repositories/userRepository');
const jwt = require('jsonwebtoken');
const { AppError } = require('../utils/appError');

/**
 * Auth Service - Business Logic Layer
 * Xử lý logic nghiệp vụ liên quan đến Authentication
 */
class AuthService {
  // Đăng nhập
  async login(email, password) {
    // Validation
    if (!email || !password) {
      throw new AppError('Email và password là bắt buộc', 400);
    }

    // Tìm user theo email
    const user = await userRepository.findByEmail(email);
    if (!user) {
      throw new AppError('Email hoặc password không đúng', 401);
    }

    // Kiểm tra password
    const isPasswordMatch = await user.matchPassword(password);
    if (!isPasswordMatch) {
      throw new AppError('Email hoặc password không đúng', 401);
    }

    // Lấy profile theo role
    const profile = await userRepository.getProfileByRole(user._id, user.role);

    // Tạo JWT token
    const token = this.generateToken(user._id, user.role);

    return {
      success: true,
      message: 'Đăng nhập thành công',
      data: {
        token,
        user: {
          id: user._id,
          email: user.email,
          name: user.name,
          role: user.role,
          profile
        }
      }
    };
  }

  // Xác thực token
  async verifyToken(token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await userRepository.findById(decoded.id);

      if (!user) {
        throw new AppError('Token không hợp lệ', 401);
      }

      return {
        success: true,
        data: {
          id: user._id,
          email: user.email,
          name: user.name,
          role: user.role
        }
      };
    } catch (error) {
      if (error.name === 'JsonWebTokenError') {
        throw new AppError('Token không hợp lệ', 401);
      }
      if (error.name === 'TokenExpiredError') {
        throw new AppError('Token đã hết hạn', 401);
      }
      throw error;
    }
  }

  // Lấy thông tin user hiện tại
  async getCurrentUser(userId) {
    const user = await userRepository.findById(userId);
    if (!user) {
      throw new AppError('Không tìm thấy user', 404);
    }

    const profile = await userRepository.getProfileByRole(userId, user.role);

    return {
      success: true,
      data: {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
        profile
      }
    };
  }

  // Đổi password
  async changePassword(userId, currentPassword, newPassword) {
    // Validation
    if (!currentPassword || !newPassword) {
      throw new AppError('Password hiện tại và password mới là bắt buộc', 400);
    }

    if (newPassword.length < 6) {
      throw new AppError('Password mới phải có ít nhất 6 ký tự', 400);
    }

    // Tìm user
    const user = await userRepository.findById(userId);
    if (!user) {
      throw new AppError('Không tìm thấy user', 404);
    }

    // Kiểm tra password hiện tại
    const isCurrentPasswordMatch = await user.matchPassword(currentPassword);
    if (!isCurrentPasswordMatch) {
      throw new AppError('Password hiện tại không đúng', 400);
    }

    // Cập nhật password mới
    await userRepository.update(userId, { password: newPassword });

    return {
      success: true,
      message: 'Đổi password thành công'
    };
  }

  // Tạo JWT token
  generateToken(userId, role) {
    return jwt.sign(
      { id: userId, role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE || '7d' }
    );
  }
}

module.exports = new AuthService();
