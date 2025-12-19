const userRepository = require('../repositories/userRepository');
const { AppError } = require('../utils/appError');
const Student = require('../models/Student');
const Staff = require('../models/Staff');
// Department model đã được xóa - hệ thống chỉ có 2 staff cố định
const mongoose = require('mongoose');

/**
 * User Service - Business Logic Layer
 * Xử lý logic nghiệp vụ liên quan đến User Management
 */
class UserService {
  // New createUser method
  async createUser(payload = {}) {
    try {
      const { email, password, role = 'ADMIN' } = payload;

      // Only admin creation is allowed here
      if (role !== 'ADMIN') {
        throw new AppError('Use studentService or staffService to create this role', 400);
      }

      if (!email || !password) {
        throw new AppError('Missing required fields: email, password', 400);
      }

      const emailNorm = email.toLowerCase().trim();

      const exists = await userRepository.findByEmail(emailNorm);
      if (exists) throw new AppError('Email đã được sử dụng', 400);

      const createdUser = await User.create({
        email: emailNorm,
        password,
        role: 'ADMIN',
        isActive: true
      });

      const obj = createdUser.toObject();
      delete obj.password;

      return {
        success: true,
        message: 'Admin created',
        data: obj
      };
    } catch (err) {
      throw err instanceof AppError ? err : new AppError(err.message, 500);
    }
  }

  // Create new user (admin)
  /*async createUser(payload = {}) {
    try {
      const { name, email, password, role = 'STUDENT' } = payload;

      // Build profile from either payload.profile or top-level known keys
      let profile = {};
      if (payload.profile && typeof payload.profile === 'object') {
        profile = { ...payload.profile };
      } else {
        const keys = [
          'studentId', 'major', 'academicYear', 'className', 'dateOfBirth',
          'phone', 'address', 'citizenId', 'enrollmentDate',
          'staffId', 'staffType', 'department', 'staffRole', 'status'
        ];
        for (const k of keys) {
          if (Object.prototype.hasOwnProperty.call(payload, k)) profile[k] = payload[k];
        }
      }

      // Basic required fields
      if (!name || !email || !password) {
        throw new AppError('Missing required fields: name, email, password', 400);
      }

      const emailNorm = String(email).toLowerCase();

      // Check email uniqueness
      const exists = await userRepository.findByEmail(emailNorm);
      if (exists) throw new AppError('Email đã được sử dụng', 400);

      // Create user
      const User = require('../models/User');
      const createdUser = await User.create({ name, email: emailNorm, password, role });

      // Create profile if role requires it
      let createdProfile = null;
      if (role === 'STUDENT') {
        // validate required student profile fields
        const requiredFields = ['studentId', 'major', 'academicYear', 'className', 'dateOfBirth'];
        const missing = requiredFields.filter(f => {
          const v = profile[f];
          return v === undefined || v === null || (typeof v === 'string' && v.trim() === '');
        });
        if (missing.length) {
          // rollback user creation (best-effort)
          await User.findByIdAndDelete(createdUser._id).catch(() => { });
          throw new AppError(`Missing student fields: ${missing.join(', ')}`, 400);
        }

        // ensure user doesn't already have student profile
        const existingStudent = await Student.findOne({ user: createdUser._id });
        if (existingStudent) {
          await User.findByIdAndDelete(createdUser._id).catch(() => { });
          throw new AppError('Student profile already exists for this user', 400);
        }

        // Ensure major id/exists is not strictly enforced here (studentService may handle), but try to be helpful
        // create student profile
        createdProfile = await Student.create({ user: createdUser._id, ...profile });
      } else if (role === 'STAFF') {
        // validate required staff profile fields
        const requiredFields = ['staffId', 'staffType', 'department'];
        const missing = requiredFields.filter(f => {
          const v = profile[f];
          return v === undefined || v === null || (typeof v === 'string' && v.trim() === '');
        });
        if (missing.length) {
          await User.findByIdAndDelete(createdUser._id).catch(() => { });
          throw new AppError(`Missing staff fields: ${missing.join(', ')}`, 400);
        }

        // verify department exists
        if (!mongoose.Types.ObjectId.isValid(String(profile.department))) {
          await User.findByIdAndDelete(createdUser._id).catch(() => { });
          throw new AppError('Invalid department id', 400);
        }
        const dept = await Department.findById(profile.department);
        if (!dept) {
          await User.findByIdAndDelete(createdUser._id).catch(() => { });
          throw new AppError('Department not found', 404);
        }

        // ensure staffId uniqueness
        const existingStaff = await Staff.findOne({ staffId: profile.staffId });
        if (existingStaff) {
          await User.findByIdAndDelete(createdUser._id).catch(() => { });
          throw new AppError('Staff ID already exists', 400);
        }

        createdProfile = await Staff.create({ user: createdUser._id, ...profile });
      }

      // remove sensitive fields before returning
      const userObj = createdUser.toObject ? createdUser.toObject() : createdUser;
      if (userObj.password) delete userObj.password;

      return {
        success: true,
        message: 'User created',
        data: {
          user: userObj,
          profile: createdProfile
        }
      };
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError(error.message || 'Internal server error', 500);
    }
  } */

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

    // Tạo object chỉ chứa các field cần update
    const dataToUpdate = {};
    if (name) dataToUpdate.name = name;
    if (email) dataToUpdate.email = email;

    // Cập nhật user
    const updatedUser = await userRepository.update(userId, dataToUpdate);

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

    // Xóa user và profile liên quan
    await userRepository.deleteWithProfile(userId);

    return {
      success: true,
      message: 'Xóa user và profile liên quan thành công'
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
