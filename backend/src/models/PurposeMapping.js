/**
 * PurposeMapping Model
 * 
 * Map từ Dialogflow Entity "purpose" sang Certificate
 * 
 * SINGLE SOURCE OF TRUTH:
 * - Dialogflow: Nhận dạng synonyms → trả về purposeCode (reference value)
 * - PurposeMapping: Map purposeCode → Certificate (quản lý qua Admin UI)
 * 
 * Khi cần thêm/sửa:
 * 1. Thêm synonyms mới vào Dialogflow Entity "purpose"
 * 2. Thêm/sửa mapping trong Admin UI (collection này)
 * 
 * KHÔNG CẦN CHẠY SCRIPT - Quản lý qua Admin UI
 */
const mongoose = require('mongoose');

const purposeMappingSchema = new mongoose.Schema({
  // purposeCode phải khớp với reference value trong Dialogflow Entity
  // VD: "giam_tru_gia_canh", "nghia_vu_quan_su", "xin_viec"
  purposeCode: {
    type: String,
    required: [true, 'Purpose code là bắt buộc'],
    unique: true,
    trim: true,
    lowercase: true
  },
  
  // Tên hiển thị cho admin
  displayName: {
    type: String,
    required: [true, 'Tên hiển thị là bắt buộc'],
    trim: true
  },
  
  // Certificate được gợi ý cho purpose này
  certificate: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Certificate',
    required: [true, 'Certificate là bắt buộc']
  },
  
  // Ghi chú tư vấn hiển thị cho sinh viên
  adviceNote: {
    type: String,
    trim: true,
    default: 'Thời gian xử lý: 1-3 ngày làm việc'
  },
  
  // Mô tả chi tiết cho purpose này
  description: {
    type: String,
    trim: true,
    default: ''
  },

  // Danh sách từ khóa đồng nghĩa (synonyms) - dùng để tìm kiếm
  // Phải khớp với synonyms trong Dialogflow Entity
  synonyms: {
    type: [String],
    default: []
  },
  
  // Trạng thái hoạt động
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Index cho tìm kiếm nhanh
purposeMappingSchema.index({ purposeCode: 1 });
purposeMappingSchema.index({ certificate: 1 });
purposeMappingSchema.index({ isActive: 1 });
purposeMappingSchema.index({ synonyms: 1 }); // Index cho tìm kiếm synonyms

module.exports = mongoose.model('PurposeMapping', purposeMappingSchema);
