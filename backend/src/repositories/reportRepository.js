const CertificateRequest = require('../models/CertificateRequest');
const DormitoryRequest = require('../models/DormitoryRequest');
const Semester = require('../models/Semester');

/**
 * Report Repository - Data Access Layer
 * Truy vấn dữ liệu báo cáo từ database
 */
class ReportRepository {
  // ==================== SEMESTER QUERIES ====================

  /**
   * Lấy tất cả học kỳ
   */
  async getAllSemesters() {
    return await Semester.find()
      .populate('templateId', 'name code type')
      .sort({ startDate: -1 });
  }

  /**
   * Tìm học kỳ hiện tại (ngày hôm nay nằm trong khoảng startDate - endDate)
   */
  async getCurrentSemester() {
    const today = new Date();
    return await Semester.findOne({
      startDate: { $lte: today },
      endDate: { $gte: today }
    }).populate('templateId', 'name code type');
  }

  // ==================== KPI QUERIES ====================

  /**
   * Lấy thống kê tổng quan CTSV
   */
  async getCTSVKPIStats(startDate, endDate) {
    const dateFilter = {
      requestDate: {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      }
    };

    const [total, approved, rejected, pending] = await Promise.all([
      CertificateRequest.countDocuments(dateFilter),
      CertificateRequest.countDocuments({ ...dateFilter, status: 'HỢP LỆ' }),
      CertificateRequest.countDocuments({ ...dateFilter, status: 'KHÔNG HỢP LỆ' }),
      CertificateRequest.countDocuments({ ...dateFilter, status: 'ĐANG XỬ LÝ' })
    ]);

    return { total, approved, rejected, pending };
  }

  /**
   * Lấy thống kê tổng quan KTX
   */
  async getKTXKPIStats(startDate, endDate) {
    const dateFilter = {
      requestDate: {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      }
    };

    const [total, approved, pending, underReview] = await Promise.all([
      DormitoryRequest.countDocuments(dateFilter),
      DormitoryRequest.countDocuments({ ...dateFilter, status: 'Approved' }),
      DormitoryRequest.countDocuments({ ...dateFilter, status: 'Pending' }),
      DormitoryRequest.countDocuments({ ...dateFilter, status: 'Under Review' })
    ]);

    return { total, approved, pending, underReview };
  }

  // ==================== TREND QUERIES ====================

  /**
   * Lấy dữ liệu xu hướng CTSV theo ngày
   */
  async getCTSVTrendByDay(startDate, endDate) {
    return await CertificateRequest.aggregate([
      {
        $match: {
          requestDate: {
            $gte: new Date(startDate),
            $lte: new Date(endDate)
          }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$requestDate' }
          },
          total: { $sum: 1 },
          approved: {
            $sum: { $cond: [{ $eq: ['$status', 'HỢP LỆ'] }, 1, 0] }
          },
          rejected: {
            $sum: { $cond: [{ $eq: ['$status', 'KHÔNG HỢP LỆ'] }, 1, 0] }
          },
          pending: {
            $sum: { $cond: [{ $eq: ['$status', 'ĐANG XỬ LÝ'] }, 1, 0] }
          }
        }
      },
      { $sort: { _id: 1 } }
    ]);
  }

  /**
   * Lấy dữ liệu xu hướng CTSV theo tuần
   */
  async getCTSVTrendByWeek(startDate, endDate) {
    return await CertificateRequest.aggregate([
      {
        $match: {
          requestDate: {
            $gte: new Date(startDate),
            $lte: new Date(endDate)
          }
        }
      },
      {
        $group: {
          _id: {
            year: { $isoWeekYear: '$requestDate' },
            week: { $isoWeek: '$requestDate' }
          },
          total: { $sum: 1 },
          approved: {
            $sum: { $cond: [{ $eq: ['$status', 'HỢP LỆ'] }, 1, 0] }
          },
          rejected: {
            $sum: { $cond: [{ $eq: ['$status', 'KHÔNG HỢP LỆ'] }, 1, 0] }
          },
          pending: {
            $sum: { $cond: [{ $eq: ['$status', 'ĐANG XỬ LÝ'] }, 1, 0] }
          },
          minDate: { $min: '$requestDate' }
        }
      },
      { $sort: { '_id.year': 1, '_id.week': 1 } }
    ]);
  }

  /**
   * Lấy dữ liệu xu hướng CTSV theo tháng
   */
  async getCTSVTrendByMonth(startDate, endDate) {
    return await CertificateRequest.aggregate([
      {
        $match: {
          requestDate: {
            $gte: new Date(startDate),
            $lte: new Date(endDate)
          }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$requestDate' },
            month: { $month: '$requestDate' }
          },
          total: { $sum: 1 },
          approved: {
            $sum: { $cond: [{ $eq: ['$status', 'HỢP LỆ'] }, 1, 0] }
          },
          rejected: {
            $sum: { $cond: [{ $eq: ['$status', 'KHÔNG HỢP LỆ'] }, 1, 0] }
          },
          pending: {
            $sum: { $cond: [{ $eq: ['$status', 'ĐANG XỬ LÝ'] }, 1, 0] }
          }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);
  }

  /**
   * Lấy dữ liệu xu hướng KTX theo ngày
   */
  async getKTXTrendByDay(startDate, endDate) {
    return await DormitoryRequest.aggregate([
      {
        $match: {
          requestDate: {
            $gte: new Date(startDate),
            $lte: new Date(endDate)
          }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$requestDate' }
          },
          total: { $sum: 1 },
          approved: {
            $sum: { $cond: [{ $eq: ['$status', 'Approved'] }, 1, 0] }
          },
          pending: {
            $sum: { $cond: [{ $eq: ['$status', 'Pending'] }, 1, 0] }
          },
          underReview: {
            $sum: { $cond: [{ $eq: ['$status', 'Under Review'] }, 1, 0] }
          }
        }
      },
      { $sort: { _id: 1 } }
    ]);
  }

  /**
   * Lấy dữ liệu xu hướng KTX theo tuần
   */
  async getKTXTrendByWeek(startDate, endDate) {
    return await DormitoryRequest.aggregate([
      {
        $match: {
          requestDate: {
            $gte: new Date(startDate),
            $lte: new Date(endDate)
          }
        }
      },
      {
        $group: {
          _id: {
            year: { $isoWeekYear: '$requestDate' },
            week: { $isoWeek: '$requestDate' }
          },
          total: { $sum: 1 },
          approved: {
            $sum: { $cond: [{ $eq: ['$status', 'Approved'] }, 1, 0] }
          },
          pending: {
            $sum: { $cond: [{ $eq: ['$status', 'Pending'] }, 1, 0] }
          },
          underReview: {
            $sum: { $cond: [{ $eq: ['$status', 'Under Review'] }, 1, 0] }
          },
          minDate: { $min: '$requestDate' }
        }
      },
      { $sort: { '_id.year': 1, '_id.week': 1 } }
    ]);
  }

  /**
   * Lấy dữ liệu xu hướng KTX theo tháng
   */
  async getKTXTrendByMonth(startDate, endDate) {
    return await DormitoryRequest.aggregate([
      {
        $match: {
          requestDate: {
            $gte: new Date(startDate),
            $lte: new Date(endDate)
          }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$requestDate' },
            month: { $month: '$requestDate' }
          },
          total: { $sum: 1 },
          approved: {
            $sum: { $cond: [{ $eq: ['$status', 'Approved'] }, 1, 0] }
          },
          pending: {
            $sum: { $cond: [{ $eq: ['$status', 'Pending'] }, 1, 0] }
          },
          underReview: {
            $sum: { $cond: [{ $eq: ['$status', 'Under Review'] }, 1, 0] }
          }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);
  }

  // ==================== DISTRIBUTION QUERIES ====================

  /**
   * Phân bổ yêu cầu CTSV theo loại chứng nhận
   */
  async getCTSVDistributionByType(startDate, endDate) {
    return await CertificateRequest.aggregate([
      {
        $match: {
          requestDate: {
            $gte: new Date(startDate),
            $lte: new Date(endDate)
          }
        }
      },
      {
        $lookup: {
          from: 'certificatetypes',
          localField: 'certificateType',
          foreignField: '_id',
          as: 'typeInfo'
        }
      },
      {
        $unwind: '$typeInfo'
      },
      {
        $group: {
          _id: '$typeInfo.name',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } }
    ]);
  }

  /**
   * Phân bổ yêu cầu CTSV theo trạng thái
   */
  async getCTSVDistributionByStatus(startDate, endDate) {
    return await CertificateRequest.aggregate([
      {
        $match: {
          requestDate: {
            $gte: new Date(startDate),
            $lte: new Date(endDate)
          }
        }
      },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } }
    ]);
  }

  /**
   * Phân bổ yêu cầu KTX theo danh mục thiết bị
   */
  async getKTXDistributionByCategory(startDate, endDate) {
    return await DormitoryRequest.aggregate([
      {
        $match: {
          requestDate: {
            $gte: new Date(startDate),
            $lte: new Date(endDate)
          }
        }
      },
      {
        $lookup: {
          from: 'equipmentcategories',
          localField: 'category',
          foreignField: '_id',
          as: 'categoryInfo'
        }
      },
      {
        $unwind: '$categoryInfo'
      },
      {
        $group: {
          _id: '$categoryInfo.name',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } }
    ]);
  }

  /**
   * Phân bổ yêu cầu KTX theo trạng thái
   */
  async getKTXDistributionByStatus(startDate, endDate) {
    return await DormitoryRequest.aggregate([
      {
        $match: {
          requestDate: {
            $gte: new Date(startDate),
            $lte: new Date(endDate)
          }
        }
      },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } }
    ]);
  }

  // ==================== COMPARE PERIOD QUERIES ====================

  /**
   * So sánh với kỳ trước - CTSV
   */
  async getCTSVPreviousPeriodStats(startDate, endDate) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const duration = end - start;
    
    const prevStart = new Date(start - duration);
    const prevEnd = new Date(start - 1); // Ngày trước kỳ hiện tại

    const dateFilter = {
      requestDate: {
        $gte: prevStart,
        $lte: prevEnd
      }
    };

    const [total, approved, rejected] = await Promise.all([
      CertificateRequest.countDocuments(dateFilter),
      CertificateRequest.countDocuments({ ...dateFilter, status: 'HỢP LỆ' }),
      CertificateRequest.countDocuments({ ...dateFilter, status: 'KHÔNG HỢP LỆ' })
    ]);

    return { total, approved, rejected };
  }

  /**
   * So sánh với kỳ trước - KTX
   */
  async getKTXPreviousPeriodStats(startDate, endDate) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const duration = end - start;
    
    const prevStart = new Date(start - duration);
    const prevEnd = new Date(start - 1);

    const dateFilter = {
      requestDate: {
        $gte: prevStart,
        $lte: prevEnd
      }
    };

    const [total, approved] = await Promise.all([
      DormitoryRequest.countDocuments(dateFilter),
      DormitoryRequest.countDocuments({ ...dateFilter, status: 'Approved' })
    ]);

    return { total, approved };
  }
}

module.exports = new ReportRepository();
