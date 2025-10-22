const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  studentId: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  major: {
    type: String,
    required: true,
    trim: true
  },
  faculty: {
    type: String,
    required: true,
    trim: true
  },
  academicYear: {
    type: String,
    required: true
  },
  gpa: {
    type: Number,
    min: 0,
    max: 4,
    default: 0
  },
  phone: {
    type: String,
    trim: true
  },
  address: {
    type: String,
    trim: true
  },
  dateOfBirth: {
    type: Date
  },
  class: {
    type: String,
    trim: true
  },
  course: {
    type: String,
    trim: true
  },
  enrollmentDate: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['ACTIVE', 'INACTIVE', 'GRADUATED', 'SUSPENDED'],
    default: 'ACTIVE'
  }
}, {
  timestamps: true
});

// Indexes
//studentSchema.index({ studentId: 1 });
//studentSchema.index({ user: 1 });
studentSchema.index({ faculty: 1, major: 1 });

module.exports = mongoose.model('Student', studentSchema);
