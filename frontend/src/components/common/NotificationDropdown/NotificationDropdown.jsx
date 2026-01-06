import React, { useState, useEffect, useRef, useCallback } from 'react';
import studentNotificationService from '../../../services/studentNotification';
import socketService from '../../../services/socket';
import './NotificationDropdown.css';

const NotificationDropdown = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [showDetailDialog, setShowDetailDialog] = useState(false);
  const dropdownRef = useRef(null);
  const listRef = useRef(null);

  // Lấy số thông báo chưa đọc
  const fetchUnreadCount = useCallback(async () => {
    try {
      const response = await studentNotificationService.getUnreadCount();
      if (response.success) {
        setUnreadCount(response.data.count);
      }
    } catch (error) {
      console.error('Error fetching unread count:', error);
    }
  }, []);

  // Lấy danh sách thông báo
  const fetchNotifications = useCallback(async (pageNum = 1, append = false) => {
    try {
      setLoading(true);
      const response = await studentNotificationService.getNotifications({ page: pageNum, limit: 10 });
      if (response.success) {
        if (append) {
          setNotifications(prev => [...prev, ...response.data]);
        } else {
          setNotifications(response.data);
        }
        setHasMore(response.data.length === 10);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch unread count on mount
  useEffect(() => {
    fetchUnreadCount();
    // Poll every 30 seconds
    const interval = setInterval(fetchUnreadCount, 30000);
    return () => clearInterval(interval);
  }, [fetchUnreadCount]);

  // Socket.IO: Lắng nghe thông báo mới để cập nhật realtime
  useEffect(() => {
    socketService.connect();
    
    socketService.onStudentNotificationCreated((data) => {
      console.log('📬 New notification received:', data);
      // Fetch lại unread count ngay lập tức
      fetchUnreadCount();
      // Nếu dropdown đang mở, fetch lại danh sách
      if (isOpen) {
        fetchNotifications(1, false);
      }
    });

    return () => {
      socketService.off('STUDENT_NOTIFICATION_CREATED');
    };
  }, [fetchUnreadCount, fetchNotifications, isOpen]);

  // Fetch notifications when dropdown opens
  useEffect(() => {
    if (isOpen) {
      setPage(1);
      fetchNotifications(1, false);
    }
  }, [isOpen, fetchNotifications]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Scroll to load more
  const handleScroll = () => {
    if (!listRef.current || loading || !hasMore) return;
    
    const { scrollTop, scrollHeight, clientHeight } = listRef.current;
    if (scrollTop + clientHeight >= scrollHeight - 50) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchNotifications(nextPage, true);
    }
  };

  // Đánh dấu đã đọc và mở dialog chi tiết
  const handleNotificationClick = async (notification) => {
    // Đánh dấu đã đọc nếu chưa đọc
    if (!notification.isRead) {
      try {
        await studentNotificationService.markAsRead(notification._id);
        setNotifications(prev => prev.map(n => 
          n._id === notification._id ? { ...n, isRead: true } : n
        ));
        setUnreadCount(prev => Math.max(0, prev - 1));
      } catch (error) {
        console.error('Error marking as read:', error);
      }
    }
    
    // Mở dialog chi tiết
    setSelectedNotification(notification);
    setShowDetailDialog(true);
  };

  // Đóng dialog chi tiết
  const handleCloseDialog = () => {
    setShowDetailDialog(false);
    setSelectedNotification(null);
  };

  // Lấy trạng thái hiển thị
  const getStatusDisplay = (type) => {
    switch (type) {
      case 'CTSV_REQUEST_CREATED':
        return { text: 'Đang xử lý', class: 'status-processing' };
      case 'CTSV_REQUEST_APPROVED':
        return { text: 'Hợp lệ', class: 'status-approved' };
      case 'CTSV_REQUEST_REJECTED':
        return { text: 'Không hợp lệ', class: 'status-rejected' };
      case 'KTX_REQUEST_CREATED':
        return { text: 'Đang chờ xử lý', class: 'status-processing' };
      case 'KTX_REQUEST_APPROVED':
        return { text: 'Đã xử lý', class: 'status-approved' };
      case 'KTX_REQUEST_REJECTED':
        return { text: 'Bị từ chối', class: 'status-rejected' };
      default:
        return { text: 'Không xác định', class: 'status-unknown' };
    }
  };

  // Đánh dấu đã đọc
  const handleMarkAsRead = async (notification) => {
    if (notification.isRead) return;
    
    try {
      await studentNotificationService.markAsRead(notification._id);
      setNotifications(prev => prev.map(n => 
        n._id === notification._id ? { ...n, isRead: true } : n
      ));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking as read:', error);
    }
  };

  // Đánh dấu tất cả đã đọc
  const handleMarkAllAsRead = async () => {
    try {
      await studentNotificationService.markAllAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  // Format time
  const formatTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Vừa xong';
    if (minutes < 60) return `${minutes} phút trước`;
    if (hours < 24) return `${hours} giờ trước`;
    if (days < 7) return `${days} ngày trước`;
    return date.toLocaleDateString('vi-VN');
  };

  // Get notification icon
  const getNotificationIcon = (type) => {
    switch (type) {
      case 'CTSV_REQUEST_CREATED':
        return '📝';
      case 'CTSV_REQUEST_APPROVED':
        return '✅';
      case 'CTSV_REQUEST_REJECTED':
        return '❌';
      case 'KTX_REQUEST_CREATED':
        return '🏠';
      case 'KTX_REQUEST_APPROVED':
        return '✅';
      case 'KTX_REQUEST_REJECTED':
        return '❌';
      default:
        return '🔔';
    }
  };

  // Get notification type label
  const getTypeLabel = (type) => {
    switch (type) {
      case 'CTSV_REQUEST_CREATED':
      case 'CTSV_REQUEST_APPROVED':
      case 'CTSV_REQUEST_REJECTED':
        return 'CTSV';
      case 'KTX_REQUEST_CREATED':
      case 'KTX_REQUEST_APPROVED':
      case 'KTX_REQUEST_REJECTED':
        return 'KTX';
      default:
        return 'Hệ thống';
    }
  };

  return (
    <div className="notification-dropdown-wrapper" ref={dropdownRef}>
      <button 
        className="notification-trigger"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Thông báo"
      >
        <svg className="notification-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 21 21">
          <path fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5"
            d="M15.585 15.5H5.415A1.65 1.65 0 0 1 4 13a10.526 10.526 0 0 0 1.5-5.415V6.5a4 4 0 0 1 4-4h2a4 4 0 0 1 4 4v1.085c0 1.907.518 3.78 1.5 5.415a1.65 1.65 0 0 1-1.415 2.5zm1.915-11c-.267-.934-.6-1.6-1-2s-1.066-.733-2-1m-10.912 3c.209-.934.512-1.6.912-2s1.096-.733 2.088-1M13 17c-.667 1-1.5 1.5-2.5 1.5S8.667 18 8 17" />
        </svg>
        {unreadCount > 0 && (
          <span className="notification-badge">{unreadCount > 99 ? '99+' : unreadCount}</span>
        )}
      </button>

      {isOpen && (
        <div className="notification-dropdown">
          <div className="notification-header">
            <h3>Thông báo</h3>
            {unreadCount > 0 && (
              <button 
                className="mark-all-read-btn"
                onClick={handleMarkAllAsRead}
              >
                Đánh dấu tất cả đã đọc
              </button>
            )}
          </div>

          <div 
            className="notification-list"
            ref={listRef}
            onScroll={handleScroll}
          >
            {notifications.length === 0 && !loading ? (
              <div className="notification-empty">
                <span className="empty-icon">📭</span>
                <p>Không có thông báo nào</p>
              </div>
            ) : (
              notifications.map((notification) => (
                <div 
                  key={notification._id}
                  className={`notification-item ${!notification.isRead ? 'unread' : ''}`}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <div className="notification-item-icon">
                    {getNotificationIcon(notification.type)}
                  </div>
                  <div className="notification-item-content">
                    <div className="notification-item-header">
                      <span className={`notification-type-badge ${getTypeLabel(notification.type).toLowerCase()}`}>
                        {getTypeLabel(notification.type)}
                      </span>
                      <span className="notification-time">
                        {formatTime(notification.createdAt)}
                      </span>
                    </div>
                    <div className="notification-title">{notification.title}</div>
                    <div className="notification-message">{notification.message}</div>
                    {notification.data?.requestCode && (
                      <div className="notification-request-code">
                        Mã yêu cầu: {notification.data.requestCode}
                      </div>
                    )}
                  </div>
                  {!notification.isRead && (
                    <div className="notification-unread-dot"></div>
                  )}
                </div>
              ))
            )}
            
            {loading && (
              <div className="notification-loading">
                <span>Đang tải...</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Dialog chi tiết thông báo */}
      {showDetailDialog && selectedNotification && (
        <div className="notification-dialog-overlay" onClick={handleCloseDialog}>
          <div className="notification-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="notification-dialog-header">
              <div className="notification-dialog-icon">
                {getNotificationIcon(selectedNotification.type)}
              </div>
              <div className="notification-dialog-title-section">
                <span className={`notification-type-badge ${getTypeLabel(selectedNotification.type).toLowerCase()}`}>
                  {getTypeLabel(selectedNotification.type)}
                </span>
                <h3>{selectedNotification.title}</h3>
              </div>
              <button className="notification-dialog-close" onClick={handleCloseDialog}>
                ✕
              </button>
            </div>
            
            <div className="notification-dialog-body">
              <div className="notification-dialog-message">
                {selectedNotification.message}
              </div>

              <div className="notification-dialog-details">
                <h4>Chi tiết yêu cầu</h4>
                
                {selectedNotification.data?.requestCode && (
                  <div className="detail-row">
                    <span className="detail-label">Mã yêu cầu:</span>
                    <span className="detail-value highlight">{selectedNotification.data.requestCode}</span>
                  </div>
                )}

                {selectedNotification.data?.requestType === 'CTSV' && selectedNotification.data?.certificateType && (
                  <div className="detail-row">
                    <span className="detail-label">Loại chứng nhận:</span>
                    <span className="detail-value">{selectedNotification.data.certificateType}</span>
                  </div>
                )}

                {selectedNotification.data?.requestType === 'CTSV' && selectedNotification.data?.certificateName && (
                  <div className="detail-row">
                    <span className="detail-label">Tên chứng nhận:</span>
                    <span className="detail-value">{selectedNotification.data.certificateName}</span>
                  </div>
                )}

                {selectedNotification.data?.requestType === 'KTX' && (
                  <div className="detail-row">
                    <span className="detail-label">Loại yêu cầu:</span>
                    <span className="detail-value">Ký túc xá</span>
                  </div>
                )}

                {selectedNotification.data?.equipmentName && (
                  <div className="detail-row">
                    <span className="detail-label">Thiết bị:</span>
                    <span className="detail-value">{selectedNotification.data.equipmentName}</span>
                  </div>
                )}

                {selectedNotification.data?.equipmentCategory && (
                  <div className="detail-row">
                    <span className="detail-label">Danh mục:</span>
                    <span className="detail-value">{selectedNotification.data.equipmentCategory}</span>
                  </div>
                )}

                <div className="detail-row">
                  <span className="detail-label">Trạng thái:</span>
                  <span className={`detail-value status-badge ${getStatusDisplay(selectedNotification.type).class}`}>
                    {getStatusDisplay(selectedNotification.type).text}
                  </span>
                </div>

                {selectedNotification.data?.notes && (
                  <div className="detail-row">
                    <span className="detail-label">Ghi chú:</span>
                    <span className="detail-value">{selectedNotification.data.notes}</span>
                  </div>
                )}

                <div className="detail-row">
                  <span className="detail-label">Thời gian:</span>
                  <span className="detail-value">
                    {new Date(selectedNotification.createdAt).toLocaleString('vi-VN')}
                  </span>
                </div>
              </div>
            </div>

            <div className="notification-dialog-footer">
              <button className="notification-dialog-btn" onClick={handleCloseDialog}>
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationDropdown;
