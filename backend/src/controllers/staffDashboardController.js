/**
 * Staff Dashboard Controller
 * Xử lý các request liên quan đến Staff Dashboard
 */
const staffDashboardService = require('../services/staffDashboardService');

/**
 * @desc    Lấy dashboard CTSV cho staff
 * @route   GET /api/staff/dashboard/ctsv
 * @access  Private (Staff CTSV)
 */
const getCtsvDashboard = async (req, res) => {
  try {
    const { limit = 10, status } = req.query;

    const data = await staffDashboardService.getCtsvDashboard({
      limit: parseInt(limit),
      status: status || null
    });

    res.json({
      success: true,
      message: 'Lấy dashboard CTSV thành công',
      data
    });
  } catch (error) {
    console.error('Error getting CTSV dashboard:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy dashboard CTSV',
      error: error.message
    });
  }
};

/**
 * @desc    Lấy dashboard KTX cho staff
 * @route   GET /api/staff/dashboard/ktx
 * @access  Private (Staff KTX)
 */
const getKtxDashboard = async (req, res) => {
  try {
    const { limit = 10, status } = req.query;

    const data = await staffDashboardService.getKtxDashboard({
      limit: parseInt(limit),
      status: status || null
    });

    res.json({
      success: true,
      message: 'Lấy dashboard KTX thành công',
      data
    });
  } catch (error) {
    console.error('Error getting KTX dashboard:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy dashboard KTX',
      error: error.message
    });
  }
};

/**
 * @desc    Lấy thống kê CTSV
 * @route   GET /api/staff/dashboard/ctsv/stats
 * @access  Private (Staff CTSV)
 */
const getCtsvStats = async (req, res) => {
  try {
    const stats = await staffDashboardService.getCtsvStats();

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Error getting CTSV stats:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy thống kê CTSV',
      error: error.message
    });
  }
};

/**
 * @desc    Lấy thống kê KTX
 * @route   GET /api/staff/dashboard/ktx/stats
 * @access  Private (Staff KTX)
 */
const getKtxStats = async (req, res) => {
  try {
    const stats = await staffDashboardService.getKtxStats();

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Error getting KTX stats:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy thống kê KTX',
      error: error.message
    });
  }
};

/**
 * @desc    Lấy yêu cầu CTSV gần đây
 * @route   GET /api/staff/dashboard/ctsv/requests
 * @access  Private (Staff CTSV)
 */
const getRecentCtsvRequests = async (req, res) => {
  try {
    const { limit = 10, status } = req.query;

    const requests = await staffDashboardService.getRecentCtsvRequests(
      parseInt(limit),
      status || null
    );

    res.json({
      success: true,
      data: requests
    });
  } catch (error) {
    console.error('Error getting recent CTSV requests:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy yêu cầu CTSV gần đây',
      error: error.message
    });
  }
};

/**
 * @desc    Lấy yêu cầu KTX gần đây
 * @route   GET /api/staff/dashboard/ktx/requests
 * @access  Private (Staff KTX)
 */
const getRecentKtxRequests = async (req, res) => {
  try {
    const { limit = 10, status } = req.query;

    const requests = await staffDashboardService.getRecentKtxRequests(
      parseInt(limit),
      status || null
    );

    res.json({
      success: true,
      data: requests
    });
  } catch (error) {
    console.error('Error getting recent KTX requests:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy yêu cầu KTX gần đây',
      error: error.message
    });
  }
};

module.exports = {
  getCtsvDashboard,
  getKtxDashboard,
  getCtsvStats,
  getKtxStats,
  getRecentCtsvRequests,
  getRecentKtxRequests
};
