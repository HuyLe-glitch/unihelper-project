const DormitoryRequest = require('../models/DormitoryRequest');
//Sus
class DormitoryRepository {
  async createMany(requests = []) {
    if (!Array.isArray(requests) || requests.length === 0) return [];
    return DormitoryRequest.insertMany(requests);
  }

    // Update findByStudent method to populate category
  async findByStudent(studentId, { skip = 0, limit = 50, filters = {} } = {}) {
    const query = { student: studentId, ...filters };
    return DormitoryRequest.find(query)
      .populate('category', 'name') // Add this line
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean()
      .exec();
  }

  // Update findById method
  async findById(id) {
    return DormitoryRequest.findById(id)
      .populate('student')
      .populate('category', 'name') // Add this line
      .lean()
      .exec();
  }

  async updateStatus(id, status, updaterId = null) {
    const update = { status };
    if (status === 'Approved' || status === 'Rejected') update.confirmDate = new Date();
    if (updaterId) update.updatedBy = updaterId;
    return DormitoryRequest.findByIdAndUpdate(id, update, { new: true }).exec();
  }

  async countByStudent(studentId, filters = {}) {
    const query = { student: studentId, ...filters };
    return DormitoryRequest.countDocuments(query).exec();
  }
}

module.exports = new DormitoryRepository();