const Room = require('../models/Room');

/**
 * Room Repository - Tương tác với Database
 * Chỉ chứa các operation CRUD, không có business logic
 */
const roomRepository = {
  /**
   * Lấy tất cả phòng
   */
  getAllRooms: async (filters = {}) => {
    const query = {};
    
    if (filters.status) {
      query.status = filters.status;
    }
    if (filters.categoryId) {
      query.categoryId = filters.categoryId;
    }

    return await Room.find(query)
      .sort({ name: 1 });
  },

  /**
   * Lấy phòng theo ID
   */
  getRoomById: async (roomId) => {
    return await Room.findById(roomId);
  },

  /**
   * Tạo phòng mới
   */
  createRoom: async (roomData) => {
    const room = new Room(roomData);
    return await room.save();
  },

  /**
   * Cập nhật phòng
   */
  updateRoom: async (roomId, updateData) => {
    return await Room.findByIdAndUpdate(
      roomId,
      updateData,
      { new: true, runValidators: true }
    );
  },

  /**
   * Xóa phòng
   */
  deleteRoom: async (roomId) => {
    return await Room.findByIdAndDelete(roomId);
  },

  /**
   * Kiểm tra tên phòng đã tồn tại
   * @param {string} name - Tên phòng
   * @param {string} excludeId - ID phòng cần loại trừ (khi update)
   */
  checkRoomNameExists: async (name, excludeId = null) => {
    const query = { name: name.trim().toUpperCase() };
    if (excludeId) {
      query._id = { $ne: excludeId };
    }
    return await Room.findOne(query);
  },

  /**
   * Lấy thống kê phòng
   */
  getRoomStats: async () => {
    const stats = await Room.aggregate([
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          available: { 
            $sum: { $cond: [{ $eq: ['$status', 'AVAILABLE'] }, 1, 0] }
          },
          full: { 
            $sum: { $cond: [{ $eq: ['$status', 'FULL'] }, 1, 0] }
          },
          maintenance: { 
            $sum: { $cond: [{ $eq: ['$status', 'MAINTENANCE'] }, 1, 0] }
          },
          totalCapacity: { $sum: '$capacity' },
          totalOccupied: { $sum: '$occupied' }
        }
      }
    ]);

    return stats[0] || {
      total: 0,
      available: 0,
      full: 0,
      maintenance: 0,
      totalCapacity: 0,
      totalOccupied: 0
    };
  },

  /**
   * Tìm phòng còn trống
   */
  findAvailableRooms: async (categoryId = null) => {
    const query = {
      status: 'AVAILABLE',
      $expr: { $lt: ['$occupied', '$capacity'] }
    };
    
    if (categoryId) {
      query.categoryId = categoryId;
    }

    return await Room.find(query)
      .sort({ name: 1 });
  },

  /**
   * Đếm số phòng theo điều kiện
   */
  countRooms: async (filters = {}) => {
    const query = {};
    if (filters.status) query.status = filters.status;
    
    return await Room.countDocuments(query);
  }
};

module.exports = roomRepository;
