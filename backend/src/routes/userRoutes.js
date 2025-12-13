const express = require('express');
const userController = require('../controllers/userController');
const { userValidation, idValidation } = require('../validators/userValidation');
const { protect, restrictTo } = require('../middleware/authMiddleware');

const router = express.Router();

/**
 * User Routes - Các endpoint cho User Management
 * Tất cả routes đều cần authentication
 */

// Middleware bảo vệ tất cả routes
router.use(protect);

// =============== PUBLIC USER ROUTES ===============

// GET /api/users/me - Lấy thông tin profile của user hiện tại
router.get('/me', userController.getUserById);

// PUT /api/users/me - Cập nhật profile của user hiện tại
router.put('/me', userValidation.updateUser, userController.updateMyProfile);

// =============== ADMIN ONLY ROUTES ===============

// GET /api/users - Lấy danh sách users (Admin only)
router.get('/', restrictTo('ADMIN'), userValidation.getUsersQuery, userController.getUsers);
// GET /api/users/search - Tìm kiếm users (Admin only)
router.get('/search', restrictTo('ADMIN'), userValidation.searchUsers, userController.searchUsers);
// GET /api/users/:id - Lấy user theo ID (Admin only)
router.get('/:id', restrictTo('ADMIN'), idValidation.validateObjectId, userController.getUserById);
// PUT /api/users/:id - Cập nhật user (Admin only)
router.put('/:id', restrictTo('ADMIN'), idValidation.validateObjectId, userValidation.updateUser, userController.updateUser);
// DELETE /api/users/:id - Xóa user (Admin only)
router.delete('/:id', restrictTo('ADMIN'), idValidation.validateObjectId, userController.deleteUser);
// PUT /api/users/:id/role - Thay đổi role (Admin only)
router.put('/:id/role', restrictTo('ADMIN'), idValidation.validateObjectId, userValidation.changeRole, userController.changeUserRole);
// PUT /api/users/:id/profile - Cập nhật profile của user khác (Admin only)
router.put('/:id/profile', restrictTo('ADMIN'), idValidation.validateObjectId, userController.updateUserProfile);
// POST /api/users/:id/profile - Tạo profile cho user (Admin only)
router.post('/:id/profile', restrictTo('ADMIN'), idValidation.validateObjectId, userController.createUserProfile);
// Tao user mới (Admin only)
router.post('/', restrictTo('ADMIN'), userValidation.createUser, userController.createUser);

module.exports = router;