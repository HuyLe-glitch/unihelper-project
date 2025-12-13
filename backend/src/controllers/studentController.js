const studentService = require('../services/studentService');
const { catchAsync } = require('../utils/appError');
const userService = require('../services/userService');

class StudentController {
  createStudent = catchAsync(async (req, res) => {
    const payload = req.body;

    const result = await studentService.createStudent(payload);

    return res.status(201).json({
      status: 'success',
      message: 'Student profile created successfully',
      data: result.data
    });
  });

  listStudents = catchAsync(async (req, res) => {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;
    const filters = {};
    if (req.query.major) filters.major = req.query.major;
    if (req.query.status) filters.status = req.query.status;
    const { docs, total } = await studentService.listStudents(page, limit, filters);
    res.json({ success: true, data: docs, meta: { page, limit, total } });
  });

  getStudentById = catchAsync(async (req, res) => {
    const doc = await studentService.getStudentById(req.params.id);
    res.json({ success: true, data: doc });
  });

  updateStudent = catchAsync(async (req, res) => {
    const updated = await studentService.updateStudent(req.params.id, req.body);
    res.json({ success: true, data: updated });
  });

  deleteStudent = catchAsync(async (req, res) => {
    await studentService.deleteStudent(req.params.id);
    res.json({ success: true, message: 'Student deleted' });
  });
}

module.exports = new StudentController();