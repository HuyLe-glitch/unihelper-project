const express = require('express');
const router = express.Router();
const roomController = require('../controllers/roomController');
const { roomValidation, idValidation, queryValidation } = require('../validators/roomValidation');
const { protect, restrictTo } = require('../middleware/authMiddleware');

/**
 * Room Routes
 * Quản lý phòng KTX
 */

// Tất cả routes yêu cầu đăng nhập
router.use(protect);

// GET /api/rooms - Lấy tất cả phòng (ADMIN, STAFF)
router.get(
  '/',
  restrictTo('ADMIN', 'STAFF'),
  queryValidation,
  roomController.getAllRooms
);

// GET /api/rooms/stats - Lấy thống kê phòng
router.get(
  '/stats',
  restrictTo('ADMIN', 'STAFF'),
  roomController.getRoomStats
);

// GET /api/rooms/available - Lấy phòng còn trống
router.get(
  '/available',
  restrictTo('ADMIN', 'STAFF'),
  roomController.getAvailableRooms
);

// GET /api/rooms/:id - Lấy phòng theo ID
router.get(
  '/:id',
  restrictTo('ADMIN', 'STAFF'),
  idValidation,
  roomController.getRoomById
);

// POST /api/rooms - Tạo phòng mới (ADMIN only)
router.post(
  '/',
  restrictTo('ADMIN'),
  roomValidation.create,
  roomController.createRoom
);

// PATCH /api/rooms/:id - Cập nhật phòng (ADMIN only)
router.patch(
  '/:id',
  restrictTo('ADMIN'),
  roomValidation.update,
  roomController.updateRoom
);

// DELETE /api/rooms/:id - Xóa phòng (ADMIN only)
router.delete(
  '/:id',
  restrictTo('ADMIN'),
  idValidation,
  roomController.deleteRoom
);

module.exports = router;
