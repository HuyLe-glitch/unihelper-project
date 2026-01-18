/**
 * Admin Dashboard Controller
 * 
 * Controller xử lý các request liên quan đến Dashboard Admin
 */

const adminDashboardService = require('../services/adminDashboardService');

class AdminDashboardController {
  /**
   * GET /api/admin/dashboard
   * Lấy dữ liệu dashboard cho Admin
   */
  async getDashboard(req, res) {
    try {
      const dashboardData = await adminDashboardService.getDashboardData();

      return res.status(200).json({
        success: true,
        message: 'Lấy dữ liệu dashboard thành công',
        data: dashboardData
      });
    } catch (error) {
      console.error('Error getting admin dashboard:', error);
      return res.status(500).json({
        success: false,
        message: 'Lỗi khi lấy dữ liệu dashboard',
        error: error.message
      });
    }
  }
}

module.exports = new AdminDashboardController();
