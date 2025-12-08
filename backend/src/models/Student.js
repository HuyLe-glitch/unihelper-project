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
  fullName: {
    type: String,
    required: true,
    trim: true,
    maxlength: 50
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
    type: String,
    required: true,
    trim: true
  },
  citizenId: {
    type: String,
    trim: true,
    unique: true,
    required: true,
    sparse: true
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
    enum: ['ACTIVE', 'INACTIVE', 'GRADUATED', 'SUSPENDED','DROPPED','TEMPORARY_LEAVE'],
    default: 'ACTIVE'
  },
  // Soft delete
  isDeleted: { 
    type: Boolean, 
    default: false 
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

// Thêm vào Student.js sau studentSchema definition
studentSchema.pre('findOneAndDelete', async function() {
    const studentId = this.getQuery()._id;
    const student = await this.model.findById(studentId);
    
    if (student && student.user) {
      // Xóa User liên quan
      await mongoose.model('User').findByIdAndDelete(student.user);
    }
});

studentSchema.pre('deleteOne', async function() {
    const student = await this.model.findOne(this.getQuery());
    
    if (student && student.user) {
      // Xóa User liên quan
      await mongoose.model('User').findByIdAndDelete(student.user);
    }
});

module.exports = mongoose.model('Student', studentSchema);
