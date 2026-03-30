const express = require('express');
const router = express.Router();

const staffController = require('../controllers/staffController');
const staffDashboardController = require('../controllers/staffDashboardController');
const authMiddleware = require('../middleware/authMiddleware');
const staffMiddleware = require('../middleware/staffMiddleware');

/**
 * Staff Routes
 * 
 * Hệ thống chỉ có 2 tài khoản staff CỐ ĐỊNH:
 * - Staff CTSV: Xử lý yêu cầu Công tác Sinh viên
 * - Staff KTX: Xử lý yêu cầu Ký túc xá
 * 
 * Mỗi staff chỉ xem và xử lý yêu cầu thuộc phạm vi của mình
 */

// Authentication required for all staff routes
router.use(authMiddleware.protect);
router.use(staffMiddleware.ensureStaff);

// ============================================
// PROFILE & DASHBOARD
// ============================================

// [GET] /staff/profile
router.get('/profile', staffController.getProfile);

// [GET] /staff/dashboard
router.get('/dashboard', staffController.getDashboard);

// [GET] /staff/dashboard/ctsv - Dashboard CTSV với stats và requests
router.get('/dashboard/ctsv', staffDashboardController.getCtsvDashboard);

// [GET] /staff/dashboard/ktx - Dashboard KTX với stats và requests
router.get('/dashboard/ktx', staffDashboardController.getKtxDashboard);

// [GET] /staff/dashboard/ctsv/stats - Chỉ stats CTSV
router.get('/dashboard/ctsv/stats', staffDashboardController.getCtsvStats);

// [GET] /staff/dashboard/ktx/stats - Chỉ stats KTX
router.get('/dashboard/ktx/stats', staffDashboardController.getKtxStats);

// [GET] /staff/dashboard/ctsv/requests - Yêu cầu CTSV gần đây
router.get('/dashboard/ctsv/requests', staffDashboardController.getRecentCtsvRequests);

// [GET] /staff/dashboard/ktx/requests - Yêu cầu KTX gần đây
router.get('/dashboard/ktx/requests', staffDashboardController.getRecentKtxRequests);

// ============================================
// REQUEST MANAGEMENT
// ============================================

// [GET] /staff/requests - Tự động filter theo staffType
router.get('/requests', staffController.getRequests);

// [GET] /staff/requests/stats
router.get('/requests/stats', staffController.getRequestStats);

// [GET] /staff/requests/:requestId
router.get('/requests/:requestId', staffController.getRequestById);

// [PUT] /staff/requests/:requestId/status
router.put('/requests/:requestId/status', staffController.updateRequestStatus);

// ============================================
// STAFF INFO (cho admin xem)
// ============================================

// [GET] /staff/info/:staffType - Lấy thông tin 1 trong 2 staff
router.get('/info/:staffType', staffController.getStaffByType);

// ============================================
// ERROR HANDLING
// ============================================

router.use((error, req, res, next) => {
  console.error('Staff route error:', error);
  
  res.status(500).json({
    status: false,
    message: 'Internal server error in staff operations',
    ...(process.env.NODE_ENV === 'development' && { error: error.message })
  });
});

module.exports = router;
