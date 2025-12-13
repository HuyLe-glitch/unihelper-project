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