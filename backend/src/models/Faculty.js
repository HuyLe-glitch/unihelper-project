const mongoose = require('mongoose');

const facultySchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true, 
    unique: true, 
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
  description: { 
    type: String, 
    trim: true,
    maxlength: 500
  }
}, { 
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual populate - Lấy danh sách Major thuộc Faculty
facultySchema.virtual('majors', {
  ref: 'Major',
  localField: '_id',
  foreignField: 'faculty'
});

module.exports = mongoose.model('Faculty', facultySchema);
