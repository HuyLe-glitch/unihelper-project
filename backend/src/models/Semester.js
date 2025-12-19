const mongoose = require('mongoose');

/**
 * Model Semester - Học kỳ thực tế
 * Lưu học kỳ được tạo ra cho một năm cụ thể
 */
const semesterSchema = new mongoose.Schema(
  {
    // Tên hiển thị (VD: "Học kỳ 1 (2024-2025)")
    name: {
      type: String,
      required: [true, 'Tên học kỳ là bắt buộc'],
      unique: true,
      trim: true,
      maxlength: [100, 'Tên học kỳ không được vượt quá 100 ký tự']
    },
    // Năm bắt đầu của học kỳ
    year: {
      type: Number,
      required: [true, 'Năm học kỳ là bắt buộc'],
      min: [2000, 'Năm phải từ 2000 trở đi'],
      max: [2100, 'Năm phải từ 2100 trở xuống']
    },
    // Ngày bắt đầu (tự động tính từ template + year)
    startDate: {
      type: Date,
      required: [true, 'Ngày bắt đầu là bắt buộc']
    },
    // Ngày kết thúc (tự động tính từ template + year)
    endDate: {
      type: Date,
      required: [true, 'Ngày kết thúc là bắt buộc']
    },
    // Liên kết đến Template
    templateId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'SemesterTemplate',
      required: [true, 'Template học kỳ là bắt buộc']
    },
    // Năm học hiển thị (VD: "2024-2025")
    academicYear: {
      type: String,
      required: [true, 'Năm học là bắt buộc'],
      trim: true
    },
    // Trạng thái hoạt động
    isActive: {
      type: Boolean,
      default: false
    },
    // Ghi chú
    note: {
      type: String,
      trim: true,
      maxlength: [500, 'Ghi chú không được vượt quá 500 ký tự']
    }
  },
  {
    timestamps: true
  }
);

// Compound unique index: Một năm không thể có 2 học kỳ cùng template
semesterSchema.index({ templateId: 1, year: 1 }, { unique: true });

// Index để tìm kiếm và sắp xếp
semesterSchema.index({ name: 1 });
semesterSchema.index({ year: -1 });
semesterSchema.index({ startDate: -1 });
semesterSchema.index({ isActive: 1 });

// Virtual populate để lấy thông tin template
semesterSchema.virtual('template', {
  ref: 'SemesterTemplate',
  localField: 'templateId',
  foreignField: '_id',
  justOne: true
});

// Đảm bảo virtuals được bao gồm khi convert to JSON/Object
semesterSchema.set('toJSON', { virtuals: true });
semesterSchema.set('toObject', { virtuals: true });

const Semester = mongoose.model('Semester', semesterSchema);

module.exports = Semester;
