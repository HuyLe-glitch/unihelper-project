const reportService = require('../services/reportService');

/**
 * Report Controller - Presentation Layer
 * Nhận HTTP Request, gọi Service, trả Response
 */
const reportController = {
  // ==================== SEMESTER ENDPOINTS ====================

  /**
   * GET /api/reports/semesters
   * Lấy danh sách học kỳ cho filter dropdown
   */
  getAllSemesters: async (req, res, next) => {
    try {
      const result = await reportService.getAllSemesters();
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  },

  /**
   * GET /api/reports/semesters/current
   * Lấy học kỳ hiện tại
   */
  getCurrentSemester: async (req, res, next) => {
    try {
      const result = await reportService.getCurrentSemester();
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  },

  // ==================== CTSV REPORT ====================

  /**
   * GET /api/reports/ctsv
   * Lấy báo cáo tổng hợp CTSV
   * Query params: startDate, endDate, granularity (day|week|month)
   */
  getCTSVReport: async (req, res, next) => {
    try {
      const { startDate, endDate, granularity } = req.query;
      
      const result = await reportService.getCTSVReport({
        startDate,
        endDate,
        granularity
      });

      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  },

  // ==================== KTX REPORT ====================

  /**
   * GET /api/reports/ktx
   * Lấy báo cáo tổng hợp KTX
   * Query params: startDate, endDate, granularity (day|week|month)
   */
  getKTXReport: async (req, res, next) => {
    try {
      const { startDate, endDate, granularity } = req.query;
      
      const result = await reportService.getKTXReport({
        startDate,
        endDate,
        granularity
      });

      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }
};

module.exports = reportController;
