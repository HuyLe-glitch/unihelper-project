const express = require('express');
const staffController = require('../controllers/staffController');
const { protect, restrictTo } = require('../middleware/authMiddleware');
const staffMiddleware = require('../middleware/staffMiddleware');
const staffValidation = require('../validators/staffValidation');
const staffService = require('../services/staffService');

const { loadStaff } = require('../middleware/staffMiddleware');
const { createStaff,updateStaff } = require('../validators/staffValidation');
const { assignRole } = require('../services/staffService');

const router = express.Router();

// Protect all routes
router.use(protect);

// Staff CRUD operations (Admin only)
router.get('/', restrictTo('ADMIN'), staffController.getAllStaff);
router.get('/:id', restrictTo('ADMIN'), staffController.getStaffById);
router.post('/', restrictTo('ADMIN'), staffValidation.createStaff, staffController.createStaff);
router.patch('/:id', restrictTo('ADMIN'), staffMiddleware.loadStaff, staffValidation.updateStaff, staffController.updateStaff);
router.delete('/:id', restrictTo('ADMIN'), staffController.deleteStaff);

// Staff role management
router.get('/:id/roles', restrictTo('ADMIN'), staffController.getStaffRoles);
router.get('/roles', restrictTo('ADMIN'), staffController.getAllRoles);
router.patch('/:id/assign-role', restrictTo('ADMIN'), staffMiddleware.loadStaff, staffController.assignRole);
router.patch('/:id/remove-role', restrictTo('ADMIN'), staffController.removeRole);

// Department management
router.get('/department/:departmentId', restrictTo('ADMIN'), staffController.getStaffByDepartment);
router.patch('/:id/transfer-department', restrictTo('ADMIN'), staffController.transferDepartment);

module.exports = router;
