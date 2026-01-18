/**
 * Admin Dashboard Service
 * 
 * Service xử lý business logic cho Dashboard Admin
 */

const adminDashboardRepository = require('../repositories/adminDashboardRepository');

class AdminDashboardService {
  /**
   * Lấy dữ liệu dashboard cho Admin
   */
  async getDashboardData() {
    try {
      const [stats, recentActivities] = await Promise.all([
        adminDashboardRepository.getStats(),
        adminDashboardRepository.getRecentActivities(10)
      ]);

      // Format thời gian cho activities
      const formattedActivities = recentActivities.map(activity => ({
        ...activity,
        timeFormatted: this.formatTimeAgo(activity.time)
      }));

      return {
        stats,
        recentActivities: formattedActivities
      };
    } catch (error) {
      console.error('Error in AdminDashboardService.getDashboardData:', error);
      throw error;
    }
  }

  /**
   * Format thời gian thành dạng "X phút trước", "X giờ trước"
   */
  formatTimeAgo(date) {
    if (!date) return 'N/A';
    
    const now = new Date();
    const time = new Date(date);
    const diffInSeconds = Math.floor((now - time) / 1000);

    if (diffInSeconds < 60) {
      return 'Vừa xong';
    }

    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) {
      return `${diffInMinutes} phút trước`;
    }

    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) {
      return `${diffInHours} giờ trước`;
    }

    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) {
      return `${diffInDays} ngày trước`;
    }

    const diffInWeeks = Math.floor(diffInDays / 7);
    if (diffInWeeks < 4) {
      return `${diffInWeeks} tuần trước`;
    }

    const diffInMonths = Math.floor(diffInDays / 30);
    if (diffInMonths < 12) {
      return `${diffInMonths} tháng trước`;
    }

    const diffInYears = Math.floor(diffInDays / 365);
    return `${diffInYears} năm trước`;
  }
}

module.exports = new AdminDashboardService();
