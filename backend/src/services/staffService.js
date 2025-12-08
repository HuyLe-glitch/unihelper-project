const mongoose = require('mongoose');
const User = require('../models/User');
const Staff = require('../models/Staff');
const StaffRole = require('../models/StaffRole');
const Department = require('../models/Department');
const userRepository = require('../repositories/userRepository');
const staffRepository = require('../repositories/staffRepository');

const { AppError } = require('../utils/appError');

class StaffService {
  // Get all staff with filters and pagination
  async getAllStaff(query = {}, pagination = {}) {
    const { page = 1, limit = 10, department, staffType } = { ...query, ...pagination };

    const filter = {};
    if (department) filter.department = department;
    if (staffType) filter.staffType = staffType;

    const staff = await Staff.find(filter)
      .populate('user', 'name email')
      .populate('department', 'name')
      .populate('staffRole', 'name')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const total = await Staff.countDocuments(filter);

    return {
      staff,
      meta: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  // New createStaff method
  async createStaff(payload = {}) {

    const {
      user,
      fullName,       // moved to Staff model
      staffId,
      staffType,
      department,
      staffRole,
      email,
      password,
      phone,
      status
    } = payload;

    // =========================
    // 1. Validate required fields
    // =========================
    if (!fullName || !staffId || !staffType || !department) {
      throw new AppError('Missing required fields: fullName, staffId, staffType, department', 400);
    }

    // Validate department ID
    if (!mongoose.Types.ObjectId.isValid(String(department))) {
      throw new AppError('Invalid department id', 400);
    }

    // =========================
    // 2. Case A: Existing user supplied
    // =========================
    if (user) {
      if (!mongoose.Types.ObjectId.isValid(String(user))) {
        throw new AppError('Invalid user id', 400);
      }

      const existingUser = await userRepository.findById(user);
      if (!existingUser) throw new AppError('User not found', 404);

      if (existingUser.role !== 'STAFF') {
        throw new AppError('User role is not STAFF role', 400);
      }

      const existingStaff = await staffRepository.findByUser(user);
      if (existingStaff) {
        throw new AppError('Staff profile already exists for this user', 400);
      }

      const existsStaffByStaffId = await Staff.findOne({ staffId });
      if (existsStaffByStaffId) throw new AppError('staffId already exists', 400);
    }

    // =========================
    // 3. Case B: Create new user
    // =========================
    let userId = user;
    let createdUser = null;

    if (!userId) {
      if (!email || !password) {
        throw new AppError('Missing email/password for creating a new user', 400);
      }

      const emailNorm = email.toLowerCase().trim();
      const existsUser = await userRepository.findByEmail(emailNorm);
      if (existsUser) throw new AppError('Email already exists', 400);

      // Ensure staffId not used
      const existsStaffId = await Staff.findOne({ staffId });
      if (existsStaffId) throw new AppError('staffId already exists', 400);

      const newUser = new User({
        email: emailNorm,
        password,
        role: 'STAFF',
        isActive: true
      });

      createdUser = await newUser.save();
      userId = createdUser._id;
    }
    // =========================
    // 4. Validate Department exists
    // =========================
    const dept = await Department.findById(department);
    if (!dept) {
      if (createdUser) await User.findByIdAndDelete(createdUser._id).catch(() => { });
      throw new AppError('Department not found', 404);
    }

    // Validate staffType matches department.staffType
    if (staffType && dept.staffType !== staffType) {
      if (createdUser) await User.findByIdAndDelete(createdUser._id).catch(() => { });
      throw new AppError(`Department ${dept.name} belongs to staffType ${dept.staffType}, does not match provided staffType ${staffType}`, 400);
    }

    // =========================
    // 5. Validate staffRole if provided
    // =========================
    if (staffRole) {
      if (!mongoose.Types.ObjectId.isValid(String(staffRole))) {
        throw new AppError('Invalid staffRole id', 400);
      }

      const roleDoc = await StaffRole.findById(staffRole);
      if (!roleDoc) {
        if (createdUser) await User.findByIdAndDelete(createdUser._id).catch(() => { });
        throw new AppError('StaffRole not found', 404);
      }
    }

    // =========================
    // 6. Create Staff profile
    // =========================
    const staffData = {
      user: userId,
      fullName,
      staffId,
      staffType,
      department
    };

    if (staffRole) staffData.staffRole = staffRole;
    if (phone) staffData.phone = phone;
    if (status) staffData.status = status;

    try {
      const createdStaff = await Staff.create(staffData);

      return {
        success: true,
        message: 'Staff created successfully',
        data: createdStaff
      };

    } catch (err) {
      // Rollback created user if staff creation failed
      if (createdUser) {
        await User.findByIdAndDelete(createdUser._id).catch(() => { });
      }

      // duplicate key error
      if (err && err.code === 11000) {
        const field = Object.keys(err.keyValue)[0];
        const value = err.keyValue[field];
        throw new AppError(`Duplicate value for ${field}: ${value}`, 400);
      }

      throw new AppError(err.message || 'Failed to create staff', 500);
    }
  }

  async updateStaff(id, payload = {}) {

    const {
      email,
      fullName,
      staffId,
      staffType,
      department,
      staffRole,
      phone,
      status
    } = payload;

    // 1) Load staff (populate current user, department, staffRole)
    const staff = await Staff.findById(id).populate('user department staffRole');
    if (!staff) throw new AppError('Staff not found', 404);

    // 2) Normalize department ids to string for comparisons
    const currentDeptId = staff.department ? String(staff.department._id || staff.department) : null;
    const incomingDeptId = department ? String(department) : null;
    const effectiveDeptId = incomingDeptId || currentDeptId; // dept to validate against

    // 3) Email update (unique)
    if (email) {
      const emailNorm = String(email).toLowerCase().trim();
      const existsEmail = await User.findOne({
        email: emailNorm,
        _id: { $ne: staff.user._id }
      });
      if (existsEmail) throw new AppError('Email already exists', 400);
      await User.findByIdAndUpdate(staff.user._id, { email: emailNorm });
    }

    // 4) Department validation (if provided)
    if (department) {
      if (!mongoose.Types.ObjectId.isValid(String(department))) {
        throw new AppError('Invalid department id', 400);
      }
      const deptExists = await Department.findById(department);
      if (!deptExists) throw new AppError('Department not found', 404);
    }

    // 4.5) Validate staffType matches department.staffType
    if (staffType || department) {
      // Lấy department để validate
      let deptToValidate;
      if (department) {
        deptToValidate = await Department.findById(department);
      } else if (currentDeptId) {
        deptToValidate = await Department.findById(currentDeptId);
      }

      if (deptToValidate) {
        const effectiveStaffType = staffType || staff.staffType;
        if (deptToValidate.staffType !== effectiveStaffType) {
          throw new AppError(
            `Phòng ban "${deptToValidate.name}" thuộc loại ${deptToValidate.staffType}, không khớp với staffType: ${effectiveStaffType}`,
            400
          );
        }
      }
    }
    // 5) StaffRole validation (if provided) - must belong to effectiveDeptId
    if (staffRole) {
      if (!mongoose.Types.ObjectId.isValid(String(staffRole))) {
        throw new AppError('Invalid staffRole id', 400);
      }
      const role = await StaffRole.findById(staffRole);
      if (!role) throw new AppError('StaffRole not found', 404);

      // if we don't know department to validate against, require client to provide department
      if (!effectiveDeptId) {
        throw new AppError('Department is required to validate staffRole', 400);
      }

      const allowedDepts = (role.departments || []).map(d => String(d));
      if (!allowedDepts.includes(String(effectiveDeptId))) {
        throw new AppError(`StaffRole ${role.name} không thuộc phòng ban được chỉ định`, 400);
      }
    }

    // 6) staffId uniqueness
    if (staffId && staffId !== staff.staffId) {
      const existsStaffId = await Staff.findOne({ staffId, _id: { $ne: id } });
      if (existsStaffId) throw new AppError('staffId already exists', 400);
    }

    // 7) If changing department (and not changing role), ensure current role still valid in new department
    if (incomingDeptId && !staffRole && staff.staffRole) {
      const currentRoleId = String(staff.staffRole._id || staff.staffRole);
      const currentRole = await StaffRole.findById(currentRoleId);
      const allowed = (currentRole?.departments || []).map(d => String(d));
      if (!allowed.includes(String(incomingDeptId))) {
        throw new AppError('Không thể chuyển phòng ban: staffRole hiện tại không hợp lệ với phòng ban mới', 400);
      }
    }

    // 8) If changing both department and role, we already validated staffRole against incomingDeptId above.

    // 9) Build update object (PATCH semantics)
    const staffUpdate = {};
    if (typeof fullName !== 'undefined') staffUpdate.fullName = fullName;
    if (typeof staffId !== 'undefined') staffUpdate.staffId = staffId;
    if (typeof staffType !== 'undefined') staffUpdate.staffType = staffType;
    if (typeof department !== 'undefined') staffUpdate.department = department;
    if (typeof staffRole !== 'undefined') staffUpdate.staffRole = staffRole;
    if (typeof phone !== 'undefined') staffUpdate.phone = phone;
    if (typeof status !== 'undefined') staffUpdate.status = status;

    // 10) Apply update and return populated doc
    const updated = await Staff.findByIdAndUpdate(id, staffUpdate, {
      new: true,
      runValidators: true
    })
      .populate('user', 'email name')
      .populate('department', 'name')
      .populate('staffRole', 'name');

    return {
      success: true,
      message: 'Staff updated successfully',
      data: updated
    };
  }

  // Get staff roles
  async getStaffRoles(staffId) {
    const staff = await Staff.findById(staffId)
      .populate('staffRole', 'name description permissions');

    if (!staff) {
      throw new AppError('Staff not found', 404);
    }

    return staff.staffRole;
  }

  // Get all available roles
  async getAllRoles() {
    return await StaffRole.find({ isActive: true });
  }

  // Assign role to staff
  async assignRole(staffId, roleId) {
    const Staff = require('../models/Staff');
    const StaffRole = require('../models/StaffRole');
    const mongoose = require('mongoose');
    const { AppError } = require('../utils/appError');

    if (!mongoose.Types.ObjectId.isValid(String(staffId))) throw new AppError('Invalid staff id', 400);
    if (!mongoose.Types.ObjectId.isValid(String(roleId))) throw new AppError('Invalid roleId', 400);

    const staff = await Staff.findById(staffId).populate('department');
    if (!staff) throw new AppError('Staff not found', 404);

    const role = await StaffRole.findById(roleId);
    if (!role) throw new AppError('StaffRole not found', 404);

    const deptId = staff.department ? String(staff.department._id || staff.department) : null;
    if (!deptId) throw new AppError('Staff has no department to validate against', 400);

    const allowed = (role.departments || []).map(d => String(d));
    if (!allowed.includes(deptId)) {
      throw new AppError(`StaffRole "${role.name}" không thuộc phòng ban của nhân viên`, 400);
    }

    const updated = await Staff.findByIdAndUpdate(
      staffId,
      { staffRole: roleId },
      { new: true, runValidators: true }
    )
      .populate('user', 'name email')
      .populate('department', 'name')
      .populate('staffRole', 'name');

    return updated;
  }

  // Remove role from staff
  async removeRole(staffId) {
    const staff = await Staff.findByIdAndUpdate(
      staffId,
      { $unset: { staffRole: 1 } },
      { new: true }
    ).populate('user', 'name email');

    if (!staff) {
      throw new AppError('Staff not found', 404);
    }

    return staff;
  }

  // Get staff by department
  async getStaffByDepartment(departmentId) {
    return await Staff.find({ department: departmentId })
      .populate('user', 'name email')
      .populate('staffRole', 'name');
  }

  // Transfer staff to different department
  async transferDepartment(staffId, departmentId) {
    // Check if department exists
    const department = await Department.findById(departmentId);
    if (!department) {
      throw new AppError('Department not found', 404);
    }

    const staff = await Staff.findByIdAndUpdate(
      staffId,
      { department: departmentId },
      { new: true }
    ).populate('user', 'name email')
      .populate('department', 'name');

    if (!staff) {
      throw new AppError('Staff not found', 404);
    }

    return staff;
  }

  // Delete staff (Xóa phương thức này khi triển khai hệ thống thật)
  async deleteStaff(id) {
    const staff = await Staff.findByIdAndDelete(id);

    if (!staff) {
      throw new AppError('Staff not found', 404);
    }
    return staff;
  }
}

module.exports = new StaffService();
