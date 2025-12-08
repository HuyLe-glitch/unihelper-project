// backend/src/models/DormitoryCategory.js
const mongoose = require('mongoose');

const dormitoryCategorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  description: {
    type: String
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, { timestamps: true });

module.exports = mongoose.model('DormitoryCategory', dormitoryCategorySchema);
