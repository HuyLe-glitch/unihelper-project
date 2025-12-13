const mongoose = require('mongoose');

const staffRoleSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },

    description: {
      type: String,
      trim: true,
    },

    // Cho phép role này dùng trong nhiều department
    departments: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Department',
      },
    ],

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

staffRoleSchema.index({ name: 1 });

const StaffRole = mongoose.model('StaffRole', staffRoleSchema);

module.exports = StaffRole;
