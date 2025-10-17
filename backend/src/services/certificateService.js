const certificateRepository = require('../repositories/certificateRepository');
const { AppError } = require('../utils/appError');

/**
 * Certificate Service - Business Logic Layer
 * Xử lý logic nghiệp vụ liên quan đến Certificate Management
 */
class CertificateService {
  // =============== CERTIFICATE TYPES ===============

  // Lấy danh sách certificate types
  async getCertificateTypes(filters = {}) {
    const types = await certificateRepository.findAllTypes(filters);

    return {
      success: true,
      message: 'Lấy danh sách certificate types thành công',
      data: types
    };
  }

  // Tạo certificate type mới
  async createCertificateType(typeData) {
    const { name, description, requirements } = typeData;

    // Validation
    if (!name) {
      throw new AppError('Tên certificate type là bắt buộc', 400);
    }

    // Kiểm tra tên đã tồn tại
    const nameExists = await certificateRepository.typeNameExists(name);
    if (nameExists) {
      throw new AppError('Tên certificate type đã tồn tại', 400);
    }

    // Tạo type mới
    const newType = await certificateRepository.createType({
      name,
      description,
      requirements
    });

    return {
      success: true,
      message: 'Tạo certificate type thành công',
      data: newType
    };
  }

  // Cập nhật certificate type
  async updateCertificateType(typeId, updateData) {
    const { name, description, requirements } = updateData;

    // Kiểm tra type tồn tại
    const type = await certificateRepository.findTypeById(typeId);
    if (!type) {
      throw new AppError('Không tìm thấy certificate type', 404);
    }

    // Kiểm tra tên mới nếu có
    if (name && name !== type.name) {
      const nameExists = await certificateRepository.typeNameExists(name, typeId);
      if (nameExists) {
        throw new AppError('Tên certificate type đã tồn tại', 400);
      }
    }

    // Cập nhật type
    const updatedType = await certificateRepository.updateType(typeId, {
      name,
      description,
      requirements
    });

    return {
      success: true,
      message: 'Cập nhật certificate type thành công',
      data: updatedType
    };
  }

  // Xóa certificate type
  async deleteCertificateType(typeId) {
    // Kiểm tra type tồn tại
    const type = await certificateRepository.findTypeById(typeId);
    if (!type) {
      throw new AppError('Không tìm thấy certificate type', 404);
    }

    // Kiểm tra có template nào đang sử dụng không
    const templateCount = await certificateRepository.countTemplatesByType(typeId);
    if (templateCount > 0) {
      throw new AppError('Không thể xóa certificate type đang được sử dụng', 400);
    }

    // Xóa type
    await certificateRepository.deleteType(typeId);

    return {
      success: true,
      message: 'Xóa certificate type thành công'
    };
  }

  // =============== CERTIFICATE TEMPLATES ===============

  // Lấy danh sách certificate templates
  async getCertificateTemplates(filters = {}) {
    const templates = await certificateRepository.findAllTemplates(filters);

    return {
      success: true,
      message: 'Lấy danh sách certificate templates thành công',
      data: templates
    };
  }

  // Lấy template theo ID
  async getCertificateTemplateById(templateId) {
    const template = await certificateRepository.findTemplateById(templateId);
    if (!template) {
      throw new AppError('Không tìm thấy certificate template', 404);
    }

    return {
      success: true,
      data: template
    };
  }

  // Tạo certificate template mới
  async createCertificateTemplate(templateData) {
    const { name, content, certificateType, isActive = true } = templateData;

    // Validation
    if (!name || !content || !certificateType) {
      throw new AppError('Tên, nội dung và loại certificate là bắt buộc', 400);
    }

    // Kiểm tra certificate type tồn tại
    const type = await certificateRepository.findTypeById(certificateType);
    if (!type) {
      throw new AppError('Certificate type không tồn tại', 404);
    }

    // Tạo template mới
    const newTemplate = await certificateRepository.createTemplate({
      name,
      content,
      certificateType,
      isActive
    });

    return {
      success: true,
      message: 'Tạo certificate template thành công',
      data: newTemplate
    };
  }

  // Cập nhật certificate template
  async updateCertificateTemplate(templateId, updateData) {
    const { name, content, certificateType, isActive } = updateData;

    // Kiểm tra template tồn tại
    const template = await certificateRepository.findTemplateById(templateId);
    if (!template) {
      throw new AppError('Không tìm thấy certificate template', 404);
    }

    // Kiểm tra certificate type nếu có thay đổi
    if (certificateType && certificateType !== template.certificateType.toString()) {
      const type = await certificateRepository.findTypeById(certificateType);
      if (!type) {
        throw new AppError('Certificate type không tồn tại', 404);
      }
    }

    // Cập nhật template
    const updatedTemplate = await certificateRepository.updateTemplate(templateId, {
      name,
      content,
      certificateType,
      isActive
    });

    return {
      success: true,
      message: 'Cập nhật certificate template thành công',
      data: updatedTemplate
    };
  }

  // Xóa certificate template
  async deleteCertificateTemplate(templateId) {
    // Kiểm tra template tồn tại
    const template = await certificateRepository.findTemplateById(templateId);
    if (!template) {
      throw new AppError('Không tìm thấy certificate template', 404);
    }

    // Xóa template
    await certificateRepository.deleteTemplate(templateId);

    return {
      success: true,
      message: 'Xóa certificate template thành công'
    };
  }

  // Lấy templates theo type
  async getTemplatesByType(typeId) {
    // Kiểm tra type tồn tại
    const type = await certificateRepository.findTypeById(typeId);
    if (!type) {
      throw new AppError('Certificate type không tồn tại', 404);
    }

    const templates = await certificateRepository.findTemplatesByType(typeId);

    return {
      success: true,
      message: 'Lấy templates theo type thành công',
      data: templates
    };
  }

  // Lấy active templates theo type
  async getActiveTemplatesByType(typeId) {
    // Kiểm tra type tồn tại
    const type = await certificateRepository.findTypeById(typeId);
    if (!type) {
      throw new AppError('Certificate type không tồn tại', 404);
    }

    const templates = await certificateRepository.findActiveTemplatesByType(typeId);

    return {
      success: true,
      message: 'Lấy active templates thành công',
      data: templates
    };
  }

  // Toggle trạng thái active của template
  async toggleTemplateStatus(templateId) {
    // Kiểm tra template tồn tại
    const template = await certificateRepository.findTemplateById(templateId);
    if (!template) {
      throw new AppError('Không tìm thấy certificate template', 404);
    }

    // Toggle trạng thái
    const updatedTemplate = await certificateRepository.updateTemplate(templateId, {
      isActive: !template.isActive
    });

    return {
      success: true,
      message: `${updatedTemplate.isActive ? 'Kích hoạt' : 'Vô hiệu hóa'} template thành công`,
      data: updatedTemplate
    };
  }
}

module.exports = new CertificateService();
