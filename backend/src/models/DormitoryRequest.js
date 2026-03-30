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
    // Phòng KTX tại thời điểm tạo yêu cầu (để lưu trữ lịch sử chính xác khi sinh viên chuyển phòng)
    roomId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Room'
        // Không required để tương thích data cũ - fallback về student.roomId nếu không có
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
    },
    // Lịch sử hoạt động (tracking mọi thao tác của Staff và Student)
    activityLog: [{
        action: {
            type: String,
            enum: ['ACCEPT', 'COMPLETE', 'ADD_NOTE', 'UPDATE_NOTE', 'STUDENT_CONFIRM'],
            required: true
        },
        // staffId hoặc studentId - một trong hai
        staffId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Staff'
        },
        studentId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Student'
        },
        details: {
            type: String,
            trim: true
        },
        timestamp: {
            type: Date,
            default: Date.now
        }
    }],
    // Ghi chú của staff
    staffNote: {
        type: String,
        trim: true
    },
    // Ẩn yêu cầu sau khi sinh viên xác nhận hoàn thành
    // Để tránh tích tụ yêu cầu cũ trong lịch sử phòng
    isHidden: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

// Indexes for performance
dormitoryRequestSchema.index({ student: 1 });
dormitoryRequestSchema.index({ status: 1 });
dormitoryRequestSchema.index({ requestDate: -1 });

module.exports = mongoose.model('DormitoryRequest', dormitoryRequestSchema);