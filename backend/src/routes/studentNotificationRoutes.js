/**
 * Student Notification Routes
 * Định nghĩa endpoints cho thông báo sinh viên
 */
const express = require('express');
const router = express.Router();
const studentNotificationController = require('../controllers/studentNotificationController');
const { protect } = require('../middleware/authMiddleware');

// Tất cả routes đều yêu cầu authentication
router.use(protect);

// GET /api/student-notifications - Lấy danh sách thông báo
router.get('/', studentNotificationController.getNotifications);

// GET /api/student-notifications/unread-count - Lấy số thông báo chưa đọc
router.get('/unread-count', studentNotificationController.getUnreadCount);

// PATCH /api/student-notifications/mark-all-read - Đánh dấu tất cả đã đọc
router.patch('/mark-all-read', studentNotificationController.markAllAsRead);

// PATCH /api/student-notifications/:id/read - Đánh dấu một thông báo đã đọc
router.patch('/:id/read', studentNotificationController.markAsRead);

// DELETE /api/student-notifications/:id - Xóa thông báo
router.delete('/:id', studentNotificationController.deleteNotification);

module.exports = router;
