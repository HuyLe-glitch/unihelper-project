const majorService = require('../services/majorService');
const { catchAsync } = require('../utils/appError');

class MajorController {
  getMajors = catchAsync(async (req, res) => {
    const result = await majorService.getMajors(req.query);
    res.status(200).json(result);
  });

  getMajorById = catchAsync(async (req, res) => {
    const result = await majorService.getMajorById(req.params.id);
    res.status(200).json(result);
  });

  createMajor = catchAsync(async (req, res) => {
    const result = await majorService.createMajor(req.body);
    res.status(201).json(result);
  });

  updateMajor = catchAsync(async (req, res) => {
    const result = await majorService.updateMajor(req.params.id, req.body);
    res.status(200).json(result);
  });

  deleteMajor = catchAsync(async (req, res) => {
    const result = await majorService.deleteMajor(req.params.id);
    res.status(200).json(result);
  });
}

module.exports = new MajorController();
