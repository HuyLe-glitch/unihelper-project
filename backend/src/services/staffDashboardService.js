/**
 * Staff Dashboard Service
 * Business Logic Layer cho Staff Dashboard
 */
const staffDashboardRepository = require('../repositories/staffDashboardRepository');

class StaffDashboardService {
  /**
   * Lấy dashboard data cho Staff CTSV
   */
  async getCtsvDashboard(options = {}) {
    const { limit = 10, status = null } = options;

    const [stats, recentRequests] = await Promise.all([
      staffDashboardRepository.getCtsvStats(),
      staffDashboardRepository.getRecentCtsvRequests(limit, status)
    ]);

    return {
      stats,
      recentRequests
    };
  }

  /**
   * Lấy dashboard data cho Staff KTX
   */
  async getKtxDashboard(options = {}) {
    const { limit = 10, status = null } = options;

    const [stats, recentRequests] = await Promise.all([
      staffDashboardRepository.getKtxStats(),
      staffDashboardRepository.getRecentKtxRequests(limit, status)
    ]);

    return {
      stats,
      recentRequests
    };
  }

  /**
   * Lấy thống kê CTSV
   */
  async getCtsvStats() {
    return staffDashboardRepository.getCtsvStats();
  }

  /**
   * Lấy thống kê KTX
   */
  async getKtxStats() {
    return staffDashboardRepository.getKtxStats();
  }

  /**
   * Lấy yêu cầu CTSV gần đây
   */
  async getRecentCtsvRequests(limit = 10, status = null) {
    return staffDashboardRepository.getRecentCtsvRequests(limit, status);
  }

  /**
   * Lấy yêu cầu KTX gần đây
   */
  async getRecentKtxRequests(limit = 10, status = null) {
    return staffDashboardRepository.getRecentKtxRequests(limit, status);
  }
}

module.exports = new StaffDashboardService();
