// src/middlewares/staffMiddleware.js
const Staff = require('../models/Staff');
const { AppError } = require('../utils/appError');

exports.loadStaff = async (req, res, next) => {
  const staffId = req.params.id;

  const staff = await Staff.findById(staffId)
    .populate('department')
    .populate('staffRole', 'name');

  if (!staff) {
    return next(new AppError('Staff not found', 404));
  }

  req.currentStaff = staff;
  next();
};
