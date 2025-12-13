const express = require('express');
const router = express.Router();
const controller = require('../controllers/dormitoryRequestController');
const { protect,restrictTo } = require('../middleware/authMiddleware');

router.use(protect);
// CRUD cơ bản
router.get('/', restrictTo('ADMIN'), controller.getAllRequests);
router.post('/', controller.createRequest);

// Dashboard stats
router.get('/stats/request-by-month', restrictTo('ADMIN'), controller.getRequestStatsByMonth);
router.get('/stats/confirm-by-month', restrictTo('ADMIN'), controller.getConfirmStatsByMonth);

router.get('/stats/weekly', restrictTo('ADMIN'), controller.getWeeklyStats);
router.get('/stats/yearly', restrictTo('ADMIN'), controller.getYearlyStats);
/*router.get('/stats/by-category', restrictTo('ADMIN'), controller.getStatsByCategory);*/
router.get('/stats/by-status', restrictTo('ADMIN'), controller.getStatsByStatus);

module.exports = router;
