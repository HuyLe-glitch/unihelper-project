const mongoose = require('mongoose');

/**
 * CertificateType Model - Loại chứng nhận
 * Tương tự EquipmentCategory
 */
const certificateTypeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Tên loại chứng nhận là bắt buộc'],
    trim: true,
    maxlength: [100, 'Tên không được vượt quá 100 ký tự']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Mô tả không được vượt quá 500 ký tự'],
    default: ''
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual để đếm số chứng nhận trong loại
certificateTypeSchema.virtual('certificateCount', {
  ref: 'Certificate',
  localField: '_id',
  foreignField: 'certificateType',
  count: true
});

// Index cho tìm kiếm
certificateTypeSchema.index({ name: 1 });

module.exports = mongoose.model('CertificateType', certificateTypeSchema);
