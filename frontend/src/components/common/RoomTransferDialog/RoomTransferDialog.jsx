import React, { useState, useEffect, useMemo } from 'react';
import studentService from '../../../services/student';
import './RoomTransferDialog.css';

/**
 * RoomTransferDialog - Dialog chuyển phòng sinh viên
 * Component riêng biệt, nhận studentIds từ trang cha
 * 
 * @param {Object} props
 * @param {boolean} props.isOpen - Hiển thị dialog
 * @param {Function} props.onClose - Callback đóng dialog
 * @param {string[]} props.studentIds - Danh sách ID sinh viên được chọn
 * @param {Function} props.onSuccess - Callback khi chuyển phòng thành công
 */
const RoomTransferDialog = ({ isOpen, onClose, studentIds = [], onSuccess }) => {
  // State
  const [rooms, setRooms] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isTransferring, setIsTransferring] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('available'); // 'available' | 'unavailable'
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [error, setError] = useState('');

  const studentCount = studentIds.length;

  // Fetch rooms when dialog opens
  useEffect(() => {
    if (isOpen) {
      fetchRooms();
      setSelectedRoom(null);
      setSearchTerm('');
      setActiveTab('available');
      setError('');
    }
  }, [isOpen]);

  const fetchRooms = async () => {
    try {
      setIsLoading(true);
      const response = await studentService.getAllRooms();
      setRooms(response.data || []);
    } catch (err) {
      console.error('Error fetching rooms:', err);
      setError('Không thể tải danh sách phòng');
    } finally {
      setIsLoading(false);
    }
  };

  // Tính toán availableSlots cho mỗi phòng
  const processedRooms = useMemo(() => {
    return rooms
      .filter(room => room.status !== 'MAINTENANCE')
      .map(room => ({
        ...room,
        availableSlots: room.capacity - room.occupied,
        isAvailable: (room.capacity - room.occupied) >= studentCount
      }))
      .sort((a, b) => {
        // Ưu tiên phòng có đủ chỗ
        if (a.isAvailable !== b.isAvailable) {
          return a.isAvailable ? -1 : 1;
        }
        // Sau đó sort theo tên
        return a.name.localeCompare(b.name, 'vi', { numeric: true });
      });
  }, [rooms, studentCount]);

  // Filter theo search và tab
  const filteredRooms = useMemo(() => {
    let filtered = processedRooms;

    // Filter theo tab
    if (activeTab === 'available') {
      filtered = filtered.filter(room => room.isAvailable);
    } else {
      filtered = filtered.filter(room => !room.isAvailable);
    }

    // Filter theo search
    if (searchTerm.trim()) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(room => 
        room.name.toLowerCase().includes(search)
      );
    }

    return filtered;
  }, [processedRooms, activeTab, searchTerm]);

  // Đếm số phòng mỗi tab
  const tabCounts = useMemo(() => ({
    available: processedRooms.filter(r => r.isAvailable).length,
    unavailable: processedRooms.filter(r => !r.isAvailable).length
  }), [processedRooms]);

  // Handle room selection
  const handleSelectRoom = (room) => {
    if (room.isAvailable) {
      setSelectedRoom(room);
      setError('');
    }
  };

  // Handle transfer
  const handleTransfer = async () => {
    if (!selectedRoom) {
      setError('Vui lòng chọn phòng');
      return;
    }

    try {
      setIsTransferring(true);
      setError('');

      const result = await studentService.transferRoom(studentIds, selectedRoom._id);
      
      if (result.success) {
        onSuccess?.(result);
        onClose();
      } else {
        setError(result.message || 'Có lỗi xảy ra');
      }
    } catch (err) {
      console.error('Transfer error:', err);
      setError(err.response?.data?.message || 'Lỗi khi chuyển phòng');
    } finally {
      setIsTransferring(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="room-transfer-overlay" onClick={() => !isTransferring && onClose()}>
      <div className="room-transfer-dialog" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="rtd-header">
          <div className="rtd-header-content">
            <h2 className="rtd-title">
              <span className="rtd-icon">🏠</span>
              Chuyển phòng KTX
            </h2>
            <p className="rtd-subtitle">
              Đang chuyển <strong>{studentCount}</strong> sinh viên sang phòng mới
            </p>
          </div>
        </div>

        {/* Search */}
        <div className="rtd-search">
          <span className="rtd-search-icon">🔍</span>
          <input
            type="text"
            placeholder="Tìm phòng theo tên..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="rtd-search-input"
          />
          {searchTerm && (
            <button 
              className="rtd-search-clear"
              onClick={() => setSearchTerm('')}
            >
              ✕
            </button>
          )}
        </div>

        {/* Tabs */}
        <div className="rtd-tabs">
          <button
            className={`rtd-tab ${activeTab === 'available' ? 'active' : ''}`}
            onClick={() => setActiveTab('available')}
          >
            <span className="rtd-tab-icon">✓</span>
            Phòng khả dụng
            <span className="rtd-tab-count">{tabCounts.available}</span>
          </button>
          <button
            className={`rtd-tab ${activeTab === 'unavailable' ? 'active' : ''}`}
            onClick={() => setActiveTab('unavailable')}
          >
            <span className="rtd-tab-icon">✗</span>
            Không đủ chỗ
            <span className="rtd-tab-count">{tabCounts.unavailable}</span>
          </button>
        </div>

        {/* Room List */}
        <div className="rtd-room-list">
          {isLoading ? (
            <div className="rtd-loading">
              <div className="rtd-spinner"></div>
              <span>Đang tải danh sách phòng...</span>
            </div>
          ) : filteredRooms.length === 0 ? (
            <div className="rtd-empty">
              <span className="rtd-empty-icon">📭</span>
              <p>
                {searchTerm 
                  ? 'Không tìm thấy phòng phù hợp' 
                  : activeTab === 'available'
                    ? 'Không có phòng nào đủ chỗ trống'
                    : 'Không có phòng nào trong danh sách này'
                }
              </p>
            </div>
          ) : (
            <div className="rtd-rooms-grid">
              {filteredRooms.map(room => (
                <div
                  key={room._id}
                  className={`rtd-room-card ${!room.isAvailable ? 'disabled' : ''} ${selectedRoom?._id === room._id ? 'selected' : ''}`}
                  onClick={() => handleSelectRoom(room)}
                  title={!room.isAvailable ? `Chỉ còn ${room.availableSlots} chỗ, cần ${studentCount} chỗ` : ''}
                >
                  <div className="rtd-room-header">
                    <span className="rtd-room-name">{room.name}</span>
                    <span className={`rtd-room-status ${room.isAvailable ? 'available' : 'full'}`}>
                      {room.isAvailable ? 'Khả dụng' : 'Không đủ'}
                    </span>
                  </div>
                  <div className="rtd-room-info">
                    <div className="rtd-room-capacity">
                      <span className="rtd-info-label">Sức chứa:</span>
                      <span className="rtd-info-value">{room.occupied}/{room.capacity}</span>
                    </div>
                    <div className="rtd-room-slots">
                      <span className="rtd-info-label">Trống:</span>
                      <span className={`rtd-info-value ${room.availableSlots >= studentCount ? 'enough' : 'not-enough'}`}>
                        {room.availableSlots} chỗ
                      </span>
                    </div>
                  </div>
                  {/* Progress bar */}
                  <div className="rtd-room-progress">
                    <div 
                      className="rtd-room-progress-bar"
                      style={{ width: `${(room.occupied / room.capacity) * 100}%` }}
                    />
                  </div>
                  {selectedRoom?._id === room._id && (
                    <div className="rtd-room-selected-indicator">
                      <span>✓</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Error */}
        {error && (
          <div className="rtd-error">
            <span className="rtd-error-icon">⚠️</span>
            {error}
          </div>
        )}

        {/* Footer */}
        <div className="rtd-footer">
          <div className="rtd-footer-info">
            {selectedRoom && (
              <span className="rtd-selected-info">
                Đã chọn: <strong>{selectedRoom.name}</strong>
              </span>
            )}
          </div>
          <div className="rtd-footer-actions">
            <button 
              className="rtd-btn rtd-btn-cancel"
              onClick={onClose}
              disabled={isTransferring}
            >
              Hủy
            </button>
            <button 
              className="rtd-btn rtd-btn-confirm"
              onClick={handleTransfer}
              disabled={!selectedRoom || isTransferring}
            >
              {isTransferring ? (
                <>
                  <span className="rtd-btn-spinner"></span>
                  Đang chuyển...
                </>
              ) : (
                <>
                  <span>🔄</span>
                  Chuyển phòng
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoomTransferDialog;
