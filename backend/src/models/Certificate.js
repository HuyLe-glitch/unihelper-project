const mongoose = require('mongoose');

/**
 * Certificate Model - Chứng nhận
 * Tương tự EquipmentItem
 */
const certificateSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Tên chứng nhận là bắt buộc'],
    trim: true,
    maxlength: [100, 'Tên không được vượt quá 100 ký tự']
  },
  certificateType: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'CertificateType',
    required: [true, 'Loại chứng nhận là bắt buộc']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Mô tả không được vượt quá 500 ký tự'],
    default: ''
  }
}, {
  timestamps: true
});

// Indexes
certificateSchema.index({ certificateType: 1 });
certificateSchema.index({ name: 1 });

module.exports = mongoose.model('Certificate', certificateSchema);
