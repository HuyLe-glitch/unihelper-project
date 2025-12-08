const Major = require('../models/Major');
const Faculty = require('../models/Faculty');
const { AppError } = require('../utils/appError');

class MajorService {
  // Get majors with optional faculty filter
  async getMajors({ faculty }) {
    const filter = { isActive: true };

    if (faculty) {
      filter.faculty = faculty;
    }

    const majors = await Major.find(filter)
      .populate('faculty', 'name code isActive')
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
      .populate('faculty', 'name code isActive');

    if (!major) {
      throw new AppError('Không tìm thấy chuyên ngành', 404);
    }

    return {
      success: true,
      data: major
    };
  }

  // Create major - Validate faculty is active
  async createMajor(majorData) {
    // Check faculty exists and is active
    const faculty = await Faculty.findById(majorData.faculty);
    if (!faculty) {
      throw new AppError('Không tìm thấy khoa', 404);
    }

    if (!faculty.isActive) {
      throw new AppError('Không thể thêm chuyên ngành vào Khoa đã bị vô hiệu hóa', 400);
    }

    // Check duplicate code
    const existingCode = await Major.findOne({ code: majorData.code });
    if (existingCode) {
      throw new AppError('Mã chuyên ngành đã tồn tại', 400);
    }

    // Check duplicate name in same faculty
    const existingName = await Major.findOne({ 
      name: majorData.name,
      faculty: majorData.faculty 
    });
    if (existingName) {
      throw new AppError('Tên chuyên ngành đã tồn tại trong khoa này', 400);
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

    // If updating faculty, validate it's active
    if (updateData.faculty && updateData.faculty !== major.faculty.toString()) {
      const faculty = await Faculty.findById(updateData.faculty);
      if (!faculty) {
        throw new AppError('Không tìm thấy khoa', 404);
      }
      if (!faculty.isActive) {
        throw new AppError('Không thể chuyển chuyên ngành sang khoa đã bị vô hiệu hóa', 400);
      }
    }

    // Check duplicate code
    if (updateData.code && updateData.code !== major.code) {
      const existingCode = await Major.findOne({ code: updateData.code });
      if (existingCode) {
        throw new AppError('Mã chuyên ngành đã tồn tại', 400);
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

  // Soft delete major
  async deleteMajor(id) {
    const major = await Major.findByIdAndUpdate(
      id,
      { isActive: false },
      { new: true }
    );

    if (!major) {
      throw new AppError('Không tìm thấy chuyên ngành', 404);
    }

    return {
      success: true,
      message: 'Xóa chuyên ngành thành công'
    };
  }
}

module.exports = new MajorService();
