const mongoose = require('mongoose');

const staffSchema = new mongoose.Schema(
  {
    staffId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    fullName: {
      type: String,
      required: true,
      trim: true,
      maxlength: 50
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    // Loại tổ chức cấp cao (CTSV, KTX)
    staffType: {
      type: String,
      enum: ['CTSV', 'KTX'],
      required: true,
    },

    // Vai trò (trưởng phòng, nhân viên, …)
    staffRole: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'StaffRole',
      required: false,
    },

    department:{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Department',
      required: true,
    },

    phone:{
      type: String,
      required: false,
    },

    // Tình trạng làm việc
    status: {
      type: String,
      enum: ['ACTIVE', 'INACTIVE', 'RETIRED', 'ON_LEAVE', 'TERMINATED'],
      default: 'ACTIVE',
    },
    // Soft delete
    isDeleted: { 
      type: Boolean, 
      default: false 
    }
  },
  {
    timestamps: true,
  }
);

// Index để tìm nhanh staff theo loại hoặc department
staffSchema.index({ staffType: 1, department: 1, staffId: 1 });


staffSchema.pre('findOneAndDelete', async function() {
  const staffId = this.getQuery()._id;
  const staff = await this.model.findById(staffId);
  
  if (staff && staff.user) {
    // Xóa User liên quan
    await mongoose.model('User').findByIdAndDelete(staff.user);
  }
});

staffSchema.pre('deleteOne', async function() {
  const staff = await this.model.findOne(this.getQuery());
  
  if (staff && staff.user) {
    // Xóa User liên quan
    await mongoose.model('User').findByIdAndDelete(staff.user);
  }
});

const Staff = mongoose.model('Staff', staffSchema);

module.exports = Staff;
