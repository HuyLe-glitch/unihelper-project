const DormitoryRequest = require('../models/DormitoryRequest');
//Sus
class DormitoryRepository {
  /**
   * Lấy mã yêu cầu tiếp theo (KTX1, KTX2, ..., KTX999, KTX1000, ...)
   * @returns {Promise<string>} Mã yêu cầu mới
   */
  async getNextRequestCode() {
    // Lấy tất cả requestCode hiện có và tìm số lớn nhất
    const requests = await DormitoryRequest.find({
      requestCode: { $exists: true, $ne: null, $regex: /^KTX\d+$/ }
    }).select('requestCode').lean();

    let maxNumber = 0;
    for (const req of requests) {
      const match = req.requestCode.match(/^KTX(\d+)$/);
      if (match) {
        const num = parseInt(match[1], 10);
        if (num > maxNumber) maxNumber = num;
      }
    }

    return `KTX${maxNumber + 1}`;
  }

  /**
   * Tạo yêu cầu mới
   * @param {Object} data - Dữ liệu yêu cầu
   * @returns {Promise<Object>} Yêu cầu đã tạo
   */
  async create(data) {
    const request = new DormitoryRequest(data);
    return request.save();
  }

  async createMany(requests = []) {
    if (!Array.isArray(requests) || requests.length === 0) return [];
    return DormitoryRequest.insertMany(requests);
  }

    // Update findByStudent method to populate category
  async findByStudent(studentId, { skip = 0, limit = 50, filters = {} } = {}) {
    const query = { student: studentId, ...filters };
    return DormitoryRequest.find(query)
      .populate('category', 'name') // Add this line
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean()
      .exec();
  }

  // Update findById method
  async findById(id) {
    return DormitoryRequest.findById(id)
      .populate({
        path: 'student',
        populate: { path: 'roomId', select: 'name' }
      })
      .populate('roomId', 'name') // Populate roomId tại thời điểm tạo yêu cầu
      .populate('category', 'name')
      .lean()
      .exec();
  }

  async updateStatus(id, status, updaterId = null) {
    const update = { status };
    if (status === 'Approved' || status === 'Rejected') update.confirmDate = new Date();
    if (updaterId) update.updatedBy = updaterId;
    return DormitoryRequest.findByIdAndUpdate(id, update, { new: true }).exec();
  }

  async countByStudent(studentId, filters = {}) {
    const query = { student: studentId, ...filters };
    return DormitoryRequest.countDocuments(query).exec();
  }

  /**
   * Lấy yêu cầu của nhiều sinh viên (cùng phòng)
   * @param {Array} studentIds - Danh sách ID sinh viên
   * @param {Object} options - Tùy chọn phân trang và filter
   */
  async findByStudents(studentIds, { skip = 0, limit = 50, filters = {} } = {}) {
    const query = { student: { $in: studentIds }, ...filters };
    return DormitoryRequest.find(query)
      .populate({
        path: 'student',
        select: 'fullName user roomId',
        populate: [
          { path: 'user', select: 'email' },
          { path: 'roomId', select: 'name' }
        ]
      })
      .populate('roomId', 'name') // Populate roomId tại thời điểm tạo yêu cầu
      .populate('category', 'name')
      .populate('item', 'name')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean()
      .exec();
  }

  /**
   * Đếm số yêu cầu của nhiều sinh viên (cùng phòng)
   * @param {Array} studentIds - Danh sách ID sinh viên
   * @param {Object} filters - Bộ lọc
   */
  async countByStudents(studentIds, filters = {}) {
    const query = { student: { $in: studentIds }, ...filters };
    return DormitoryRequest.countDocuments(query).exec();
  }

  /**
   * Xác nhận sửa chữa - Sinh viên xác nhận đã sửa xong
   * @param {string} id - ID yêu cầu
   * @param {string} studentId - ID sinh viên (để verify ownership)
   * @returns {Promise<Object|null>} Request đã cập nhật hoặc null nếu không tìm thấy
   */
  async confirmRepair(id, studentId) {
    return DormitoryRequest.findOneAndUpdate(
      { 
        _id: id, 
        student: studentId,
        status: 'Under Review' // Chỉ cho phép xác nhận khi đang 'Under Review'
      },
      { 
        status: 'Approved',
        confirmDate: new Date()
      },
      { new: true }
    )
    .populate({
      path: 'student',
      select: 'fullName user roomId',
      populate: [
        { path: 'user', select: 'email' },
        { path: 'roomId', select: 'name' }
      ]
    })
    .populate('roomId', 'name') // Populate roomId tại thời điểm tạo yêu cầu
    .populate('category', 'name')
    .populate('item', 'name')
    .exec();
  }
}

module.exports = new DormitoryRepository();