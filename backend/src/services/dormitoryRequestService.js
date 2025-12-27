const DormitoryRequest = require('../models/DormitoryRequest');
const EquipmentCategory = require('../models/EquipmentCategory');
const EquipmentItem = require('../models/EquipmentItem');
const Student = require('../models/Student');
const { AppError } = require('../utils/appError');

const monthLabels = [
  '', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
];

const ALLOWED_STATUSES = ['Pending', 'Under Review', 'Approved', 'Rejected'];

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
    if (item) {
      const foundItem = await EquipmentItem.findOne({ _id: item, category: category });
      if (!foundItem) {
        throw new AppError('Thiết bị không tồn tại hoặc không thuộc danh mục đã chọn', 400);
      }
    }

    // Tạo request
    const created = await DormitoryRequest.create({
      student: student._id,
      category,
      item: item || null,
      description: description?.trim() || '',
      status: 'Pending',
      requestDate: new Date()
    });

    return created;
  }

  /**
   * Lấy danh sách yêu cầu của sinh viên
   */
  async getStudentRequests(userId, options = {}) {
    const student = await this.validateDormitoryResident(userId);

    const { page = 1, limit = 50, status } = options;
    const skip = (page - 1) * limit;

    const filters = { student: student._id };
    if (status) filters.status = status;

    const requests = await DormitoryRequest.find(filters)
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
      },
      studentInfo: {
        id: student._id,
        fullName: student.fullName,
        roomName: student.roomId?.name || 'Chưa xếp phòng'
      }
    };
  }

  /**
   * Lấy tất cả yêu cầu (Staff/Admin)
   */
  async getAllRequests(options = {}) {
    const { page = 1, limit = 50, status, studentId } = options;
    const skip = (page - 1) * limit;

    const filters = {};
    if (status) filters.status = status;
    if (studentId) filters.student = studentId;

    const requests = await DormitoryRequest.find(filters)
      .populate({
        path: 'student',
        select: 'fullName studentId',
        populate: { path: 'roomId', select: 'name' }
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
        select: 'fullName studentId user',
        populate: { path: 'roomId', select: 'name' }
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
        select: 'fullName studentId',
        populate: { path: 'roomId', select: 'name' }
      })
      .populate('category', 'name')
      .populate('item', 'name');

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
