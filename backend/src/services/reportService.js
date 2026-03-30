const reportRepository = require('../repositories/reportRepository');

/**
 * Helper function để tạo operational error
 */
const createError = (message, statusCode, field = null) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  error.status = statusCode >= 500 ? 'error' : 'fail';
  error.isOperational = true;
  if (field) error.field = field;
  return error;
};

/**
 * Report Service - Business Logic Layer
 * Xử lý logic báo cáo, format dữ liệu cho charts
 */
const reportService = {
  // ==================== SEMESTER METHODS ====================

  /**
   * Lấy danh sách học kỳ cho dropdown filter
   */
  getAllSemesters: async () => {
    const semesters = await reportRepository.getAllSemesters();
    return {
      success: true,
      count: semesters.length,
      data: semesters
    };
  },

  /**
   * Lấy học kỳ hiện tại
   */
  getCurrentSemester: async () => {
    const semester = await reportRepository.getCurrentSemester();
    return {
      success: true,
      data: semester
    };
  },

  // ==================== CTSV REPORT ====================

  /**
   * Lấy báo cáo tổng hợp CTSV
   */
  getCTSVReport: async (params) => {
    const { startDate, endDate, granularity = 'day' } = params;

    if (!startDate || !endDate) {
      throw createError('startDate và endDate là bắt buộc', 400);
    }

    // Lấy KPI stats
    const kpiStats = await reportRepository.getCTSVKPIStats(startDate, endDate);

    // Lấy previous period để so sánh
    const prevStats = await reportRepository.getCTSVPreviousPeriodStats(startDate, endDate);

    // Tính % thay đổi
    const changes = calculateChanges(kpiStats, prevStats);

    // Lấy trend data theo granularity
    let trendData;
    switch (granularity) {
      case 'week':
        trendData = await reportRepository.getCTSVTrendByWeek(startDate, endDate);
        trendData = formatWeeklyTrendData(trendData);
        break;
      case 'month':
        trendData = await reportRepository.getCTSVTrendByMonth(startDate, endDate);
        trendData = formatMonthlyTrendData(trendData);
        break;
      default:
        trendData = await reportRepository.getCTSVTrendByDay(startDate, endDate);
        trendData = formatDailyTrendData(trendData, startDate, endDate);
    }

    // Lấy distribution data
    const typeDistribution = await reportRepository.getCTSVDistributionByType(startDate, endDate);
    const statusDistribution = await reportRepository.getCTSVDistributionByStatus(startDate, endDate);
    
    // Lấy tất cả loại chứng nhận để hiển thị đầy đủ
    const allCertificateTypes = await reportRepository.getAllCertificateTypes();

    return {
      success: true,
      data: {
        kpi: {
          total: kpiStats.total,
          approved: kpiStats.approved,
          rejected: kpiStats.rejected,
          pending: kpiStats.pending,
          changes
        },
        trendData,
        typeDistribution: formatDistributionWithAllTypes(typeDistribution, allCertificateTypes),
        statusDistribution: formatStatusDistribution(statusDistribution, 'CTSV')
      }
    };
  },

  // ==================== KTX REPORT ====================

  /**
   * Lấy báo cáo tổng hợp KTX
   */
  getKTXReport: async (params) => {
    const { startDate, endDate, granularity = 'day' } = params;

    if (!startDate || !endDate) {
      throw createError('startDate và endDate là bắt buộc', 400);
    }

    // Lấy KPI stats
    const kpiStats = await reportRepository.getKTXKPIStats(startDate, endDate);

    // Lấy previous period để so sánh
    const prevStats = await reportRepository.getKTXPreviousPeriodStats(startDate, endDate);

    // Tính % thay đổi
    const changes = calculateKTXChanges(kpiStats, prevStats);

    // Lấy trend data theo granularity
    let trendData;
    switch (granularity) {
      case 'week':
        trendData = await reportRepository.getKTXTrendByWeek(startDate, endDate);
        trendData = formatWeeklyTrendDataKTX(trendData);
        break;
      case 'month':
        trendData = await reportRepository.getKTXTrendByMonth(startDate, endDate);
        trendData = formatMonthlyTrendDataKTX(trendData);
        break;
      default:
        trendData = await reportRepository.getKTXTrendByDay(startDate, endDate);
        trendData = formatDailyTrendDataKTX(trendData, startDate, endDate);
    }

    // Lấy distribution data
    const categoryDistribution = await reportRepository.getKTXDistributionByCategory(startDate, endDate);
    const statusDistribution = await reportRepository.getKTXDistributionByStatus(startDate, endDate);
    
    // Lấy tất cả danh mục thiết bị để hiển thị đầy đủ
    const allEquipmentCategories = await reportRepository.getAllEquipmentCategories();

    return {
      success: true,
      data: {
        kpi: {
          total: kpiStats.total,
          approved: kpiStats.approved,
          pending: kpiStats.pending,
          underReview: kpiStats.underReview,
          changes
        },
        trendData,
        categoryDistribution: formatDistributionWithAllCategories(categoryDistribution, allEquipmentCategories),
        statusDistribution: formatStatusDistribution(statusDistribution, 'KTX')
      }
    };
  }
};

// ==================== HELPER FUNCTIONS ====================

/**
 * Tính % thay đổi so với kỳ trước - CTSV
 */
function calculateChanges(current, previous) {
  const calculatePercent = (curr, prev) => {
    if (prev === 0) return curr > 0 ? 100 : 0;
    return Math.round(((curr - prev) / prev) * 100);
  };

  return {
    total: calculatePercent(current.total, previous.total),
    approved: calculatePercent(current.approved, previous.approved),
    rejected: calculatePercent(current.rejected, previous.rejected)
  };
}

/**
 * Tính % thay đổi so với kỳ trước - KTX
 */
function calculateKTXChanges(current, previous) {
  const calculatePercent = (curr, prev) => {
    if (prev === 0) return curr > 0 ? 100 : 0;
    return Math.round(((curr - prev) / prev) * 100);
  };

  return {
    total: calculatePercent(current.total, previous.total),
    approved: calculatePercent(current.approved, previous.approved)
  };
}

/**
 * Format trend data theo ngày - CTSV
 */
function formatDailyTrendData(data, startDate, endDate) {
  const result = [];
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  // Tạo map từ data
  const dataMap = {};
  data.forEach(item => {
    dataMap[item._id] = {
      new: item.total,
      approved: item.approved,
      rejected: item.rejected
    };
  });

  // Fill tất cả ngày trong khoảng
  const current = new Date(start);
  while (current <= end) {
    const dateStr = current.toISOString().split('T')[0];
    const dayName = current.toLocaleDateString('vi-VN', { weekday: 'short', day: 'numeric' });
    
    result.push({
      date: dateStr,
      name: dayName,
      new: dataMap[dateStr]?.new || 0,
      approved: dataMap[dateStr]?.approved || 0,
      rejected: dataMap[dateStr]?.rejected || 0
    });
    
    current.setDate(current.getDate() + 1);
  }

  return result;
}

/**
 * Format trend data theo tuần - CTSV
 */
function formatWeeklyTrendData(data) {
  return data.map((item, index) => ({
    name: `Tuần ${index + 1}`,
    new: item.total,
    approved: item.approved,
    rejected: item.rejected
  }));
}

/**
 * Format trend data theo tháng - CTSV
 */
function formatMonthlyTrendData(data) {
  return data.map(item => ({
    name: `T${item._id.month}/${item._id.year}`,
    new: item.total,
    approved: item.approved,
    rejected: item.rejected
  }));
}

/**
 * Format trend data theo ngày - KTX
 */
function formatDailyTrendDataKTX(data, startDate, endDate) {
  const result = [];
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  const dataMap = {};
  data.forEach(item => {
    dataMap[item._id] = {
      new: item.total,
      approved: item.approved,
      pending: item.pending,
      underReview: item.underReview
    };
  });

  const current = new Date(start);
  while (current <= end) {
    const dateStr = current.toISOString().split('T')[0];
    const dayName = current.toLocaleDateString('vi-VN', { weekday: 'short', day: 'numeric' });
    
    result.push({
      date: dateStr,
      name: dayName,
      new: dataMap[dateStr]?.new || 0,
      approved: dataMap[dateStr]?.approved || 0,
      pending: dataMap[dateStr]?.pending || 0,
      underReview: dataMap[dateStr]?.underReview || 0
    });
    
    current.setDate(current.getDate() + 1);
  }

  return result;
}

/**
 * Format trend data theo tuần - KTX
 */
function formatWeeklyTrendDataKTX(data) {
  return data.map((item, index) => ({
    name: `Tuần ${index + 1}`,
    new: item.total,
    approved: item.approved,
    pending: item.pending,
    underReview: item.underReview
  }));
}

/**
 * Format trend data theo tháng - KTX
 */
function formatMonthlyTrendDataKTX(data) {
  return data.map(item => ({
    name: `T${item._id.month}/${item._id.year}`,
    new: item.total,
    approved: item.approved,
    pending: item.pending,
    underReview: item.underReview
  }));
}

/**
 * Format distribution data với percentage
 */
function formatDistribution(data) {
  const total = data.reduce((sum, item) => sum + item.count, 0);
  
  return data.map(item => ({
    type: item._id,
    count: item.count,
    percentage: total > 0 ? Math.round((item.count / total) * 100) : 0
  }));
}

/**
 * Format distribution data với tất cả loại chứng nhận (bao gồm cả loại có count = 0)
 */
function formatDistributionWithAllTypes(data, allTypes) {
  const total = data.reduce((sum, item) => sum + item.count, 0);
  
  // Tạo map từ data hiện có
  const dataMap = {};
  data.forEach(item => {
    dataMap[item._id] = item.count;
  });
  
  // Merge với tất cả loại
  const result = allTypes.map(type => {
    const count = dataMap[type.name] || 0;
    return {
      type: type.name,
      count: count,
      percentage: total > 0 ? Math.round((count / total) * 100) : 0
    };
  });
  
  // Sắp xếp theo count giảm dần
  return result.sort((a, b) => b.count - a.count);
}

/**
 * Format distribution data với tất cả danh mục thiết bị (bao gồm cả loại có count = 0)
 */
function formatDistributionWithAllCategories(data, allCategories) {
  const total = data.reduce((sum, item) => sum + item.count, 0);
  
  // Tạo map từ data hiện có
  const dataMap = {};
  data.forEach(item => {
    dataMap[item._id] = item.count;
  });
  
  // Merge với tất cả danh mục
  const result = allCategories.map(category => {
    const count = dataMap[category] || 0;
    return {
      type: category,
      count: count,
      percentage: total > 0 ? Math.round((count / total) * 100) : 0
    };
  });
  
  // Sắp xếp theo count giảm dần
  return result.sort((a, b) => b.count - a.count);
}

/**
 * Format status distribution với labels tiếng Việt
 */
function formatStatusDistribution(data, module) {
  const total = data.reduce((sum, item) => sum + item.count, 0);
  
  // CTSV: Hệ thống giấy chứng nhận
  // KTX: Hệ thống báo cáo sự cố thiết bị
  const statusLabels = module === 'CTSV' 
    ? {
        'HỢP LỆ': 'Đã duyệt',
        'KHÔNG HỢP LỆ': 'Bị từ chối',
        'ĐANG XỬ LÝ': 'Đang chờ'
      }
    : {
        'Approved': 'Hoàn thành',     // Đã xử lý xong sự cố
        'Pending': 'Đã gửi',          // Sinh viên đã gửi báo cáo
        'Under Review': 'Tiếp nhận'   // Staff đã tiếp nhận
      };

  return data.map(item => ({
    status: statusLabels[item._id] || item._id,
    originalStatus: item._id,
    count: item.count,
    percentage: total > 0 ? Math.round((item.count / total) * 100) : 0
  }));
}

module.exports = reportService;
