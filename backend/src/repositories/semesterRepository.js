const SemesterTemplate = require('../models/SemesterTemplate');
const Semester = require('../models/Semester');

/**
 * Semester Repository - Tương tác với Database
 * Chỉ chứa các operation CRUD, không có business logic
 */
const semesterRepository = {
  // ==================== SEMESTER TEMPLATE OPERATIONS ====================
  
  /**
   * Lấy tất cả templates
   */
  getAllTemplates: async () => {
    return await SemesterTemplate.find().sort({ displayOrder: 1, code: 1 });
  },

  /**
   * Lấy template theo ID
   */
  getTemplateById: async (templateId) => {
    return await SemesterTemplate.findById(templateId);
  },

  /**
   * Lấy template theo code
   */
  getTemplateByCode: async (code) => {
    return await SemesterTemplate.findOne({ code: code.toUpperCase() });
  },

  /**
   * Tạo template mới
   */
  createTemplate: async (templateData) => {
    const template = new SemesterTemplate(templateData);
    return await template.save();
  },

  /**
   * Cập nhật template
   */
  updateTemplate: async (templateId, updateData) => {
    return await SemesterTemplate.findByIdAndUpdate(
      templateId,
      updateData,
      { new: true, runValidators: true }
    );
  },

  /**
   * Xóa template
   */
  deleteTemplate: async (templateId) => {
    return await SemesterTemplate.findByIdAndDelete(templateId);
  },

  /**
   * Kiểm tra template có đang được sử dụng bởi semester nào không
   */
  isTemplateInUse: async (templateId) => {
    const count = await Semester.countDocuments({ templateId });
    return count > 0;
  },

  /**
   * Kiểm tra code template đã tồn tại
   */
  checkTemplateCodeExists: async (code, excludeId = null) => {
    const query = { code: code.toUpperCase() };
    if (excludeId) {
      query._id = { $ne: excludeId };
    }
    return await SemesterTemplate.findOne(query);
  },

  /**
   * Kiểm tra tên template đã tồn tại
   */
  checkTemplateNameExists: async (name, excludeId = null) => {
    const query = { name: name.trim() };
    if (excludeId) {
      query._id = { $ne: excludeId };
    }
    return await SemesterTemplate.findOne(query);
  },

  // ==================== SEMESTER OPERATIONS ====================

  /**
   * Lấy tất cả semesters với populate template
   */
  getAllSemesters: async (filters = {}) => {
    const query = {};
    
    if (filters.year) {
      query.year = filters.year;
    }
    if (filters.templateId) {
      query.templateId = filters.templateId;
    }
    if (typeof filters.isActive === 'boolean') {
      query.isActive = filters.isActive;
    }

    return await Semester.find(query)
      .populate('templateId', 'code name')
      .sort({ startDate: -1 });
  },

  /**
   * Lấy semester theo ID
   */
  getSemesterById: async (semesterId) => {
    return await Semester.findById(semesterId)
      .populate('templateId', 'code name startMonth startDay endMonth endDay');
  },

  /**
   * Tạo semester mới
   */
  createSemester: async (semesterData) => {
    const semester = new Semester(semesterData);
    return await semester.save();
  },

  /**
   * Cập nhật semester
   */
  updateSemester: async (semesterId, updateData) => {
    return await Semester.findByIdAndUpdate(
      semesterId,
      updateData,
      { new: true, runValidators: true }
    ).populate('templateId', 'code name');
  },

  /**
   * Xóa semester
   */
  deleteSemester: async (semesterId) => {
    return await Semester.findByIdAndDelete(semesterId);
  },

  /**
   * Kiểm tra tên semester đã tồn tại
   */
  checkSemesterNameExists: async (name, excludeId = null) => {
    const query = { name: name.trim() };
    if (excludeId) {
      query._id = { $ne: excludeId };
    }
    return await Semester.findOne(query);
  },

  /**
   * Kiểm tra cặp {templateId, year} đã tồn tại
   * (Một năm không thể có 2 học kỳ cùng loại)
   */
  checkSemesterDuplicate: async (templateId, year, excludeId = null) => {
    const query = { templateId, year };
    if (excludeId) {
      query._id = { $ne: excludeId };
    }
    return await Semester.findOne(query).populate('templateId', 'code name');
  },

  /**
   * Lấy semester đang active
   */
  getActiveSemester: async () => {
    return await Semester.findOne({ isActive: true })
      .populate('templateId', 'code name');
  },

  /**
   * Tìm semester theo ngày - Học kỳ nào có startDate <= date <= endDate
   * CHỈ THUẦN QUERY, không có logic if/else
   * @param {Date} date - Ngày cần kiểm tra
   * @returns {Semester|null} - Học kỳ phù hợp hoặc null
   */
  findSemesterByDate: async (date) => {
    return await Semester.findOne({
      startDate: { $lte: date },
      endDate: { $gte: date }
    }).populate('templateId', 'code name');
  },

  /**
   * Deactivate tất cả semesters
   */
  deactivateAllSemesters: async () => {
    return await Semester.updateMany({}, { isActive: false });
  },

  /**
   * Đếm số lượng semesters theo template
   */
  countSemestersByTemplate: async (templateId) => {
    return await Semester.countDocuments({ templateId });
  }
};

module.exports = semesterRepository;
