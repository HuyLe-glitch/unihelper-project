const mongoose = require('mongoose');

/**
 * Model EquipmentItem - Thiết bị KTX
 * VD: Bóng đèn LED, Quạt trần, Giường tầng...
 * Mỗi thiết bị chỉ thuộc về 1 danh mục duy nhất
 */
const equipmentItemSchema = new mongoose.Schema(
  {
    // Tên thiết bị - UNIQUE trong toàn hệ thống
    name: {
      type: String,
      required: [true, 'Tên thiết bị là bắt buộc'],
      unique: true,
      trim: true,
      maxlength: [100, 'Tên thiết bị không được vượt quá 100 ký tự']
    },
    // Danh mục thiết bị
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'EquipmentCategory',
      required: [true, 'Danh mục là bắt buộc']
    },
    // Mô tả
    description: {
      type: String,
      trim: true,
      maxlength: [500, 'Mô tả không được vượt quá 500 ký tự']
    }
  },
  {
    timestamps: true
  }
);

// Indexes
equipmentItemSchema.index({ category: 1 });

const EquipmentItem = mongoose.model('EquipmentItem', equipmentItemSchema);

module.exports = EquipmentItem;
