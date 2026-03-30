const mongoose = require('mongoose');

/**
 * Model SemesterTemplate - Cấu hình mẫu học kỳ
 * Lưu quy định khung thời gian cho từng loại học kỳ
 */
const semesterTemplateSchema = new mongoose.Schema(
  {
    // Mã template (VD: "HK1", "HK2", "HK3")
    code: {
      type: String,
      required: [true, 'Mã template là bắt buộc'],
      unique: true,
      trim: true,
      uppercase: true,
      maxlength: [10, 'Mã template không được vượt quá 10 ký tự']
    },
    // Tên hiển thị (VD: "Học kỳ 1", "Học kỳ 2", "Học kỳ Hè")
    name: {
      type: String,
      required: [true, 'Tên template là bắt buộc'],
      unique: true,
      trim: true,
      maxlength: [100, 'Tên template không được vượt quá 100 ký tự']
    },
    // Mô tả
    description: {
      type: String,
      trim: true,
      maxlength: [500, 'Mô tả không được vượt quá 500 ký tự']
    },
    // Tháng bắt đầu (1-12)
    startMonth: {
      type: Number,
      required: [true, 'Tháng bắt đầu là bắt buộc'],
      min: [1, 'Tháng bắt đầu phải từ 1-12'],
      max: [12, 'Tháng bắt đầu phải từ 1-12']
    },
    // Ngày bắt đầu trong tháng (1-31)
    startDay: {
      type: Number,
      required: [true, 'Ngày bắt đầu là bắt buộc'],
      min: [1, 'Ngày bắt đầu phải từ 1-31'],
      max: [31, 'Ngày bắt đầu phải từ 1-31']
    },
    // Tháng kết thúc (1-12)
    endMonth: {
      type: Number,
      required: [true, 'Tháng kết thúc là bắt buộc'],
      min: [1, 'Tháng kết thúc phải từ 1-12'],
      max: [12, 'Tháng kết thúc phải từ 1-12']
    },
    // Ngày kết thúc trong tháng (1-31)
    endDay: {
      type: Number,
      required: [true, 'Ngày kết thúc là bắt buộc'],
      min: [1, 'Ngày kết thúc phải từ 1-31'],
      max: [31, 'Ngày kết thúc phải từ 1-31']
    },
    // Thứ tự hiển thị
    displayOrder: {
      type: Number,
      default: 0
    }
  },
  {
    timestamps: true
  }
);

// Index để tìm kiếm nhanh (code đã có unique:true tự động tạo index)
semesterTemplateSchema.index({ displayOrder: 1 });

const SemesterTemplate = mongoose.model('SemesterTemplate', semesterTemplateSchema);

module.exports = SemesterTemplate;
