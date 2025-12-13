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

// Lấy tất cả request (admin dùng)
exports.getAllRequests = catchAsync(async (req, res) => {
  const result = await dormitoryRequestService.getAllRequests();
  res.status(200).json({ success: true, data: result });
});

exports.getWeeklyStats = catchAsync(async (req, res) => {
  const month = parseInt(req.query.month, 10);
  const year = parseInt(req.query.year, 10);

  const result = await dormitoryRequestService.getWeeklyStats(month, year);
  res.status(200).json({ success: true, data: result });
});

exports.getYearlyStats = catchAsync(async (req, res) => {
  const result = await dormitoryRequestService.getYearlyStats();
  res.status(200).json({ success: true, data: result });
});


/*exports.getStatsByCategory = catchAsync(async (req, res) => {
  const result = await dormitoryRequestService.getStatsByCategory();
  res.status(200).json({ success: true, data: result });
}); */

exports.getStatsByStatus = catchAsync(async (req, res) => {
  // Lấy từ query string, parse int; nếu không có thì để null để service tự xử lý
  const month = req.query.month ? parseInt(req.query.month, 10) : null;
  const year  = req.query.year  ? parseInt(req.query.year, 10)  : null;

  const result = await dormitoryRequestService.getStatsByStatus(month, year);
  res.status(200).json({ success: true, data: result });
});

// Tạo request
exports.createRequest = catchAsync(async (req, res) => {
  const result = await dormitoryRequestService.createRequest(req.body);
  res.status(201).json({ success: true, data: result });
});
