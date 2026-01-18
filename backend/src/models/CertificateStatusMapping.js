/**
 * CertificateStatusMapping Model
 * 
 * Map từ Dialogflow Entity reference value sang CertificateType hoặc Certificate (CertificateName)
 * Dùng cho chức năng: Kiểm tra trạng thái yêu cầu
 * 
 * Flow:
 * 1. User: "kiểm tra yêu cầu tạm hoãn nghĩa vụ quân sự"
 * 2. Dialogflow: certificate_name = "tạm hoãn nghĩa vụ quân sự" 
 *    → Backend lấy referenceValue = "tam_hoan_nghia_vu_quan_su"
 * 3. Backend: Tra CertificateStatusMapping → biết filter theo Certificate nào
 * 4. Query CertificateRequest theo certificateName._id
 * 
 * SYNC VỚI DIALOGFLOW:
 * - referenceValue phải khớp với reference value trong Dialogflow Entities
 * - Entity certificate_type: Cho loại chứng nhận (filter nhiều yêu cầu)
 * - Entity certificate_name: Cho tên cụ thể (filter yêu cầu gần nhất)
 */
const mongoose = require('mongoose');

const certificateStatusMappingSchema = new mongoose.Schema({
  // Reference value từ Dialogflow Entity (certificate_type hoặc certificate_name)
  // VD: "nghia_vu_quan_su", "tam_hoan_nghia_vu_quan_su", "mau_so_41"
  referenceValue: {
    type: String,
    required: [true, 'Reference value là bắt buộc'],
    unique: true,
    trim: true,
    lowercase: true
  },
  
  // Loại entity: 'type' hoặc 'name'
  // - type: Filter theo loại chứng nhận (trả về nhiều yêu cầu thuộc loại này)
  // - name: Filter theo tên cụ thể (trả về yêu cầu gần nhất của giấy này)
  entityType: {
    type: String,
    required: [true, 'Entity type là bắt buộc'],
    enum: ['type', 'name']
  },
  
  // Tên hiển thị (cho admin UI và debug)
  displayName: {
    type: String,
    required: [true, 'Tên hiển thị là bắt buộc'],
    trim: true
  },
  
  // Reference đến CertificateType (khi entityType = 'type')
  certificateType: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'CertificateType',
    default: null
  },
  
  // Reference đến Certificate/CertificateName (khi entityType = 'name')
  certificateName: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Certificate',
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

// Validation: Phải có certificateType hoặc certificateName tương ứng với entityType
certificateStatusMappingSchema.pre('save', function(next) {
  if (this.entityType === 'type' && !this.certificateType) {
    return next(new Error('certificateType là bắt buộc khi entityType = type'));
  }
  if (this.entityType === 'name' && !this.certificateName) {
    return next(new Error('certificateName là bắt buộc khi entityType = name'));
  }
  next();
});

// Indexes
// referenceValue đã có unique: true nên không cần khai báo index lại
certificateStatusMappingSchema.index({ entityType: 1 });
certificateStatusMappingSchema.index({ isActive: 1 });
certificateStatusMappingSchema.index({ certificateType: 1 });
certificateStatusMappingSchema.index({ certificateName: 1 });

module.exports = mongoose.model('CertificateStatusMapping', certificateStatusMappingSchema);
