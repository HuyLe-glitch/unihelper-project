const Major = require('../models/Major');
const Faculty = require('../models/Faculty');
const Student = require('../models/Student');
const { AppError } = require('../utils/appError');

class MajorService {
  // Get all majors with optional faculty filter
  async getMajors({ faculty }) {
    const filter = {};

    if (faculty) {
      filter.faculty = faculty;
    }

    const majors = await Major.find(filter)
      .populate('faculty', 'name code')
      .sort({ name: 1 });

    return {
      success: true,
      count: majors.length,
      data: majors
    };
  }

  // Get major by ID
  async getMajorById(id) {
    const major = await Major.findById(id)
      .populate('faculty', 'name code');

    if (!major) {
      throw new AppError('Không tìm thấy chuyên ngành', 404);
    }

    return {
      success: true,
      data: major
    };
  }

  // Create major
  async createMajor(majorData) {
    // Check faculty exists
    const faculty = await Faculty.findById(majorData.faculty);
    if (!faculty) {
      throw new AppError('Không tìm thấy khoa', 404);
    }

    // Check duplicate code
    const existingCode = await Major.findOne({ code: majorData.code });
    if (existingCode) {
      const error = new AppError('Mã chuyên ngành đã tồn tại', 409);
      error.field = 'code';
      throw error;
    }

    // Check duplicate name in same faculty
    const existingName = await Major.findOne({ 
      name: majorData.name,
      faculty: majorData.faculty
    });
    if (existingName) {
      const error = new AppError('Tên chuyên ngành đã tồn tại trong khoa này', 409);
      error.field = 'name';
      throw error;
    }

    const major = await Major.create(majorData);
    await major.populate('faculty', 'name code');

    return {
      success: true,
      message: 'Tạo chuyên ngành thành công',
      data: major
    };
  }

  // Update major
  async updateMajor(id, updateData) {
    const major = await Major.findById(id);
    if (!major) {
      throw new AppError('Không tìm thấy chuyên ngành', 404);
    }

    // If updating faculty, validate it exists
    if (updateData.faculty && updateData.faculty !== major.faculty.toString()) {
      const faculty = await Faculty.findById(updateData.faculty);
      if (!faculty) {
        throw new AppError('Không tìm thấy khoa', 404);
      }
    }

    // Check duplicate code (exclude self)
    if (updateData.code && updateData.code !== major.code) {
      const existingCode = await Major.findOne({ 
        code: updateData.code,
        _id: { $ne: id }
      });
      if (existingCode) {
        const error = new AppError('Mã chuyên ngành đã tồn tại', 409);
        error.field = 'code';
        throw error;
      }
    }

    // Check duplicate name in same faculty (exclude self)
    if (updateData.name && updateData.name !== major.name) {
      const targetFaculty = updateData.faculty || major.faculty;
      const existingName = await Major.findOne({ 
        name: updateData.name,
        faculty: targetFaculty,
        _id: { $ne: id }
      });
      if (existingName) {
        const error = new AppError('Tên chuyên ngành đã tồn tại trong khoa này', 409);
        error.field = 'name';
        throw error;
      }
    }

    const updatedMajor = await Major.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).populate('faculty', 'name code');

    return {
      success: true,
      message: 'Cập nhật chuyên ngành thành công',
      data: updatedMajor
    };
  }

  // Hard delete major - Xóa hoàn toàn khỏi DB
  async deleteMajor(id) {
    const major = await Major.findById(id).populate('faculty', 'name');
    if (!major) {
      throw new AppError('Không tìm thấy chuyên ngành', 404);
    }

    // BUSINESS LOGIC: Kiểm tra xem có sinh viên nào thuộc chuyên ngành này không
    const studentCount = await Student.countDocuments({ major: id });
    if (studentCount > 0) {
      const error = new AppError(
        `Không thể xóa chuyên ngành "${major.name}" vì đang có ${studentCount} sinh viên thuộc chuyên ngành này. Vui lòng chuyển sinh viên sang chuyên ngành khác trước khi xóa.`,
        400
      );
      error.studentCount = studentCount;
      error.majorName = major.name;
      throw error;
    }

    await Major.findByIdAndDelete(id);

    return {
      success: true,
      message: 'Đã xóa chuyên ngành hoàn toàn'
    };
  }

  // Kiểm tra xem có thể xóa chuyên ngành không (đếm số sinh viên)
  async checkCanDeleteMajor(id) {
    const major = await Major.findById(id).populate('faculty', 'name');
    if (!major) {
      throw new AppError('Không tìm thấy chuyên ngành', 404);
    }

    const studentCount = await Student.countDocuments({ major: id });

    return {
      success: true,
      data: {
        canDelete: studentCount === 0,
        studentCount,
        majorName: major.name,
        facultyName: major.faculty?.name
      }
    };
  }

  /**
   * Batch Create Majors - Thêm nhiều chuyên ngành cùng lúc
   * Business Logic:
   * 1. Validate khoa tồn tại
   * 2. Kiểm tra trùng lặp code/name giữa các entries
   * 3. Kiểm tra trùng lặp code/name với DB
   * 4. Nếu có BẤT KỲ lỗi nào → KHÔNG thêm gì cả (atomic)
   * 5. Chỉ khi tất cả hợp lệ → thêm tất cả
   */
  async createBatchMajors(facultyId, majorsData) {
    // 1. Validate khoa tồn tại
    const faculty = await Faculty.findById(facultyId);
    if (!faculty) {
      throw new AppError('Không tìm thấy khoa', 404);
    }

    const errors = [];
    
    // 2. Kiểm tra trùng lặp giữa các entries (local)
    const codeMap = {};  // { code: index }
    const nameMap = {};  // { name: index }
    
    majorsData.forEach((entry, index) => {
      const codeUpper = entry.code.toUpperCase();
      const nameLower = entry.name.toLowerCase();
      
      // Check code trùng với entries trước
      if (codeMap[codeUpper] !== undefined) {
        errors.push({
          entryIndex: index,
          field: 'code',
          message: `Mã "${codeUpper}" trùng với chuyên ngành #${codeMap[codeUpper] + 1}`
        });
      } else {
        codeMap[codeUpper] = index;
      }
      
      // Check name trùng với entries trước
      if (nameMap[nameLower] !== undefined) {
        errors.push({
          entryIndex: index,
          field: 'name',
          message: `Tên "${entry.name}" trùng với chuyên ngành #${nameMap[nameLower] + 1}`
        });
      } else {
        nameMap[nameLower] = index;
      }
    });

    // Nếu có lỗi trùng local → dừng ngay
    if (errors.length > 0) {
      const error = new AppError('Có lỗi trùng lặp giữa các chuyên ngành', 400);
      error.errors = errors;
      throw error;
    }

    // 3. Kiểm tra trùng lặp với DB
    const codes = majorsData.map(e => e.code.toUpperCase());
    const names = majorsData.map(e => e.name);
    
    // Check codes exist in DB
    const existingCodes = await Major.find({ code: { $in: codes } }).select('code');
    existingCodes.forEach(existing => {
      const index = codes.findIndex(c => c === existing.code);
      if (index !== -1) {
        errors.push({
          entryIndex: index,
          field: 'code',
          message: `Mã "${existing.code}" đã tồn tại trong hệ thống`
        });
      }
    });

    // Check names exist in same faculty
    const existingNames = await Major.find({ 
      name: { $in: names },
      faculty: facultyId
    }).select('name');
    existingNames.forEach(existing => {
      const index = names.findIndex(n => n === existing.name);
      if (index !== -1) {
        errors.push({
          entryIndex: index,
          field: 'name',
          message: `Tên "${existing.name}" đã tồn tại trong khoa này`
        });
      }
    });

    // Nếu có lỗi trùng với DB → dừng ngay
    if (errors.length > 0) {
      const error = new AppError('Có chuyên ngành đã tồn tại trong hệ thống', 409);
      error.errors = errors;
      throw error;
    }

    // 4. Tất cả hợp lệ → Tạo tất cả majors
    const majorsToCreate = majorsData.map(entry => ({
      name: entry.name.trim(),
      code: entry.code.trim().toUpperCase(),
      description: entry.description?.trim() || '',
      faculty: facultyId
    }));

    const createdMajors = await Major.insertMany(majorsToCreate);
    
    // Populate faculty info
    await Major.populate(createdMajors, { path: 'faculty', select: 'name code' });

    return {
      success: true,
      message: `Đã thêm ${createdMajors.length} chuyên ngành thành công`,
      count: createdMajors.length,
      data: createdMajors
    };
  }
}

module.exports = new MajorService();
