const mongoose = require('mongoose');

const staffSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: String,
  department: String,
  position: String
});

module.exports = mongoose.model('Staff', staffSchema);
