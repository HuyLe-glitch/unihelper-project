const mongoose = require('mongoose');

const dormitoryRequestSchema = new mongoose.Schema({
    student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Student',
        required: true
    },
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'DormitoryCategory',
        required: true
    },
    deviceName: {
        type: String,
        required: true
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