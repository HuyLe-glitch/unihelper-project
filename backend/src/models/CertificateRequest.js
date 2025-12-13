const mongoose = require('mongoose');

const certificateRequestSchema = new mongoose.Schema({
  requestCode: {
    type: String,
    unique: true
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
  certificateName: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'CertificateName',
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
  // File đính kèm PDF
  attachedFile: {
    fileName: {
      type: String,
      default: ''
    },
    filePath: {
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
  staffAssigned: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Staff'
  },
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

// Generate request code before save
certificateRequestSchema.pre('save', async function(next) {
  if (!this.requestCode) {
    try {
      const count = await this.constructor.countDocuments();
      this.requestCode = String(count + 1).padStart(8, '0');
    } catch (error) {
      return next(error);
    }
  }
  next();
});

module.exports = mongoose.model('CertificateRequest', certificateRequestSchema);
