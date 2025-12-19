const mongoose = require('mongoose');

/**
 * Staff Model - Đơn giản hóa cho 2 tài khoản cố định
 * - Staff CTSV: Xử lý yêu cầu Công tác Sinh viên
 * - Staff KTX: Xử lý yêu cầu Ký túc xá
 * 
 * LƯU Ý: Hệ thống CHỈ CÓ 2 staff, KHÔNG tạo thêm được
 */
const staffSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  staffId: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  // Loại staff cố định: CTSV hoặc KTX
  staffType: {
    type: String,
    enum: ['CTSV', 'KTX'],
    required: true
  },
  // Tên phòng ban (tự động set theo staffType)
  department: {
    type: String,
    required: true,
    trim: true,
    default: function() {
      return this.staffType === 'CTSV' 
        ? 'Phòng Công tác Sinh viên' 
        : 'Phòng Ký túc xá';
    }
  },
  // Chức vụ (mặc định là Chuyên viên)
  position: {
    type: String,
    default: 'Chuyên viên',
    trim: true
  },
  phone: {
    type: String,
    trim: true
  },
  dateOfJoining: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['ACTIVE', 'INACTIVE', 'ON_LEAVE'],
    default: 'ACTIVE'
  }
}, {
  timestamps: true
});

// Indexes - chỉ thêm index cho staffType (staffId và user đã có unique: true tự động tạo index)
staffSchema.index({ staffType: 1 });

// Virtual để lấy tên phòng ban đầy đủ
staffSchema.virtual('departmentName').get(function() {
  return this.staffType === 'CTSV' 
    ? 'Phòng Công tác Sinh viên' 
    : 'Phòng Ký túc xá';
});

// Method để kiểm tra quyền xử lý loại yêu cầu
staffSchema.methods.canProcessRequestType = function(requestType) {
  // CTSV staff chỉ xử lý yêu cầu CTSV
  // KTX staff chỉ xử lý yêu cầu KTX
  if (this.staffType === 'CTSV') {
    return requestType === 'CTSV' || requestType === 'certificate';
  }
  if (this.staffType === 'KTX') {
    return requestType === 'KTX' || requestType === 'dormitory';
  }
  return false;
};

// Static method để lấy staff theo type (chỉ có 1 staff mỗi loại)
staffSchema.statics.findByType = function(staffType) {
  return this.findOne({ staffType, status: 'ACTIVE' }).populate('user', 'name email');
};

// Static method để lấy tất cả staff (chỉ có 2)
staffSchema.statics.getAllStaff = function() {
  return this.find({ status: 'ACTIVE' }).populate('user', 'name email');
};

module.exports = mongoose.model('Staff', staffSchema);
