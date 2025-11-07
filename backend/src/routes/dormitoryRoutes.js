const express = require('express');
const router = express.Router();
const dormitoryController = require('../controllers/dormitoryController');
const { protect, restrictTo } = require('../middleware/authMiddleware');

// Protect all dormitory routes
router.use(protect);

// Add routes for managing categories
router.get('/categories', dormitoryController.getCategories);

// Student creates one or more dormitory requests
router.post('/requests', restrictTo('STUDENT'), dormitoryController.createDormitoryRequests);

// Student fetches their requests
router.get('/requests/my', restrictTo('STUDENT'), dormitoryController.getMyRequests);

// Get single request (student own or staff/admin)
router.get('/requests/:id', restrictTo('STUDENT', 'STAFF', 'ADMIN'), dormitoryController.getRequestById);

// Update status (staff/admin)
router.patch('/requests/:id/status', restrictTo('STAFF', 'ADMIN'), dormitoryController.updateRequestStatus);

// DELETE /api/auth/dormitory/requests/:id - Xóa yêu cầu KTX
router.delete('/requests/:id', restrictTo('STUDENT', 'STAFF', 'ADMIN'), dormitoryController.deleteDormitoryRequest);

module.exports = router;