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
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, { 
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual populate - Đếm số Major thuộc Faculty
facultySchema.virtual('majors', {
  ref: 'Major',
  localField: '_id',
  foreignField: 'faculty'
});

facultySchema.virtual('majorCount', {
  ref: 'Major',
  localField: '_id',
  foreignField: 'faculty',
  count: true
});

// Middleware: Khi Faculty isActive = false → cascade to Majors
facultySchema.pre('save', async function(next) {
  if (this.isModified('isActive') && !this.isActive) {
    const Major = mongoose.model('Major');
    await Major.updateMany(
      { faculty: this._id },
      { isActive: false }
    );
  }
  next();
});

facultySchema.pre('findOneAndUpdate', async function(next) {
  const update = this.getUpdate();
  if (update.isActive === false || update.$set?.isActive === false) {
    const Major = mongoose.model('Major');
    const faculty = await this.model.findOne(this.getQuery());
    if (faculty) {
      await Major.updateMany(
        { faculty: faculty._id },
        { isActive: false }
      );
    }
  }
  next();
});

// Indexes for performance
facultySchema.index({ code: 1 });
facultySchema.index({ name: 1 });
facultySchema.index({ isActive: 1 });

module.exports = mongoose.model('Faculty', facultySchema);
