const mongoose = require('mongoose');

/**
 * Model Room - Phòng KTX
 * Lưu thông tin các phòng ký túc xá
 */
const roomSchema = new mongoose.Schema(
  {
    // Tên phòng (VD: "A101", "B202") - UNIQUE
    name: {
      type: String,
      required: [true, 'Tên phòng là bắt buộc'],
      unique: true,
      trim: true,
      maxlength: [20, 'Tên phòng không được vượt quá 20 ký tự']
    },
    // Sức chứa (số người tối đa)
    capacity: {
      type: Number,
      required: [true, 'Sức chứa là bắt buộc'],
      min: [1, 'Sức chứa phải ít nhất là 1'],
      max: [20, 'Sức chứa không được vượt quá 20']
    },
    // Số người đang ở
    occupied: {
      type: Number,
      default: 0,
      min: [0, 'Số người đang ở không thể âm']
    },
    // Loại phòng (có thể để trống hoặc liên kết với category phòng)
    categoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'RoomCategory',
      default: null
    },
    // Mô tả
    description: {
      type: String,
      trim: true,
      maxlength: [500, 'Mô tả không được vượt quá 500 ký tự']
    },
    // Trạng thái phòng (auto-calculated based on occupied/capacity)
    status: {
      type: String,
      enum: ['AVAILABLE', 'FULL', 'MAINTENANCE'],
      default: 'AVAILABLE'
    }
  },
  {
    timestamps: true
  }
);

// Indexes (name đã có unique: true nên không cần index riêng)
roomSchema.index({ status: 1 });

// Pre-save middleware để auto-update status
roomSchema.pre('save', function(next) {
  if (this.occupied >= this.capacity && this.status !== 'MAINTENANCE') {
    this.status = 'FULL';
  } else if (this.occupied < this.capacity && this.status === 'FULL') {
    this.status = 'AVAILABLE';
  }
  next();
});

// Đảm bảo virtuals được bao gồm khi convert to JSON/Object
roomSchema.set('toJSON', { virtuals: true });
roomSchema.set('toObject', { virtuals: true });

const Room = mongoose.model('Room', roomSchema);

module.exports = Room;
