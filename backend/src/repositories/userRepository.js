const User = require('../models/User');
const Student = require('../models/Student');
const Staff = require('../models/Staff');
const Admin = require('../models/Admin');
const bcrypt = require('bcryptjs');

/**
 * User Repository - Data Access Layer
 * Xử lý tất cả các thao tác database liên quan đến User
 */
class UserRepository {
  // Helper method để loại bỏ password khỏi user object
  sanitizeUser(user) {
    if (!user) return null;
    const userObject = user.toObject ? user.toObject() : user;
    const { password, ...sanitizedUser } = userObject;
    return sanitizedUser;
  }

  // Helper method để loại bỏ password khỏi array of users
  sanitizeUsers(users) {
    return users.map(user => this.sanitizeUser(user));
  }

  // Hash password helper
  async hashPassword(password) {
    const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS) || 12;
    return await bcrypt.hash(password, saltRounds);
  }

  // Compare password helper
  async comparePassword(plainPassword, hashedPassword) {
    return await bcrypt.compare(plainPassword, hashedPassword);
  }

  // Tìm user theo email - trả về có password để validate
  async findByEmail(email) {
    return await User.findOne({ email });
  }

  // Tìm user theo ID - trả về không có password
  async findById(id) {
    const user = await User.findById(id);
    return this.sanitizeUser(user);
  }

  // Tìm user theo ID với password (cho validation)
  async findByIdWithPassword(id) {
    return await User.findById(id);
  }

  // Tạo user mới với password đã hash
  async create(userData) {
    // Hash password trước khi lưu
    if (userData.password) {
      userData.password = await this.hashPassword(userData.password);
    }

    const user = new User(userData);
    const savedUser = await user.save();
    return this.sanitizeUser(savedUser);
  }

  // Cập nhật user
  async update(id, updateData) {
    // Kiểm tra updateData không rỗng
    if (!updateData || Object.keys(updateData).length === 0) {
      throw new Error('No data to update');
    }

    // Hash password nếu có cập nhật password
    if (updateData.password) {
      updateData.password = await this.hashPassword(updateData.password);
    }

    // Kiểm tra user tồn tại trước khi update
    const existingUser = await User.findById(id);
    if (!existingUser) {
      throw new Error('User not found');
    }

    const updatedUser = await User.findByIdAndUpdate(
      id, 
      updateData, 
      { 
        new: true,
        runValidators: true // Chạy validation
      }
    );
    
    if (!updatedUser) {
      throw new Error('Failed to update user');
    }

    return this.sanitizeUser(updatedUser);
  }
  // Thêm vào UserRepository class
  async deleteWithProfile(userId) {
    const user = await User.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    // Xóa profile theo role trước
    switch (user.role) {
      case 'STUDENT':
        await Student.findOneAndDelete({ user: userId });
        break;
      case 'STAFF':
        await Staff.findOneAndDelete({ user: userId });
        break;
      case 'ADMIN':
        await Admin.findOneAndDelete({ user: userId });
        break;
    }

    // Sau đó xóa user
    return await User.findByIdAndDelete(userId);
  }

  // Lấy tất cả users với pagination - không có password
  async findAll(page = 1, limit = 10, filters = {}) {
    const skip = (page - 1) * limit;
    const users = await User.find(filters)
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    const total = await User.countDocuments(filters);

    return {
      users: this.sanitizeUsers(users),
      total,
      page,
      totalPages: Math.ceil(total / limit)
    };
  }

  // Lấy profile theo role
  async getProfileByRole(userId, role) {
    let profileModel;

    switch (role) {
      case 'STUDENT':
        profileModel = Student;
        break;
      case 'STAFF':
        profileModel = Staff;
        break;
      case 'ADMIN':
        profileModel = Admin;
        break;
      default:
        return null;
    }

    // For Student, need to populate major and faculty
    if (role === 'STUDENT') {
      return await profileModel.findOne({ user: userId })
        .populate({
          path: 'user',
          select: '-password'
        })
        .populate({
          path: 'major',
          populate: {
            path: 'faculty'
          }
        })
        .populate('roomId');
    }

    return await profileModel.findOne({ user: userId }).populate({
      path: 'user',
      select: '-password' // Exclude password from populate
    });
  }

  // Tạo profile theo role
  async createProfile(userId, role, profileData) {
    let profileModel;

    switch (role) {
      case 'STUDENT':
        profileModel = Student;
        break;
      case 'STAFF':
        profileModel = Staff;
        break;
      case 'ADMIN':
        profileModel = Admin;
        break;
      default:
        throw new Error('Invalid role');
    }

    const profile = new profileModel({
      user: userId,
      ...profileData
    });

    return await profile.save();
  }

  // Cập nhật profile
  async updateProfile(userId, role, updateData) {
    let profileModel;

    switch (role) {
      case 'STUDENT':
        profileModel = Student;
        break;
      case 'STAFF':
        profileModel = Staff;
        break;
      case 'ADMIN':
        profileModel = Admin;
        break;
      default:
        throw new Error('Invalid role');
    }

    return await profileModel.findOneAndUpdate(
      { user: userId },
      updateData,
      { new: true }
    ).populate('user', '-password');
  }

  // Xác thực password
  async validatePassword(user, plainPassword) {
    return await this.comparePassword(plainPassword, user.password);
  }

  // Kiểm tra email đã tồn tại
  async emailExists(email, excludeId = null) {
    const query = { email };
    if (excludeId) {
      query._id = { $ne: excludeId };
    }
    const user = await User.findOne(query);
    return !!user;
  }
}

module.exports = new UserRepository();
