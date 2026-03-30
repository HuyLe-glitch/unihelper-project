/**
 * StudentNotification Model
 * Lưu trữ thông báo cá nhân cho sinh viên về yêu cầu CTSV và KTX
 */
const mongoose = require('mongoose');

const studentNotificationSchema = new mongoose.Schema({
  // Người nhận thông báo
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User là bắt buộc']
  },

  // Loại thông báo
  type: {
    type: String,
    enum: [
      'CTSV_REQUEST_CREATED',      // Yêu cầu CTSV đã được gửi
      'CTSV_REQUEST_APPROVED',     // Yêu cầu CTSV đã được duyệt (hợp lệ)
      'CTSV_REQUEST_REJECTED',     // Yêu cầu CTSV bị từ chối (không hợp lệ)
      'KTX_REQUEST_CREATED',       // Yêu cầu KTX đã được tiếp nhận
      'KTX_REQUEST_APPROVED',      // Yêu cầu KTX đã được xử lý (approved)
      'KTX_REQUEST_REJECTED',      // Yêu cầu KTX bị từ chối
      'SYSTEM'                     // Thông báo hệ thống
    ],
    required: [true, 'Loại thông báo là bắt buộc']
  },

  // Tiêu đề thông báo
  title: {
    type: String,
    required: [true, 'Tiêu đề là bắt buộc'],
    trim: true
  },

  // Nội dung chi tiết
  message: {
    type: String,
    required: [true, 'Nội dung là bắt buộc'],
    trim: true
  },

  // Dữ liệu bổ sung
  data: {
    requestCode: String,
    requestId: {
      type: mongoose.Schema.Types.ObjectId
    },
    requestType: {
      type: String,
      enum: ['CTSV', 'KTX']
    },
    // Thông tin chi tiết yêu cầu CTSV
    certificateType: String,
    certificateName: String,
    // Thông tin chi tiết yêu cầu KTX
    equipmentCategory: String,
    equipmentName: String,
    description: String,
    // Trạng thái và ghi chú
    status: String,
    notes: String
  },

  // Trạng thái đã đọc
  isRead: {
    type: Boolean,
    default: false
  },

  // Thời gian đọc
  readAt: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

// Index cho tìm kiếm nhanh
studentNotificationSchema.index({ user: 1, createdAt: -1 });
studentNotificationSchema.index({ user: 1, isRead: 1 });
studentNotificationSchema.index({ type: 1 });

module.exports = mongoose.model('StudentNotification', studentNotificationSchema);
