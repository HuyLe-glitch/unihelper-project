import { apiClient } from './api';

/**
 * Report Service - Gọi API cho báo cáo
 * CHỈ gọi API, KHÔNG có business logic
 */
export const reportsService = {
  // ==================== SEMESTER API ====================

  /**
   * Lấy danh sách học kỳ cho filter
   */
  getAllSemesters: async () => {
    const response = await apiClient.get('/reports/semesters');
    return response.data;
  },

  /**
   * Lấy học kỳ hiện tại
   */
  getCurrentSemester: async () => {
    const response = await apiClient.get('/reports/semesters/current');
    return response.data;
  },

  // ==================== CTSV REPORT API ====================

  /**
   * Lấy báo cáo tổng hợp CTSV
   * @param {Object} params - { startDate, endDate, granularity }
   */
  getCTSVReport: async (params) => {
    const response = await apiClient.get('/reports/ctsv', { params });
    return response.data;
  },

  // ==================== KTX REPORT API ====================

  /**
   * Lấy báo cáo tổng hợp KTX
   * @param {Object} params - { startDate, endDate, granularity }
   */
  getKTXReport: async (params) => {
    const response = await apiClient.get('/reports/ktx', { params });
    return response.data;
  }
};

// ==================== UTILITY FUNCTIONS ====================

/**
 * Generate danh sách tháng trong một học kỳ
 * @param {Date} startDate - Ngày bắt đầu học kỳ
 * @param {Date} endDate - Ngày kết thúc học kỳ
 * @returns {Array} Danh sách tháng
 */
export const generateMonthsInSemester = (startDate, endDate) => {
  const months = [];
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  let current = new Date(start.getFullYear(), start.getMonth(), 1);
  
  while (current <= end) {
    const monthStart = new Date(current);
    const monthEnd = new Date(current.getFullYear(), current.getMonth() + 1, 0);
    
    // Điều chỉnh ngày nếu nằm ngoài học kỳ
    const actualStart = monthStart < start ? start : monthStart;
    const actualEnd = monthEnd > end ? end : monthEnd;
    
    months.push({
      value: `${current.getFullYear()}-${String(current.getMonth() + 1).padStart(2, '0')}`,
      label: `Tháng ${current.getMonth() + 1}/${current.getFullYear()}`,
      startDate: actualStart.toISOString().split('T')[0],
      endDate: actualEnd.toISOString().split('T')[0]
    });
    
    current.setMonth(current.getMonth() + 1);
  }
  
  return months;
};

/**
 * Generate danh sách tuần trong một học kỳ
 * @param {Date} startDate - Ngày bắt đầu học kỳ
 * @param {Date} endDate - Ngày kết thúc học kỳ
 * @returns {Array} Danh sách tuần
 */
export const generateWeeksInSemester = (startDate, endDate) => {
  const weeks = [];
  let currentStart = new Date(startDate);
  const end = new Date(endDate);
  let weekNumber = 1;
  
  while (currentStart <= end) {
    let currentEnd = new Date(currentStart);
    currentEnd.setDate(currentEnd.getDate() + 6);
    
    if (currentEnd > end) {
      currentEnd = new Date(end);
    }
    
    const formatDate = (date) => {
      return `${String(date.getDate()).padStart(2, '0')}/${String(date.getMonth() + 1).padStart(2, '0')}`;
    };
    
    weeks.push({
      value: weekNumber,
      label: `Tuần ${weekNumber} (${formatDate(currentStart)} - ${formatDate(currentEnd)})`,
      startDate: currentStart.toISOString().split('T')[0],
      endDate: currentEnd.toISOString().split('T')[0]
    });
    
    currentStart = new Date(currentEnd);
    currentStart.setDate(currentStart.getDate() + 1);
    weekNumber++;
  }
  
  return weeks;
};

/**
 * Xác định granularity dựa trên khoảng thời gian
 * @param {Date} startDate 
 * @param {Date} endDate 
 * @returns {string} 'day' | 'week' | 'month'
 */
export const getChartGranularity = (startDate, endDate) => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diffDays = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
  
  if (diffDays <= 7) {
    return 'day';
  } else if (diffDays <= 35) {
    return 'week';
  } else {
    return 'month';
  }
};

/**
 * Tìm tuần/tháng chứa ngày hiện tại
 * @param {Array} items - Danh sách tuần hoặc tháng
 * @param {Date} today - Ngày hiện tại
 * @returns {Object|null} Item chứa ngày hiện tại
 */
export const findCurrentPeriod = (items, today = new Date()) => {
  return items.find(item => {
    const start = new Date(item.startDate);
    const end = new Date(item.endDate);
    return today >= start && today <= end;
  }) || items[items.length - 1]; // Nếu không tìm thấy, lấy item cuối
};

/**
 * Xác định học kỳ hiện tại từ danh sách
 * @param {Array} semesters - Danh sách học kỳ
 * @returns {Object|null} Học kỳ hiện tại
 */
export const findCurrentSemester = (semesters) => {
  const today = new Date();
  return semesters.find(sem => {
    const start = new Date(sem.startDate);
    const end = new Date(sem.endDate);
    return today >= start && today <= end;
  }) || semesters[0]; // Nếu không tìm thấy, lấy học kỳ đầu tiên (mới nhất)
};
