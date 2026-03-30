const mongoose = require('mongoose');

/**
 * Student Model
 * Các trường theo yêu cầu: name, dateOfBirth, phone, email (từ User), 
 * cccd, address, FacultyId, majorId, isDormResident, roomId
 */
const studentSchema = new mongoose.Schema({
  // Email được lấy từ User model thông qua ref
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  // Họ và tên
  fullName: {
    type: String,
    required: true,
    trim: true,
    maxlength: 50
  },
  // Ngày sinh
  dateOfBirth: {
    type: Date,
    required: true
  },
  // Số điện thoại
  phone: {
    type: String,
    trim: true
  },
  // CCCD
  citizenId: {
    type: String,
    trim: true,
    unique: true,
    required: true,
    sparse: true
  },
  // Địa chỉ
  address: {
    type: String,
    required: true,
    trim: true
  },
  // Khoa (Faculty) - Ref thông qua Major
  major: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Major',
    required: true
  },
  // KTX - Có ở ký túc xá không
  isDormResident: {
    type: Boolean,
    default: false
  },
  // Phòng KTX - nullable
  roomId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Room',
    default: null
  },
  // Soft delete
  isDeleted: { 
    type: Boolean, 
    default: false 
  }
}, { timestamps: true });

// Indexes - Thêm các index để tối ưu query
studentSchema.index({ major: 1 });
studentSchema.index({ isDeleted: 1, createdAt: -1 }); // Compound index cho query chính
studentSchema.index({ user: 1 });
studentSchema.index({ roomId: 1 });

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
