const mongoose = require('mongoose');

const departmentSchema = new mongoose.Schema(
  {
    // Tên phòng ban
    name: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },

    // Phòng ban thuộc về loại tổ chức nào
    staffType: {
      type: String,
      enum: ['CTSV', 'KTX'],
      required: true,
    },

    description: { 
      type: String, 
      trim: true,
      maxlength: 500
    },

    // Trạng thái hoạt động
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Index để tìm nhanh theo staffType và tên phòng
departmentSchema.index({ staffType: 1, name: 1 });

const Department = mongoose.model('Department', departmentSchema);

module.exports = Department;
