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
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Major',
    required: true
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
  className: {
    type: String,
    required: true,
    trim: true
  },
  address: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Address'
  },
  citizen: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Citizen'
  },
  dateOfBirth: {
    type: Date,
    required: true
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
}, { timestamps: true });

// Indexes
studentSchema.index({ major: 1, status: 1 });

// Virtual populate
studentSchema.virtual('userInfo', {
  ref: 'User',
  localField: 'user',
  foreignField: '_id',
  justOne: true
});

studentSchema.set('toJSON', { virtuals: true });
studentSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Student', studentSchema);
