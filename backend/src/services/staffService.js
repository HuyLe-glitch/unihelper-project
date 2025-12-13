const staffRepository = require('../repositories/staffRepository');

class StaffService {

  /**
   * Lấy thông tin staff từ user ID
   * @param {String} userId 
   * @returns {Object} Staff information
   */
  async getStaffByUserId(userId) {
    try {
      if (!userId) {
        throw new Error('User ID is required');
      }

      const staff = await staffRepository.findStaffByUserId(userId);
      
      if (!staff) {
        throw new Error('Staff not found');
      }

      return staff;
    } catch (error) {
      throw new Error(`Error fetching staff information: ${error.message}`);
    }
  }

  /**
   * Lấy danh sách yêu cầu dành cho staff
   * @param {String} userId - ID của user staff
   * @param {Object} options - Filter và pagination options
   * @returns {Object} Danh sách yêu cầu và thông tin pagination
   */
  async getRequestsForStaff(userId, options = {}) {
    try {
      if (!userId) {
        throw new Error('User ID is required');
      }

      // Lấy thông tin staff để xác định loại yêu cầu cần xử lý
      const staff = await this.getStaffByUserId(userId);
      
      if (!staff) {
        throw new Error('Staff not found');
      }

      if (!['CTSV', 'KTX'].includes(staff.staffType)) {
        throw new Error('Invalid staff type');
      }

      // Validate options
      const {
        page = 1,
        limit = 10,
        status,
        sortBy = 'requestDate',
        sortOrder = 'desc'
      } = options;

      // Validate pagination parameters
      if (page < 1 || limit < 1 || limit > 100) {
        throw new Error('Invalid pagination parameters');
      }

      // Validate sort parameters
      const allowedSortFields = ['requestDate', 'status', 'certificateType'];
      if (!allowedSortFields.includes(sortBy)) {
        throw new Error('Invalid sort field');
      }

      if (!['asc', 'desc'].includes(sortOrder)) {
        throw new Error('Invalid sort order');
      }

      // Validate status if provided
      if (status) {
        const allowedStatuses = ['pending', 'processing', 'approved', 'rejected', 'valid', 'invalid'];
        if (!allowedStatuses.includes(status)) {
          throw new Error('Invalid status value');
        }
      }

      // Lấy danh sách yêu cầu theo staff type
      const result = await staffRepository.getCertificateRequestsByStaffType(
        staff.staffType, 
        { page, limit, status, sortBy, sortOrder }
      );

      return {
        staff: {
          id: staff._id,
          staffId: staff.staffId,
          staffType: staff.staffType,
          department: staff.department,
          fullName: staff.user.fullName
        },
        ...result
      };
    } catch (error) {
      throw new Error(`Error fetching requests for staff: ${error.message}`);
    }
  }

  /**
   * Lấy thống kê yêu cầu cho staff
   * @param {String} userId 
   * @returns {Object} Statistics
   */
  async getRequestStatsForStaff(userId) {
    try {
      if (!userId) {
        throw new Error('User ID is required');
      }

      // Lấy thông tin staff
      const staff = await this.getStaffByUserId(userId);
      
      if (!staff) {
        throw new Error('Staff not found');
      }

      // Lấy thống kê theo staff type
      const stats = await staffRepository.getRequestStatsByStaffType(staff.staffType);

      return {
        staffType: staff.staffType,
        department: staff.department,
        ...stats
      };
    } catch (error) {
      throw new Error(`Error fetching request statistics: ${error.message}`);
    }
  }

  /**
   * Cập nhật trạng thái yêu cầu
   * @param {String} userId - ID của staff user
   * @param {String} requestId - ID của certificate request
   * @param {String} newStatus - Trạng thái mới
   * @param {String} note - Ghi chú (optional)
   * @returns {Object} Updated request
   */
  async updateRequestStatus(userId, requestId, newStatus, note = '') {
    try {
      if (!userId || !requestId || !newStatus) {
        throw new Error('User ID, Request ID, and new status are required');
      }

      // Validate new status
      const allowedStatuses = ['processing', 'approved', 'rejected', 'valid', 'invalid'];
      if (!allowedStatuses.includes(newStatus)) {
        throw new Error('Invalid status value');
      }

      // Lấy thông tin staff
      const staff = await this.getStaffByUserId(userId);
      
      if (!staff) {
        throw new Error('Staff not found');
      }

      // Cập nhật status
      const updatedRequest = await staffRepository.updateRequestStatus(
        requestId, 
        newStatus, 
        staff._id, 
        note
      );

      if (!updatedRequest) {
        throw new Error('Certificate request not found');
      }

      return updatedRequest;
    } catch (error) {
      throw new Error(`Error updating request status: ${error.message}`);
    }
  }

  /**
   * Lấy chi tiết một yêu cầu cụ thể
   * @param {String} userId - ID của staff user
   * @param {String} requestId - ID của certificate request
   * @returns {Object} Request details
   */
  async getRequestById(userId, requestId) {
    try {
      if (!userId || !requestId) {
        throw new Error('User ID and Request ID are required');
      }

      // Verify staff permissions
      const staff = await this.getStaffByUserId(userId);
      
      if (!staff) {
        throw new Error('Staff not found');
      }

      // Tìm request và kiểm tra quyền truy cập
      const request = await staffRepository.findRequestById(requestId);
      
      if (!request) {
        throw new Error('Certificate request not found');
      }

      // Kiểm tra xem staff có quyền xem request này không
      const hasPermission = this.checkStaffPermissionForRequest(staff.staffType, request.certificateType);
      
      if (!hasPermission) {
        throw new Error('You do not have permission to view this request');
      }

      return request;
    } catch (error) {
      throw new Error(`Error fetching request details: ${error.message}`);
    }
  }

  /**
   * Kiểm tra quyền của staff với loại yêu cầu
   * @param {String} staffType 
   * @param {Object|String} certificateType - Có thể là ObjectId string hoặc populated object
   * @returns {Boolean}
   */
  checkStaffPermissionForRequest(staffType, certificateType) {
    // Tạm thời cho phép tất cả staff xem tất cả requests
    // Vì chưa có logic rõ ràng để phân chia theo certificateType
    return true;
    
    /* 
    // Logic cũ (comment lại):
    const ctsvTypes = ['hoc_phi', 'sinh_vien', 'tot_nghiep', 'ket_qua_hoc_tap'];
    const ktxTypes = ['ktx_confirmation', 'ktx_registration', 'ktx_checkout'];

    // Lấy tên certificateType để so sánh
    let typeName = '';
    if (typeof certificateType === 'string') {
      typeName = certificateType;
    } else if (certificateType && certificateType.name) {
      typeName = certificateType.name.toLowerCase();
    }

    if (staffType === 'CTSV') {
      return ctsvTypes.includes(typeName);
    } else if (staffType === 'KTX') {
      return ktxTypes.includes(typeName);
    }

    return false;
    */
  }

  /**
   * Lấy danh sách nhân viên theo staffType
   * @param {String} staffType - 'CTSV' hoặc 'KTX'
   * @param {Object} options - Filter và pagination options
   * @returns {Object} Danh sách staff và thông tin pagination
   */
  async getStaffByType(staffType, options = {}) {
    try {
      // Validate staffType
      if (!staffType) {
        throw new Error('Staff type is required');
      }

      if (!['CTSV', 'KTX'].includes(staffType)) {
        throw new Error('Invalid staff type. Must be CTSV or KTX');
      }

      // Validate options
      const validatedOptions = {
        page: Math.max(1, parseInt(options.page) || 1),
        limit: Math.min(50, Math.max(1, parseInt(options.limit) || 10)),
        status: options.status || 'ACTIVE',
        sortBy: options.sortBy || 'dateOfJoining',
        sortOrder: ['asc', 'desc'].includes(options.sortOrder) ? options.sortOrder : 'desc'
      };

      // Get staff list from repository
      const result = await staffRepository.getStaffByType(staffType, validatedOptions);

      if (!result || !result.staff) {
        return {
          staff: [],
          pagination: {
            currentPage: 1,
            totalPages: 0,
            totalCount: 0,
            hasNext: false,
            hasPrev: false
          }
        };
      }

      // Format response data
      const formattedStaff = result.staff.map(staff => ({
        _id: staff._id,
        staffId: staff.staffId,
        staffType: staff.staffType,
        department: staff.department,
        email: staff.email,
        hometown: staff.hometown,
        phone: staff.phone,
        dateOfJoining: staff.dateOfJoining,
        status: staff.status,
        user: staff.user ? {
          username: staff.user.username,
          fullName: staff.user.fullName,
          email: staff.user.email
        } : null,
        staffRole: staff.staffRole ? {
          name: staff.staffRole.name,
          description: staff.staffRole.description
        } : null
      }));

      return {
        staff: formattedStaff,
        pagination: result.pagination,
        summary: {
          departmentType: staffType,
          totalStaff: result.pagination.totalCount,
          activeStaff: formattedStaff.filter(s => s.status === 'ACTIVE').length
        }
      };

    } catch (error) {
      throw new Error(`Error getting staff by type: ${error.message}`);
    }
  }
}

module.exports = new StaffService();
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
      department,
      staffRole,
      phone,
      status
    } = payload;

    // 1) Load staff
    const staff = await Staff.findById(id).populate('user department staffRole');
    if (!staff) throw new AppError('Staff not found', 404);

    // 2) Email update
    if (email) {
      const emailNorm = String(email).toLowerCase().trim();
      const existsEmail = await User.findOne({
        email: emailNorm,
        _id: { $ne: staff.user._id }
      });
      if (existsEmail) throw new AppError('Email already exists', 400);
      await User.findByIdAndUpdate(staff.user._id, { email: emailNorm });
    }

    // 3) Department validation và auto-update staffType
    let newDept = null;
    if (department) {
      if (!mongoose.Types.ObjectId.isValid(String(department))) {
        throw new AppError('Invalid department id', 400);
      }
      newDept = await Department.findById(department);
      if (!newDept) throw new AppError('Department not found', 404);
    }

    // 4) StaffRole validation
    if (staffRole) {
      if (!mongoose.Types.ObjectId.isValid(String(staffRole))) {
        throw new AppError('Invalid staffRole id', 400);
      }
      const role = await StaffRole.findById(staffRole);
      if (!role) throw new AppError('StaffRole not found', 404);

      const deptToCheck = newDept || staff.department;
      const deptId = deptToCheck ? String(deptToCheck._id || deptToCheck) : null;

      if (!deptId) {
        throw new AppError('Department is required to validate staffRole', 400);
      }

      const allowedDepts = (role.departments || []).map(d => String(d));
      if (!allowedDepts.includes(deptId)) {
        throw new AppError(`StaffRole ${role.name} không thuộc phòng ban được chỉ định`, 400);
      }
    }

    // 5) staffId uniqueness
    if (staffId && staffId !== staff.staffId) {
      const existsStaffId = await Staff.findOne({ staffId, _id: { $ne: id } });
      if (existsStaffId) throw new AppError('staffId already exists', 400);
    }

    // 6) Validate current role with new department (nếu đổi department mà không đổi role)
    if (newDept && !staffRole && staff.staffRole) {
      const currentRoleId = String(staff.staffRole._id || staff.staffRole);
      const currentRole = await StaffRole.findById(currentRoleId);
      const allowed = (currentRole?.departments || []).map(d => String(d));
      if (!allowed.includes(String(newDept._id))) {
        throw new AppError('Không thể chuyển phòng ban: staffRole hiện tại không hợp lệ với phòng ban mới', 400);
      }
    }

    // 7) Build update object
    const staffUpdate = {};
    if (fullName) staffUpdate.fullName = fullName;
    if (staffId) staffUpdate.staffId = staffId;
    if (department) {
      staffUpdate.department = department;
      staffUpdate.staffType = newDept.staffType; // Auto-update staffType
    }
    if (staffRole) staffUpdate.staffRole = staffRole;
    if (phone) staffUpdate.phone = phone;
    if (status) staffUpdate.status = status;

    // 8) Apply update
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
