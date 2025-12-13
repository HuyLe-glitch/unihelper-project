const Student = require('../models/Student');

class StudentRepository {
  async create(data) {
    const doc = new Student(data);
    return doc.save();
  }

  async findAll({ skip = 0, limit = 20, filters = {} } = {}) {
    const q = Student.find(filters).populate('user', 'name email role').populate('major').skip(skip).limit(limit).sort({ createdAt: -1 });
    const docs = await q.exec();
    const total = await Student.countDocuments(filters);
    return { docs, total };
  }

  async findById(id) {
    return Student.findById(id).populate('user', 'name email role').populate('major').exec();
  }

  async findByUser(userId) {
    return Student.findOne({ user: userId }).populate('major').exec();
  }

  async updateById(id, updateData) {
    return Student.findByIdAndUpdate(id, updateData, { new: true, runValidators: true }).exec();
  }

  async deleteById(id) {
    return Student.findByIdAndDelete(id).exec();
  }
}

module.exports = new StudentRepository();