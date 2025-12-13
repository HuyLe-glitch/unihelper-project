const departmentService = require('../services/departmentService');
const { catchAsync } = require('../utils/appError');

class DepartmentController {
  // GET /api/departments?staffType=CTSV
  getAllDepartments = catchAsync(async (req, res) => {
    const { staffType } = req.query;
    const result = await departmentService.getAllDepartments(staffType);
    res.status(200).json(result);
  });

  getStaffByDepartment = catchAsync(async (req, res) => {
    const result = await departmentService.getStaffByDepartment(req.params.id);
    res.status(200).json(result);
  });

  // POST /api/departments
  createDepartment = catchAsync(async (req, res) => {
    const { name, staffType } = req.body;
    const result = await departmentService.createDepartment({ ...req.body });
    res.status(201).json(result);
  });

  // GET /api/departments/:id
  getDepartmentById = catchAsync(async (req, res) => {
    const result = await departmentService.getDepartmentById(req.params.id);
    res.status(200).json(result);
  });

  // PUT /api/departments/:id
  updateDepartment = catchAsync(async (req, res) => {
    const result = await departmentService.updateDepartment(req.params.id, req.body);
    res.status(200).json(result);
  });

  // DELETE /api/departments/:id
  deleteDepartment = catchAsync(async (req, res) => {
    await departmentService.deleteDepartment(req.params.id);
    res.status(204).json();
  });
}

module.exports = new DepartmentController();
