const mongoose = require('mongoose');

/**
 * Model EquipmentCategory - Danh mục thiết bị KTX
 * VD: Thiết bị điện, Nội thất, Vệ sinh, An ninh...
 */
const equipmentCategorySchema = new mongoose.Schema(
  {
    // Tên danh mục - UNIQUE
    name: {
      type: String,
      required: [true, 'Tên danh mục là bắt buộc'],
      unique: true,
      trim: true,
      maxlength: [100, 'Tên danh mục không được vượt quá 100 ký tự']
    },
    // Mô tả
    description: {
      type: String,
      trim: true,
      maxlength: [500, 'Mô tả không được vượt quá 500 ký tự']
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Virtual: Đếm số thiết bị trong danh mục
equipmentCategorySchema.virtual('itemCount', {
  ref: 'EquipmentItem',
  localField: '_id',
  foreignField: 'category',
  count: true
});

const EquipmentCategory = mongoose.model('EquipmentCategory', equipmentCategorySchema);

module.exports = EquipmentCategory;
