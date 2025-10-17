const User = require('../models/User');
const Student = require('../models/Student');
const Staff = require('../models/Staff');
const Admin = require('../models/Admin');

/**
 * User Repository - Data Access Layer
 * Xử lý tất cả các thao tác database liên quan đến User
 */
class UserRepository {
  // Tìm user theo email
  async findByEmail(email) {
    return await User.findOne({ email });
  }

  // Tìm user theo ID
  async findById(id) {
    return await User.findById(id);
  }

  // Tạo user mới
  async create(userData) {
    const user = new User(userData);
    return await user.save();
  }

  // Cập nhật user
  async update(id, updateData) {
    return await User.findByIdAndUpdate(id, updateData, { new: true });
  }

  // Xóa user
  async delete(id) {
    return await User.findByIdAndDelete(id);
  }

  // Lấy tất cả users với pagination
  async findAll(page = 1, limit = 10, filters = {}) {
    const skip = (page - 1) * limit;
    const users = await User.find(filters)
      .select('-password')
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    const total = await User.countDocuments(filters);

    return {
      users,
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

    return await profileModel.findOne({ user: userId }).populate('user', '-password');
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
