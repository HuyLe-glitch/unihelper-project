/**
 * Socket Service - Frontend Socket.IO Layer
 * 
 * Tuân thủ Separation of Concerns:
 * - Tất cả logic kết nối socket nằm tại đây
 * - Component chỉ gọi các method của service này
 */

import { io } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';

let socket = null;

const socketService = {
  /**
   * Kết nối đến Socket Server
   * @returns {Socket} Socket instance
   */
  connect: () => {
    if (!socket) {
      socket = io(SOCKET_URL, {
        transports: ['websocket', 'polling'],
        autoConnect: true
      });

      socket.on('connect', () => {
        console.log('🔌 Socket connected:', socket.id);
      });

      socket.on('disconnect', () => {
        console.log('🔌 Socket disconnected');
      });

      socket.on('connect_error', (error) => {
        console.error('🔌 Socket connection error:', error);
      });
    }
    return socket;
  },

  /**
   * Ngắt kết nối Socket
   */
  disconnect: () => {
    if (socket) {
      socket.disconnect();
      socket = null;
      console.log('🔌 Socket manually disconnected');
    }
  },

  /**
   * Tham gia phòng KTX
   * @param {string} roomId - ID phòng KTX
   */
  joinRoom: (roomId) => {
    if (socket && roomId) {
      socket.emit('JOIN_ROOM', roomId);
      console.log(`👤 Joining room: ${roomId}`);
    }
  },

  /**
   * Rời phòng KTX
   * @param {string} roomId - ID phòng KTX
   */
  leaveRoom: (roomId) => {
    if (socket && roomId) {
      socket.emit('LEAVE_ROOM', roomId);
      console.log(`👤 Leaving room: ${roomId}`);
    }
  },

  /**
   * Lắng nghe sự kiện có yêu cầu mới
   * @param {Function} callback - Hàm xử lý khi có yêu cầu mới
   */
  onNewRequest: (callback) => {
    if (socket) {
      socket.on('NEW_REQUEST_CREATED', callback);
    }
  },

  /**
   * Lắng nghe sự kiện có yêu cầu CTSV mới được tạo
   * @param {Function} callback - Hàm xử lý khi có yêu cầu mới
   */
  onCertificateRequestCreated: (callback) => {
    if (socket) {
      socket.on('CERTIFICATE_REQUEST_CREATED', callback);
    }
  },

  /**
   * Lắng nghe sự kiện yêu cầu CTSV được cập nhật (duyệt/từ chối)
   * @param {Function} callback - Hàm xử lý khi yêu cầu được cập nhật
   */
  onCertificateRequestUpdated: (callback) => {
    if (socket) {
      socket.on('CERTIFICATE_REQUEST_UPDATED', callback);
    }
  },

  /**
   * Lắng nghe sự kiện có yêu cầu KTX mới được tạo (broadcast)
   * @param {Function} callback - Hàm xử lý khi có yêu cầu mới
   */
  onDormitoryRequestCreated: (callback) => {
    if (socket) {
      socket.on('DORMITORY_REQUEST_CREATED', callback);
    }
  },

  /**
   * Lắng nghe sự kiện yêu cầu KTX được cập nhật (duyệt/từ chối)
   * @param {Function} callback - Hàm xử lý khi yêu cầu được cập nhật
   */
  onDormitoryRequestUpdated: (callback) => {
    if (socket) {
      socket.on('DORMITORY_REQUEST_UPDATED', callback);
    }
  },

  /**
   * Hủy lắng nghe sự kiện
   * @param {string} eventName - Tên sự kiện
   */
  off: (eventName) => {
    if (socket) {
      socket.off(eventName);
    }
  },

  /**
   * Lấy socket instance hiện tại
   * @returns {Socket|null}
   */
  getSocket: () => socket
};

export default socketService;
