const express = require('express');
const router = express.Router();
const dormitoryController = require('../controllers/dormitoryController');
const { protect, restrictTo } = require('../middleware/authMiddleware');

router.use(protect);

// KTX Reports - sử dụng dormitoryController
router.get('/ktx/requests', restrictTo('ADMIN', 'STAFF'), dormitoryController.getAllDormitoryRequests);
router.get('/ktx/stats/by-month', restrictTo('ADMIN', 'STAFF'), dormitoryController.getDormitoryRequestsByMonth);

// TODO: Thêm các route báo cáo khác sau này (CTSV, etc.)

module.exports = router;
