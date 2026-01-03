const mongoose = require('mongoose');

const dormitoryRequestSchema = new mongoose.Schema({
    // Mã yêu cầu KTX - format: KTX1, KTX2, ..., KTX999, KTX1000, ... (không giới hạn)
    requestCode: {
        type: String,
        unique: true,
        sparse: true // Cho phép null/undefined nhưng vẫn đảm bảo unique khi có giá trị
    },
    student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Student',
        required: true
    },
    // Học kỳ - lấy từ semester active khi tạo yêu cầu
    semester: {
        type: String,
        required: [true, 'Học kỳ là bắt buộc'],
        trim: true
    },
    // Danh mục thiết bị (ref đến EquipmentCategory)
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'EquipmentCategory',
        required: true
    },
    // Thiết bị cụ thể (ref đến EquipmentItem) - tùy chọn
    item: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'EquipmentItem'
    },
    description: {
        type: String
    },
    requestDate: {
        type: Date,
        default: Date.now
    },
    confirmDate: {
        type: Date
    },
    status: {
        type: String,
        enum: ['Pending', 'Under Review', 'Approved'],
        default: 'Pending'
    }
}, {
    timestamps: true
});

// Indexes for performance
dormitoryRequestSchema.index({ student: 1 });
dormitoryRequestSchema.index({ status: 1 });
dormitoryRequestSchema.index({ requestDate: -1 });

module.exports = mongoose.model('DormitoryRequest', dormitoryRequestSchema);