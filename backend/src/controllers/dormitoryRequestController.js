/**
 * Dormitory Request Controller - Thống kê bổ sung
 * 
 * Chứa các endpoint thống kê nâng cao cho báo cáo
 * CRUD chính nằm trong dormitoryController.js
 */

const dormitoryRequestService = require('../services/dormitoryRequestService');
const { catchAsync } = require('../utils/appError');

// Lấy thống kê requestDate theo tháng
exports.getRequestStatsByMonth = catchAsync(async (req, res) => {
  const result = await dormitoryRequestService.getRequestStatsByMonth();
  res.status(200).json({ success: true, data: result });
});

// Lấy thống kê confirmDate theo tháng (chỉ Approved / Rejected)
exports.getConfirmStatsByMonth = catchAsync(async (req, res) => {
  const result = await dormitoryRequestService.getConfirmStatsByMonth();
  res.status(200).json({ success: true, data: result });
});

// Thống kê theo tuần trong tháng
exports.getWeeklyStats = catchAsync(async (req, res) => {
  const month = parseInt(req.query.month, 10);
  const year = parseInt(req.query.year, 10);

  const result = await dormitoryRequestService.getWeeklyStats(month, year);
  res.status(200).json({ success: true, data: result });
});

// Thống kê theo năm
exports.getYearlyStats = catchAsync(async (req, res) => {
  const result = await dormitoryRequestService.getYearlyStats();
  res.status(200).json({ success: true, data: result });
});

// Thống kê theo status
exports.getStatsByStatus = catchAsync(async (req, res) => {
  const month = req.query.month ? parseInt(req.query.month, 10) : null;
  const year  = req.query.year  ? parseInt(req.query.year, 10)  : null;

  const result = await dormitoryRequestService.getStatsByStatus(month, year);
  res.status(200).json({ success: true, data: result });
});
