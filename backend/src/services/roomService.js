const roomRepository = require('../repositories/roomRepository');

/**
 * Helper function để tạo operational error với field
 * Quan trọng: isOperational = true để errorHandler trả về message đúng
 */
const createError = (message, statusCode, field = null, extra = {}) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  error.status = statusCode >= 500 ? 'error' : 'fail';
  error.isOperational = true;
  if (field) {
    error.field = field;
  }
  Object.assign(error, extra);
  return error;
};

/**
 * Room Service - Business Logic Layer
 * Xử lý toàn bộ logic nghiệp vụ: check trùng tên, validate business rules
 */
const roomService = {
  /**
   * Lấy tất cả phòng
   */
  getAllRooms: async (filters = {}) => {
    // Parse filters
    const parsedFilters = {};
    if (filters.status) parsedFilters.status = filters.status;
    if (filters.categoryId) parsedFilters.categoryId = filters.categoryId;

    const rooms = await roomRepository.getAllRooms(parsedFilters);
    return {
      success: true,
      count: rooms.length,
      data: rooms
    };
  },

  /**
   * Lấy phòng theo ID
   */
  getRoomById: async (roomId) => {
    const room = await roomRepository.getRoomById(roomId);
    if (!room) {
      throw createError('Không tìm thấy phòng', 404);
    }
    return { success: true, data: room };
  },

  /**
   * Tạo phòng mới - CORE BUSINESS LOGIC
   * Check trùng tên phòng nằm ở đây
   */
  createRoom: async (roomData) => {
    const { name, capacity, occupied = 0 } = roomData;

    // 1. BUSINESS LOGIC: Check trùng tên phòng
    const normalizedName = name.trim().toUpperCase();
    const existingRoom = await roomRepository.checkRoomNameExists(normalizedName);
    if (existingRoom) {
      throw createError(
        `Tên phòng "${normalizedName}" đã tồn tại trong hệ thống`,
        409,
        'name'
      );
    }

    // 2. BUSINESS LOGIC: Validate occupied không vượt quá capacity
    if (occupied > capacity) {
      throw createError(
        `Số người đang ở (${occupied}) không thể vượt quá sức chứa (${capacity})`,
        400,
        'occupied'
      );
    }

    // 3. Chuẩn hóa dữ liệu
    const roomToCreate = {
      ...roomData,
      name: normalizedName,
      // Auto set status dựa trên occupied/capacity
      status: occupied >= capacity ? 'FULL' : 'AVAILABLE'
    };

    // 4. Tạo phòng
    const newRoom = await roomRepository.createRoom(roomToCreate);
    const populatedRoom = await roomRepository.getRoomById(newRoom._id);

    return {
      success: true,
      message: 'Tạo phòng thành công',
      data: populatedRoom
    };
  },

  /**
   * Cập nhật phòng - CORE BUSINESS LOGIC
   * Check trùng tên phòng (trừ chính nó)
   */
  updateRoom: async (roomId, updateData) => {
    // 1. Kiểm tra phòng tồn tại
    const existingRoom = await roomRepository.getRoomById(roomId);
    if (!existingRoom) {
      throw createError('Không tìm thấy phòng', 404);
    }

    // 2. BUSINESS LOGIC: Check trùng tên nếu có update tên
    if (updateData.name && updateData.name.trim().toUpperCase() !== existingRoom.name) {
      const normalizedName = updateData.name.trim().toUpperCase();
      const duplicateRoom = await roomRepository.checkRoomNameExists(normalizedName, roomId);
      if (duplicateRoom) {
        throw createError(
          `Tên phòng "${normalizedName}" đã tồn tại trong hệ thống`,
          409,
          'name'
        );
      }
      updateData.name = normalizedName;
    }

    // 3. BUSINESS LOGIC: Validate occupied không vượt quá capacity
    const newOccupied = updateData.occupied !== undefined ? updateData.occupied : existingRoom.occupied;
    const newCapacity = updateData.capacity !== undefined ? updateData.capacity : existingRoom.capacity;
    
    if (newOccupied > newCapacity) {
      throw createError(
        `Số người đang ở (${newOccupied}) không thể vượt quá sức chứa (${newCapacity})`,
        400,
        'occupied'
      );
    }

    // 4. Auto update status nếu cần (trừ khi đang MAINTENANCE)
    if (existingRoom.status !== 'MAINTENANCE') {
      if (newOccupied >= newCapacity) {
        updateData.status = 'FULL';
      } else {
        updateData.status = 'AVAILABLE';
      }
    }

    // 5. Cập nhật
    const updatedRoom = await roomRepository.updateRoom(roomId, updateData);
    return {
      success: true,
      message: 'Cập nhật phòng thành công',
      data: updatedRoom
    };
  },

  /**
   * Xóa phòng
   */
  deleteRoom: async (roomId) => {
    const room = await roomRepository.getRoomById(roomId);
    if (!room) {
      throw createError('Không tìm thấy phòng', 404);
    }

    // BUSINESS LOGIC: Không cho xóa phòng đang có người ở
    if (room.occupied > 0) {
      throw createError(
        `Không thể xóa phòng đang có ${room.occupied} người ở. Vui lòng chuyển sinh viên sang phòng khác trước.`,
        400
      );
    }

    await roomRepository.deleteRoom(roomId);
    return { success: true, message: 'Xóa phòng thành công' };
  },

  /**
   * Lấy thống kê phòng
   */
  getRoomStats: async () => {
    const stats = await roomRepository.getRoomStats();
    return {
      success: true,
      data: {
        ...stats,
        occupancyRate: stats.totalCapacity > 0 
          ? Math.round((stats.totalOccupied / stats.totalCapacity) * 100) 
          : 0
      }
    };
  },

  /**
   * Lấy phòng còn trống
   */
  getAvailableRooms: async (categoryId = null) => {
    const rooms = await roomRepository.findAvailableRooms(categoryId);
    return {
      success: true,
      count: rooms.length,
      data: rooms
    };
  }
};

module.exports = roomService;
