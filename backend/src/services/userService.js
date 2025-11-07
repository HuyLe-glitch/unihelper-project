const userRepository = require('../repositories/userRepository');
const { AppError } = require('../utils/appError');
const Student = require('../models/Student');
const Staff = require('../models/Staff');
const Address = require('../models/Address');
const Citizen = require('../models/Citizen');
const Department = require('../models/Department');
const StaffRole = require('../models/StaffRole');
const mongoose = require('mongoose');

/**
 * User Service - Business Logic Layer
 * Xử lý logic nghiệp vụ liên quan đến User Management
 */
class UserService {
  // Create new user (admin)
  async createUser(payload = {}) {
    try {
      const { name, email, password, role = 'STUDENT', ...profile } = payload;

      if (!name || !email || !password) {
        throw new AppError('Missing required fields: name, email, password', 400);
      }

      const emailNorm = String(email).toLowerCase();

      const exists = await userRepository.findByEmail(emailNorm);
      if (exists) throw new AppError('Email đã được sử dụng', 400);

      // Tạo user (KHÔNG dùng session)
      const User = require('../models/User');
      const createdUser = await User.create({ name, email: emailNorm, password, role });

      // Nếu là Student hoặc Staff → tạo profile
      let createdProfile = null;
      if (role === 'STUDENT' || role === 'STAFF') {
        if (role === 'STUDENT') {
          const requiredFields = ['studentId', 'major', 'academicYear', 'faculty', 'dateOfBirth'];
          const missing = requiredFields.filter(f => !profile || !profile[f]);
          if (missing.length) {
            throw new AppError(`Missing student fields: ${missing.join(', ')}`, 400);
          }

          // Tạo Student (KHÔNG dùng session)
          createdProfile = await Student.create({ user: createdUser._id, ...profile });

        } else {
          // STAFF BRANCH
          const requiredFields = ['staffId', 'staffType'];
          const missing = requiredFields.filter(f => !profile[f]);
          if (missing.length) {
            throw new AppError(`Missing staff fields: ${missing.join(', ')}`, 400);
          }

          // Xử lý department
          if (profile.department && typeof profile.department === 'string') {
            const deptDoc = await Department.findOne({
              name: profile.department,
              staffType: profile.staffType
            });

            if (deptDoc) {
              profile.department = deptDoc._id;
            } else {
              // Tạo department mới
              const newDept = await Department.create({
                name: profile.department,
                staffType: profile.staffType
              });
              profile.department = newDept._id;
            }
          }

          // Tạo Staff (KHÔNG dùng session)
          createdProfile = await Staff.create({ user: createdUser._id, ...profile });

          // Thêm staff vào department
          if (profile.department) {
            await Department.findByIdAndUpdate(
              profile.department,
              { $addToSet: { staffMembers: createdProfile._id } }
            );
          }
        }
      }

      return {
        success: true,
        message: 'Tạo user thành công',
        data: {
          id: createdUser._id,
          name: createdUser.name,
          email: createdUser.email,
          role: createdUser.role,
          profileId: createdProfile ? createdProfile._id : null
        }
      };
    } catch (error) {
      throw error;
    }
  }

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
