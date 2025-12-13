const DormitoryRequest = require('../models/DormitoryRequest');
const { AppError } = require('../utils/appError');

const monthLabels = [
  '', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
];

class DormitoryRequestService {

  // 1) Thống kê theo requestDate (Pending + Under Review)
  async getRequestStatsByMonth() {
    return await DormitoryRequest.aggregate([
      /*{
        $match: { status: { $in: ["Pending", "Under Review"] } }
      },*/
      {
        $group: {
          _id: {
            year: { $year: "$requestDate" },
            month: { $month: "$requestDate" }
          },
          count: { $sum: 1 }
        }
      },
      {
        $project: {
          year: "$_id.year",
          month: { $arrayElemAt: [monthLabels, "$_id.month"] },
          count: 1,
          _id: 0
        }
      },
      { $sort: { year: 1, "_id.month": 1 } }
    ]);
  }

  // 2) Thống kê confirmDate theo tháng (Approved + Rejected)
  async getConfirmStatsByMonth() {
    return await DormitoryRequest.aggregate([
      {
        $match: { status: { $in: ["Approved", "Rejected"] } }
      },
      {
        $group: {
          _id: {
            year: { $year: "$confirmDate" },
            month: { $month: "$confirmDate" }
          },
          count: { $sum: 1 }
        }
      },
      {
        $project: {
          year: "$_id.year",
          month: { $arrayElemAt: [monthLabels, "$_id.month"] },
          count: 1,
          _id: 0
        }
      },
      { $sort: { year: 1, "_id.month": 1 } }
    ]);
  }

  // 3) Lấy tất cả request
  async getAllRequests() {
    return await DormitoryRequest.find()
      .populate("student", "studentId fullName")
      .sort({ requestDate: -1 });
  }

  // 4) Tạo yêu cầu ở KTX
  async createRequest(payload) {
    const created = await DormitoryRequest.create(payload);
    return created;
  }

  async getWeeklyStats(month, year) {
    const start = new Date(year, month - 1, 1);  // ví dụ month=11 → 2025-11-01
    const end = new Date(year, month, 1);        // → 2025-12-01 (tháng sau)

    return await DormitoryRequest.aggregate([
      {
        $match: {
          requestDate: {
            $gte: start,
            $lt: end     // dùng < end để tránh lỗi date boundary
          }
        }
      },
      {
        $project: {
          week: { $week: "$requestDate" }
        }
      },
      {
        $group: {
          _id: "$week",
          count: { $sum: 1 }
        }
      },
      {
        $project: {
          week: "$_id",
          count: 1,
          _id: 0
        }
      },
      { $sort: { week: 1 } }
    ]);
  }

  async getYearlyStats() {
    return await DormitoryRequest.aggregate([
      {
        $group: {
          _id: { year: { $year: { $toDate: "$requestDate" } } },
          total: { $sum: 1 }
        }
      },
      {
        $project: {
          year: "$_id.year",
          total: 1,
          _id: 0
        }
      },
      { $sort: { year: 1 } }
    ]);
  }

  /*async getStatsByCategory(month, year) {
    return await DormitoryRequest.aggregate([
      {
        $match: {
          requestDate: {
            $gte: new Date(year, month - 1, 1),
            $lte: new Date(year, month, 0)
          }
        }
      },
      {
        $group: {
          _id: "$category",
          count: { $sum: 1 }
        }
      },
      {
        $project: {
          category: "$_id",
          count: 1,
          _id: 0
        }
      }
    ]);
  }*/

  async getStatsByStatus(month, year) {
    const start = new Date(year, month - 1, 1);
    const end = new Date(year, month, 1); // tháng sau

    return await DormitoryRequest.aggregate([
      {
        $match: {
          requestDate: {
            $gte: start,
            $lt: end
          }
        }
      },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 }
        }
      },
      {
        $project: {
          status: "$_id",
          count: 1,
          _id: 0
        }
      }
    ]);
  }

}

module.exports = new DormitoryRequestService();
