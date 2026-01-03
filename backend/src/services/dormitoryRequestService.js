const DormitoryRequest = require('../models/DormitoryRequest');
const EquipmentCategory = require('../models/EquipmentCategory');
const EquipmentItem = require('../models/EquipmentItem');
const Student = require('../models/Student');
const Semester = require('../models/Semester');
const { AppError } = require('../utils/appError');

// Repositories
const dormitoryRepository = require('../repositories/dormitoryRepository');
const studentRepository = require('../repositories/studentRepository');

const monthLabels = [
  '', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
];

const ALLOWED_STATUSES = ['Pending', 'Under Review', 'Approved'];

class DormitoryRequestService {

  // ==========================================
  // BUSINESS RULE VALIDATION
  // ==========================================

  /**
   * Kiểm tra sinh viên có ở KTX không
   * Business Rule: Chỉ sinh viên đang ở KTX mới được gửi yêu cầu hoặc xem lịch sử KTX
   * @param {string} userId - ID của user
   * @returns {Object} - Student object nếu hợp lệ
   * @throws {AppError} - Nếu không phải sinh viên KTX
   */
  async validateDormitoryResident(userId) {
    const student = await Student.findOne({ user: userId, isDeleted: false })
      .populate('roomId', 'name')
      .lean();

    if (!student) {
      throw new AppError('Không tìm thấy thông tin sinh viên', 404);
    }

    if (!student.isDormResident) {
      throw new AppError(
        'Bạn không phải sinh viên nội trú. Chức năng này chỉ dành cho sinh viên đang ở KTX.',
        403
      );
    }

    if (!student.roomId) {
      throw new AppError(
        'Bạn chưa được xếp phòng KTX. Vui lòng liên hệ quản lý KTX.',
        403
      );
    }

    return student;
  }

  // ==========================================
  // CRUD OPERATIONS
  // ==========================================

  /**
   * Tạo yêu cầu KTX mới
   * @returns {Object} { request, roomId, realtimePayload } - Trả về request, roomId để emit socket, và payload cho realtime
   */
  async createRequest(payload, userId) {
    // Validate sinh viên nội trú
    const student = await this.validateDormitoryResident(userId);

    const { category, item, description } = payload;

    // Validate category bắt buộc
    if (!category) {
      throw new AppError('Vui lòng chọn danh mục', 400);
    }

    // Kiểm tra category tồn tại
    const foundCategory = await EquipmentCategory.findById(category);
    if (!foundCategory) {
      throw new AppError('Danh mục không tồn tại', 400);
    }

    // Validate item nếu có
    let foundItem = null;
    if (item) {
      foundItem = await EquipmentItem.findOne({ _id: item, category: category });
      if (!foundItem) {
        throw new AppError('Thiết bị không tồn tại hoặc không thuộc danh mục đã chọn', 400);
      }
    }

    // Lấy học kỳ đang active từ database
    const activeSemester = await Semester.findOne({ isActive: true }).lean();
    if (!activeSemester) {
      throw new AppError('Không có học kỳ nào đang hoạt động. Vui lòng liên hệ quản trị viên.', 400);
    }

    // Lấy mã yêu cầu tiếp theo từ Repository (tuân thủ kiến trúc 4 lớp)
    const requestCode = await dormitoryRepository.getNextRequestCode();

    // Tạo request thông qua Repository
    const created = await dormitoryRepository.create({
      requestCode,
      student: student._id,
      semester: activeSemester.name, // Lưu tên học kỳ active
      category,
      item: item || null,
      description: description?.trim() || '',
      status: 'Pending',
      requestDate: new Date()
    });

    // Chuẩn bị payload cho realtime (format giống như getStudentRequests trả về)
    const realtimePayload = {
      _id: created._id,
      requestCode: created.requestCode,
      semester: created.semester,
      category: { _id: foundCategory._id, name: foundCategory.name },
      item: foundItem ? { _id: foundItem._id, name: foundItem.name } : null,
      description: created.description,
      status: created.status,
      requestDate: created.requestDate,
      createdAt: created.createdAt,
      // Thông tin người gửi
      senderName: student.fullName,
      senderEmail: student.user?.email || '',
      student: {
        _id: student._id,
        fullName: student.fullName,
        user: { email: student.user?.email || '' }
      }
    };

    return {
      request: created,
      roomId: student.roomId._id.toString(), // Room ID để emit socket
      realtimePayload
    };
  }

  /**
   * Lấy danh sách yêu cầu của sinh viên và các sinh viên cùng phòng
   * Business Rule: Sinh viên có thể xem tất cả yêu cầu trong phòng của mình
   */
  async getStudentRequests(userId, options = {}) {
    // Validate và lấy thông tin student với user email
    const student = await Student.findOne({ user: userId, isDeleted: false })
      .populate('roomId', 'name')
      .populate('user', 'email')
      .lean();

    if (!student) {
      throw new AppError('Không tìm thấy thông tin sinh viên', 404);
    }

    if (!student.isDormResident) {
      throw new AppError(
        'Bạn không phải sinh viên nội trú. Chức năng này chỉ dành cho sinh viên đang ở KTX.',
        403
      );
    }

    if (!student.roomId) {
      throw new AppError(
        'Bạn chưa được xếp phòng KTX. Vui lòng liên hệ quản lý KTX.',
        403
      );
    }

    const { page = 1, limit = 50, status } = options;
    const skip = (page - 1) * limit;

    // Lấy danh sách tất cả sinh viên cùng phòng (sử dụng Repository)
    const roommates = await studentRepository.findByRoom(student.roomId._id);
    const roommateIds = roommates.map(s => s._id);

    // Build filters cho query
    const filters = {};
    if (status) filters.status = status;

    // Query yêu cầu của tất cả sinh viên cùng phòng (sử dụng Repository)
    const requests = await dormitoryRepository.findByStudents(roommateIds, {
      skip,
      limit,
      filters
    });

    const total = await dormitoryRepository.countByStudents(roommateIds, filters);

    // Transform data để thêm thông tin người gửi và đánh dấu yêu cầu của chính mình
    const transformedRequests = requests.map(req => ({
      ...req,
      isOwner: req.student?._id?.toString() === student._id.toString(),
      senderName: req.student?.fullName || 'Không xác định',
      senderEmail: req.student?.user?.email || ''
    }));

    return {
      data: transformedRequests,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      },
      studentInfo: {
        id: student._id,
        email: student.user?.email || '',
        fullName: student.fullName,
        roomName: student.roomId?.name || 'Chưa xếp phòng'
      },
      roomInfo: {
        roomId: student.roomId._id,
        roomName: student.roomId.name,
        totalRoommates: roommates.length
      }
    };
  }

  /**
   * Lấy tất cả yêu cầu (Staff/Admin)
   */
  async getAllRequests(options = {}) {
    const { page = 1, limit = 50, status, student } = options;
    const skip = (page - 1) * limit;

    const filters = {};
    if (status) filters.status = status;
    if (student) filters.student = student;

    const requests = await DormitoryRequest.find(filters)
      .populate({
        path: 'student',
        select: 'fullName user roomId',
        populate: [{ path: 'roomId', select: 'name' }, { path: 'user', select: 'email' }]
      })
      .populate('category', 'name')
      .populate('item', 'name')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await DormitoryRequest.countDocuments(filters);

    return {
      data: requests,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    };
  }

  /**
   * Lấy yêu cầu theo ID
   */
  async getRequestById(id, userId, userRole) {
    const request = await DormitoryRequest.findById(id)
      .populate({
        path: 'student',
        select: 'fullName user roomId',
        populate: [{ path: 'roomId', select: 'name' }, { path: 'user', select: 'email' }]
      })
      .populate('category', 'name')
      .populate('item', 'name')
      .lean();

    if (!request) {
      throw new AppError('Yêu cầu không tồn tại', 404);
    }

    // Kiểm tra quyền: Student chỉ xem được của mình
    if (userRole === 'STUDENT') {
      const student = await Student.findOne({ user: userId }).lean();
      if (!student || String(request.student._id) !== String(student._id)) {
        throw new AppError('Bạn không có quyền xem yêu cầu này', 403);
      }
    }

    return request;
  }

  /**
   * Cập nhật yêu cầu (Student - chỉ khi Pending)
   */
  async updateRequest(id, updateData, userId) {
    const student = await this.validateDormitoryResident(userId);

    const request = await DormitoryRequest.findById(id);
    if (!request) {
      throw new AppError('Yêu cầu không tồn tại', 404);
    }

    // Kiểm tra quyền sở hữu
    if (String(request.student) !== String(student._id)) {
      throw new AppError('Bạn không có quyền cập nhật yêu cầu này', 403);
    }

    // Chỉ cho phép cập nhật khi Pending
    if (request.status !== 'Pending') {
      throw new AppError(`Không thể cập nhật yêu cầu khi trạng thái là "${request.status}"`, 400);
    }

    // Không cho phép thay đổi status
    if (updateData.status) {
      throw new AppError('Không được phép tự thay đổi trạng thái', 400);
    }

    // Validate category nếu có
    if (updateData.category) {
      const foundCategory = await EquipmentCategory.findById(updateData.category);
      if (!foundCategory) {
        throw new AppError('Danh mục không tồn tại', 400);
      }
    }

    // Validate item nếu có
    if (updateData.item) {
      const categoryId = updateData.category || request.category;
      const foundItem = await EquipmentItem.findOne({ _id: updateData.item, category: categoryId });
      if (!foundItem) {
        throw new AppError('Thiết bị không tồn tại hoặc không thuộc danh mục đã chọn', 400);
      }
    }

    const updated = await DormitoryRequest.findByIdAndUpdate(
      id,
      {
        category: updateData.category || request.category,
        item: updateData.item || request.item,
        description: updateData.description?.trim() || request.description
      },
      { new: true, runValidators: true }
    )
      .populate('category', 'name')
      .populate('item', 'name');

    return updated;
  }

  /**
   * Cập nhật status (Staff/Admin)
   */
  async updateRequestStatus(id, status, updaterId) {
    if (!ALLOWED_STATUSES.includes(status)) {
      throw new AppError(`Trạng thái không hợp lệ. Chỉ cho phép: ${ALLOWED_STATUSES.join(', ')}`, 400);
    }

    const request = await DormitoryRequest.findById(id);
    if (!request) {
      throw new AppError('Yêu cầu không tồn tại', 404);
    }

    const updateFields = { status };
    if (status === 'Approved' || status === 'Rejected') {
      updateFields.confirmDate = new Date();
    }

    const updated = await DormitoryRequest.findByIdAndUpdate(
      id,
      updateFields,
      { new: true, runValidators: true }
    )
      .populate({
        path: 'student',
        select: 'fullName user',
        populate: [{ path: 'roomId', select: 'name' }, { path: 'user', select: 'email' }]
      })
      .populate('category', 'name')
      .populate('item', 'name');

    return updated;
  }

  /**
   * Staff tiếp nhận yêu cầu (Pending -> Under Review)
   * Business Rule: Chỉ cho phép tiếp nhận yêu cầu đang ở trạng thái "Pending"
   * @param {string} requestId - ID yêu cầu
   * @param {string} staffId - ID staff đang xử lý
   * @returns {Object} - Request đã cập nhật
   */
  async acceptRequest(requestId, staffId) {
    // Kiểm tra yêu cầu tồn tại
    const request = await DormitoryRequest.findById(requestId);
    if (!request) {
      throw new AppError('Yêu cầu không tồn tại', 404);
    }

    // Business Rule: Chỉ tiếp nhận được yêu cầu đang ở trạng thái "Pending"
    if (request.status !== 'Pending') {
      throw new AppError(
        `Không thể tiếp nhận yêu cầu khi trạng thái là "${request.status}". Chỉ tiếp nhận được yêu cầu đang chờ xử lý.`,
        400
      );
    }

    // Sử dụng Repository để cập nhật status
    const updated = await dormitoryRepository.updateStatus(requestId, 'Under Review', staffId);

    // Populate đầy đủ thông tin để trả về
    const populatedResult = await DormitoryRequest.findById(requestId)
      .populate({
        path: 'student',
        select: 'fullName user roomId',
        populate: [{ path: 'roomId', select: 'name' }, { path: 'user', select: 'email' }]
      })
      .populate('category', 'name')
      .populate('item', 'name')
      .lean();

    return populatedResult;
  }

  /**
   * Xác nhận sửa chữa - Sinh viên xác nhận đã sửa xong
   * Business Rule: Chỉ cho phép khi status = 'Under Review'
   * @param {string} requestId - ID yêu cầu
   * @param {string} userId - ID user đang đăng nhập
   * @returns {Object} - Request đã cập nhật
   */
  async confirmRepair(requestId, userId) {
    // Validate sinh viên nội trú
    const student = await this.validateDormitoryResident(userId);

    // Kiểm tra yêu cầu tồn tại
    const request = await DormitoryRequest.findById(requestId);
    if (!request) {
      throw new AppError('Yêu cầu không tồn tại', 404);
    }

    // Kiểm tra quyền sở hữu - chỉ chủ yêu cầu mới được xác nhận
    if (String(request.student) !== String(student._id)) {
      throw new AppError('Bạn không có quyền xác nhận yêu cầu này', 403);
    }

    // Kiểm tra status - chỉ cho phép khi đang "Under Review"
    if (request.status !== 'Under Review') {
      throw new AppError(
        `Không thể xác nhận khi trạng thái là "${request.status}". Chỉ xác nhận được khi đang xử lý.`,
        400
      );
    }

    // Sử dụng Repository để cập nhật
    const updated = await dormitoryRepository.confirmRepair(requestId, student._id);

    if (!updated) {
      throw new AppError('Không thể cập nhật yêu cầu', 500);
    }

    return updated;
  }

  /**
   * Xóa yêu cầu
   */
  async deleteRequest(id, userId, userRole) {
    const request = await DormitoryRequest.findById(id);
    if (!request) {
      throw new AppError('Yêu cầu không tồn tại', 404);
    }

    // Student chỉ xóa được của mình và chỉ khi Pending
    if (userRole === 'STUDENT') {
      const student = await Student.findOne({ user: userId }).lean();
      if (!student || String(request.student) !== String(student._id)) {
        throw new AppError('Bạn không có quyền xóa yêu cầu này', 403);
      }
      if (request.status !== 'Pending') {
        throw new AppError('Chỉ có thể xóa yêu cầu đang ở trạng thái Pending', 400);
      }
    }

    await DormitoryRequest.findByIdAndDelete(id);
    return true;
  }

  // ==========================================
  // STATISTICS (Thống kê cơ bản)
  // ==========================================

  /**
   * Thống kê yêu cầu theo tháng
   */
  async getRequestStatsByMonth() {
    return await DormitoryRequest.aggregate([
      {
        $group: {
          _id: {
            year: { $year: "$requestDate" },
            month: { $month: "$requestDate" }
          },
          count: { $sum: 1 }
        }
      },
      {
        $project: {
          year: "$_id.year",
          month: { $arrayElemAt: [monthLabels, "$_id.month"] },
          count: 1,
          _id: 0
        }
      },
      { $sort: { year: 1, "_id.month": 1 } }
    ]);
  }
}

module.exports = new DormitoryRequestService();
