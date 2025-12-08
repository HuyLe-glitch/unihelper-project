const Staff = require('../models/Staff');
const StaffRole = require('../models/StaffRole');
const User = require('../models/User');
const Department = require('../models/Department');
const { catchAsync } = require('../utils/appError');
const staffService = require('../services/staffService');
const userService = require('../services/userService');

class StaffController {
  // Add this missing method
  getStaffRoles = catchAsync(async (req, res) => {
    const roles = await staffService.getStaffRoles(req.params.id);

    res.status(200).json({
      success: true,
      data: roles
    });
  });

  // Add method to get all available roles
  getAllRoles = catchAsync(async (req, res) => {
    const roles = await staffService.getAllRoles();

    res.status(200).json({
      success: true,
      data: roles
    });
  })

  // Get all staff
  getAllStaff = catchAsync(async (req, res) => {
    const result = await staffService.getAllStaff(req.query, req.query);

    res.status(200).json({
      success: true,
      data: result.staff,
      meta: result.meta
    });
  });

  // Get staff by ID
  getStaffById = catchAsync(async (req, res) => {
    const staff = await Staff.findById(req.params.id)
      .populate('user', 'name email')
      .populate('department', 'name')
      .populate('staffRole', 'name');

    if (!staff) {
      return res.status(404).json({
        success: false,
        message: 'Staff not found'
      });
    }

    res.status(200).json({
      success: true,
      data: staff
    });
  });

  // Create new staff
  createStaff = catchAsync(async (req, res) => {
    const payload = req.body;

    const result = await staffService.createStaff(payload);

    return res.status(201).json({
      status: 'success',
      message: 'Staff profile created successfully',
      data: result.data
    });
  });

  // Update staff
  // Thay thế method updateStaff trong staffController.js
  updateStaff = catchAsync(async (req, res) => {
    const result = await staffService.updateStaff(req.params.id, req.body);

    res.status(200).json({
      success: true,
      message: result.message,
      data: result.data
    });
  });

  // Delete staff
  deleteStaff = catchAsync(async (req, res) => {
    const staff = await Staff.findByIdAndDelete(req.params.id);

    if (!staff) {
      return res.status(404).json({
        success: false,
        message: 'Staff not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Staff deleted successfully'
    });
  });

  // Assign role to staff
  assignRole = catchAsync(async (req, res) => {
  const { roleId, staffRole } = req.body;
  const mongoose = require('mongoose');

  // debug helper (tạm) - bỏ/comment khi xong
  // console.log('assignRole.req.body=', req.body);

  const rid = roleId || staffRole;
  if (!rid || !mongoose.Types.ObjectId.isValid(String(rid))) {
    // trả lỗi rõ ràng (AppError sẽ được xử lý bởi global handler)
    const { AppError } = require('../utils/appError');
    throw new AppError('Invalid or missing roleId (use JSON body with "roleId" or "staffRole")', 400);
  }

  const updated = await staffService.assignRole(req.params.id, rid);

  res.status(200).json({
    success: true,
    message: 'Role assigned successfully',
    data: updated
  });
});

  // Remove role from staff
  removeRole = catchAsync(async (req, res) => {
    const staff = await Staff.findByIdAndUpdate(
      req.params.id,
      { $unset: { staffRole: 1 } },
      { new: true }
    ).populate('user', 'name email');

    if (!staff) {
      return res.status(404).json({
        success: false,
        message: 'Staff not found'
      });
    }

    res.status(200).json({
      success: true,
      data: staff,
      message: 'Role removed successfully'
    });
  });

  // Get staff by department
  getStaffByDepartment = catchAsync(async (req, res) => {
    const staff = await Staff.find({ department: req.params.departmentId })
      .populate('user', 'name email')
      .populate('staffRole', 'name');

    res.status(200).json({
      success: true,
      data: staff
    });
  });

  // Transfer staff to different department
  transferDepartment = catchAsync(async (req, res) => {
    const { departmentId } = req.body;

    const staff = await Staff.findByIdAndUpdate(
      req.params.id,
      { department: departmentId },
      { new: true }
    ).populate('user', 'name email')
      .populate('department', 'name');

    if (!staff) {
      return res.status(404).json({
        success: false,
        message: 'Staff not found'
      });
    }

    res.status(200).json({
      success: true,
      data: staff,
      message: 'Staff transferred successfully'
    });
  });
}

module.exports = new StaffController();
