const mongoose = require('mongoose');

const dormitoryRequestSchema = new mongoose.Schema({
    student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Student',
        required: true
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
        enum: ['Pending', 'Under Review', 'Approved', 'Rejected'],
        default: 'Pending'
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('DormitoryRequest', dormitoryRequestSchema);