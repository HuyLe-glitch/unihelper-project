/**
 * Student Notification Controller
 * Xử lý HTTP requests cho thông báo sinh viên
 */
const studentNotificationService = require('../services/studentNotificationService');

/**
 * Lấy danh sách thông báo của user hiện tại
 * GET /api/student-notifications
 */
const getNotifications = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { page = 1, limit = 20, isRead } = req.query;

    const options = {
      page: parseInt(page),
      limit: parseInt(limit),
      isRead: isRead !== undefined ? isRead === 'true' : null
    };

    const result = await studentNotificationService.getNotifications(userId, options);

    res.status(200).json({
      success: true,
      data: result.notifications,
      pagination: {
        total: result.total,
        page: result.page,
        limit: result.limit,
        totalPages: result.totalPages
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Lấy số lượng thông báo chưa đọc
 * GET /api/student-notifications/unread-count
 */
const getUnreadCount = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const count = await studentNotificationService.getUnreadCount(userId);

    res.status(200).json({
      success: true,
      data: { count }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Đánh dấu thông báo đã đọc
 * PATCH /api/student-notifications/:id/read
 */
const markAsRead = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const notificationId = req.params.id;

    const notification = await studentNotificationService.markAsRead(notificationId, userId);

    res.status(200).json({
      success: true,
      message: 'Đã đánh dấu đã đọc',
      data: notification
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Đánh dấu tất cả thông báo đã đọc
 * PATCH /api/student-notifications/mark-all-read
 */
const markAllAsRead = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const result = await studentNotificationService.markAllAsRead(userId);

    res.status(200).json({
      success: true,
      message: 'Đã đánh dấu tất cả đã đọc',
      data: { modifiedCount: result.modifiedCount }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Xóa thông báo
 * DELETE /api/student-notifications/:id
 */
const deleteNotification = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const notificationId = req.params.id;

    await studentNotificationService.deleteNotification(notificationId, userId);

    res.status(200).json({
      success: true,
      message: 'Đã xóa thông báo'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification
};
