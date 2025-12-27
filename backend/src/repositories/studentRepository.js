const Student = require('../models/Student');

/**
 * Student Repository - Chỉ xử lý CRUD với Database
 * Không chứa business logic
 */
class StudentRepository {
  /**
   * Tạo sinh viên mới
   */
  async create(data) {
    const doc = new Student(data);
    return doc.save();
  }

  /**
   * Lấy danh sách sinh viên với phân trang và filter
   */
  async findAll({ skip = 0, limit = 20, filters = {} } = {}) {
    const query = { ...filters, isDeleted: false };
    
    const docs = await Student.find(query)
      .populate('user', 'email role isActive')
      .populate({
        path: 'major',
        populate: { path: 'faculty', select: 'name code' }
      })
      .populate('roomId', 'name capacity occupied status')
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 })
      .exec();
    
    const total = await Student.countDocuments(query);
    return { docs, total };
  }

  /**
   * Tìm sinh viên theo ID
   */
  async findById(id) {
    return Student.findById(id)
      .populate('user', 'email role isActive')
      .populate({
        path: 'major',
        populate: { path: 'faculty', select: 'name code' }
      })
      .populate('roomId', 'name capacity occupied status')
      .exec();
  }

  /**
   * Tìm sinh viên theo User ID
   */
  async findByUser(userId) {
    return Student.findOne({ user: userId, isDeleted: false })
      .populate('major')
      .populate('roomId')
      .exec();
  }



  /**
   * Tìm sinh viên theo email (qua User)
   */
  async findByEmail(email) {
    const User = require('../models/User');
    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) return null;
    return Student.findOne({ user: user._id, isDeleted: false }).exec();
  }

  /**
   * Tìm sinh viên theo CCCD
   */
  async findByCitizenId(citizenId, excludeId = null) {
    const query = { citizenId, isDeleted: false };
    if (excludeId) {
      query._id = { $ne: excludeId };
    }
    return Student.findOne(query).exec();
  }

  /**
   * Tìm sinh viên theo số điện thoại
   */
  async findByPhone(phone, excludeId = null) {
    const query = { phone, isDeleted: false };
    if (excludeId) {
      query._id = { $ne: excludeId };
    }
    return Student.findOne(query).exec();
  }

  /**
   * Tìm sinh viên theo tên (exact match, case-insensitive)
   */
  async findByFullName(fullName, excludeId = null) {
    const query = { 
      fullName: { $regex: new RegExp(`^${fullName.trim()}$`, 'i') },
      isDeleted: false 
    };
    if (excludeId) {
      query._id = { $ne: excludeId };
    }
    return Student.findOne(query).exec();
  }

  /**
   * Kiểm tra email tồn tại (trong User)
   */
  async checkEmailExists(email, excludeUserId = null) {
    const User = require('../models/User');
    const query = { email: email.toLowerCase().trim() };
    if (excludeUserId) {
      query._id = { $ne: excludeUserId };
    }
    return User.findOne(query).exec();
  }

  /**
   * Cập nhật sinh viên theo ID
   */
  async updateById(id, updateData) {
    return Student.findByIdAndUpdate(id, updateData, { 
      new: true, 
      runValidators: true 
    })
      .populate('user', 'email role isActive')
      .populate({
        path: 'major',
        populate: { path: 'faculty', select: 'name code' }
      })
      .populate('roomId', 'name capacity occupied status')
      .exec();
  }

  /**
   * Hard Delete sinh viên
   */
  async deleteById(id) {
    return Student.findByIdAndDelete(id).exec();
  }

  /**
   * Lấy sinh viên theo phòng KTX
   */
  async findByRoom(roomId) {
    return Student.find({ roomId, isDormResident: true, isDeleted: false })
      .populate('user', 'email')
      .exec();
  }

  /**
   * Đếm số sinh viên trong phòng
   */
  async countByRoom(roomId) {
    return Student.countDocuments({ roomId, isDormResident: true, isDeleted: false });
  }

  /**
   * Lấy sinh viên ở KTX
   */
  async findDormResidents({ skip = 0, limit = 20, filters = {} } = {}) {
    const query = { ...filters, isDormResident: true, isDeleted: false };
    
    const docs = await Student.find(query)
      .populate('user', 'email role isActive')
      .populate({
        path: 'major',
        populate: { path: 'faculty', select: 'name code' }
      })
      .populate('roomId', 'name capacity occupied status')
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 })
      .exec();
    
    const total = await Student.countDocuments(query);
    return { docs, total };
  }

  // ==========================================
  // BULK OPERATIONS - Import CSV
  // ==========================================

  /**
   * Tìm tất cả emails đã tồn tại trong danh sách (Bulk check)
   * @param {string[]} emails - Danh sách email cần kiểm tra
   * @returns {Set<string>} - Set các email đã tồn tại
   */
  async findExistingEmails(emails) {
    const User = require('../models/User');
    const normalizedEmails = emails.map(e => e.toLowerCase().trim());
    const existingUsers = await User.find({ 
      email: { $in: normalizedEmails } 
    }).select('email').lean();
    return new Set(existingUsers.map(u => u.email.toLowerCase()));
  }

  /**
   * Tìm tất cả CCCD đã tồn tại trong danh sách (Bulk check)
   * @param {string[]} citizenIds - Danh sách CCCD cần kiểm tra
   * @returns {Set<string>} - Set các CCCD đã tồn tại
   */
  async findExistingCitizenIds(citizenIds) {
    const existing = await Student.find({ 
      citizenId: { $in: citizenIds },
      isDeleted: false 
    }).select('citizenId').lean();
    return new Set(existing.map(s => s.citizenId));
  }

  /**
   * Tìm tất cả SĐT đã tồn tại trong danh sách (Bulk check)
   * @param {string[]} phones - Danh sách SĐT cần kiểm tra
   * @returns {Set<string>} - Set các SĐT đã tồn tại
   */
  async findExistingPhones(phones) {
    const existing = await Student.find({ 
      phone: { $in: phones },
      isDeleted: false 
    }).select('phone').lean();
    return new Set(existing.map(s => s.phone));
  }

  /**
   * Tìm tất cả tên đã tồn tại trong danh sách (Bulk check)
   * @param {string[]} names - Danh sách tên cần kiểm tra
   * @returns {Set<string>} - Set các tên đã tồn tại (lowercase)
   */
  async findExistingNames(names) {
    const normalizedNames = names.map(n => n.trim().toLowerCase());
    const existing = await Student.find({ 
      isDeleted: false 
    }).select('fullName').lean();
    
    const existingSet = new Set();
    existing.forEach(s => {
      if (normalizedNames.includes(s.fullName.toLowerCase())) {
        existingSet.add(s.fullName.toLowerCase());
      }
    });
    return existingSet;
  }

  /**
   * Bulk insert nhiều sinh viên (Tối ưu hiệu năng)
   * @param {Object[]} students - Mảng dữ liệu sinh viên
   * @returns {Object[]} - Mảng sinh viên đã tạo
   */
  async bulkInsert(students) {
    return Student.insertMany(students, { ordered: false });
  }

  /**
   * Xóa nhiều sinh viên theo danh sách IDs (Bulk Delete)
   * @param {string[]} ids - Mảng ID sinh viên cần xóa
   * @returns {Object} - Kết quả xóa { deletedCount }
   */
  async bulkDelete(ids) {
    return Student.deleteMany({ _id: { $in: ids } });
  }

  /**
   * Tìm nhiều sinh viên theo danh sách IDs
   * @param {string[]} ids - Mảng ID sinh viên
   * @returns {Object[]} - Mảng sinh viên
   */
  async findByIds(ids) {
    return Student.find({ 
      _id: { $in: ids },
      isDeleted: false 
    })
      .populate('user', 'email')
      .populate('roomId', 'name')
      .exec();
  }

  /**
   * Cập nhật phòng cho nhiều sinh viên (Bulk Update Room)
   * @param {string[]} ids - Mảng ID sinh viên
   * @param {string} roomId - ID phòng mới
   * @returns {Object} - Kết quả cập nhật { modifiedCount }
   */
  async bulkUpdateRoom(ids, roomId) {
    return Student.updateMany(
      { _id: { $in: ids } },
      { 
        $set: { 
          roomId: roomId,
          isDormResident: true 
        } 
      }
    );
  }
}

module.exports = new StudentRepository();
