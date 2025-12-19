import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { roomService } from '../../../services/room';
import RoomFormModal from './RoomFormModal';
import './RoomManagement.css';

const RoomManagement = () => {
  // Data states
  const [isLoading, setIsLoading] = useState(true);
  const [rooms, setRooms] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    available: 0,
    full: 0,
    maintenance: 0,
    totalCapacity: 0,
    totalOccupied: 0,
    occupancyRate: 0
  });

  // UI states
  const [searchTerm, setSearchTerm] = useState('');
  const [showRoomModal, setShowRoomModal] = useState(false);
  const [editingRoom, setEditingRoom] = useState(null);

  // Delete confirmation
  const [deleteConfirm, setDeleteConfirm] = useState({ show: false, item: null });

  // Toast notification
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  // Toast helper
  const showToast = useCallback((message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3000);
  }, []);

  // Load rooms từ API
  const loadRooms = useCallback(async () => {
    try {
      const response = await roomService.getAllRooms();
      if (response.success) {
        setRooms(response.data);
      }
    } catch (error) {
      console.error('Lỗi load rooms:', error);
      showToast('Không thể tải danh sách phòng', 'error');
    }
  }, [showToast]);

  // Load stats từ API
  const loadStats = useCallback(async () => {
    try {
      const response = await roomService.getRoomStats();
      if (response.success) {
        setStats(response.data);
      }
    } catch (error) {
      console.error('Lỗi load stats:', error);
    }
  }, []);

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      await Promise.all([loadRooms(), loadStats()]);
      setIsLoading(false);
    };
    loadData();
  }, [loadRooms, loadStats]);

  // Filter rooms
  const filteredRooms = useMemo(() => {
    return rooms.filter(room =>
      room.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [rooms, searchTerm]);

  // Handlers
  const handleAddRoom = () => {
    setEditingRoom(null);
    setShowRoomModal(true);
  };

  const handleEditRoom = (room) => {
    setEditingRoom(room);
    setShowRoomModal(true);
  };

  const handleDeleteClick = (room) => {
    if (room.occupied > 0) {
      showToast(`Không thể xóa phòng đang có ${room.occupied} người ở!`, 'error');
      return;
    }
    setDeleteConfirm({ show: true, item: room });
  };

  const handleConfirmDelete = async () => {
    const room = deleteConfirm.item;
    try {
      const response = await roomService.deleteRoom(room._id);
      if (response.success) {
        showToast('Đã xóa phòng thành công');
        loadRooms();
        loadStats();
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Không thể xóa phòng';
      showToast(message, 'error');
    } finally {
      setDeleteConfirm({ show: false, item: null });
    }
  };

  const handleModalSuccess = (data, action) => {
    if (action === 'create') {
      showToast('Thêm phòng thành công!');
    } else {
      showToast('Cập nhật phòng thành công!');
    }
    loadRooms();
    loadStats();
    setShowRoomModal(false);
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'AVAILABLE': return { text: '✅ Còn chỗ', className: 'status-available' };
      case 'FULL': return { text: '🔴 Đầy', className: 'status-full' };
      case 'MAINTENANCE': return { text: '🔧 Bảo trì', className: 'status-maintenance' };
      default: return { text: status, className: '' };
    }
  };

  if (isLoading) {
    return (
      <div className="room-management-loading">
        <div className="loading-spinner"></div>
        <p>Đang tải dữ liệu...</p>
      </div>
    );
  }

  return (
    <div className="room-management">
      {/* Header */}
      <div className="page-header">
        <div className="header-content">
          <div>
            <h1 className="page-title">Quản lý Phòng KTX</h1>
            <p className="page-subtitle">Quản lý thông tin các phòng ký túc xá</p>
          </div>
          <div className="header-actions">
            <button className="btn btn-primary" onClick={handleAddRoom}>
              <span className="btn-icon">+</span>
              Thêm phòng mới
            </button>
          </div>
        </div>
      </div>

      {/* Statistics */}
      <div className="stats-grid">
        <div className="stat-card stat-blue">
          <div className="stat-icon">🏠</div>
          <div className="stat-content">
            <h3>Tổng số phòng</h3>
            <div className="stat-value">{stats.total}</div>
          </div>
        </div>
        <div className="stat-card stat-green">
          <div className="stat-icon">✅</div>
          <div className="stat-content">
            <h3>Phòng còn chỗ</h3>
            <div className="stat-value">{stats.available}</div>
          </div>
        </div>
        <div className="stat-card stat-red">
          <div className="stat-icon">🔴</div>
          <div className="stat-content">
            <h3>Phòng đầy</h3>
            <div className="stat-value">{stats.full}</div>
          </div>
        </div>
        <div className="stat-card stat-purple">
          <div className="stat-icon">👥</div>
          <div className="stat-content">
            <h3>Tỷ lệ lấp đầy</h3>
            <div className="stat-value">{stats.occupancyRate}%</div>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="search-and-filters">
        <div className="search-box">
          <span className="search-icon">🔍</span>
          <input
            type="text"
            placeholder="Tìm kiếm phòng..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
      </div>

      {/* Rooms Grid */}
      <div className="rooms-section">
        <div className="section-header">
          <h3 className="section-title">Danh sách phòng</h3>
          <div className="section-info">
            Hiển thị {filteredRooms.length} / {rooms.length} phòng
          </div>
        </div>

        {filteredRooms.length === 0 ? (
          <div className="no-data">
            <div className="no-data-icon">📭</div>
            <p>Không tìm thấy phòng nào</p>
          </div>
        ) : (
          <div className="rooms-grid">
            {filteredRooms.map((room) => {
              const statusInfo = getStatusLabel(room.status);
              return (
                <div key={room._id} className={`room-card ${room.status === 'FULL' ? 'room-full' : ''}`}>
                  <div className="room-card-header">
                    <h4 className="room-name">{room.name}</h4>
                    <span className={`room-status ${statusInfo.className}`}>
                      {statusInfo.text}
                    </span>
                  </div>
                  <div className="room-card-body">
                    <div className="room-info">
                      <span className="info-label">Sức chứa:</span>
                      <span className="info-value">{room.capacity} người</span>
                    </div>
                    <div className="room-info">
                      <span className="info-label">Đang ở:</span>
                      <span className="info-value">{room.occupied} người</span>
                    </div>
                    <div className="room-progress">
                      <div className="progress-bar">
                        <div
                          className="progress-fill"
                          style={{ width: `${(room.occupied / room.capacity) * 100}%` }}
                        ></div>
                      </div>
                      <span className="progress-text">{room.occupied}/{room.capacity}</span>
                    </div>
                  </div>
                  <div className="room-card-actions">
                    <button
                      className="btn-action btn-edit"
                      onClick={() => handleEditRoom(room)}
                      title="Chỉnh sửa"
                    >
                      ✏️
                    </button>
                    <button
                      className="btn-action btn-delete"
                      onClick={() => handleDeleteClick(room)}
                      title="Xóa"
                      disabled={room.occupied > 0}
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Room Form Modal */}
      <RoomFormModal
        isOpen={showRoomModal}
        onClose={() => setShowRoomModal(false)}
        onSuccess={handleModalSuccess}
        editingItem={editingRoom}
      />

      {/* Delete Confirmation Dialog */}
      {deleteConfirm.show && (
        <div className="delete-overlay" onClick={() => setDeleteConfirm({ show: false, item: null })}>
          <div className="delete-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="delete-dialog-header">
              <span className="delete-icon">⚠️</span>
              <h3>Xác nhận xóa</h3>
            </div>
            <div className="delete-dialog-content">
              <p>
                Bạn có chắc chắn muốn xóa phòng{' '}
                <strong>"{deleteConfirm.item?.name}"</strong>?
              </p>
              <p className="delete-warning-text">
                Hành động này không thể hoàn tác.
              </p>
            </div>
            <div className="delete-dialog-actions">
              <button
                className="btn btn-outline"
                onClick={() => setDeleteConfirm({ show: false, item: null })}
              >
                Hủy
              </button>
              <button className="btn btn-danger" onClick={handleConfirmDelete}>
                Xóa
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toast.show && (
        <div className={`toast-notification ${toast.type}`}>
          <span className="toast-icon">
            {toast.type === 'success' ? '✅' : '❌'}
          </span>
          <span className="toast-message">{toast.message}</span>
        </div>
      )}
    </div>
  );
};

export default RoomManagement;
