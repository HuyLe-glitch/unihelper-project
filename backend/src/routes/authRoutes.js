const express = require('express');
const authController = require('../controllers/authController');
const { authValidation } = require('../validators/userValidation');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

/**
 * Auth Routes - Các endpoint cho Authentication
 * Chỉ bao gồm login và các chức năng cần thiết
 */

// Add this route BEFORE the existing routes
router.post('/login/student', authController.loginStudent);

// POST /api/auth/login - Đăng nhập
router.post('/login', authController.login);

// GET /api/auth/me - Lấy thông tin user hiện tại (cần token)
router.get('/me', protect, authController.getCurrentUser);

// PUT /api/auth/change-password - Đổi password (cần token)
router.put('/change-password', protect, authValidation.changePassword, authController.changePassword);

// GET /api/auth/verify - Xác thực token
router.get('/verify', protect, authController.verifyToken);

module.exports = router;
