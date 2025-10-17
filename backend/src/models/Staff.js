const mongoose = require('mongoose');

const staffSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  staffId: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  staffType: {
    type: String,
    enum: ['CTSV', 'KTX'],
    required: true
  },
  department: {
    type: String,
    required: true,
    trim: true
  },
  position: {
    type: String,
    required: true,
    trim: true
  },
  phone: {
    type: String,
    trim: true
  },
  dateOfJoining: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['ACTIVE', 'INACTIVE', 'ON_LEAVE'],
    default: 'ACTIVE'
  }
}, {
  timestamps: true
});

// Indexes
staffSchema.index({ staffId: 1 });
staffSchema.index({ user: 1 });
staffSchema.index({ department: 1 });
staffSchema.index({ staffType: 1 });

module.exports = mongoose.model('Staff', staffSchema);
