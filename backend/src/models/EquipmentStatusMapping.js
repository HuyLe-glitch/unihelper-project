/**
 * EquipmentStatusMapping Model
 * 
 * Map từ Dialogflow Entity reference value sang EquipmentCategory hoặc EquipmentItem
 * Dùng cho chức năng: Kiểm tra trạng thái báo cáo sự cố KTX
 * 
 * Flow:
 * 1. User: "kiểm tra yêu cầu sửa quạt trần"
 * 2. Dialogflow: equipment_item = "quạt trần" 
 *    → Backend lấy referenceValue = "quat_tran"
 * 3. Backend: Tra EquipmentStatusMapping → biết filter theo EquipmentItem nào
 * 4. Query DormitoryRequest theo item._id
 * 
 * SYNC VỚI DIALOGFLOW:
 * - referenceValue phải khớp với reference value trong Dialogflow Entities
 * - Entity equipment_category: Cho danh mục thiết bị (filter nhiều yêu cầu)
 * - Entity equipment_item: Cho thiết bị cụ thể (filter yêu cầu gần nhất)
 */
const mongoose = require('mongoose');

const equipmentStatusMappingSchema = new mongoose.Schema({
  // Reference value từ Dialogflow Entity (equipment_category hoặc equipment_item)
  // VD: "thiet_bi_dien", "quat_tran", "bong_den"
  referenceValue: {
    type: String,
    required: [true, 'Reference value là bắt buộc'],
    unique: true,
    trim: true,
    lowercase: true
  },
  
  // Loại entity: 'category' hoặc 'item'
  // - category: Filter theo danh mục thiết bị (trả về nhiều yêu cầu thuộc danh mục này)
  // - item: Filter theo thiết bị cụ thể (trả về yêu cầu gần nhất của thiết bị này)
  entityType: {
    type: String,
    required: [true, 'Entity type là bắt buộc'],
    enum: ['category', 'item']
  },
  
  // Tên hiển thị (cho admin UI và debug)
  displayName: {
    type: String,
    required: [true, 'Tên hiển thị là bắt buộc'],
    trim: true
  },
  
  // Reference đến EquipmentCategory (khi entityType = 'category')
  equipmentCategory: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'EquipmentCategory',
    default: null
  },
  
  // Reference đến EquipmentItem (khi entityType = 'item')
  equipmentItem: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'EquipmentItem',
    default: null
  },
  
  // Trạng thái hoạt động
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Validation: Phải có equipmentCategory hoặc equipmentItem tương ứng với entityType
equipmentStatusMappingSchema.pre('save', function(next) {
  if (this.entityType === 'category' && !this.equipmentCategory) {
    return next(new Error('equipmentCategory là bắt buộc khi entityType = category'));
  }
  if (this.entityType === 'item' && !this.equipmentItem) {
    return next(new Error('equipmentItem là bắt buộc khi entityType = item'));
  }
  next();
});

// Indexes
// referenceValue đã có unique: true nên không cần khai báo index lại
equipmentStatusMappingSchema.index({ entityType: 1 });
equipmentStatusMappingSchema.index({ isActive: 1 });
equipmentStatusMappingSchema.index({ equipmentCategory: 1 });
equipmentStatusMappingSchema.index({ equipmentItem: 1 });

module.exports = mongoose.model('EquipmentStatusMapping', equipmentStatusMappingSchema);
