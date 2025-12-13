const express = require('express');
const router = express.Router();
const staffRoleController = require('../controllers/staffRoleController');
const { protect, restrictTo } = require('../middleware/authMiddleware');

// Bảo vệ tất cả route
router.use(protect);
router.use(restrictTo('ADMIN'));

// CRUD
router.get('/', staffRoleController.getAllRoles);
router.get('/:id', staffRoleController.getRoleById);
router.post('/', staffRoleController.createRole);
router.patch('/:id', staffRoleController.updateRole);
router.delete('/:id', staffRoleController.deleteRole);

module.exports = router;
