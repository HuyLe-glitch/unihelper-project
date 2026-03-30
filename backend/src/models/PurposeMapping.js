/**
 * PurposeMapping Model
 * 
 * Map từ Dialogflow Entity "purpose" sang Certificate hoặc CertificateType
 * 
 * SINGLE SOURCE OF TRUTH:
 * - Dialogflow: Nhận dạng synonyms → trả về purposeCode (reference value)
 * - PurposeMapping: Map purposeCode → Certificate hoặc CertificateType
 * 
 * MAPPING TYPES:
 * - "certificate": Map trực tiếp đến một Certificate cụ thể
 *   VD: "bo_sung_ho_so" → Certificate "Bổ sung hồ sơ cá nhân"
 * 
 * - "type": Map đến một CertificateType (loại), chatbot sẽ hiển thị 
 *   danh sách các Certificate thuộc loại này để user chọn
 *   VD: "loai_bo_sung_ho_so" → CertificateType "bổ sung hồ sơ cá nhân" 
 *       → hiển thị: ["Giấy bổ sung hồ sơ", "Giấy vay vốn ngân hàng"]
 * 
 * Khi cần thêm/sửa:
 * 1. Thêm synonyms mới vào Dialogflow Entity "purpose"
 * 2. Chạy script seedPurposeMapping.js hoặc thêm qua Admin UI
 */
const mongoose = require('mongoose');

const purposeMappingSchema = new mongoose.Schema({
  // purposeCode phải khớp với reference value trong Dialogflow Entity
  // VD: "bo_sung_ho_so", "loai_bo_sung_ho_so", "nghia_vu_quan_su"
  purposeCode: {
    type: String,
    required: [true, 'Purpose code là bắt buộc'],
    unique: true,
    trim: true,
    lowercase: true
  },
  
  // Loại mapping: 'certificate' (giấy cụ thể) hoặc 'type' (loại chứng nhận)
  // - 'certificate': Tư vấn trực tiếp giấy cụ thể
  // - 'type': Hiển thị danh sách giấy trong loại để user chọn
  mappingType: {
    type: String,
    enum: ['certificate', 'type'],
    default: 'certificate',
    required: true
  },
  
  // Tên hiển thị cho admin/user
  displayName: {
    type: String,
    required: [true, 'Tên hiển thị là bắt buộc'],
    trim: true
  },
  
  // Certificate được gợi ý (dùng khi mappingType = 'certificate')
  certificate: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Certificate',
    required: false // Không bắt buộc vì có thể dùng certificateType
  },
  
  // CertificateType được gợi ý (dùng khi mappingType = 'type')
  certificateType: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'CertificateType',
    required: false // Không bắt buộc vì có thể dùng certificate
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
// purposeCode đã có unique: true nên không cần khai báo index lại
purposeMappingSchema.index({ mappingType: 1 }); // Index cho filter theo loại mapping
purposeMappingSchema.index({ certificate: 1 });
purposeMappingSchema.index({ certificateType: 1 }); // Index cho CertificateType
purposeMappingSchema.index({ isActive: 1 });
purposeMappingSchema.index({ synonyms: 1 }); // Index cho tìm kiếm synonyms

// Validation: Phải có certificate hoặc certificateType tùy theo mappingType
purposeMappingSchema.pre('save', function(next) {
  if (this.mappingType === 'certificate' && !this.certificate) {
    return next(new Error('Certificate là bắt buộc khi mappingType = "certificate"'));
  }
  if (this.mappingType === 'type' && !this.certificateType) {
    return next(new Error('CertificateType là bắt buộc khi mappingType = "type"'));
  }
  next();
});

module.exports = mongoose.model('PurposeMapping', purposeMappingSchema);
