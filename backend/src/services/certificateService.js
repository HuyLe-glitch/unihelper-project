const certificateRepository = require('../repositories/certificateRepository');
const CertificateRequest = require('../models/CertificateRequest');

/**
 * Helper function để tạo operational error với field
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
 * Certificate Service - Business Logic Layer
 * Xử lý toàn bộ logic nghiệp vụ
 */
const certificateService = {
  // ==========================================
  // CERTIFICATE TYPE OPERATIONS
  // ==========================================

  /**
   * Lấy tất cả loại chứng nhận
   */
  getAllTypes: async () => {
    const types = await certificateRepository.getAllTypes();
    return {
      success: true,
      count: types.length,
      data: types
    };
  },

  /**
   * Lấy loại chứng nhận theo ID
   */
  getTypeById: async (typeId) => {
    const type = await certificateRepository.getTypeById(typeId);
    if (!type) {
      throw createError('Không tìm thấy loại chứng nhận', 404);
    }
    return { success: true, data: type };
  },

  /**
   * Tạo loại chứng nhận mới - BUSINESS LOGIC: Check trùng tên
   */
  createType: async (typeData) => {
    const { name } = typeData;

    // BUSINESS LOGIC: Check trùng tên loại chứng nhận (unique trong toàn hệ thống)
    const existingType = await certificateRepository.checkTypeNameExists(name);
    if (existingType) {
      throw createError(
        `Tên loại chứng nhận "${name}" đã tồn tại trong hệ thống`,
        409,
        'name'
      );
    }

    const newType = await certificateRepository.createType({
      name: name.trim(),
      description: typeData.description?.trim() || ''
    });

    // Populate certificateCount
    const populatedType = await certificateRepository.getTypeById(newType._id);

    return {
      success: true,
      message: 'Tạo loại chứng nhận thành công',
      data: populatedType
    };
  },

  /**
   * Cập nhật loại chứng nhận - BUSINESS LOGIC: Check trùng tên (trừ chính nó)
   */
  updateType: async (typeId, updateData) => {
    // Kiểm tra loại chứng nhận tồn tại
    const existingType = await certificateRepository.getTypeById(typeId);
    if (!existingType) {
      throw createError('Không tìm thấy loại chứng nhận', 404);
    }

    // BUSINESS LOGIC: Check trùng tên nếu có update tên
    if (updateData.name && updateData.name.trim().toLowerCase() !== existingType.name.toLowerCase()) {
      const duplicateType = await certificateRepository.checkTypeNameExists(updateData.name, typeId);
      if (duplicateType) {
        throw createError(
          `Tên loại chứng nhận "${updateData.name}" đã tồn tại trong hệ thống`,
          409,
          'name'
        );
      }
    }

    const updatedType = await certificateRepository.updateType(typeId, {
      name: updateData.name?.trim(),
      description: updateData.description?.trim()
    });

    return {
      success: true,
      message: 'Cập nhật loại chứng nhận thành công',
      data: updatedType
    };
  },

  /**
   * Xóa loại chứng nhận - BUSINESS LOGIC: Kiểm tra ràng buộc trước khi xóa
   */
  deleteType: async (typeId) => {
    const type = await certificateRepository.getTypeById(typeId);
    if (!type) {
      throw createError('Không tìm thấy loại chứng nhận', 404);
    }

    // Kiểm tra có yêu cầu chứng nhận nào liên quan không
    const relatedRequestsCount = await CertificateRequest.countDocuments({ certificateType: typeId });
    if (relatedRequestsCount > 0) {
      throw createError(
        `Không thể xóa loại chứng nhận "${type.name}" vì đã có ${relatedRequestsCount} yêu cầu liên quan trong hệ thống`,
        400,
        'certificateType',
        { relatedRequestsCount }
      );
    }

    // Đếm số chứng nhận sẽ bị xóa
    const certificateCount = await certificateRepository.countCertificatesByType(typeId);

    // Xóa tất cả chứng nhận trong loại
    await certificateRepository.deleteCertificatesByType(typeId);

    // Xóa loại chứng nhận
    await certificateRepository.deleteType(typeId);

    return {
      success: true,
      message: `Đã xóa loại chứng nhận "${type.name}" và ${certificateCount} chứng nhận liên quan`
    };
  },

  /**
   * Kiểm tra có thể xóa loại chứng nhận không
   * Trả về thông tin để frontend hiển thị dialog phù hợp
   */
  checkCanDeleteType: async (typeId) => {
    const type = await certificateRepository.getTypeById(typeId);
    if (!type) {
      throw createError('Không tìm thấy loại chứng nhận', 404);
    }

    // Kiểm tra có yêu cầu chứng nhận nào liên quan không
    const relatedRequestsCount = await CertificateRequest.countDocuments({ certificateType: typeId });
    
    // Đếm số chứng nhận trong loại
    const certificateCount = await certificateRepository.countCertificatesByType(typeId);

    if (relatedRequestsCount > 0) {
      return {
        success: true,
        canDelete: false,
        data: {
          type,
          relatedRequestsCount,
          certificateCount,
          message: `Không thể xóa loại chứng nhận "${type.name}" vì đã có ${relatedRequestsCount} yêu cầu chứng nhận liên quan trong hệ thống`
        }
      };
    }

    return {
      success: true,
      canDelete: true,
      data: {
        type,
        certificateCount,
        message: certificateCount > 0 
          ? `Xóa loại chứng nhận "${type.name}" sẽ xóa luôn ${certificateCount} chứng nhận trong đó`
          : `Bạn có chắc chắn muốn xóa loại chứng nhận "${type.name}"?`
      }
    };
  },

  // ==========================================
  // CERTIFICATE OPERATIONS
  // ==========================================

  /**
   * Lấy tất cả chứng nhận
   */
  getAllCertificates: async (filters = {}) => {
    const certificates = await certificateRepository.getAllCertificates(filters);
    return {
      success: true,
      count: certificates.length,
      data: certificates
    };
  },

  /**
   * Lấy chứng nhận theo ID
   */
  getCertificateById: async (certificateId) => {
    const certificate = await certificateRepository.getCertificateById(certificateId);
    if (!certificate) {
      throw createError('Không tìm thấy chứng nhận', 404);
    }
    return { success: true, data: certificate };
  },

  /**
   * Lấy chứng nhận theo loại
   */
  getCertificatesByType: async (typeId) => {
    // Kiểm tra loại chứng nhận tồn tại
    const type = await certificateRepository.getTypeById(typeId);
    if (!type) {
      throw createError('Không tìm thấy loại chứng nhận', 404);
    }

    const certificates = await certificateRepository.getCertificatesByType(typeId);
    return {
      success: true,
      count: certificates.length,
      data: certificates
    };
  },

  /**
   * Tạo chứng nhận đơn lẻ - BUSINESS LOGIC: Check trùng tên
   */
  createCertificate: async (certificateData) => {
    const { name, certificateType } = certificateData;

    // Kiểm tra loại chứng nhận tồn tại
    const typeExists = await certificateRepository.getTypeById(certificateType);
    if (!typeExists) {
      throw createError('Không tìm thấy loại chứng nhận', 404, 'certificateType');
    }

    // BUSINESS LOGIC: Check trùng tên chứng nhận (unique trong toàn hệ thống)
    const existingCertificate = await certificateRepository.checkCertificateNameExists(name);
    if (existingCertificate) {
      throw createError(
        `Tên chứng nhận "${name}" đã tồn tại trong loại "${existingCertificate.certificateType.name}"`,
        409,
        'name'
      );
    }

    const newCertificate = await certificateRepository.createCertificate({
      name: name.trim(),
      certificateType,
      description: certificateData.description?.trim() || ''
    });

    const populatedCertificate = await certificateRepository.getCertificateById(newCertificate._id);

    return {
      success: true,
      message: 'Tạo chứng nhận thành công',
      data: populatedCertificate
    };
  },

  /**
   * BATCH CREATE CERTIFICATES - Thêm nhiều chứng nhận cùng lúc
   * Business Logic:
   * 1. Validate loại chứng nhận tồn tại
   * 2. Kiểm tra trùng lặp tên giữa các entries
   * 3. Kiểm tra trùng lặp tên với DB (toàn hệ thống)
   * 4. Nếu có BẤT KỲ lỗi nào → KHÔNG thêm gì cả (atomic)
   */
  createCertificatesBatch: async (typeId, certificatesData) => {
    // 1. Validate loại chứng nhận tồn tại
    const type = await certificateRepository.getTypeById(typeId);
    if (!type) {
      throw createError('Không tìm thấy loại chứng nhận', 404);
    }

    const errors = [];

    // 2. Kiểm tra trùng lặp giữa các entries (local)
    const nameMap = {}; // { nameLower: index }

    certificatesData.forEach((entry, index) => {
      const nameLower = entry.name.trim().toLowerCase();

      // Check tên trùng với entries trước
      if (nameMap[nameLower] !== undefined) {
        errors.push({
          entryIndex: index,
          field: 'name',
          message: `Tên "${entry.name}" trùng với chứng nhận #${nameMap[nameLower] + 1}`
        });
      } else {
        nameMap[nameLower] = index;
      }
    });

    // Nếu có lỗi trùng local → dừng ngay
    if (errors.length > 0) {
      const error = createError('Có lỗi trùng lặp giữa các chứng nhận', 400);
      error.errors = errors;
      throw error;
    }

    // 3. Kiểm tra trùng lặp với DB (toàn hệ thống)
    const names = certificatesData.map(e => e.name.trim());
    const existingCertificates = await certificateRepository.checkCertificateNamesExist(names);

    existingCertificates.forEach(existing => {
      const index = names.findIndex(n => n.toLowerCase() === existing.name.toLowerCase());
      if (index !== -1) {
        errors.push({
          entryIndex: index,
          field: 'name',
          message: `Tên "${existing.name}" đã tồn tại trong loại "${existing.certificateType.name}"`
        });
      }
    });

    // Nếu có lỗi trùng với DB → dừng ngay
    if (errors.length > 0) {
      const error = createError('Có chứng nhận đã tồn tại trong hệ thống', 409);
      error.errors = errors;
      throw error;
    }

    // 4. Tất cả hợp lệ → Tạo tất cả certificates
    const certificatesToCreate = certificatesData.map(entry => ({
      name: entry.name.trim(),
      certificateType: typeId,
      description: entry.description?.trim() || ''
    }));

    const createdCertificates = await certificateRepository.createManyCertificates(certificatesToCreate);

    // Populate type info
    const populatedCertificates = await certificateRepository.getAllCertificates({ certificateType: typeId });
    const newCertificates = populatedCertificates.filter(cert => 
      createdCertificates.some(c => c._id.toString() === cert._id.toString())
    );

    return {
      success: true,
      message: `Đã thêm ${createdCertificates.length} chứng nhận thành công`,
      count: createdCertificates.length,
      data: newCertificates
    };
  },

  /**
   * Cập nhật chứng nhận - BUSINESS LOGIC: Check trùng tên (trừ chính nó)
   */
  updateCertificate: async (certificateId, updateData) => {
    // Kiểm tra chứng nhận tồn tại
    const existingCertificate = await certificateRepository.getCertificateById(certificateId);
    if (!existingCertificate) {
      throw createError('Không tìm thấy chứng nhận', 404);
    }

    // BUSINESS LOGIC: Check trùng tên nếu có update tên
    if (updateData.name && updateData.name.trim().toLowerCase() !== existingCertificate.name.toLowerCase()) {
      const duplicateCertificate = await certificateRepository.checkCertificateNameExists(updateData.name, certificateId);
      if (duplicateCertificate) {
        throw createError(
          `Tên chứng nhận "${updateData.name}" đã tồn tại trong loại "${duplicateCertificate.certificateType.name}"`,
          409,
          'name'
        );
      }
    }

    // Nếu thay đổi loại chứng nhận, kiểm tra loại mới tồn tại
    if (updateData.certificateType && updateData.certificateType !== existingCertificate.certificateType._id.toString()) {
      const typeExists = await certificateRepository.getTypeById(updateData.certificateType);
      if (!typeExists) {
        throw createError('Không tìm thấy loại chứng nhận', 404, 'certificateType');
      }
    }

    const updatedCertificate = await certificateRepository.updateCertificate(certificateId, {
      name: updateData.name?.trim(),
      certificateType: updateData.certificateType,
      description: updateData.description?.trim()
    });

    return {
      success: true,
      message: 'Cập nhật chứng nhận thành công',
      data: updatedCertificate
    };
  },

  /**
   * Xóa chứng nhận - Kiểm tra ràng buộc trước khi xóa
   */
  deleteCertificate: async (certificateId) => {
    const certificate = await certificateRepository.getCertificateById(certificateId);
    if (!certificate) {
      throw createError('Không tìm thấy chứng nhận', 404);
    }

    // Kiểm tra có yêu cầu chứng nhận nào liên quan không
    const relatedRequestsCount = await CertificateRequest.countDocuments({ certificateName: certificateId });
    if (relatedRequestsCount > 0) {
      throw createError(
        `Không thể xóa chứng nhận "${certificate.name}" vì đã có ${relatedRequestsCount} yêu cầu liên quan trong hệ thống`,
        400,
        'certificate',
        { relatedRequestsCount }
      );
    }

    await certificateRepository.deleteCertificate(certificateId);

    return {
      success: true,
      message: `Đã xóa chứng nhận "${certificate.name}"`
    };
  },

  /**
   * Kiểm tra có thể xóa chứng nhận không
   * Trả về thông tin để frontend hiển thị dialog phù hợp
   */
  checkCanDeleteCertificate: async (certificateId) => {
    const certificate = await certificateRepository.getCertificateById(certificateId);
    if (!certificate) {
      throw createError('Không tìm thấy chứng nhận', 404);
    }

    // Kiểm tra có yêu cầu chứng nhận nào liên quan không
    const relatedRequestsCount = await CertificateRequest.countDocuments({ certificateName: certificateId });

    if (relatedRequestsCount > 0) {
      return {
        success: true,
        canDelete: false,
        data: {
          certificate,
          relatedRequestsCount,
          message: `Không thể xóa chứng nhận "${certificate.name}" vì đã có ${relatedRequestsCount} yêu cầu liên quan trong hệ thống`
        }
      };
    }

    return {
      success: true,
      canDelete: true,
      data: {
        certificate,
        message: `Bạn có chắc chắn muốn xóa chứng nhận "${certificate.name}"?`
      }
    };
  },

  /**
   * Lấy thống kê
   */
  getStats: async () => {
    const stats = await certificateRepository.getStats();
    return {
      success: true,
      data: stats
    };
  }
};

module.exports = certificateService;
