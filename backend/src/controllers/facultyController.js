const facultyService = require('../services/facultyService');
const { catchAsync } = require('../utils/appError');

class FacultyController {
  getAllFaculties = catchAsync(async (req, res) => {
    const result = await facultyService.getAllFaculties(req.query);
    res.status(200).json(result);
  });

  getFacultyById = catchAsync(async (req, res) => {
    const result = await facultyService.getFacultyById(req.params.id);
    res.status(200).json(result);
  });

  createFaculty = catchAsync(async (req, res) => {
    const result = await facultyService.createFaculty(req.body);
    res.status(201).json(result);
  });

  updateFaculty = catchAsync(async (req, res) => {
    const result = await facultyService.updateFaculty(req.params.id, req.body);
    res.status(200).json(result);
  });

  deleteFaculty = catchAsync(async (req, res) => {
    const result = await facultyService.deleteFaculty(req.params.id);
    res.status(200).json(result);
  });

  getMajorsByFaculty = catchAsync(async (req, res) => {
    const result = await facultyService.getMajorsByFaculty(req.params.id);
    res.status(200).json(result);
  });

}

module.exports = new FacultyController();
