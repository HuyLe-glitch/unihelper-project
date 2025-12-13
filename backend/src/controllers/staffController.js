const staffService = require('../services/staffService');

class StaffController {

  /**
   * [GET] /staff/profile - Lấy thông tin profile staff
   */
  async getProfile(req, res) {
    try {
      const userId = req.userData.id; // Use .id
      const staff = await staffService.getStaffByUserId(userId);

      res.status(200).json({
        status: true,
        message: 'Staff profile retrieved successfully',
        data: staff
      });
    } catch (error) {
      console.error('Error in getProfile:', error);
      res.status(400).json({
        status: false,
        message: error.message
      });
    }
  }

  /**
   * [GET] /staff/requests - Lấy danh sách yêu cầu dành cho staff
   */
  async getRequests(req, res) {
    try {
      const userId = req.userData.id; // Use .id
      const {
        page = 1,
        limit = 10,
        status,
        sortBy = 'requestDate',
        sortOrder = 'desc'
      } = req.query;

      const options = {
        page: parseInt(page),
        limit: parseInt(limit),
        status,
        sortBy,
        sortOrder
      };

      const result = await staffService.getRequestsForStaff(userId, options);

      res.status(200).json({
        status: true,
        message: 'Requests retrieved successfully',
        data: result
      });
    } catch (error) {
      console.error('Error in getRequests:', error);
      res.status(400).json({
        status: false,
        message: error.message
      });
    }
  }

  /**
   * [GET] /staff/requests/stats - Lấy thống kê yêu cầu
   */
  async getRequestStats(req, res) {
    try {
      const userId = req.userData.id; // Use .id
      const stats = await staffService.getRequestStatsForStaff(userId);

      res.status(200).json({
        status: true,
        message: 'Request statistics retrieved successfully',
        data: stats
      });
    } catch (error) {
      console.error('Error in getRequestStats:', error);
      res.status(400).json({
        status: false,
        message: error.message
      });
    }
  }

  /**
   * [GET] /staff/requests/:requestId - Lấy chi tiết một yêu cầu
   */
  async getRequestById(req, res) {
    try {
      const userId = req.userData.id; // Use .id
      const { requestId } = req.params;

      const request = await staffService.getRequestById(userId, requestId);

      res.status(200).json({
        status: true,
        message: 'Request details retrieved successfully',
        data: request
      });
    } catch (error) {
      console.error('Error in getRequestById:', error);
      res.status(400).json({
        status: false,
        message: error.message
      });
    }
  }

  /**
   * [PUT] /staff/requests/:requestId/status - Cập nhật trạng thái yêu cầu
   */
  async updateRequestStatus(req, res) {
    try {
      const userId = req.userData.id; // Use .id
      const { requestId } = req.params;
      const { status, note } = req.body;

      const updatedRequest = await staffService.updateRequestStatus(
        userId, 
        requestId, 
        status, 
        note
      );

      res.status(200).json({
        status: true,
        message: 'Request status updated successfully',
        data: updatedRequest
      });
    } catch (error) {
      console.error('Error in updateRequestStatus:', error);
      res.status(400).json({
        status: false,
        message: error.message
      });
    }
  }

  /**
   * [GET] /staff/dashboard - Lấy dữ liệu cho dashboard staff
   */
  async getDashboard(req, res) {
    try {
      const userId = req.userData.id; // Use .id

      // Lấy thống kê
      const stats = await staffService.getRequestStatsForStaff(userId);

      // Lấy danh sách yêu cầu gần đây (chưa xử lý)
      const recentRequests = await staffService.getRequestsForStaff(userId, {
        page: 1,
        limit: 5,
        status: 'pending', // This will be mapped to 'ĐANG XỬ LÝ' in repository
        sortBy: 'requestDate',
        sortOrder: 'desc'
      });

      res.status(200).json({
        status: true,
        message: 'Dashboard data retrieved successfully',
        data: {
          stats,
          recentRequests: recentRequests.requests,
          staffInfo: recentRequests.staff
        }
      });
    } catch (error) {
      console.error('Error in getDashboard:', error);
      res.status(400).json({
        status: false,
        message: error.message
      });
    }
  }

  /**
   * [GET] /staff/department/:staffType - Lấy danh sách nhân viên theo phòng ban
   */
  async getStaffByDepartment(req, res) {
    try {
      const { staffType } = req.params;
      const {
        page = 1,
        limit = 10,
        status = 'ACTIVE',
        sortBy = 'dateOfJoining',
        sortOrder = 'desc'
      } = req.query;

      // Validate staffType parameter
      if (!['CTSV', 'KTX'].includes(staffType.toUpperCase())) {
        return res.status(400).json({
          status: false,
          message: 'Invalid staff type. Must be CTSV or KTX'
        });
      }

      const options = {
        page: parseInt(page),
        limit: parseInt(limit),
        status,
        sortBy,
        sortOrder
      };

      const result = await staffService.getStaffByType(staffType.toUpperCase(), options);

      res.status(200).json({
        status: true,
        message: `${staffType.toUpperCase()} staff list retrieved successfully`,
        data: result,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      console.error('Error in getStaffByDepartment:', error);
      res.status(400).json({
        status: false,
        message: error.message,
        timestamp: new Date().toISOString()
      });
    }
  }
}

module.exports = new StaffController();
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
