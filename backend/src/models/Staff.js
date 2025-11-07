const mongoose = require('mongoose');

const staffSchema = new mongoose.Schema(
  {
    staffId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    // Loại tổ chức cấp cao (CTSV, KTX)
    staffType: {
      type: String,
      enum: ['CTSV', 'KTX'],
      required: true,
    },

    // Phòng ban cụ thể
    department: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Department',
      required: true,
    },

    // Vai trò (trưởng phòng, nhân viên, …)
    staffRole: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'StaffRole',
      required: false,
    },

    // Tình trạng làm việc
    status: {
      type: String,
      enum: ['Active', 'Inactive'],
      default: 'Active',
    },
  },
  {
    timestamps: true,
  }
);

// Index để tìm nhanh staff theo loại hoặc department
staffSchema.index({ staffType: 1, department: 1, staffId: 1 });

const Staff = mongoose.model('Staff', staffSchema);

module.exports = Staff;
