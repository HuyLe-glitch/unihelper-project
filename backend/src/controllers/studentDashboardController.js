/**
 * Student Dashboard Controller
 * Xử lý HTTP requests cho dashboard sinh viên
 */
const studentDashboardService = require('../services/studentDashboardService');

class StudentDashboardController {
  /**
   * GET /api/students/dashboard
   * Lấy dữ liệu dashboard cho sinh viên đang đăng nhập
   */
  getDashboard = async (req, res, next) => {
    try {
      const userId = req.user._id;
      const result = await studentDashboardService.getDashboardData(userId);
      res.json(result);
    } catch (error) {
      next(error);
    }
  };
}

module.exports = new StudentDashboardController();
