/**
 * Admin Routes
 * 
 * Routes cho các chức năng Admin
 */

const express = require('express');
const router = express.Router();
const { protect, restrictTo } = require('../middleware/authMiddleware');
const adminDashboardController = require('../controllers/adminDashboardController');

// Dashboard - Role phải là 'ADMIN' (viết hoa như trong User model)
router.get('/dashboard', protect, restrictTo('ADMIN'), adminDashboardController.getDashboard);

module.exports = router;
