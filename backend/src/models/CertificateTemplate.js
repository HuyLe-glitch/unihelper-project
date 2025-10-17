const mongoose = require('mongoose');

const certificateTemplateSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  content: {
    type: String,
    required: true
  },
  certificateType: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'CertificateType',
    required: true
  },
  variables: [{
    name: String,
    description: String,
    type: {
      type: String,
      enum: ['TEXT', 'DATE', 'NUMBER'],
      default: 'TEXT'
    }
  }],
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
certificateTemplateSchema.index({ certificateType: 1 });
certificateTemplateSchema.index({ isActive: 1 });
certificateTemplateSchema.index({ name: 1 });

module.exports = mongoose.model('CertificateTemplate', certificateTemplateSchema);
