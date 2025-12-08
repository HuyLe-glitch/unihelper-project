const express = require('express');
const departmentController = require('../controllers/departmentController');
const { protect, restrictTo } = require('../middleware/authMiddleware');

const router = express.Router();

// Protect all routes
router.use(protect);

// GET /api/departments - Get all departments (with optional staffType filter)
router.get('/', departmentController.getAllDepartments);

// POST /api/departments - Create new department (Admin only)
router.post('/', restrictTo('ADMIN'), departmentController.createDepartment);

// GET /api/departments/:id - Get department by ID
router.get('/:id', departmentController.getDepartmentById);

// patch /api/departments/:id - Update department (Admin only)
router.patch('/:id', restrictTo('ADMIN'), departmentController.updateDepartment);

// DELETE /api/departments/:id - Delete department (Admin only)
router.delete('/:id', restrictTo('ADMIN'), departmentController.deleteDepartment);

router.get('/:id/staff', departmentController.getStaffByDepartment);

module.exports = router;
