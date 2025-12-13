const mongoose = require('mongoose');

/**
 * Admin Model - Chỉ có 1 tài khoản admin duy nhất
 * Quản lý toàn bộ hệ thống
 * 
 * LƯU Ý: Hệ thống CHỈ CÓ 1 admin, KHÔNG tạo thêm được
 */
const adminSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  adminId: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    default: 'ADMIN001'
  },
  phone: {
    type: String,
    trim: true
  },
  dateOfJoining: {
    type: Date,
    default: Date.now
  },
  lastLogin: {
    type: Date
  },
  status: {
    type: String,
    enum: ['ACTIVE', 'INACTIVE'],
    default: 'ACTIVE'
  }
}, {
  timestamps: true
});

// Indexes
adminSchema.index({ adminId: 1 });
adminSchema.index({ user: 1 });

// Cập nhật lastLogin
adminSchema.methods.updateLastLogin = function() {
  this.lastLogin = new Date();
  return this.save();
};

// Static method để lấy admin (chỉ có 1)
adminSchema.statics.getAdmin = function() {
  return this.findOne({ status: 'ACTIVE' }).populate('user', 'name email');
};

module.exports = mongoose.model('Admin', adminSchema);
