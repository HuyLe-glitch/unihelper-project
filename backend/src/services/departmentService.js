const Department = require('../models/Department');
const Staff = require('../models/Staff');
const { AppError } = require('../utils/appError');

class DepartmentService {
  async getAllDepartments(staffType) {
    const filter = staffType ? { staffType, isActive: true } : { isActive: true };
    const departments = await Department.find(filter).sort({ name: 1 });
    
    // Lấy staff count cho mỗi department
    const departmentsWithCount = await Promise.all(
      departments.map(async (dept) => {
        const staffCount = await Staff.countDocuments({ department: dept._id });
        return {
          ...dept.toObject(),
          staffCount
        };
      })
    );
    
    return {
      success: true,
      data: departmentsWithCount
    };
  }

  async createDepartment(departmentData) {
    const existingDept = await Department.findOne({ name: departmentData.name });
    if (existingDept) {
      throw new AppError('Tên phòng ban đã tồn tại', 400);
    }

    const department = await Department.create(departmentData);
    return {
      success: true,
      message: 'Tạo phòng ban thành công',
      data: department
    };
  }

  async getDepartmentById(id) {
    const department = await Department.findById(id);
    if (!department) {
      throw new AppError('Không tìm thấy phòng ban', 404);
    }

    // Lấy staff thuộc department này
    const staffList = await Staff.find({ department: id })
      .populate('user', 'name email role')
      .select('staffId position staffType');

    return {
      success: true,
      data: {
        ...department.toObject(),
        staffMembers: staffList,
        staffCount: staffList.length
      }
    };
  }

  async updateDepartment(id, updateData) {
    const department = await Department.findByIdAndUpdate(id, updateData, { 
      new: true 
    });
    
    if (!department) {
      throw new AppError('Không tìm thấy phòng ban', 404);
    }

    return {
      success: true,
      message: 'Cập nhật phòng ban thành công',
      data: department
    };
  }

  // Xóa khi chạy hệ thống thật
  async deleteDepartment(id) {
    const department = await Department.findByIdAndDelete(id);
    if (!department) {
      throw new AppError('Không tìm thấy phòng ban', 404);
    }

    return {
      success: true,
      message: 'Xóa phòng ban thành công'
    };
  }

  // Method mới: Lấy staff thuộc department
  async getStaffByDepartment(departmentId) {
    const department = await Department.findById(departmentId);
    if (!department) {
      throw new AppError('Không tìm thấy phòng ban', 404);
    }

    const staffList = await Staff.find({ department: departmentId })
      .populate('user', 'name email role')
      .sort({ createdAt: -1 });

    return {
      success: true,
      data: {
        department: {
          id: department._id,
          name: department.name,
          staffType: department.staffType
        },
        staffCount: staffList.length,
        staffList
      }
    };
  }
}

module.exports = new DepartmentService();
