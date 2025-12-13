const mongoose = require('mongoose');

const certificateNameSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  description: {
    type: String,
    trim: true,
    maxlength: 500
  },
  certificateType: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'CertificateType',
    required: true
  },
  // Thông tin bổ sung cho tên chứng nhận
  purpose: {
    type: String,
    trim: true,
    maxlength: 200
  },
  processingTime: {
    type: Number, // Số ngày xử lý
    default: 7
  },
  fee: {
    type: Number,
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

// Indexes
certificateNameSchema.index({ certificateType: 1 });
certificateNameSchema.index({ isActive: 1 });
certificateNameSchema.index({ name: 1 });

// Đảm bảo tên chứng nhận unique trong cùng một loại
certificateNameSchema.index({ name: 1, certificateType: 1 }, { unique: true });

module.exports = mongoose.model('CertificateName', certificateNameSchema);
