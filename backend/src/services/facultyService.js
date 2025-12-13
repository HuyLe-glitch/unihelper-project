const Faculty = require('../models/Faculty');
const Major = require('../models/Major');
const { AppError } = require('../utils/appError');

class FacultyService {
  // Get all faculties with major count
  async getAllFaculties(filters = {}) {
    const query = { isActive: true, ...filters };
    
    const faculties = await Faculty.find(query)
      .populate('majorCount')
      .sort({ name: 1 });

    return {
      success: true,
      data: faculties
    };
  }

  // Get faculty by ID with majors
  async getFacultyById(id) {
    const faculty = await Faculty.findById(id)
      .populate({
        path: 'majors',
        match: { isActive: true },
        select: 'name code description'
      })
      .populate('majorCount');

    if (!faculty) {
      throw new AppError('Không tìm thấy khoa', 404);
    }

    return {
      success: true,
      data: faculty
    };
  }

  // Create faculty
  async createFaculty(facultyData) {
    const existingCode = await Faculty.findOne({ code: facultyData.code });
    if (existingCode) {
      throw new AppError('Mã khoa đã tồn tại', 400);
    }

    const existingName = await Faculty.findOne({ name: facultyData.name });
    if (existingName) {
      throw new AppError('Tên khoa đã tồn tại', 400);
    }

    const faculty = await Faculty.create(facultyData);

    return {
      success: true,
      message: 'Tạo khoa thành công',
      data: faculty
    };
  }

  // Update faculty
  async updateFaculty(id, updateData) {
  
    const faculty = await Faculty.findById(id);
    if (!faculty) {
      throw new AppError('Không tìm thấy Khoa', 404);
    }

    // Convert string "false" to boolean
    if (updateData.isActive !== undefined) {
      updateData.isActive = updateData.isActive === 'false' ? false : updateData.isActive === 'true' ? true : updateData.isActive;
    }

    // Check duplicate code/name if updating
    if (updateData.code && updateData.code !== faculty.code) {
      const existingCode = await Faculty.findOne({ code: updateData.code });
      if (existingCode) {
        throw new AppError('Mã Khoa đã tồn tại', 400);
      }
    }

    if (updateData.name && updateData.name !== faculty.name) {
      const existingName = await Faculty.findOne({ name: updateData.name });
      if (existingName) {
        throw new AppError('Tên Khoa đã tồn tại', 400);
      }
    }

    // Cascade: Update majors based on faculty isActive status
    // Deactivate major
    if (updateData.isActive === false) {
      const result = await Major.updateMany(
        { faculty: id },
        { isActive: false }
      );
    }
    // Activate major 
    else if (updateData.isActive === true) {
      const result = await Major.updateMany(
        { faculty: id },
        { isActive: true }
      );
    }

    const updatedFaculty = await Faculty.findByIdAndUpdate(
      id, 
      updateData, 
      { new: true, runValidators: true }
    ).populate('majorCount');

    return {
      success: true,
      message: 'Cập nhật khoa thành công',
      data: updatedFaculty
    };
  }

  // Soft delete faculty (cascade to majors)
  async deleteFaculty(id) {
    const faculty = await Faculty.findById(id);
    if (!faculty) {
      throw new AppError('Không tìm thấy khoa', 404);
    }

    // Set isActive = false (will trigger cascade)
    faculty.isActive = false;
    await faculty.save();

    return {
      success: true,
      message: 'Xóa khoa thành công (đã cascade to majors)'
    };
  }

  // Get majors by faculty
  async getMajorsByFaculty(facultyId) {
    const faculty = await Faculty.findById(facultyId);
    if (!faculty) {
      throw new AppError('Không tìm thấy khoa', 404);
    }

    const majors = await Major.find({ 
      faculty: facultyId,
      isActive: true 
    }).select('name code description');

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
