const Faculty = require('../models/Faculty');
const Major = require('../models/Major');
const { AppError } = require('../utils/appError');

class FacultyService {
  // Get all faculties with major count
  async getAllFaculties() {
    const faculties = await Faculty.find()
      .sort({ name: 1 });

    // Đếm số chuyên ngành cho mỗi khoa
    const facultiesWithCount = await Promise.all(
      faculties.map(async (faculty) => {
        const majorCount = await Major.countDocuments({ faculty: faculty._id });
        return {
          ...faculty.toObject(),
          majorCount
        };
      })
    );

    return {
      success: true,
      data: facultiesWithCount
    };
  }

  // Get faculty by ID with majors
  async getFacultyById(id) {
    const faculty = await Faculty.findById(id);

    if (!faculty) {
      throw new AppError('Không tìm thấy khoa', 404);
    }

    // Lấy danh sách chuyên ngành thuộc khoa
    const majors = await Major.find({ faculty: id }).select('name code description');
    
    return {
      success: true,
      data: {
        ...faculty.toObject(),
        majorCount: majors.length,
        majors
      }
    };
  }

  // Create faculty
  async createFaculty(facultyData) {
    // Kiểm tra trùng code
    const existingCode = await Faculty.findOne({ code: facultyData.code });
    if (existingCode) {
      const error = new AppError('Mã khoa đã tồn tại', 409);
      error.field = 'code';
      throw error;
    }

    // Kiểm tra trùng name
    const existingName = await Faculty.findOne({ name: facultyData.name });
    if (existingName) {
      const error = new AppError('Tên khoa đã tồn tại', 409);
      error.field = 'name';
      throw error;
    }

    const faculty = await Faculty.create(facultyData);

    return {
      success: true,
      message: 'Tạo khoa thành công',
      data: {
        ...faculty.toObject(),
        majorCount: 0
      }
    };
  }

  // Update faculty
  async updateFaculty(id, updateData) {
    const faculty = await Faculty.findById(id);
    if (!faculty) {
      throw new AppError('Không tìm thấy Khoa', 404);
    }

    // Check duplicate code (exclude self)
    if (updateData.code && updateData.code !== faculty.code) {
      const existingCode = await Faculty.findOne({ 
        code: updateData.code,
        _id: { $ne: id }
      });
      if (existingCode) {
        const error = new AppError('Mã Khoa đã tồn tại', 409);
        error.field = 'code';
        throw error;
      }
    }

    // Check duplicate name (exclude self)
    if (updateData.name && updateData.name !== faculty.name) {
      const existingName = await Faculty.findOne({ 
        name: updateData.name,
        _id: { $ne: id }
      });
      if (existingName) {
        const error = new AppError('Tên Khoa đã tồn tại', 409);
        error.field = 'name';
        throw error;
      }
    }

    const updatedFaculty = await Faculty.findByIdAndUpdate(
      id, 
      updateData, 
      { new: true, runValidators: true }
    );

    // Đếm số chuyên ngành
    const majorCount = await Major.countDocuments({ faculty: id });

    return {
      success: true,
      message: 'Cập nhật khoa thành công',
      data: {
        ...updatedFaculty.toObject(),
        majorCount
      }
    };
  }

  // Hard delete faculty - Xóa hoàn toàn khỏi DB (cascade xóa tất cả majors)
  async deleteFaculty(id) {
    const faculty = await Faculty.findById(id);
    if (!faculty) {
      throw new AppError('Không tìm thấy khoa', 404);
    }

    // Xóa tất cả chuyên ngành thuộc khoa này trước
    await Major.deleteMany({ faculty: id });

    // Xóa khoa
    await Faculty.findByIdAndDelete(id);

    return {
      success: true,
      message: 'Đã xóa khoa và tất cả chuyên ngành thuộc khoa'
    };
  }

  // Get majors by faculty
  async getMajorsByFaculty(facultyId) {
    const faculty = await Faculty.findById(facultyId);
    if (!faculty) {
      throw new AppError('Không tìm thấy khoa', 404);
    }

    const majors = await Major.find({ faculty: facultyId })
      .select('name code description');

    return {
      success: true,
      data: {
        faculty: {
          id: faculty._id,
          name: faculty.name,
          code: faculty.code
        },
        majorCount: majors.length,
        majors
      }
    };
  }
}

module.exports = new FacultyService();
