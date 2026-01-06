/**
 * Student Notification Repository
 * Xử lý truy vấn database cho thông báo sinh viên
 */
const StudentNotification = require('../models/StudentNotification');

class StudentNotificationRepository {
  /**
   * Tạo thông báo mới
   */
  async create(notificationData) {
    const notification = new StudentNotification(notificationData);
    return await notification.save();
  }

  /**
   * Lấy danh sách thông báo của user
   */
  async findByUser(userId, options = {}) {
    const { page = 1, limit = 20, isRead = null } = options;
    
    const query = { user: userId };
    if (isRead !== null) {
      query.isRead = isRead;
    }

    const skip = (page - 1) * limit;

    const [notifications, total] = await Promise.all([
      StudentNotification.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      StudentNotification.countDocuments(query)
    ]);

    return {
      notifications,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    };
  }

  /**
   * Đếm số thông báo chưa đọc
   */
  async countUnread(userId) {
    return await StudentNotification.countDocuments({
      user: userId,
      isRead: false
    });
  }

  /**
   * Đánh dấu thông báo đã đọc
   */
  async markAsRead(notificationId, userId) {
    return await StudentNotification.findOneAndUpdate(
      { _id: notificationId, user: userId },
      { isRead: true, readAt: new Date() },
      { new: true }
    );
  }

  /**
   * Đánh dấu tất cả thông báo đã đọc
   */
  async markAllAsRead(userId) {
    return await StudentNotification.updateMany(
      { user: userId, isRead: false },
      { isRead: true, readAt: new Date() }
    );
  }

  /**
   * Xóa thông báo
   */
  async delete(notificationId, userId) {
    return await StudentNotification.findOneAndDelete({
      _id: notificationId,
      user: userId
    });
  }

  /**
   * Xóa thông báo cũ (cleanup)
   */
  async deleteOldNotifications(daysOld = 30) {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);
    
    return await StudentNotification.deleteMany({
      createdAt: { $lt: cutoffDate },
      isRead: true
    });
  }

  /**
   * Tạo thông báo CTSV - Yêu cầu đã gửi
   */
  async createCtsvRequestCreated(userId, requestData) {
    return await this.create({
      user: userId,
      type: 'CTSV_REQUEST_CREATED',
      title: 'Yêu cầu CTSV đã được gửi',
      message: `Yêu cầu ${requestData.requestCode} - ${requestData.certificateType || requestData.certificateName} đã được gửi thành công. Vui lòng chờ xử lý.`,
      data: {
        requestCode: requestData.requestCode,
        requestId: requestData.requestId,
        requestType: 'CTSV',
        certificateType: requestData.certificateType || requestData.certificateName,
        certificateName: requestData.certificateName,
        status: 'ĐANG XỬ LÝ'
      }
    });
  }

  /**
   * Tạo thông báo CTSV - Yêu cầu hợp lệ
   */
  async createCtsvRequestApproved(userId, requestData) {
    return await this.create({
      user: userId,
      type: 'CTSV_REQUEST_APPROVED',
      title: 'Yêu cầu CTSV đã được duyệt',
      message: `Yêu cầu ${requestData.requestCode} - ${requestData.certificateName} đã được duyệt HỢP LỆ.${requestData.notes ? ` Ghi chú: ${requestData.notes}` : ''}`,
      data: {
        requestCode: requestData.requestCode,
        requestId: requestData.requestId,
        requestType: 'CTSV',
        certificateType: requestData.certificateType,
        certificateName: requestData.certificateName,
        status: 'HỢP LỆ',
        notes: requestData.notes
      }
    });
  }

  /**
   * Tạo thông báo CTSV - Yêu cầu không hợp lệ
   */
  async createCtsvRequestRejected(userId, requestData) {
    return await this.create({
      user: userId,
      type: 'CTSV_REQUEST_REJECTED',
      title: 'Yêu cầu CTSV không hợp lệ',
      message: `Yêu cầu ${requestData.requestCode} - ${requestData.certificateName} đã bị từ chối.${requestData.notes ? ` Lý do: ${requestData.notes}` : ''}`,
      data: {
        requestCode: requestData.requestCode,
        requestId: requestData.requestId,
        requestType: 'CTSV',
        certificateType: requestData.certificateType,
        certificateName: requestData.certificateName,
        status: 'KHÔNG HỢP LỆ',
        notes: requestData.notes
      }
    });
  }

  /**
   * Tạo thông báo KTX - Yêu cầu đã tiếp nhận
   */
  async createKtxRequestCreated(userId, requestData) {
    return await this.create({
      user: userId,
      type: 'KTX_REQUEST_CREATED',
      title: 'Yêu cầu KTX đã được tiếp nhận',
      message: `Yêu cầu ${requestData.requestCode} - ${requestData.equipmentName} đã được tiếp nhận. Ban quản lý sẽ xử lý trong thời gian sớm nhất.`,
      data: {
        requestCode: requestData.requestCode,
        requestId: requestData.requestId,
        requestType: 'KTX',
        equipmentCategory: requestData.equipmentCategory,
        equipmentName: requestData.equipmentName,
        description: requestData.description,
        status: 'Pending'
      }
    });
  }

  /**
   * Tạo thông báo KTX - Yêu cầu đã xử lý
   */
  async createKtxRequestApproved(userId, requestData) {
    return await this.create({
      user: userId,
      type: 'KTX_REQUEST_APPROVED',
      title: 'Yêu cầu KTX đã được xử lý',
      message: `Yêu cầu ${requestData.requestCode} - ${requestData.equipmentName} đã được xử lý thành công.${requestData.notes ? ` Ghi chú: ${requestData.notes}` : ''}`,
      data: {
        requestCode: requestData.requestCode,
        requestId: requestData.requestId,
        requestType: 'KTX',
        equipmentCategory: requestData.equipmentCategory,
        equipmentName: requestData.equipmentName,
        status: 'Approved',
        notes: requestData.notes
      }
    });
  }

  /**
   * Tạo thông báo KTX - Yêu cầu bị từ chối
   */
  async createKtxRequestRejected(userId, requestData) {
    return await this.create({
      user: userId,
      type: 'KTX_REQUEST_REJECTED',
      title: 'Yêu cầu KTX bị từ chối',
      message: `Yêu cầu ${requestData.requestCode} - ${requestData.equipmentName} đã bị từ chối.${requestData.notes ? ` Lý do: ${requestData.notes}` : ''}`,
      data: {
        requestCode: requestData.requestCode,
        requestId: requestData.requestId,
        requestType: 'KTX',
        equipmentCategory: requestData.equipmentCategory,
        equipmentName: requestData.equipmentName,
        status: 'Rejected',
        notes: requestData.notes
      }
    });
  }
}

module.exports = new StudentNotificationRepository();
