const mongoose = require('mongoose');

const certificateTypeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    maxlength: 100
  },
  description: {
    type: String,
    trim: true,
    maxlength: 500
  },
  requirements: [{
    type: String,
    trim: true
  }],
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Index for performance
certificateTypeSchema.index({ name: 1 });
certificateTypeSchema.index({ isActive: 1 });

module.exports = mongoose.model('CertificateType', certificateTypeSchema);
