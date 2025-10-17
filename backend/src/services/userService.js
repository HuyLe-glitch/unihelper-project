const userRepository = require('../repositories/userRepository');
const { AppError } = require('../utils/appError');

/**
 * User Service - Business Logic Layer
 * Xử lý logic nghiệp vụ liên quan đến User Management
 */
class UserService {
  // Lấy danh sách users với phân trang và filter
  async getUsers(page = 1, limit = 10, filters = {}) {
    // Validation
    if (page < 1 || limit < 1) {
      throw new AppError('Page và limit phải lớn hơn 0', 400);
    }

    if (limit > 100) {
      throw new AppError('Limit không được vượt quá 100', 400);
    }

    const result = await userRepository.findAll(page, limit, filters);

    return {
      success: true,
      message: 'Lấy danh sách users thành công',
      data: result
    };
  }

  // Lấy thông tin user theo ID
  async getUserById(userId) {
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
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
        profile
      }
    };
  }

  // Cập nhật thông tin user
  async updateUser(userId, updateData) {
    const { name, email } = updateData;

    // Validation
    if (!name && !email) {
      throw new AppError('Cần ít nhất một trường để cập nhật', 400);
    }

    // Kiểm tra user tồn tại
    const user = await userRepository.findById(userId);
    if (!user) {
      throw new AppError('Không tìm thấy user', 404);
    }

    // Kiểm tra email mới nếu có
    if (email && email !== user.email) {
      const emailExists = await userRepository.emailExists(email, userId);
      if (emailExists) {
        throw new AppError('Email đã được sử dụng', 400);
      }
    }

    // Cập nhật user
    const updatedUser = await userRepository.update(userId, { name, email });

    return {
      success: true,
      message: 'Cập nhật user thành công',
      data: {
        id: updatedUser._id,
        email: updatedUser.email,
        name: updatedUser.name,
        role: updatedUser.role,
        updatedAt: updatedUser.updatedAt
      }
    };
  }

  // Cập nhật profile của user
  async updateProfile(userId, profileData) {
    // Kiểm tra user tồn tại
    const user = await userRepository.findById(userId);
    if (!user) {
      throw new AppError('Không tìm thấy user', 404);
    }

    // Cập nhật profile theo role
    const updatedProfile = await userRepository.updateProfile(userId, user.role, profileData);

    return {
      success: true,
      message: 'Cập nhật profile thành công',
      data: updatedProfile
    };
  }

  // Tạo profile cho user (admin function)
  async createProfile(userId, profileData) {
    // Kiểm tra user tồn tại
    const user = await userRepository.findById(userId);
    if (!user) {
      throw new AppError('Không tìm thấy user', 404);
    }

    // Kiểm tra đã có profile chưa
    const existingProfile = await userRepository.getProfileByRole(userId, user.role);
    if (existingProfile) {
      throw new AppError('User đã có profile', 400);
    }

    // Tạo profile mới
    const newProfile = await userRepository.createProfile(userId, user.role, profileData);

    return {
      success: true,
      message: 'Tạo profile thành công',
      data: newProfile
    };
  }

  // Xóa user (admin function)
  async deleteUser(userId) {
    // Kiểm tra user tồn tại
    const user = await userRepository.findById(userId);
    if (!user) {
      throw new AppError('Không tìm thấy user', 404);
    }

    // Xóa user
    await userRepository.delete(userId);

    return {
      success: true,
      message: 'Xóa user thành công'
    };
  }

  // Thay đổi role của user (admin function)
  async changeUserRole(userId, newRole) {
    // Validation
    const validRoles = ['STUDENT', 'STAFF', 'ADMIN'];
    if (!validRoles.includes(newRole)) {
      throw new AppError('Role không hợp lệ', 400);
    }

    // Kiểm tra user tồn tại
    const user = await userRepository.findById(userId);
    if (!user) {
      throw new AppError('Không tìm thấy user', 404);
    }

    if (user.role === newRole) {
      throw new AppError('User đã có role này rồi', 400);
    }

    // Cập nhật role
    const updatedUser = await userRepository.update(userId, { role: newRole });

    return {
      success: true,
      message: 'Thay đổi role thành công',
      data: {
        id: updatedUser._id,
        email: updatedUser.email,
        name: updatedUser.name,
        role: updatedUser.role,
        updatedAt: updatedUser.updatedAt
      }
    };
  }

  // Tìm kiếm users
  async searchUsers(searchTerm, page = 1, limit = 10) {
    if (!searchTerm || searchTerm.trim().length < 2) {
      throw new AppError('Từ khóa tìm kiếm phải có ít nhất 2 ký tự', 400);
    }

    const filters = {
      $or: [
        { name: { $regex: searchTerm, $options: 'i' } },
        { email: { $regex: searchTerm, $options: 'i' } }
      ]
    };

    const result = await userRepository.findAll(page, limit, filters);

    return {
      success: true,
      message: 'Tìm kiếm users thành công',
      data: result
    };
  }
}

module.exports = new UserService();
