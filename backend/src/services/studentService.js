const studentRepository = require('../repositories/studentRepository');
const Room = require('../models/Room');
const User = require('../models/User');
const Major = require('../models/Major');
const CertificateRequest = require('../models/CertificateRequest');
const DormitoryRequest = require('../models/DormitoryRequest');
const { AppError } = require('../utils/appError');

/**
 * Student Service - Business Logic Layer
 * Xử lý toàn bộ logic nghiệp vụ
 */
class StudentService {
  /**
   * Helper: Tạo error với field cụ thể
   */
  createError(message, statusCode, field = null) {
    const error = new AppError(message, statusCode);
    if (field) error.field = field;
    return error;
  }

  // ==========================================
  // UNIQUENESS VALIDATION - Logic kiểm tra trùng
  // ==========================================

  /**
   * Kiểm tra trùng lặp cho Create
   */
  async checkUniquenessForCreate({ fullName, email, citizenId, phone }) {
    const errors = [];

    // Check trùng tên
    if (fullName) {
      const existingName = await studentRepository.findByFullName(fullName);
      if (existingName) {
        errors.push({ field: 'fullName', message: `Tên sinh viên "${fullName}" đã tồn tại trong hệ thống` });
      }
    }

    // Check trùng email
    if (email) {
      const existingEmail = await studentRepository.checkEmailExists(email);
      if (existingEmail) {
        errors.push({ field: 'email', message: `Email "${email}" đã được sử dụng` });
      }
    }

    // Check trùng CCCD
    if (citizenId) {
      const existingCitizenId = await studentRepository.findByCitizenId(citizenId);
      if (existingCitizenId) {
        errors.push({ field: 'citizenId', message: `CCCD "${citizenId}" đã tồn tại trong hệ thống` });
      }
    }

    // Check trùng SĐT
    if (phone) {
      const existingPhone = await studentRepository.findByPhone(phone);
      if (existingPhone) {
        errors.push({ field: 'phone', message: `Số điện thoại "${phone}" đã được sử dụng` });
      }
    }

    return errors;
  }

  /**
   * Kiểm tra trùng lặp cho Update (exclude current student)
   */
  async checkUniquenessForUpdate(studentId, userId, { email, citizenId, phone }) {
    const errors = [];

    // Check trùng email (exclude current user)
    if (email) {
      const existingEmail = await studentRepository.checkEmailExists(email, userId);
      if (existingEmail) {
        errors.push({ field: 'email', message: `Email "${email}" đã được sử dụng` });
      }
    }

    // Check trùng CCCD (exclude current student)
    if (citizenId) {
      const existingCitizenId = await studentRepository.findByCitizenId(citizenId, studentId);
      if (existingCitizenId) {
        errors.push({ field: 'citizenId', message: `CCCD "${citizenId}" đã tồn tại trong hệ thống` });
      }
    }

    // Check trùng SĐT (exclude current student)
    if (phone) {
      const existingPhone = await studentRepository.findByPhone(phone, studentId);
      if (existingPhone) {
        errors.push({ field: 'phone', message: `Số điện thoại "${phone}" đã được sử dụng` });
      }
    }

    return errors;
  }

  // ==========================================
  // ROOM LOGIC - Logic xử lý KTX
  // ==========================================

  /**
   * Kiểm tra phòng còn chỗ
   */
  async checkRoomAvailability(roomId) {
    const room = await Room.findById(roomId);
    if (!room) {
      throw this.createError('Phòng không tồn tại', 404, 'roomId');
    }
    if (room.status === 'MAINTENANCE') {
      throw this.createError('Phòng đang bảo trì', 400, 'roomId');
    }
    if (room.occupied >= room.capacity) {
      throw this.createError(`Phòng "${room.name}" đã đầy (${room.occupied}/${room.capacity})`, 400, 'roomId');
    }
    return room;
  }

  /**
   * Tăng số người trong phòng (+1)
   */
  async incrementRoomOccupancy(roomId) {
    const room = await Room.findById(roomId);
    if (room) {
      room.occupied = Math.min(room.occupied + 1, room.capacity);
      if (room.occupied >= room.capacity) {
        room.status = 'FULL';
      }
      await room.save();
    }
  }

  /**
   * Giảm số người trong phòng (-1)
   */
  async decrementRoomOccupancy(roomId) {
    const room = await Room.findById(roomId);
    if (room) {
      room.occupied = Math.max(room.occupied - 1, 0);
      if (room.occupied < room.capacity && room.status === 'FULL') {
        room.status = 'AVAILABLE';
      }
      await room.save();
    }
  }

  /**
   * Lấy danh sách phòng còn chỗ trống
   */
  async getAvailableRooms() {
    const rooms = await Room.find({
      status: { $ne: 'MAINTENANCE' },
      $expr: { $lt: ['$occupied', '$capacity'] }
    }).sort({ name: 1 });

    return {
      success: true,
      count: rooms.length,
      data: rooms.map(room => ({
        _id: room._id,
        name: room.name,
        capacity: room.capacity,
        occupied: room.occupied,
        available: room.capacity - room.occupied,
        status: room.status
      }))
    };
  }

  // ==========================================
  // CRUD OPERATIONS
  // ==========================================

  /**
   * Tạo sinh viên mới
   * Business Logic:
   * 1. Check trùng: fullName, email, citizenId, phone
   * 2. Nếu isDormResident = true: check roomId hợp lệ và còn chỗ
   * 3. Tạo User (nếu chưa có)
   * 4. Tạo Student
   * 5. Nếu ở KTX: cập nhật occupied +1
   */
  async createStudent(payload) {
    const {
      fullName,
      email,
      password,
      phone,
      citizenId,
      dateOfBirth,
      address,
      major,
      isDormResident = false,
      roomId = null
    } = payload;

    // 1. Check trùng lặp
    const uniquenessErrors = await this.checkUniquenessForCreate({
      fullName,
      email,
      citizenId,
      phone
    });

    if (uniquenessErrors.length > 0) {
      const error = this.createError('Dữ liệu bị trùng lặp', 409);
      error.errors = uniquenessErrors;
      throw error;
    }

    // 2. Validate major
    const majorDoc = await Major.findById(major);
    if (!majorDoc) {
      throw this.createError('Chuyên ngành không tồn tại', 404, 'major');
    }

    // 3. Xử lý KTX
    if (isDormResident) {
      if (!roomId) {
        throw this.createError('Phải chọn phòng KTX khi đăng ký ở KTX', 400, 'roomId');
      }
      await this.checkRoomAvailability(roomId);
    }

    // 4. Tạo User - Mật khẩu mặc định là 123456
    let createdUser = null;
    try {
      if (!email) {
        throw this.createError('Email là bắt buộc', 400);
      }

      const defaultPassword = '123456'; // Mật khẩu mặc định cho sinh viên mới

      const newUser = new User({
        email: email.toLowerCase().trim(),
        password: defaultPassword,
        role: 'STUDENT',
        isActive: true
      });
      createdUser = await newUser.save();

    } catch (err) {
      if (err.code === 11000) {
        throw this.createError(`Email "${email}" đã được sử dụng`, 409, 'email');
      }
      throw err;
    }

    // 5. Tạo Student
    try {
      const studentData = {
        user: createdUser._id,
        fullName: fullName.trim(),
        major,
        dateOfBirth,
        phone: phone?.trim(),
        address: address?.trim(),
        citizenId: citizenId?.trim(),
        isDormResident,
        roomId: isDormResident ? roomId : null
      };

      const createdStudent = await studentRepository.create(studentData);

      // 6. Cập nhật occupied nếu ở KTX
      if (isDormResident && roomId) {
        await this.incrementRoomOccupancy(roomId);
      }

      // Populate và trả về
      const populatedStudent = await studentRepository.findById(createdStudent._id);

      return {
        success: true,
        message: 'Tạo sinh viên thành công',
        data: populatedStudent
      };

    } catch (err) {
      // Rollback User nếu tạo Student thất bại
      if (createdUser) {
        await User.findByIdAndDelete(createdUser._id).catch(() => {});
      }

      if (err.code === 11000) {
        const field = Object.keys(err.keyValue)[0];
        throw this.createError(`Giá trị ${field} đã tồn tại`, 409, field);
      }

      throw err;
    }
  }

  /**
   * Lấy danh sách sinh viên
   */
  async listStudents(page = 1, limit = 20, filters = {}) {
    const skip = (Math.max(1, page) - 1) * limit;
    const { docs, total } = await studentRepository.findAll({ skip, limit, filters });
    
    return {
      success: true,
      data: docs,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) }
    };
  }

  /**
   * Lấy sinh viên ở KTX
   */
  async listDormStudents(page = 1, limit = 20, filters = {}) {
    const skip = (Math.max(1, page) - 1) * limit;
    const { docs, total } = await studentRepository.findDormResidents({ skip, limit, filters });
    
    return {
      success: true,
      data: docs,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) }
    };
  }

  /**
   * Lấy sinh viên theo ID
   */
  async getStudentById(id) {
    const student = await studentRepository.findById(id);
    if (!student) {
      throw this.createError('Không tìm thấy sinh viên', 404);
    }
    return { success: true, data: student };
  }

  /**
   * Cập nhật sinh viên
   * Business Logic:
   * 1. KHÔNG cho sửa fullName (bỏ qua nếu có)
   * 2. Check trùng: email, citizenId, phone
   * 3. Xử lý logic đổi phòng KTX
   */
  async updateStudent(id, payload) {
    const student = await studentRepository.findById(id);
    if (!student) {
      throw this.createError('Không tìm thấy sinh viên', 404);
    }

    // 1. Bỏ qua fullName - KHÔNG CHO SỬA
    const { fullName, ...updatePayload } = payload;
    if (fullName && fullName !== student.fullName) {
      // Có thể throw error hoặc chỉ bỏ qua
      // throw this.createError('Không được phép sửa tên sinh viên', 400, 'fullName');
    }

    const {
      email,
      phone,
      citizenId,
      dateOfBirth,
      address,
      major,
      isDormResident,
      roomId
    } = updatePayload;

    // 2. Check trùng lặp (exclude current)
    const uniquenessErrors = await this.checkUniquenessForUpdate(
      id,
      student.user._id || student.user,
      { email, citizenId, phone }
    );

    if (uniquenessErrors.length > 0) {
      const error = this.createError('Dữ liệu bị trùng lặp', 409);
      error.errors = uniquenessErrors;
      throw error;
    }

    // 3. Validate major nếu có thay đổi
    if (major && major !== student.major?._id?.toString()) {
      const majorDoc = await Major.findById(major);
      if (!majorDoc) {
        throw this.createError('Chuyên ngành không tồn tại', 404, 'major');
      }
    }

    // 4. Xử lý logic KTX
    const oldIsDormResident = student.isDormResident;
    const oldRoomId = student.roomId?._id?.toString() || student.roomId?.toString();
    const newIsDormResident = isDormResident !== undefined ? isDormResident : oldIsDormResident;
    const newRoomId = roomId || null;

    // Case 1: Chuyển từ không ở KTX -> ở KTX
    if (!oldIsDormResident && newIsDormResident) {
      if (!newRoomId) {
        throw this.createError('Phải chọn phòng KTX', 400, 'roomId');
      }
      await this.checkRoomAvailability(newRoomId);
    }

    // Case 2: Đổi phòng (vẫn ở KTX)
    if (oldIsDormResident && newIsDormResident && newRoomId && newRoomId !== oldRoomId) {
      await this.checkRoomAvailability(newRoomId);
    }

    // 5. Cập nhật User nếu có email
    if (email && email !== student.user?.email) {
      await User.findByIdAndUpdate(
        student.user._id || student.user,
        { email: email.toLowerCase().trim() }
      );
    }

    // 6. Cập nhật Student
    const studentUpdateData = {};
    if (phone !== undefined) studentUpdateData.phone = phone?.trim();
    if (citizenId !== undefined) studentUpdateData.citizenId = citizenId?.trim();
    if (dateOfBirth !== undefined) studentUpdateData.dateOfBirth = dateOfBirth;
    if (address !== undefined) studentUpdateData.address = address?.trim();
    if (major !== undefined) studentUpdateData.major = major;
    if (isDormResident !== undefined) studentUpdateData.isDormResident = isDormResident;
    if (newIsDormResident && newRoomId) {
      studentUpdateData.roomId = newRoomId;
    } else if (!newIsDormResident) {
      studentUpdateData.roomId = null;
    }

    const updatedStudent = await studentRepository.updateById(id, studentUpdateData);

    // 7. Cập nhật Room occupancy
    // Case A: Chuyển từ không ở -> ở KTX
    if (!oldIsDormResident && newIsDormResident && newRoomId) {
      await this.incrementRoomOccupancy(newRoomId);
    }
    // Case B: Chuyển từ ở -> không ở KTX
    else if (oldIsDormResident && !newIsDormResident && oldRoomId) {
      await this.decrementRoomOccupancy(oldRoomId);
    }
    // Case C: Đổi phòng
    else if (oldIsDormResident && newIsDormResident && newRoomId && newRoomId !== oldRoomId) {
      await this.decrementRoomOccupancy(oldRoomId);
      await this.incrementRoomOccupancy(newRoomId);
    }

    return {
      success: true,
      message: 'Cập nhật sinh viên thành công',
      data: updatedStudent
    };
  }

  /**
   * Xem trước dữ liệu sẽ bị xóa khi xóa sinh viên
   * Dùng để hiển thị thông tin trong modal xác nhận
   * @param {string} id - ID sinh viên
   * @returns {Object} - Thông tin sinh viên và số yêu cầu liên quan
   */
  async getDeletePreview(id) {
    const student = await studentRepository.findById(id);
    if (!student) {
      throw this.createError('Không tìm thấy sinh viên', 404);
    }

    // Đếm số yêu cầu CTSV
    const certificateRequestCount = await CertificateRequest.countDocuments({ student: id });
    
    // Đếm số yêu cầu KTX
    const dormitoryRequestCount = await DormitoryRequest.countDocuments({ student: id });

    return {
      success: true,
      data: {
        student: {
          _id: student._id,
          fullName: student.fullName,
          email: student.user?.email,
          isDormResident: student.isDormResident,
          roomName: student.roomId?.name || null
        },
        relatedData: {
          certificateRequests: certificateRequestCount,
          dormitoryRequests: dormitoryRequestCount
        }
      }
    };
  }

  /**
   * Xóa sinh viên hoàn toàn (Hard Delete) - CẢI TIẾN
   * Business Logic:
   * 1. Xóa tất cả CertificateRequest của sinh viên
   * 2. Xóa tất cả DormitoryRequest của sinh viên (nếu ở KTX)
   * 3. Nếu ở KTX: giảm occupied -1
   * 4. Xóa User liên quan
   * 5. Xóa Student
   */
  async deleteStudent(id) {
    const student = await studentRepository.findById(id);
    if (!student) {
      throw this.createError('Không tìm thấy sinh viên', 404);
    }

    // Lưu thông tin trước khi xóa để emit socket event
    const affectedRoomId = student.isDormResident && student.roomId 
      ? (student.roomId._id || student.roomId).toString() 
      : null;
    
    let deletedCertificateRequests = 0;
    let deletedDormitoryRequests = 0;
    
    try {
      // 1. Xóa tất cả CertificateRequest của sinh viên
      const certResult = await CertificateRequest.deleteMany({ student: id });
      deletedCertificateRequests = certResult.deletedCount;

      // 2. Xóa tất cả DormitoryRequest của sinh viên (nếu ở KTX)
      if (student.isDormResident) {
        const dormResult = await DormitoryRequest.deleteMany({ student: id });
        deletedDormitoryRequests = dormResult.deletedCount;
      }

      // 3. Giảm room occupied nếu ở KTX
      if (student.isDormResident && student.roomId) {
        const roomId = student.roomId._id || student.roomId;
        await Room.findByIdAndUpdate(roomId, { $inc: { occupied: -1 } });
      }

      // 4. Xóa User
      const userId = student.user?._id || student.user;
      if (userId) {
        await User.findByIdAndDelete(userId);
      }

      // 5. Xóa Student
      await studentRepository.deleteById(id);
      
      return {
        success: true,
        message: `Đã xóa sinh viên "${student.fullName}"`,
        data: {
          deletedCertificateRequests,
          deletedDormitoryRequests,
          affectedRoomId
        }
      };

    } catch (error) {
      console.error('Delete student failed:', error);
      throw this.createError('Không thể xóa sinh viên: ' + error.message, 500);
    }
  }

  /**
   * Chỉ xóa sinh viên khỏi KTX (không xóa sinh viên)
   * Business Logic:
   * 1. Kiểm tra sinh viên có ở KTX không
   * 2. Xóa tất cả DormitoryRequest của sinh viên
   * 3. Giảm room occupied -1
   * 4. Cập nhật student: isDormResident = false, roomId = null
   * @param {string} id - ID sinh viên
   * @returns {Object} - Kết quả
   */
  async removeFromDormitory(id) {
    const student = await studentRepository.findById(id);
    
    if (!student) {
      throw this.createError('Không tìm thấy sinh viên', 404);
    }

    if (!student.isDormResident) {
      throw this.createError('Sinh viên này không ở ký túc xá', 400);
    }
    
    // Lưu thông tin trước khi xóa để emit socket event
    const affectedRoomId = student.roomId 
      ? (student.roomId._id || student.roomId).toString() 
      : null;
    
    let deletedDormitoryRequests = 0;
    
    try {
      // 1. Xóa tất cả DormitoryRequest của sinh viên
      const dormResult = await DormitoryRequest.deleteMany({ student: id });
      deletedDormitoryRequests = dormResult.deletedCount;

      // 2. Giảm room occupied
      if (student.roomId) {
        const roomId = student.roomId._id || student.roomId;
        await Room.findByIdAndUpdate(roomId, { $inc: { occupied: -1 } });
      }

      // 3. Cập nhật student
      await studentRepository.updateById(id, {
        isDormResident: false,
        roomId: null
      });
      
      return {
        success: true,
        message: `Đã xóa sinh viên "${student.fullName}" khỏi ký túc xá`,
        data: {
          deletedDormitoryRequests,
          affectedRoomId
        }
      };

    } catch (error) {
      console.error('Remove from dormitory failed:', error);
      throw this.createError('Không thể xóa sinh viên khỏi KTX: ' + error.message, 500);
    }
  }

  /**
   * Xem trước dữ liệu sẽ bị xóa khi xóa nhiều sinh viên
   * Dùng để hiển thị thông tin trong modal xác nhận xóa hàng loạt
   * @param {string[]} ids - Mảng ID sinh viên cần xóa
   * @returns {Object} - Thông tin tổng hợp
   */
  async getBulkDeletePreview(ids) {
    const Student = require('../models/Student');

    if (!ids || ids.length === 0) {
      throw this.createError('Danh sách ID không được rỗng', 400);
    }

    // Tìm tất cả sinh viên cần xóa
    const students = await Student.find({ 
      _id: { $in: ids },
      isDeleted: false 
    }).populate('roomId', 'name');

    if (students.length === 0) {
      throw this.createError('Không tìm thấy sinh viên nào', 404);
    }

    // Đếm số yêu cầu CTSV của tất cả sinh viên
    const certificateRequestCount = await CertificateRequest.countDocuments({ 
      student: { $in: ids } 
    });
    
    // Đếm số yêu cầu KTX của tất cả sinh viên
    const dormitoryRequestCount = await DormitoryRequest.countDocuments({ 
      student: { $in: ids } 
    });

    // Đếm số sinh viên ở KTX
    const dormResidentCount = students.filter(s => s.isDormResident).length;

    return {
      success: true,
      data: {
        studentCount: students.length,
        dormResidentCount,
        relatedData: {
          certificateRequests: certificateRequestCount,
          dormitoryRequests: dormitoryRequestCount
        }
      }
    };
  }

  /**
   * Xóa nhiều sinh viên cùng lúc (Bulk Delete) - CẢI TIẾN
   * Business Logic:
   * 1. Tìm tất cả sinh viên theo danh sách IDs
   * 2. Xóa tất cả CertificateRequest & DormitoryRequest của các sinh viên
   * 3. Giảm room occupied cho những SV ở KTX
   * 4. Xóa tất cả User liên quan
   * 5. Xóa tất cả Student
   * @param {string[]} ids - Mảng ID sinh viên cần xóa
   * @returns {Object} - Kết quả xóa
   */
  async bulkDeleteStudents(ids) {
    const mongoose = require('mongoose');
    const Student = require('../models/Student');

    if (!ids || ids.length === 0) {
      throw this.createError('Danh sách ID không được rỗng', 400);
    }

    // 1. Tìm tất cả sinh viên cần xóa
    const students = await Student.find({ 
      _id: { $in: ids },
      isDeleted: false 
    }).populate('roomId', 'name');

    if (students.length === 0) {
      throw this.createError('Không tìm thấy sinh viên nào để xóa', 404);
    }

    // 2. Thu thập thông tin cần thiết
    const userIds = students
      .map(s => s.user?._id || s.user)
      .filter(Boolean);
    
    const roomUpdates = new Map(); // roomId -> decrement count
    const studentNames = [];

    for (const student of students) {
      studentNames.push(student.fullName);
      
      // Track room decrement cho sinh viên ở KTX
      if (student.isDormResident && student.roomId) {
        const roomIdStr = (student.roomId._id || student.roomId).toString();
        roomUpdates.set(roomIdStr, (roomUpdates.get(roomIdStr) || 0) + 1);
      }
    }

    try {
      let deletedCertificateRequests = 0;
      let deletedDormitoryRequests = 0;

      // Xóa tất cả CertificateRequest của các sinh viên
      const certResult = await CertificateRequest.deleteMany({ student: { $in: ids } });
      deletedCertificateRequests = certResult.deletedCount;

      // Xóa tất cả DormitoryRequest của các sinh viên
      const dormResult = await DormitoryRequest.deleteMany({ student: { $in: ids } });
      deletedDormitoryRequests = dormResult.deletedCount;

      // Bulk update room occupancy (giảm số người)
      if (roomUpdates.size > 0) {
        const bulkOps = Array.from(roomUpdates.entries()).map(([roomId, decrement]) => ({
          updateOne: {
            filter: { _id: new mongoose.Types.ObjectId(roomId) },
            update: { $inc: { occupied: -decrement } }
          }
        }));
        await Room.bulkWrite(bulkOps);
      }

      // Xóa tất cả Users
      if (userIds.length > 0) {
        await User.deleteMany({ _id: { $in: userIds } });
      }

      // Xóa tất cả Students
      await Student.deleteMany({ _id: { $in: ids } });

      // Lấy danh sách roomIds bị ảnh hưởng để emit socket event
      const affectedRoomIds = Array.from(roomUpdates.keys());

      return {
        success: true,
        message: `Đã xóa ${students.length} sinh viên thành công`,
        data: {
          deletedCount: students.length,
          deletedNames: studentNames,
          deletedCertificateRequests,
          deletedDormitoryRequests,
          affectedRoomIds
        }
      };

    } catch (error) {
      console.error('Bulk delete failed:', error);
      throw this.createError('Không thể xóa sinh viên: ' + error.message, 500);
    }
  }

  /**
   * Xóa nhiều sinh viên khỏi KTX (giữ lại sinh viên, chỉ xóa khỏi KTX)
   * Business Logic:
   * 1. Tìm tất cả sinh viên theo danh sách IDs
   * 2. Xóa tất cả DormitoryRequest của các sinh viên
   * 3. Giảm room occupied cho những SV ở KTX
   * 4. Cập nhật sinh viên: isDormResident = false, roomId = null
   * @param {string[]} ids - Mảng ID sinh viên cần xóa khỏi KTX
   * @returns {Object} - Kết quả xóa
   */
  async bulkRemoveFromDormitory(ids) {
    const mongoose = require('mongoose');
    const Student = require('../models/Student');

    if (!ids || ids.length === 0) {
      throw this.createError('Danh sách ID không được rỗng', 400);
    }

    // 1. Tìm tất cả sinh viên cần xóa khỏi KTX (chỉ lấy những SV đang ở KTX)
    const students = await Student.find({ 
      _id: { $in: ids },
      isDeleted: false,
      isDormResident: true
    }).populate('roomId', 'name');

    if (students.length === 0) {
      throw this.createError('Không tìm thấy sinh viên nào đang ở KTX để xóa', 404);
    }

    // 2. Thu thập thông tin cần thiết
    const roomUpdates = new Map(); // roomId -> decrement count
    const studentNames = [];
    const studentIds = students.map(s => s._id);

    for (const student of students) {
      studentNames.push(student.fullName);
      
      // Track room decrement
      if (student.roomId) {
        const roomIdStr = (student.roomId._id || student.roomId).toString();
        roomUpdates.set(roomIdStr, (roomUpdates.get(roomIdStr) || 0) + 1);
      }
    }

    try {
      let deletedDormitoryRequests = 0;

      // Xóa tất cả DormitoryRequest của các sinh viên
      const dormResult = await DormitoryRequest.deleteMany({ student: { $in: studentIds } });
      deletedDormitoryRequests = dormResult.deletedCount;

      // Bulk update room occupancy (giảm số người)
      if (roomUpdates.size > 0) {
        const bulkOps = Array.from(roomUpdates.entries()).map(([roomId, decrement]) => ({
          updateOne: {
            filter: { _id: new mongoose.Types.ObjectId(roomId) },
            update: { $inc: { occupied: -decrement } }
          }
        }));
        await Room.bulkWrite(bulkOps);
      }

      // Cập nhật tất cả sinh viên: isDormResident = false, roomId = null
      await Student.updateMany(
        { _id: { $in: studentIds } },
        { $set: { isDormResident: false, roomId: null } }
      );

      // Lấy danh sách roomIds bị ảnh hưởng để emit socket event
      const affectedRoomIds = Array.from(roomUpdates.keys());

      return {
        success: true,
        message: `Đã xóa ${students.length} sinh viên khỏi ký túc xá`,
        data: {
          removedCount: students.length,
          removedNames: studentNames,
          deletedDormitoryRequests,
          affectedRoomIds
        }
      };

    } catch (error) {
      console.error('Bulk remove from dormitory failed:', error);
      throw this.createError('Không thể xóa sinh viên khỏi KTX: ' + error.message, 500);
    }
  }

  /**
   * Lấy thống kê
   */
  async getStats() {
    const Student = require('../models/Student');
    
    const [
      totalStudents,
      activeStudents,
      dormStudents,
      graduatedStudents
    ] = await Promise.all([
      Student.countDocuments({ isDeleted: false }),
      Student.countDocuments({ isDeleted: false, status: 'ACTIVE' }),
      Student.countDocuments({ isDeleted: false, isDormResident: true }),
      Student.countDocuments({ isDeleted: false, status: 'GRADUATED' })
    ]);

    return {
      success: true,
      data: {
        total: totalStudents,
        active: activeStudents,
        dormitory: dormStudents,
        graduated: graduatedStudents
      }
    };
  }

  // ==========================================
  // IMPORT CSV - BATCH PROCESSING
  // ==========================================

  /**
   * LỚP 1: Kiểm tra định dạng (Format Validation)
   * @param {Object} row - Dữ liệu 1 dòng CSV
   * @returns {string[]} - Mảng lỗi định dạng
   */
  validateFormat(row) {
    const errors = [];
    
    // Check required fields
    if (!row.fullName?.trim()) errors.push('Thiếu họ và tên');
    if (!row.email?.trim()) errors.push('Thiếu email');
    if (!row.phone?.trim()) errors.push('Thiếu số điện thoại');
    if (!row.citizenId?.trim()) errors.push('Thiếu CCCD');
    if (!row.dateOfBirth?.trim()) errors.push('Thiếu ngày sinh');
    if (!row.address?.trim()) errors.push('Thiếu địa chỉ');
    
    // Email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (row.email && !emailRegex.test(row.email)) {
      errors.push('Email không đúng định dạng');
    }
    
    // Phone format (10 digits starting with 0)
    const phoneRegex = /^0\d{9}$/;
    if (row.phone && !phoneRegex.test(row.phone)) {
      errors.push('SĐT không đúng định dạng (10 số, bắt đầu bằng 0)');
    }
    
    // CCCD format (12 digits)
    if (row.citizenId && !/^\d{12}$/.test(row.citizenId)) {
      errors.push('CCCD phải có 12 chữ số');
    }
    
    // Date format validation (DD/MM/YYYY)
    if (row.dateOfBirth) {
      const dateRegex = /^\d{1,2}\/\d{1,2}\/\d{4}$/;
      if (!dateRegex.test(row.dateOfBirth)) {
        errors.push('Ngày sinh phải theo định dạng DD/MM/YYYY');
      }
    }
    
    return errors;
  }

  /**
   * Preview Import - Validate dữ liệu KHÔNG lưu DB
   * Thực hiện 4 lớp validation
   * @param {Object[]} rows - Mảng dữ liệu từ CSV
   * @param {string} majorId - ID chuyên ngành
   * @returns {Object} - Kết quả validation với thống kê
   */
  async previewImport(rows, majorId) {
    // Validate major exists
    const major = await Major.findById(majorId);
    if (!major) {
      throw this.createError('Chuyên ngành không tồn tại', 400);
    }

    const results = [];
    
    // Sets để theo dõi trùng lặp nội bộ file
    const seenEmails = new Map(); // email -> rowIndex
    const seenPhones = new Map(); // phone -> rowIndex
    const seenCitizenIds = new Map(); // citizenId -> rowIndex
    
    // Thu thập tất cả unique values để bulk check DB
    const allEmails = [];
    const allPhones = [];
    const allCitizenIds = [];
    
    // ========== LỚP 1 & 2: Format + Internal Duplication ==========
    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const result = {
        rowIndex: i + 1,
        data: row,
        status: 'valid',
        errors: []
      };
      
      // LỚP 1: Format Validation
      const formatErrors = this.validateFormat(row);
      if (formatErrors.length > 0) {
        result.status = 'error';
        result.errors = formatErrors;
        results.push(result);
        continue;
      }
      
      // LỚP 2: Internal Duplication Check
      const email = row.email?.toLowerCase().trim();
      const phone = row.phone?.trim();
      const citizenId = row.citizenId?.trim();
      
      let isDuplicate = false;
      
      if (email && seenEmails.has(email)) {
        result.status = 'duplicate';
        result.errors.push(`Email trùng với dòng ${seenEmails.get(email)}`);
        isDuplicate = true;
      }
      
      if (phone && seenPhones.has(phone)) {
        result.status = 'duplicate';
        result.errors.push(`SĐT trùng với dòng ${seenPhones.get(phone)}`);
        isDuplicate = true;
      }
      
      if (citizenId && seenCitizenIds.has(citizenId)) {
        result.status = 'duplicate';
        result.errors.push(`CCCD trùng với dòng ${seenCitizenIds.get(citizenId)}`);
        isDuplicate = true;
      }
      
      if (isDuplicate) {
        results.push(result);
        continue;
      }
      
      // Track for internal duplication
      if (email) seenEmails.set(email, i + 1);
      if (phone) seenPhones.set(phone, i + 1);
      if (citizenId) seenCitizenIds.set(citizenId, i + 1);
      
      // Collect for DB check
      if (email) allEmails.push(email);
      if (phone) allPhones.push(phone);
      if (citizenId) allCitizenIds.push(citizenId);
      
      results.push(result);
    }
    
    // ========== LỚP 3: Database Uniqueness (Bulk Query) ==========
    // Chỉ query DB 1 lần cho mỗi trường - Tối ưu hiệu năng
    const [existingEmails, existingPhones, existingCitizenIds] = await Promise.all([
      studentRepository.findExistingEmails(allEmails),
      studentRepository.findExistingPhones(allPhones),
      studentRepository.findExistingCitizenIds(allCitizenIds)
    ]);
    
    // Apply DB check results
    for (const result of results) {
      if (result.status !== 'valid') continue;
      
      const email = result.data.email?.toLowerCase().trim();
      const phone = result.data.phone?.trim();
      const citizenId = result.data.citizenId?.trim();
      
      const dbErrors = [];
      
      if (email && existingEmails.has(email)) {
        dbErrors.push('Email đã tồn tại trong hệ thống');
      }
      if (phone && existingPhones.has(phone)) {
        dbErrors.push('SĐT đã tồn tại trong hệ thống');
      }
      if (citizenId && existingCitizenIds.has(citizenId)) {
        dbErrors.push('CCCD đã tồn tại trong hệ thống');
      }
      
      if (dbErrors.length > 0) {
        result.status = 'duplicate';
        result.errors = dbErrors;
      }
    }
    
    // ========== LỚP 4: Dormitory Validation (Slot Counting) ==========
    // Lấy thông tin tất cả phòng KTX (không lấy phòng đang bảo trì)
    const rooms = await Room.find({ status: { $ne: 'MAINTENANCE' } }).lean();
    const roomMap = new Map(); // roomName -> { capacity, occupied, available }
    
    rooms.forEach(room => {
      roomMap.set(room.name?.toLowerCase(), {
        _id: room._id,
        name: room.name,
        capacity: room.capacity || 0,
        occupied: room.occupied || 0,
        available: (room.capacity || 0) - (room.occupied || 0)
      });
    });
    
    // Track temporary slot usage within file
    const tempSlotUsage = new Map(); // roomName -> count used in this import
    
    for (const result of results) {
      if (result.status !== 'valid') continue;
      
      const isDormResident = result.data.isDormResident === true || 
                            result.data.isDormResident === 'true' ||
                            result.data.isDormResident === 'Có' ||
                            result.data.isDormResident === 'có';
      
      if (!isDormResident) continue;
      
      const roomName = result.data.roomName?.toLowerCase().trim();
      
      if (!roomName) {
        result.status = 'error';
        result.errors.push('Sinh viên ở KTX phải có tên phòng');
        continue;
      }
      
      const room = roomMap.get(roomName);
      if (!room) {
        result.status = 'error';
        result.errors.push(`Phòng "${result.data.roomName}" không tồn tại`);
        continue;
      }
      
      // Calculate available slots
      const usedInFile = tempSlotUsage.get(roomName) || 0;
      const availableSlots = room.available - usedInFile;
      
      if (availableSlots <= 0) {
        result.status = 'error';
        result.errors.push(`Phòng "${room.name}" đã hết chỗ (vượt quá số lượng trong file)`);
        continue;
      }
      
      // Reserve slot temporarily
      tempSlotUsage.set(roomName, usedInFile + 1);
      result.data._roomId = room._id; // Store room ID for import
    }
    
    // ========== Tính toán thống kê ==========
    const stats = {
      total: results.length,
      valid: results.filter(r => r.status === 'valid').length,
      duplicate: results.filter(r => r.status === 'duplicate').length,
      error: results.filter(r => r.status === 'error').length
    };
    
    return {
      success: true,
      stats,
      results
    };
  }

  /**
   * Execute Import - Lưu dữ liệu vào DB (TỐI ƯU CAO NHẤT)
   * 
   * CHIẾN LƯỢC TỐI ƯU:
   * 1. Hash password 1 LẦN DUY NHẤT (vì tất cả đều là "123456")
   * 2. User.insertMany() - Insert tất cả users 1 lần
   * 3. Student.insertMany() - Insert tất cả students 1 lần  
   * 4. Room.bulkWrite() - Update tất cả room 1 lần
   * 5. Transaction để rollback nếu fail
   * 
   * HIỆU NĂNG:
   * - Cũ: 1000 rows = 1000 bcrypt + 2000 DB calls = ~15 giây
   * - Mới: 1000 rows = 1 bcrypt + 3 DB calls = ~0.5 giây
   * 
   * @param {Object[]} validRows - Mảng dữ liệu hợp lệ
   * @param {string} majorId - ID chuyên ngành
   * @returns {Object} - Kết quả import
   */
  async executeImport(validRows, majorId) {
    const bcrypt = require('bcryptjs');
    const mongoose = require('mongoose');
    const Student = require('../models/Student');
    
    // Validate major
    const major = await Major.findById(majorId);
    if (!major) {
      throw this.createError('Chuyên ngành không tồn tại', 400);
    }

    if (!validRows || validRows.length === 0) {
      return {
        success: true,
        data: { total: 0, successCount: 0, failedCount: 0, errors: [] }
      };
    }

    // ========================================
    // BƯỚC 1: Hash password 1 LẦN DUY NHẤT
    // ========================================
    // Key insight: Tất cả sinh viên đều có password = "123456"
    // → Chỉ cần hash 1 lần và reuse cho tất cả!
    const hashedPassword = await bcrypt.hash('123456', 12);
    
    // ========================================
    // BƯỚC 2: Chuẩn bị dữ liệu (Transform)
    // ========================================
    const userDocs = [];
    const roomUpdates = new Map(); // roomId -> increment count
    
    for (const row of validRows) {
      // Prepare user document (password already hashed)
      userDocs.push({
        email: row.email.toLowerCase().trim(),
        password: hashedPassword, // Reuse hashed password
        role: 'STUDENT',
        isActive: true
      });
      
      // Track room updates
      const isDormResident = row.isDormResident === true || 
                            row.isDormResident === 'true' ||
                            row.isDormResident === 'Có' ||
                            row.isDormResident === 'có';
      
      if (isDormResident && row._roomId) {
        const roomIdStr = row._roomId.toString();
        roomUpdates.set(roomIdStr, (roomUpdates.get(roomIdStr) || 0) + 1);
      }
    }
    
    // ========================================
    // BƯỚC 3: Thực hiện với Transaction
    // ========================================
    const session = await mongoose.startSession();
    
    try {
      let insertedUsers = [];
      let insertedStudents = [];
      
      await session.withTransaction(async () => {
        // 3.1: Insert ALL users trong 1 lần (bypass pre-save hook vì đã hash)
        insertedUsers = await User.insertMany(userDocs, { 
          session,
          ordered: true // Stop on first error for transaction
        });
        
        // 3.2: Prepare student documents với user IDs
        const studentDocs = validRows.map((row, index) => {
          // Parse date
          let dateOfBirth = null;
          if (row.dateOfBirth) {
            const parts = row.dateOfBirth.split('/');
            if (parts.length === 3) {
              dateOfBirth = new Date(`${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`);
            }
          }
          
          const isDormResident = row.isDormResident === true || 
                                row.isDormResident === 'true' ||
                                row.isDormResident === 'Có' ||
                                row.isDormResident === 'có';
          
          return {
            user: insertedUsers[index]._id,
            fullName: row.fullName.trim(),
            phone: row.phone.trim(),
            citizenId: row.citizenId.trim(),
            dateOfBirth,
            address: row.address.trim(),
            major: majorId,
            isDormResident,
            roomId: isDormResident && row._roomId ? row._roomId : null
          };
        });
        
        // 3.3: Insert ALL students trong 1 lần
        insertedStudents = await Student.insertMany(studentDocs, { 
          session,
          ordered: true
        });
        
        // 3.4: Bulk update room occupancy (1 lần duy nhất)
        if (roomUpdates.size > 0) {
          const bulkOps = Array.from(roomUpdates.entries()).map(([roomId, increment]) => ({
            updateOne: {
              filter: { _id: new mongoose.Types.ObjectId(roomId) },
              update: { $inc: { occupied: increment } }
            }
          }));
          
          await Room.bulkWrite(bulkOps, { session });
        }
      });
      
      await session.endSession();
      
      return {
        success: true,
        data: {
          total: validRows.length,
          successCount: insertedStudents.length,
          failedCount: 0,
          errors: []
        }
      };
      
    } catch (error) {
      await session.endSession();
      
      // Transaction tự động rollback, trả về lỗi chi tiết
      console.error('Import transaction failed:', error);
      
      // Parse error để xác định dòng lỗi (nếu có)
      let errorMessage = error.message;
      let failedIndex = -1;
      
      if (error.writeErrors && error.writeErrors[0]) {
        failedIndex = error.writeErrors[0].index;
        errorMessage = error.writeErrors[0].errmsg || error.message;
      }
      
      return {
        success: false,
        data: {
          total: validRows.length,
          successCount: 0, // Transaction rolled back
          failedCount: validRows.length,
          errors: [{
            rowIndex: failedIndex >= 0 ? failedIndex + 1 : 'unknown',
            fullName: failedIndex >= 0 ? validRows[failedIndex]?.fullName : 'N/A',
            error: errorMessage
          }]
        }
      };
    }
  }

  // ==========================================
  // ROOM TRANSFER - Chuyển phòng sinh viên
  // ==========================================

  /**
   * Chuyển phòng cho nhiều sinh viên
   * Business Logic:
   * 1. Kiểm tra phòng đích tồn tại và không bảo trì
   * 2. Kiểm tra phòng đích có đủ chỗ trống
   * 3. Lấy danh sách sinh viên và phòng cũ của họ
   * 4. Sử dụng transaction để:
   *    - Cập nhật roomId cho tất cả sinh viên
   *    - Giảm occupied của các phòng cũ
   *    - Tăng occupied của phòng mới
   * 5. Trả về kết quả
   * 
   * @param {string[]} studentIds - Danh sách ID sinh viên cần chuyển
   * @param {string} targetRoomId - ID phòng đích
   * @returns {Object} - Kết quả chuyển phòng
   */
  async transferStudentsRoom(studentIds, targetRoomId) {
    const mongoose = require('mongoose');
    
    // 1. Kiểm tra phòng đích
    const targetRoom = await Room.findById(targetRoomId);
    if (!targetRoom) {
      throw this.createError('Phòng đích không tồn tại', 404, 'targetRoomId');
    }
    
    if (targetRoom.status === 'MAINTENANCE') {
      throw this.createError('Phòng đích đang bảo trì', 400, 'targetRoomId');
    }
    
    // 2. Kiểm tra sức chứa
    const availableSlots = targetRoom.capacity - targetRoom.occupied;
    if (availableSlots < studentIds.length) {
      throw this.createError(
        `Phòng "${targetRoom.name}" chỉ còn ${availableSlots} chỗ trống, không đủ cho ${studentIds.length} sinh viên`,
        400,
        'targetRoomId'
      );
    }
    
    // 3. Lấy danh sách sinh viên
    const students = await studentRepository.findByIds(studentIds);
    if (students.length === 0) {
      throw this.createError('Không tìm thấy sinh viên nào', 404);
    }
    
    // Tính toán số lượng cần giảm cho mỗi phòng cũ
    const oldRoomUpdates = new Map(); // roomId -> count to decrease
    students.forEach(student => {
      if (student.roomId && student.roomId._id) {
        const oldRoomId = student.roomId._id.toString();
        // Không giảm nếu phòng cũ trùng phòng mới
        if (oldRoomId !== targetRoomId) {
          oldRoomUpdates.set(oldRoomId, (oldRoomUpdates.get(oldRoomId) || 0) + 1);
        }
      }
    });
    
    // Đếm số sinh viên thực sự chuyển (không tính những người đã ở phòng đích)
    const studentsToTransfer = students.filter(s => {
      const currentRoomId = s.roomId?._id?.toString() || s.roomId?.toString();
      return currentRoomId !== targetRoomId;
    });
    
    if (studentsToTransfer.length === 0) {
      return {
        success: true,
        message: 'Tất cả sinh viên đã ở phòng này rồi',
        data: {
          transferred: 0,
          targetRoom: targetRoom.name
        }
      };
    }
    
    // 4. Thực hiện transaction
    const session = await mongoose.startSession();
    
    try {
      await session.withTransaction(async () => {
        // 4.1: Cập nhật roomId cho tất cả sinh viên
        await studentRepository.bulkUpdateRoom(
          studentsToTransfer.map(s => s._id),
          targetRoomId
        );
        
        // 4.2: Giảm occupied cho các phòng cũ
        if (oldRoomUpdates.size > 0) {
          const decrementOps = Array.from(oldRoomUpdates.entries()).map(([roomId, count]) => ({
            updateOne: {
              filter: { _id: new mongoose.Types.ObjectId(roomId) },
              update: { 
                $inc: { occupied: -count },
                $set: { status: 'AVAILABLE' } // Phòng có chỗ trống
              }
            }
          }));
          await Room.bulkWrite(decrementOps, { session });
        }
        
        // 4.3: Tăng occupied cho phòng mới
        await Room.findByIdAndUpdate(
          targetRoomId,
          { 
            $inc: { occupied: studentsToTransfer.length },
          },
          { session }
        );
        
        // 4.4: Cập nhật status phòng mới nếu đầy
        const updatedRoom = await Room.findById(targetRoomId).session(session);
        if (updatedRoom.occupied >= updatedRoom.capacity) {
          updatedRoom.status = 'FULL';
          await updatedRoom.save({ session });
        }
      });
      
      await session.endSession();
      
      return {
        success: true,
        message: `Đã chuyển ${studentsToTransfer.length} sinh viên sang phòng ${targetRoom.name}`,
        data: {
          transferred: studentsToTransfer.length,
          targetRoom: targetRoom.name,
          studentNames: studentsToTransfer.map(s => s.fullName)
        }
      };
      
    } catch (error) {
      await session.endSession();
      console.error('Transfer room transaction failed:', error);
      throw this.createError('Lỗi khi chuyển phòng: ' + error.message, 500);
    }
  }

  /**
   * Lấy dữ liệu sinh viên để xuất CSV
   * @param {Object} filters - { isDormResident, faculty, major, roomId }
   * @returns {Object} - { success, data }
   */
  async getDataForCSVExport(filters = {}) {
    const { faculty, major, roomId, isDormResident } = filters;
    
    // Build query filters
    const queryFilters = {};
    
    // Filter theo tình trạng KTX
    if (isDormResident !== undefined) {
      queryFilters.isDormResident = isDormResident;
    }
    
    // Filter theo phòng
    if (roomId) {
      queryFilters.roomId = roomId;
    }
    
    // Lấy tất cả sinh viên theo filter cơ bản
    let { docs } = await studentRepository.findAll({ 
      skip: 0, 
      limit: 100000, // Lấy hết 
      filters: queryFilters 
    });
    
    // Filter theo major (nếu có)
    if (major) {
      docs = docs.filter(student => {
        const studentMajorId = student.major?._id?.toString() || student.major?.toString();
        return studentMajorId === major;
      });
    }
    
    // Filter theo faculty (nếu có và không có major)
    if (faculty && !major) {
      docs = docs.filter(student => {
        const studentFacultyId = student.major?.faculty?._id?.toString() || student.major?.faculty?.toString();
        return studentFacultyId === faculty;
      });
    }

    return {
      success: true,
      data: docs
    };
  }
}

module.exports = new StudentService();
