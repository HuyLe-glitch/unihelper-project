const semesterRepository = require('../repositories/semesterRepository');

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
 * Semester Service - Business Logic Layer
 * Xử lý toàn bộ logic nghiệp vụ, không để ở Controller hay Frontend
 */
const semesterService = {
  // ==================== SEMESTER TEMPLATE SERVICES ====================

  getAllTemplates: async () => {
    const templates = await semesterRepository.getAllTemplates();
    return {
      success: true,
      count: templates.length,
      data: templates
    };
  },

  getTemplateById: async (templateId) => {
    const template = await semesterRepository.getTemplateById(templateId);
    if (!template) {
      throw createError('Không tìm thấy template', 404);
    }
    return { success: true, data: template };
  },

  createTemplate: async (templateData) => {
    const existingCode = await semesterRepository.checkTemplateCodeExists(templateData.code);
    if (existingCode) {
      throw createError(`Mã template "${templateData.code.toUpperCase()}" đã tồn tại`, 409, 'code');
    }

    const existingName = await semesterRepository.checkTemplateNameExists(templateData.name);
    if (existingName) {
      throw createError(`Tên template "${templateData.name}" đã tồn tại`, 409, 'name');
    }

    const template = await semesterRepository.createTemplate({
      ...templateData,
      code: templateData.code.toUpperCase()
    });

    return {
      success: true,
      message: 'Tạo template thành công',
      data: template
    };
  },

  updateTemplate: async (templateId, updateData) => {
    const template = await semesterRepository.getTemplateById(templateId);
    if (!template) {
      throw createError('Không tìm thấy template', 404);
    }

    if (updateData.code) {
      const existingCode = await semesterRepository.checkTemplateCodeExists(updateData.code, templateId);
      if (existingCode) {
        throw createError(`Mã template "${updateData.code.toUpperCase()}" đã tồn tại`, 409, 'code');
      }
      updateData.code = updateData.code.toUpperCase();
    }

    if (updateData.name) {
      const existingName = await semesterRepository.checkTemplateNameExists(updateData.name, templateId);
      if (existingName) {
        throw createError(`Tên template "${updateData.name}" đã tồn tại`, 409, 'name');
      }
    }

    const updatedTemplate = await semesterRepository.updateTemplate(templateId, updateData);
    return {
      success: true,
      message: 'Cập nhật template thành công',
      data: updatedTemplate
    };
  },

  deleteTemplate: async (templateId) => {
    const template = await semesterRepository.getTemplateById(templateId);
    if (!template) {
      throw createError('Không tìm thấy template', 404);
    }

    const isInUse = await semesterRepository.isTemplateInUse(templateId);
    if (isInUse) {
      const count = await semesterRepository.countSemestersByTemplate(templateId);
      throw createError(`Không thể xóa template này vì đang có ${count} học kỳ sử dụng`, 400);
    }

    await semesterRepository.deleteTemplate(templateId);
    return { success: true, message: 'Xóa template thành công' };
  },

  // ==================== SEMESTER SERVICES ====================

  getAllSemesters: async (filters = {}) => {
    // Sync trạng thái active trước khi trả về danh sách
    await semesterService.syncActiveSemester();

    const parsedFilters = {};
    if (filters.year) parsedFilters.year = parseInt(filters.year);
    if (filters.templateId) parsedFilters.templateId = filters.templateId;
    if (filters.isActive === 'true') parsedFilters.isActive = true;
    else if (filters.isActive === 'false') parsedFilters.isActive = false;

    const semesters = await semesterRepository.getAllSemesters(parsedFilters);
    return {
      success: true,
      count: semesters.length,
      data: semesters
    };
  },

  getSemesterById: async (semesterId) => {
    const semester = await semesterRepository.getSemesterById(semesterId);
    if (!semester) {
      throw createError('Không tìm thấy học kỳ', 404);
    }
    return { success: true, data: semester };
  },

  /**
   * Tạo semester mới - CORE BUSINESS LOGIC
   */
  createSemester: async (semesterData) => {
    const { templateId, year, name, isActive, note } = semesterData;

    // 1. Fetch Template
    const template = await semesterRepository.getTemplateById(templateId);
    if (!template) {
      throw createError('Template không tồn tại', 404, 'templateId');
    }

    // 2. Check trùng tên
    const existingName = await semesterRepository.checkSemesterNameExists(name);
    if (existingName) {
      throw createError(`Tên học kỳ "${name}" đã tồn tại trong hệ thống`, 409, 'name');
    }

    // 3. Check trùng cặp {templateId, year}
    const existingDuplicate = await semesterRepository.checkSemesterDuplicate(templateId, year);
    if (existingDuplicate) {
      const templateInfo = existingDuplicate.templateId;
      throw createError(
        `Học kỳ ${templateInfo.name} (${templateInfo.code}) năm ${year} đã tồn tại với tên: "${existingDuplicate.name}"`,
        409,
        'duplicate',
        {
          existingSemester: {
            id: existingDuplicate._id,
            name: existingDuplicate.name,
            templateCode: templateInfo.code,
            templateName: templateInfo.name,
            year: existingDuplicate.year
          }
        }
      );
    }

    // 4. AUTO-CALCULATE DATES từ Template
    const { startDate, endDate, academicYear } = semesterService.calculateDatesFromTemplate(template, year);

    // 5. Nếu isActive=true, deactivate tất cả semester khác trước
    if (isActive) {
      await semesterRepository.deactivateAllSemesters();
    }

    // 6. Tạo semester
    const newSemester = await semesterRepository.createSemester({
      name,
      year,
      startDate,
      endDate,
      templateId,
      academicYear,
      isActive: isActive || false,
      note
    });

    const populatedSemester = await semesterRepository.getSemesterById(newSemester._id);
    return {
      success: true,
      message: 'Tạo học kỳ thành công',
      data: populatedSemester
    };
  },

  updateSemester: async (semesterId, updateData) => {
    const semester = await semesterRepository.getSemesterById(semesterId);
    if (!semester) {
      throw createError('Không tìm thấy học kỳ', 404);
    }

    if (updateData.name && updateData.name !== semester.name) {
      const existingName = await semesterRepository.checkSemesterNameExists(updateData.name, semesterId);
      if (existingName) {
        throw createError(`Tên học kỳ "${updateData.name}" đã tồn tại trong hệ thống`, 409, 'name');
      }
    }

    if (updateData.isActive === true && !semester.isActive) {
      await semesterRepository.deactivateAllSemesters();
    }

    const allowedUpdates = {};
    if (updateData.name !== undefined) allowedUpdates.name = updateData.name;
    if (updateData.isActive !== undefined) allowedUpdates.isActive = updateData.isActive;
    if (updateData.note !== undefined) allowedUpdates.note = updateData.note;

    const updatedSemester = await semesterRepository.updateSemester(semesterId, allowedUpdates);
    return {
      success: true,
      message: 'Cập nhật học kỳ thành công',
      data: updatedSemester
    };
  },

  deleteSemester: async (semesterId) => {
    const semester = await semesterRepository.getSemesterById(semesterId);
    if (!semester) {
      throw createError('Không tìm thấy học kỳ', 404);
    }

    if (semester.isActive) {
      throw createError('Không thể xóa học kỳ đang hoạt động. Vui lòng kích hoạt học kỳ khác trước.', 400);
    }

    await semesterRepository.deleteSemester(semesterId);
    return { success: true, message: 'Xóa học kỳ thành công' };
  },

  getActiveSemester: async () => {
    // Sync trước khi trả về để đảm bảo dữ liệu chính xác
    await semesterService.syncActiveSemester();
    const semester = await semesterRepository.getActiveSemester();
    return { success: true, data: semester || null };
  },

  /**
   * CORE BUSINESS LOGIC: Tự động xác định học kỳ đang hoạt động
   * Dựa trên thời gian hiện tại và startDate/endDate của các học kỳ
   * 
   * Logic:
   * 1. Lấy thời gian hiện tại
   * 2. Tìm học kỳ có startDate <= currentDate <= endDate
   * 3. Nếu tìm thấy: Activate học kỳ đó, deactivate các học kỳ khác
   * 4. Nếu không tìm thấy (đang nghỉ): Deactivate tất cả
   * 
   * @returns {Object} - Kết quả sync
   */
  syncActiveSemester: async () => {
    // 1. Lấy thời gian hiện tại (đầu ngày để so sánh chính xác)
    const currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);

    // 2. Tìm học kỳ phù hợp với ngày hiện tại
    const matchingSemester = await semesterRepository.findSemesterByDate(currentDate);

    // 3. Xử lý kết quả
    if (matchingSemester) {
      // Nếu học kỳ này đã active rồi thì không cần làm gì
      if (matchingSemester.isActive) {
        return {
          success: true,
          message: `Học kỳ "${matchingSemester.name}" đang hoạt động`,
          data: matchingSemester,
          synced: false
        };
      }

      // Deactivate tất cả trước
      await semesterRepository.deactivateAllSemesters();
      
      // Activate học kỳ phù hợp bằng updateSemester
      const activatedSemester = await semesterRepository.updateSemester(
        matchingSemester._id, 
        { isActive: true }
      );
      
      return {
        success: true,
        message: `Đã tự động kích hoạt học kỳ "${activatedSemester.name}"`,
        data: activatedSemester,
        synced: true
      };
    } else {
      // 4. Không có học kỳ nào phù hợp -> deactivate tất cả
      await semesterRepository.deactivateAllSemesters();
      
      return {
        success: true,
        message: 'Hiện tại không có học kỳ nào đang diễn ra',
        data: null,
        synced: true
      };
    }
  },

  previewDates: async (templateId, year) => {
    const template = await semesterRepository.getTemplateById(templateId);
    if (!template) {
      throw createError('Template không tồn tại', 404);
    }

    const { startDate, endDate, academicYear } = semesterService.calculateDatesFromTemplate(template, year);

    return {
      success: true,
      data: {
        templateCode: template.code,
        templateName: template.name,
        year,
        academicYear,
        startDate,
        endDate,
        startDateFormatted: startDate.toLocaleDateString('vi-VN'),
        endDateFormatted: endDate.toLocaleDateString('vi-VN')
      }
    };
  },

  // ==================== HELPER FUNCTIONS ====================

  /**
   * Tính toán startDate và endDate từ Template + Year
   * 
   * QUY TẮC NIÊN KHÓA:
   * - HK1 (startMonth >= 7): Năm nhập = năm bắt đầu niên khóa
   *   VD: Nhập 2025 → niên khóa 2025-2026, HK bắt đầu 15/08/2025
   * - HK2, HK3 (startMonth < 7): Năm nhập là năm dương lịch, niên khóa trừ 1
   *   VD: HK2 nhập 2026 → niên khóa 2025-2026, HK bắt đầu 01/02/2026
   */
  calculateDatesFromTemplate: (template, year) => {
    const { startMonth, startDay, endMonth, endDay } = template;
    const inputYear = parseInt(year);
    
    // HK1 bắt đầu từ tháng 7-8 (nửa sau năm), HK2/HK3 bắt đầu từ tháng 1-6 (nửa đầu năm)
    const isFirstSemester = startMonth >= 7;
    
    let academicYearStart, academicYearEnd;
    let startDateYear, endDateYear;
    
    if (isFirstSemester) {
      academicYearStart = inputYear;
      academicYearEnd = inputYear + 1;
      startDateYear = inputYear;
      endDateYear = endMonth <= startMonth ? inputYear + 1 : inputYear;
    } else {
      academicYearStart = inputYear - 1;
      academicYearEnd = inputYear;
      startDateYear = inputYear;
      endDateYear = inputYear;
    }

    const startDate = new Date(startDateYear, startMonth - 1, startDay);
    const endDate = new Date(endDateYear, endMonth - 1, endDay);
    const academicYear = `${academicYearStart}-${academicYearEnd}`;

    return { startDate, endDate, academicYear };
  }
};

module.exports = semesterService;
