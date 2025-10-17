const mongoose = require('mongoose');

const adminSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: String,
  permissions: [String]
});

module.exports = mongoose.model('Admin', adminSchema);
