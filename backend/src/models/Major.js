const mongoose = require('mongoose');

const majorSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true, 
    trim: true,
    maxlength: 100
  },
  code: { 
    type: String, 
    required: true, 
    unique: true, 
    uppercase: true, 
    trim: true,
    maxlength: 10
  },
  faculty: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Faculty',
    required: true
  },
  description: { 
    type: String, 
    trim: true,
    maxlength: 500
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, { timestamps: true });

// Indexes
majorSchema.index({ faculty: 1, name: 1 }, { unique: true });
majorSchema.index({ code: 1 });
majorSchema.index({ faculty: 1 });
majorSchema.index({ isActive: 1 });

// Pre-save validation to ensure faculty exists
majorSchema.pre('save', async function(next) {
  if (this.isModified('faculty')) {
    const Faculty = mongoose.model('Faculty');
    const facultyExists = await Faculty.findById(this.faculty);
    if (!facultyExists) {
      throw new Error('Faculty không tồn tại');
    }
  }
  next();
});

module.exports = mongoose.model('Major', majorSchema);
