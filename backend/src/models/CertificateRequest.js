const mongoose = require('mongoose');

const certificateRequestSchema = new mongoose.Schema({
  // Mã yêu cầu CTSV - format: CTSV1, CTSV2, ... (không giới hạn)
  requestCode: {
    type: String,
    unique: true,
    sparse: true // Cho phép null/undefined nhưng vẫn đảm bảo unique khi có giá trị
  },
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: true
  },
  certificateType: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'CertificateType',
    required: true
  },
  // Tên chứng nhận - ref đến model Certificate (tương tự EquipmentItem)
  certificateName: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Certificate',
    required: true
  },
  semester: {
    type: String,
    required: true,
    trim: true
  },
  requestDate: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['ĐANG XỬ LÝ', 'HỢP LỆ', 'KHÔNG HỢP LỆ'],
    default: 'ĐANG XỬ LÝ'
  },
  responseTime: {
    type: Date
  },
  notes: {
    type: String,
    default: '',
    trim: true
  },
  staffAssigned: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Staff'
  },
  // File đính kèm từ Staff (file phản hồi) - Lưu trên Firebase Storage
  staffFile: {
    fileName: {
      type: String,
      default: ''
    },
    storedName: {
      type: String,
      default: ''
    },
    fileUrl: {
      type: String,
      default: ''
    },
    fileType: {
      type: String,
      default: ''
    },
    fileSize: {
      type: Number
    },
    uploadDate: {
      type: Date
    }
  },
  // Lịch sử xử lý
  processingHistory: [{
    status: {
      type: String,
      enum: ['ĐANG XỬ LÝ', 'HỢP LỆ', 'KHÔNG HỢP LỆ']
    },
    staffId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Staff'
    },
    notes: {
      type: String,
      trim: true
    },
    timestamp: {
      type: Date,
      default: Date.now
    }
  }],
  // Lịch sử hoạt động của Staff (tracking mọi thao tác: thêm file, sửa ghi chú, etc.)
  activityLog: [{
    action: {
      type: String,
      enum: ['ADD_FILE', 'UPDATE_FILE', 'DELETE_FILE', 'ADD_NOTE', 'UPDATE_NOTE', 'APPROVE', 'REJECT'],
      required: true
    },
    staffId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Staff',
      required: true
    },
    details: {
      type: String,
      trim: true
    },
    timestamp: {
      type: Date,
      default: Date.now
    }
  }],
  // Thông tin xử lý
  processingInfo: {
    assignedDate: {
      type: Date
    },
    completedDate: {
      type: Date
    },
    estimatedCompletionDate: {
      type: Date
    },
    reviewNotes: {
      type: String,
      trim: true
    }
  }
}, {
  timestamps: true
});

// Index for performance (requestCode index is already created by unique: true)
certificateRequestSchema.index({ student: 1 });
certificateRequestSchema.index({ status: 1 });
certificateRequestSchema.index({ certificateType: 1 });
certificateRequestSchema.index({ certificateName: 1 });

module.exports = mongoose.model('CertificateRequest', certificateRequestSchema);
