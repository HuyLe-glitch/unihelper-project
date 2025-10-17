const CertificateTemplate = require('../models/CertificateTemplate');
const CertificateType = require('../models/CertificateType');

/**
 * Certificate Repository - Data Access Layer
 * Xử lý tất cả các thao tác database liên quan đến Certificate
 */
class CertificateRepository {
  // =============== CERTIFICATE TEMPLATES ===============

  // Tạo certificate template mới
  async createTemplate(templateData) {
    const template = new CertificateTemplate(templateData);
    return await template.save();
  }

  // Tìm template theo ID
  async findTemplateById(id) {
    return await CertificateTemplate.findById(id).populate('certificateType');
  }

  // Lấy tất cả templates
  async findAllTemplates(filters = {}) {
    return await CertificateTemplate.find(filters)
      .populate('certificateType')
      .sort({ createdAt: -1 });
  }

  // Cập nhật template
  async updateTemplate(id, updateData) {
    return await CertificateTemplate.findByIdAndUpdate(id, updateData, { new: true })
      .populate('certificateType');
  }

  // Xóa template
  async deleteTemplate(id) {
    return await CertificateTemplate.findByIdAndDelete(id);
  }

  // Tìm templates theo type
  async findTemplatesByType(typeId) {
    return await CertificateTemplate.find({ certificateType: typeId })
      .populate('certificateType')
      .sort({ createdAt: -1 });
  }

  // =============== CERTIFICATE TYPES ===============

  // Tạo certificate type mới
  async createType(typeData) {
    const type = new CertificateType(typeData);
    return await type.save();
  }

  // Tìm type theo ID
  async findTypeById(id) {
    return await CertificateType.findById(id);
  }

  // Lấy tất cả types
  async findAllTypes(filters = {}) {
    return await CertificateType.find(filters).sort({ name: 1 });
  }

  // Cập nhật type
  async updateType(id, updateData) {
    return await CertificateType.findByIdAndUpdate(id, updateData, { new: true });
  }

  // Xóa type
  async deleteType(id) {
    return await CertificateType.findByIdAndDelete(id);
  }

  // Tìm type theo name
  async findTypeByName(name) {
    return await CertificateType.findOne({ name });
  }

  // Kiểm tra type name đã tồn tại
  async typeNameExists(name, excludeId = null) {
    const query = { name };
    if (excludeId) {
      query._id = { $ne: excludeId };
    }
    const type = await CertificateType.findOne(query);
    return !!type;
  }

  // Lấy templates active theo type
  async findActiveTemplatesByType(typeId) {
    return await CertificateTemplate.find({
      certificateType: typeId,
      isActive: true
    }).populate('certificateType');
  }

  // Đếm số template theo type
  async countTemplatesByType(typeId) {
    return await CertificateTemplate.countDocuments({ certificateType: typeId });
  }
}

module.exports = new CertificateRepository();
