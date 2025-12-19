const CertificateType = require('../models/CertificateType');
const Certificate = require('../models/Certificate');

/**
 * Certificate Repository - Tương tác với Database
 * Chỉ chứa các operation CRUD, không có business logic
 */
const certificateRepository = {
  // ==========================================
  // CERTIFICATE TYPE OPERATIONS
  // ==========================================

  /**
   * Lấy tất cả loại chứng nhận
   */
  getAllTypes: async () => {
    return await CertificateType.find()
      .populate('certificateCount')
      .sort({ name: 1 });
  },

  /**
   * Lấy loại chứng nhận theo ID
   */
  getTypeById: async (typeId) => {
    return await CertificateType.findById(typeId)
      .populate('certificateCount');
  },

  /**
   * Kiểm tra tên loại chứng nhận đã tồn tại
   */
  checkTypeNameExists: async (name, excludeId = null) => {
    const query = { name: { $regex: new RegExp(`^${name.trim()}$`, 'i') } };
    if (excludeId) {
      query._id = { $ne: excludeId };
    }
    return await CertificateType.findOne(query);
  },

  /**
   * Tạo loại chứng nhận mới
   */
  createType: async (typeData) => {
    const type = new CertificateType(typeData);
    return await type.save();
  },

  /**
   * Cập nhật loại chứng nhận
   */
  updateType: async (typeId, updateData) => {
    return await CertificateType.findByIdAndUpdate(
      typeId,
      updateData,
      { new: true, runValidators: true }
    ).populate('certificateCount');
  },

  /**
   * Xóa loại chứng nhận
   */
  deleteType: async (typeId) => {
    return await CertificateType.findByIdAndDelete(typeId);
  },

  /**
   * Đếm số loại chứng nhận
   */
  countTypes: async () => {
    return await CertificateType.countDocuments();
  },

  // ==========================================
  // CERTIFICATE OPERATIONS
  // ==========================================

  /**
   * Lấy tất cả chứng nhận
   */
  getAllCertificates: async (filters = {}) => {
    const query = {};
    if (filters.certificateType) {
      query.certificateType = filters.certificateType;
    }

    return await Certificate.find(query)
      .populate('certificateType', 'name')
      .sort({ name: 1 });
  },

  /**
   * Lấy chứng nhận theo ID
   */
  getCertificateById: async (certificateId) => {
    return await Certificate.findById(certificateId)
      .populate('certificateType', 'name');
  },

  /**
   * Lấy chứng nhận theo loại
   */
  getCertificatesByType: async (typeId) => {
    return await Certificate.find({ certificateType: typeId })
      .populate('certificateType', 'name')
      .sort({ name: 1 });
  },

  /**
   * Kiểm tra tên chứng nhận đã tồn tại (trong toàn hệ thống)
   */
  checkCertificateNameExists: async (name, excludeId = null) => {
    const query = { name: { $regex: new RegExp(`^${name.trim()}$`, 'i') } };
    if (excludeId) {
      query._id = { $ne: excludeId };
    }
    return await Certificate.findOne(query).populate('certificateType', 'name');
  },

  /**
   * Kiểm tra nhiều tên chứng nhận cùng lúc
   */
  checkCertificateNamesExist: async (names) => {
    const normalizedNames = names.map(n => new RegExp(`^${n.trim()}$`, 'i'));
    return await Certificate.find({ 
      name: { $in: normalizedNames } 
    }).populate('certificateType', 'name');
  },

  /**
   * Tạo chứng nhận mới
   */
  createCertificate: async (certificateData) => {
    const certificate = new Certificate(certificateData);
    return await certificate.save();
  },

  /**
   * Tạo nhiều chứng nhận cùng lúc
   */
  createManyCertificates: async (certificatesData) => {
    return await Certificate.insertMany(certificatesData);
  },

  /**
   * Cập nhật chứng nhận
   */
  updateCertificate: async (certificateId, updateData) => {
    return await Certificate.findByIdAndUpdate(
      certificateId,
      updateData,
      { new: true, runValidators: true }
    ).populate('certificateType', 'name');
  },

  /**
   * Xóa chứng nhận
   */
  deleteCertificate: async (certificateId) => {
    return await Certificate.findByIdAndDelete(certificateId);
  },

  /**
   * Xóa tất cả chứng nhận theo loại
   */
  deleteCertificatesByType: async (typeId) => {
    return await Certificate.deleteMany({ certificateType: typeId });
  },

  /**
   * Đếm số chứng nhận trong loại
   */
  countCertificatesByType: async (typeId) => {
    return await Certificate.countDocuments({ certificateType: typeId });
  },

  /**
   * Đếm tổng số chứng nhận
   */
  countCertificates: async () => {
    return await Certificate.countDocuments();
  },

  /**
   * Lấy thống kê
   */
  getStats: async () => {
    const [typeCount, certificateCount, certificatesByType] = await Promise.all([
      CertificateType.countDocuments(),
      Certificate.countDocuments(),
      Certificate.aggregate([
        { $group: { _id: '$certificateType', count: { $sum: 1 } } }
      ])
    ]);

    return {
      totalTypes: typeCount,
      totalCertificates: certificateCount,
      certificatesByType
    };
  }
};

module.exports = certificateRepository;
