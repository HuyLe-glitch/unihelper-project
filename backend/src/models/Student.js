const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: String,
  mssv: String,
  className: String,
  faculty: String
});

module.exports = mongoose.model('Student', studentSchema);
