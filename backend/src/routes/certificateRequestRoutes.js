const express = require('express');
const certificateRequestController = require('../controllers/certificateRequestController');
const { certificateRequestValidation, idValidation } = require('../validators/certificateRequestValidation');
const { protect, restrictTo } = require('../middleware/authMiddleware');

const router = express.Router();

/**
 * Certificate Request Routes - API endpoints cho yêu cầu chứng nhận
 */

// Middleware bảo vệ tất cả routes
router.use(protect);

// =============== STUDENT ROUTES ===============

// POST /api/certificate-requests - Tạo yêu cầu chứng nhận mới (Student only)
router.post('/',
  restrictTo('STUDENT'),
  certificateRequestValidation.createRequest,
  certificateRequestController.createRequest
);

// GET /api/certificate-requests/my - Lấy lịch sử yêu cầu của sinh viên hiện tại
router.get('/my',
  restrictTo('STUDENT'),
  certificateRequestValidation.getRequestsQuery,
  certificateRequestController.getMyRequests
);

// =============== DASHBOARD ROUTES (Student only) ===============

// GET /api/certificate-requests/dashboard/processing - Lấy yêu cầu đang xử lý cho dashboard
router.get('/dashboard/processing',
  restrictTo('STUDENT'),
  certificateRequestController.getDashboardProcessingRequests
);

// GET /api/certificate-requests/dashboard/valid - Lấy yêu cầu hợp lệ cho dashboard
router.get('/dashboard/valid',
  restrictTo('STUDENT'),
  certificateRequestController.getDashboardValidRequests
);

// GET /api/certificate-requests/dashboard/invalid - Lấy yêu cầu không hợp lệ cho dashboard
router.get('/dashboard/invalid',
  restrictTo('STUDENT'),
  certificateRequestController.getDashboardInvalidRequests
);

// =============== ADMIN ONLY ROUTES (phải đặt trước /:id) ===============

// GET /api/certificate-requests/stats - Lấy thống kê yêu cầu (Admin only)
router.get('/stats',
  restrictTo('ADMIN'),
  certificateRequestController.getRequestStats
);

// =============== STAFF/ADMIN ROUTES ===============

// GET /api/certificate-requests - Lấy tất cả yêu cầu (Staff/Admin only)
router.get('/',
  restrictTo('STAFF', 'ADMIN'),
  certificateRequestValidation.getRequestsQuery,
  certificateRequestController.getAllRequests
);

// =============== SHARED ROUTES (phải đặt sau các route cụ thể) ===============

// GET /api/certificate-requests/:id - Lấy chi tiết yêu cầu (Student xem của mình, Staff/Admin xem tất cả)
router.get('/:id',
  idValidation.validateObjectId,
  certificateRequestController.getRequestDetails
);

// PUT /api/certificate-requests/:id/status - Cập nhật trạng thái yêu cầu (Staff/Admin only)
router.put('/:id/status',
  restrictTo('STAFF', 'ADMIN'),
  idValidation.validateObjectId,
  certificateRequestValidation.updateStatus,
  certificateRequestController.updateRequestStatus
);

module.exports = router;
