const StaffRole = require('../models/StaffRole');
const Department = require('../models/Department');
const { AppError } = require('../utils/appError');

class StaffRoleService {
  async getAllRoles(departmentId) {
    // Nếu có departmentId, filter theo department
    const filter = { isActive: true };
    if (departmentId) {
      filter.departments = { $in: [departmentId] };
    }

    return await StaffRole.find(filter).populate('departments', 'name');
  }


  async getRoleById(id) {
    const role = await StaffRole.findById(id).populate('departments', 'name');
    if (!role) throw new AppError('Role not found', 404);
    return role;
  }

  async createRole(data) {
    // MUST have at least one department
    if (!data.departments || data.departments.length === 0) {
      throw new AppError('StaffRole must belong to at least one department', 400);
    }
    // Validate each department exists
    for (const depId of data.departments) {
      const exists = await Department.findById(depId);
      if (!exists) throw new AppError(`Department ${depId} not found`, 400);
    }
    const role = await StaffRole.create(data);
    return await role.populate('departments', 'name');
  }

  async updateRole(id, data) {
    // Validate departments nếu có
    if (data.departments && data.departments.length > 0) {
      for (const depId of data.departments) {
        const exists = await Department.findById(depId);
        if (!exists) throw new AppError(`Department ${depId} not found`, 400);
      }
    }

    const updated = await StaffRole.findByIdAndUpdate(id, data, {
      new: true,
      runValidators: true
    }).populate('departments', 'name');

    if (!updated) throw new AppError('Role not found', 404);
    return updated;
  }

  async deleteRole(id) {
    const deleted = await StaffRole.findByIdAndDelete(id);
    if (!deleted) throw new AppError('Role not found', 404);
  }

  async getRolesByDepartment(departmentId) {
    return await StaffRole.find({
      departments: { $in: [departmentId] },
      isActive: true
    }).populate('departments', 'name');
  }
}

module.exports = new StaffRoleService();
