/**
 * Student Notification Service
 * Xử lý business logic cho thông báo sinh viên
 * Bao gồm cả In-app notification và Email notification
 */
const studentNotificationRepository = require('../repositories/studentNotificationRepository');
const emailService = require('./emailService');

class StudentNotificationService {
  /**
   * Lấy danh sách thông báo của user
   */
  async getNotifications(userId, options = {}) {
    return await studentNotificationRepository.findByUser(userId, options);
  }

  /**
   * Đếm số thông báo chưa đọc
   */
  async getUnreadCount(userId) {
    return await studentNotificationRepository.countUnread(userId);
  }

  /**
   * Đánh dấu thông báo đã đọc
   */
  async markAsRead(notificationId, userId) {
    const notification = await studentNotificationRepository.markAsRead(notificationId, userId);
    if (!notification) {
      throw new Error('Không tìm thấy thông báo hoặc bạn không có quyền');
    }
    return notification;
  }

  /**
   * Đánh dấu tất cả thông báo đã đọc
   */
  async markAllAsRead(userId) {
    return await studentNotificationRepository.markAllAsRead(userId);
  }

  /**
   * Xóa thông báo
   */
  async deleteNotification(notificationId, userId) {
    const notification = await studentNotificationRepository.delete(notificationId, userId);
    if (!notification) {
      throw new Error('Không tìm thấy thông báo hoặc bạn không có quyền');
    }
    return notification;
  }

  // ==========================================
  // CTSV NOTIFICATIONS (In-app + Email)
  // ==========================================

  /**
   * Tạo thông báo khi sinh viên gửi yêu cầu CTSV
   * Gửi cả In-app notification và Email (song song, không chờ)
   */
  async createCtsvRequestCreated(userId, requestData, email = null) {
    // 1. Tạo In-app notification
    const notification = await studentNotificationRepository.createCtsvRequestCreated(userId, requestData);

    // 2. Gửi Email (không chờ - fire and forget)
    if (email) {
      emailService.sendCtsvRequestCreated(email, requestData)
        .then(result => {
          if (result.success) {
            console.log(`📧 CTSV created email sent to ${email}`);
          }
        })
        .catch(err => console.error('Email send error:', err.message));
    }

    return notification;
  }

  /**
   * Tạo thông báo khi yêu cầu CTSV được duyệt (hợp lệ)
   * Gửi cả In-app notification và Email (song song, không chờ)
   */
  async createCtsvRequestApproved(userId, requestData, email = null) {
    // 1. Tạo In-app notification
    const notification = await studentNotificationRepository.createCtsvRequestApproved(userId, requestData);

    // 2. Gửi Email (không chờ - fire and forget)
    if (email) {
      emailService.sendCtsvRequestApproved(email, requestData)
        .then(result => {
          if (result.success) {
            console.log(`📧 CTSV approved email sent to ${email}`);
          }
        })
        .catch(err => console.error('Email send error:', err.message));
    }

    return notification;
  }

  /**
   * Tạo thông báo khi yêu cầu CTSV bị từ chối (không hợp lệ)
   * Gửi cả In-app notification và Email (song song, không chờ)
   */
  async createCtsvRequestRejected(userId, requestData, email = null) {
    // 1. Tạo In-app notification
    const notification = await studentNotificationRepository.createCtsvRequestRejected(userId, requestData);

    // 2. Gửi Email (không chờ - fire and forget)
    if (email) {
      emailService.sendCtsvRequestRejected(email, requestData)
        .then(result => {
          if (result.success) {
            console.log(`📧 CTSV rejected email sent to ${email}`);
          }
        })
        .catch(err => console.error('Email send error:', err.message));
    }

    return notification;
  }

  // ==========================================
  // KTX NOTIFICATIONS (In-app + Email)
  // ==========================================

  /**
   * Tạo thông báo khi sinh viên gửi yêu cầu KTX
   * Gửi cả In-app notification và Email (song song, không chờ)
   */
  async createKtxRequestCreated(userId, requestData, email = null) {
    // 1. Tạo In-app notification
    const notification = await studentNotificationRepository.createKtxRequestCreated(userId, requestData);

    // 2. Gửi Email (không chờ - fire and forget)
    if (email) {
      emailService.sendKtxRequestCreated(email, requestData)
        .then(result => {
          if (result.success) {
            console.log(`📧 KTX created email sent to ${email}`);
          }
        })
        .catch(err => console.error('Email send error:', err.message));
    }

    return notification;
  }

  /**
   * Tạo thông báo khi yêu cầu KTX được xử lý
   * Gửi cả In-app notification và Email (song song, không chờ)
   */
  async createKtxRequestApproved(userId, requestData, email = null) {
    // 1. Tạo In-app notification
    const notification = await studentNotificationRepository.createKtxRequestApproved(userId, requestData);

    // 2. Gửi Email (không chờ - fire and forget)
    if (email) {
      emailService.sendKtxRequestApproved(email, requestData)
        .then(result => {
          if (result.success) {
            console.log(`📧 KTX approved email sent to ${email}`);
          }
        })
        .catch(err => console.error('Email send error:', err.message));
    }

    return notification;
  }

  /**
   * Tạo thông báo khi yêu cầu KTX bị từ chối
   * Gửi cả In-app notification và Email (song song, không chờ)
   */
  async createKtxRequestRejected(userId, requestData, email = null) {
    // 1. Tạo In-app notification
    const notification = await studentNotificationRepository.createKtxRequestRejected(userId, requestData);

    // 2. Gửi Email (không chờ - fire and forget)
    if (email) {
      emailService.sendKtxRequestRejected(email, requestData)
        .then(result => {
          if (result.success) {
            console.log(`📧 KTX rejected email sent to ${email}`);
          }
        })
        .catch(err => console.error('Email send error:', err.message));
    }

    return notification;
  }
}

module.exports = new StudentNotificationService();
