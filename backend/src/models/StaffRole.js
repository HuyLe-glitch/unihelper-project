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
    departments: {
      type: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Department',
          required: true,
        }
      ],
      validate: {
        validator: function(v) {
          return Array.isArray(v) && v.length > 0;
        },
        message: 'StaffRole phải có ít nhất 1 phòng ban'
      }
    },

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
