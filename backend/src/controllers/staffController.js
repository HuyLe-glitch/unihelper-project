const staffService = require('../services/staffService');
const { STAFF_TYPES } = require('../constants/modelConstants');

/**
 * Staff Controller - Presentation Layer
 * 
 * Hệ thống chỉ có 2 tài khoản staff CỐ ĐỊNH:
 * - Staff CTSV: ctsv@university.edu.vn
 * - Staff KTX: ktx@university.edu.vn
 */
class StaffController {

  /**
   * [GET] /staff/profile - Lấy thông tin profile staff
   */
  async getProfile(req, res) {
    try {
      const userId = req.userData.id;
      const staff = await staffService.getStaffByUserId(userId);

      res.status(200).json({
        status: true,
        message: 'Staff profile retrieved successfully',
        data: {
          ...staff.toObject(),
          userName: staff.user?.name,
          userEmail: staff.user?.email
        }
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
   * [GET] /staff/dashboard - Lấy dữ liệu dashboard
   */
  async getDashboard(req, res) {
    try {
      const userId = req.userData.id;
      const dashboardData = await staffService.getDashboardData(userId);

      res.status(200).json({
        status: true,
        message: 'Dashboard data retrieved successfully',
        data: dashboardData
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
   * [GET] /staff/requests - Lấy danh sách yêu cầu
   * Tự động filter theo staffType (CTSV hoặc KTX)
   */
  async getRequests(req, res) {
    try {
      const userId = req.userData.id;
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
      const userId = req.userData.id;
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
   * [GET] /staff/requests/:requestId - Lấy chi tiết yêu cầu
   */
  async getRequestById(req, res) {
    try {
      const userId = req.userData.id;
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
   * [PUT] /staff/requests/:requestId/status - Cập nhật trạng thái
   */
  async updateRequestStatus(req, res) {
    try {
      const userId = req.userData.id;
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
   * [GET] /staff/info/:staffType - Lấy thông tin staff theo type
   * Chỉ trả về 1 staff vì mỗi type chỉ có 1 staff
   */
  async getStaffByType(req, res) {
    try {
      const { staffType } = req.params;

      const upperType = staffType.toUpperCase();
      if (!Object.values(STAFF_TYPES).includes(upperType)) {
        return res.status(400).json({
          status: false,
          message: 'Invalid staff type. Must be CTSV or KTX'
        });
      }

      const Staff = require('../models/Staff');
      const staff = await Staff.findByType(upperType);

      if (!staff) {
        return res.status(404).json({
          status: false,
          message: `No ${upperType} staff found`
        });
      }

      res.status(200).json({
        status: true,
        message: `${upperType} staff info retrieved successfully`,
        data: {
          staffId: staff.staffId,
          staffType: staff.staffType,
          department: staff.department,
          position: staff.position,
          name: staff.user?.name,
          email: staff.user?.email,
          status: staff.status
        }
      });

    } catch (error) {
      console.error('Error in getStaffByType:', error);
      res.status(400).json({
        status: false,
        message: error.message
      });
    }
  }
}

module.exports = new StaffController();
