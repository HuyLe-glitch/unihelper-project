const Staff = require('../models/Staff');

class StaffRepository {
  async create(data) {
    const doc = new Staff(data);
    return doc.save();
  }

  async findAll({ skip = 0, limit = 50, filters = {} } = {}) {
    const query = Staff.find(filters).skip(skip).limit(limit).sort({ createdAt: -1 });
    const docs = await query.exec();
    const total = await Staff.countDocuments(filters);
    return { docs, total };
  }

  async findById(id) {
    return Staff.findById(id).exec();
  }

  async findByUser(userId) {
    return Staff.findOne({ user: userId }).exec();
  }

  async updateById(id, updateData) {
    return Staff.findByIdAndUpdate(id, updateData, { new: true, runValidators: true }).exec();
  }

  async deleteById(id) {
    return Staff.findByIdAndDelete(id).exec();
  }
}

module.exports = new StaffRepository();