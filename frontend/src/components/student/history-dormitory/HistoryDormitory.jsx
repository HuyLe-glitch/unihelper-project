import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import dormitoryRequestService from '../../../services/dormitoryRequest';
import socketService from '../../../services/socket';
import { ConfirmDialog } from '../../common';
import './HistoryDormitory.css';

const HistoryDormitory = () => {
  const navigate = useNavigate();

  // State cho dữ liệu từ API
  const [dormitoryHistory, setDormitoryHistory] = useState([]);
  const [studentInfo, setStudentInfo] = useState(null);
  const [roomInfo, setRoomInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // State cho Confirm Dialog
  const [confirmDialog, setConfirmDialog] = useState({
    isOpen: false,
    title: '',
    message: '',
    type: 'confirm',
    requestId: null
  });

  // State cho loading khi xác nhận
  const [confirmingId, setConfirmingId] = useState(null);

  // Toast notification state
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  // Show toast helper
  const showToast = useCallback((message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3000);
  }, []);

  // Mapping status từ backend sang frontend UI
  // 3 trạng thái:
  // - pending: Chờ tiếp nhận (Staff chưa tiếp nhận)
  // - processing: Đang xử lý (Staff đã tiếp nhận, chờ SV xác nhận hoàn thành)
  // - completed: Hoàn thành (SV đã xác nhận)
  const mapStatus = (backendStatus) => {
    const statusMapping = {
      'Pending': 'pending',
      'Under Review': 'processing',
      'Approved': 'completed'
    };
    return statusMapping[backendStatus] || 'pending';
  };

  // Fetch dữ liệu từ API
  const fetchDormitoryHistory = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await dormitoryRequestService.getMyRequests();
      
      if (response.success) {
        setStudentInfo(response.studentInfo);
        setRoomInfo(response.roomInfo || null);
        // Transform data sau khi có studentInfo
        // Bao gồm thông tin người gửi để hiển thị yêu cầu của tất cả sinh viên cùng phòng
        const transformedData = (response.data || []).map((req) => ({
          id: req._id,
          // Sử dụng requestCode từ backend (format: KTX1, KTX2, ...)
          requestCode: req.requestCode || 'N/A',
          // Sử dụng thông tin người gửi từ API (senderName) thay vì studentInfo
          fullName: req.senderName || req.student?.fullName || 'Không xác định',
          senderEmail: req.senderEmail || req.student?.user?.email || '',
          room: response.studentInfo?.roomName || 'Chưa xếp phòng',
          category: req.category?.name || 'Không xác định',
          deviceName: req.item?.name || 'Không chọn',
          description: req.description || '',
          requestDate: req.requestDate || req.createdAt,
          confirmDate: req.status === 'Approved' ? req.updatedAt : '',
          // Sử dụng semester từ backend (lấy từ học kỳ active khi tạo yêu cầu)
          semester: req.semester || 'Không xác định',
          status: mapStatus(req.status),
          // Đánh dấu yêu cầu của chính mình
          isOwner: req.isOwner || false
        }));
        setDormitoryHistory(transformedData);
      }
    } catch (err) {
      console.error('Error fetching dormitory history:', err);
      setError(err.response?.data?.message || 'Không thể tải lịch sử yêu cầu KTX');
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch data khi component mount
  useEffect(() => {
    fetchDormitoryHistory();
  }, [fetchDormitoryHistory]);

  // ==========================================
  // SOCKET.IO: Realtime updates
  // Tuân thủ kiến trúc: Component chỉ gọi service methods
  // ==========================================
  useEffect(() => {
    // Kết nối socket ngay khi mount
    socketService.connect();

    // Helper function để transform request data
    const transformRequest = (newRequest, currentRoomInfo, currentStudentInfo) => ({
      id: newRequest._id,
      requestCode: newRequest.requestCode || 'N/A',
      fullName: newRequest.senderName || newRequest.student?.fullName || 'Không xác định',
      senderEmail: newRequest.senderEmail || newRequest.student?.user?.email || '',
      room: currentRoomInfo?.roomName || currentStudentInfo?.roomName || 'Chưa xếp phòng',
      category: newRequest.category?.name || 'Không xác định',
      deviceName: newRequest.item?.name || 'Không chọn',
      description: newRequest.description || '',
      requestDate: newRequest.requestDate || newRequest.createdAt,
      confirmDate: newRequest.status === 'Approved' ? newRequest.updatedAt : '',
      semester: newRequest.semester || 'Không xác định',
      status: mapStatus(newRequest.status),
      isOwner: newRequest.student?._id === studentInfo?.id || newRequest.isOwner
    });

    // 1. Lắng nghe DORMITORY_REQUEST_CREATED (broadcast cho student vừa tạo)
    socketService.onDormitoryRequestCreated((data) => {
      console.log('📡 Received DORMITORY_REQUEST_CREATED:', data);
      
      const newRequest = data.request;
      if (!newRequest) return;

      const transformedRequest = transformRequest(newRequest, roomInfo, studentInfo);

      setDormitoryHistory(prev => {
        const exists = prev.some(item => item.id === transformedRequest.id);
        if (exists) return prev;
        return [transformedRequest, ...prev];
      });
    });

    // 2. Lắng nghe DORMITORY_REQUEST_UPDATED (khi staff duyệt/từ chối)
    socketService.onDormitoryRequestUpdated((data) => {
      console.log('📡 Received DORMITORY_REQUEST_UPDATED:', data);
      
      // Cập nhật status trong danh sách
      setDormitoryHistory(prev => prev.map(item => {
        if (item.id === data.requestId) {
          return {
            ...item,
            status: mapStatus(data.status),
            confirmDate: data.status === 'Approved' ? new Date().toISOString() : item.confirmDate
          };
        }
        return item;
      }));
    });

    // Cleanup khi unmount
    return () => {
      socketService.off('DORMITORY_REQUEST_CREATED');
      socketService.off('DORMITORY_REQUEST_UPDATED');
      console.log('🧹 Cleaned up socket listeners');
    };
  }, [roomInfo, studentInfo]);

  // ==========================================
  // SOCKET.IO: Room-based updates (cho các bạn cùng phòng)
  // ==========================================
  useEffect(() => {
    // Chỉ setup room socket khi đã có roomInfo
    if (!roomInfo?.roomId) return;

    const roomId = roomInfo.roomId;

    // Join room để nhận updates từ bạn cùng phòng
    socketService.joinRoom(roomId);

    // Lắng nghe sự kiện có yêu cầu mới trong room
    socketService.onNewRequest((newRequest) => {
      console.log('📡 Received NEW_REQUEST_CREATED in room:', newRequest);

      const transformedRequest = {
        id: newRequest._id,
        requestCode: newRequest.requestCode || 'N/A',
        fullName: newRequest.senderName || newRequest.student?.fullName || 'Không xác định',
        senderEmail: newRequest.senderEmail || newRequest.student?.user?.email || '',
        room: roomInfo?.roomName || studentInfo?.roomName || 'Chưa xếp phòng',
        category: newRequest.category?.name || 'Không xác định',
        deviceName: newRequest.item?.name || 'Không chọn',
        description: newRequest.description || '',
        requestDate: newRequest.requestDate || newRequest.createdAt,
        confirmDate: newRequest.status === 'Approved' ? newRequest.updatedAt : '',
        semester: newRequest.semester || 'Không xác định',
        status: mapStatus(newRequest.status),
        isOwner: newRequest.student?._id === studentInfo?.id
      };

      setDormitoryHistory(prev => {
        const exists = prev.some(item => item.id === transformedRequest.id);
        if (exists) return prev;
        return [transformedRequest, ...prev];
      });
    });

    // Cleanup: Rời room và hủy listener khi unmount
    return () => {
      socketService.leaveRoom(roomId);
      socketService.off('NEW_REQUEST_CREATED');
    };
  }, [roomInfo?.roomId, roomInfo?.roomName, studentInfo?.roomName, studentInfo?.id]);

  // States cho filter và search
  const [searchTerm, setSearchTerm] = useState('');
  const [semesterFilter, setSemesterFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortOrder, setSortOrder] = useState('newest');

  // Toggle sort order trực tiếp khi click
  const toggleSortOrder = () => {
    setSortOrder(prev => prev === 'newest' ? 'oldest' : 'newest');
  };

  const handleCreateRequest = () => {
    navigate('/student/dormitory');
  };

  // ==========================================
  // XÁC NHẬN SỬA CHỮA
  // ==========================================

  // Mở dialog xác nhận
  const handleOpenConfirmRepair = (requestId, requestCode) => {
    setConfirmDialog({
      isOpen: true,
      title: 'Xác nhận sửa chữa',
      message: `Bạn xác nhận yêu cầu ${requestCode} đã được sửa chữa hoàn tất?`,
      type: 'confirm',
      requestId
    });
  };

  // Đóng dialog
  const handleCloseConfirmDialog = () => {
    setConfirmDialog({
      isOpen: false,
      title: '',
      message: '',
      type: 'confirm',
      requestId: null
    });
  };

  // Xử lý xác nhận sửa chữa
  const handleConfirmRepair = async () => {
    const requestId = confirmDialog.requestId;
    if (!requestId) return;

    try {
      setConfirmingId(requestId);
      handleCloseConfirmDialog();

      const response = await dormitoryRequestService.confirmRepair(requestId);

      if (response.success) {
        // Cập nhật local state
        setDormitoryHistory(prev => prev.map(item => {
          if (item.id === requestId) {
            return {
              ...item,
              status: 'completed',
              confirmDate: new Date().toISOString()
            };
          }
          return item;
        }));
        showToast('Đã xác nhận sửa chữa thành công!', 'success');
      }
    } catch (err) {
      console.error('Error confirming repair:', err);
      showToast(err.response?.data?.message || 'Không thể xác nhận sửa chữa', 'error');
    } finally {
      setConfirmingId(null);
    }
  };

  // Hàm lấy label và class cho status
  // 3 trạng thái: pending, processing, completed
  const getStatusInfo = (status) => {
    const statusMap = {
      pending: { label: 'Chờ tiếp nhận', class: 'status-pending', icon: '📨' },
      processing: { label: 'Đang xử lý', class: 'status-processing', icon: '⟳' },
      completed: { label: 'Đã hoàn thành', class: 'status-completed', icon: '✓' }
    };
    return statusMap[status] || statusMap.pending;
  };

  // Tính toán thống kê - 3 trạng thái
  const statistics = useMemo(() => {
    return {
      total: dormitoryHistory.length,
      pending: dormitoryHistory.filter(item => item.status === 'pending').length,
      processing: dormitoryHistory.filter(item => item.status === 'processing').length,
      completed: dormitoryHistory.filter(item => item.status === 'completed').length
    };
  }, [dormitoryHistory]);

  // Lọc và sắp xếp dữ liệu
  const filteredAndSortedData = useMemo(() => {
    let result = [...dormitoryHistory];

    // Filter theo search term (bao gồm cả email người gửi)
    if (searchTerm) {
      result = result.filter(item =>
        item.requestCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.senderEmail?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.deviceName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter theo semester
    if (semesterFilter !== 'all') {
      result = result.filter(item => item.semester === semesterFilter);
    }

    // Filter theo status
    if (statusFilter !== 'all') {
      result = result.filter(item => item.status === statusFilter);
    }

    // Sort theo thời gian
    result.sort((a, b) => {
      const dateA = new Date(a.requestDate);
      const dateB = new Date(b.requestDate);
      return sortOrder === 'newest' ? dateB - dateA : dateA - dateB;
    });

    return result;
  }, [dormitoryHistory, searchTerm, semesterFilter, statusFilter, sortOrder]);

  // Lấy danh sách semester unique
  const semesters = useMemo(() => {
    return [...new Set(dormitoryHistory.map(item => item.semester))];
  }, [dormitoryHistory]);

  // Loading state
  if (loading) {
    return (
      <div className="history-dormitory-container">
        <div className="page-header">
          <div className="header-content">
            <h1 className="page-title">🏢 Lịch sử yêu cầu Ký túc xá</h1>
          </div>
        </div>
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p className="loading-text">Đang tải lịch sử yêu cầu...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="history-dormitory-container">
        <div className="page-header">
          <div className="header-content">
            <h1 className="page-title">🏢 Lịch sử yêu cầu Ký túc xá</h1>
            <button className="create-btn" onClick={handleCreateRequest}>
              <span className="btn-icon">+</span>
              Tạo yêu cầu mới
            </button>
          </div>
        </div>
        <div className="error-container">
          <div className="error-icon">⚠️</div>
          <p className="error-message">{error}</p>
          <button className="retry-btn" onClick={fetchDormitoryHistory}>
            🔄 Thử lại
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="history-dormitory-container">
      {/* Header */}
      <div className="page-header">
        <div className="header-content">
          <h1 className="page-title">🏢 Lịch sử yêu cầu Ký túc xá</h1>
          <button className="create-btn" onClick={handleCreateRequest}>
            <span className="btn-icon">+</span>
            Tạo yêu cầu mới
          </button>
        </div>
      </div>

      {/* Statistics Cards - 3 cards */}
      <div className="stats-grid stats-grid-3">
        <div className="stat-card stat-total">
          <div className="stat-icon">📊</div>
          <div className="stat-content">
            <div className="stat-value">{statistics.total}</div>
            <div className="stat-label">Tổng yêu cầu</div>
          </div>
        </div>
        <div className="stat-card stat-completed">
          <div className="stat-icon">✓</div>
          <div className="stat-content">
            <div className="stat-value">{statistics.completed}</div>
            <div className="stat-label">Đã hoàn thành</div>
          </div>
        </div>
        <div className="stat-card stat-processing">
          <div className="stat-icon">⟳</div>
          <div className="stat-content">
            <div className="stat-value">{statistics.processing}</div>
            <div className="stat-label">Đang xử lý</div>
          </div>
        </div>
      </div>

      {/* Filters Section */}
      <div className="filters-section">
        <div className="filters-wrapper">
          {/* Search */}
          <div className="filter-group search-group">
            <input
              type="text"
              placeholder="🔍 Tìm theo mã yêu cầu, tên, thiết bị..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>

          {/* Semester Filter */}
          <div className="filter-group">
            <select
              value={semesterFilter}
              onChange={(e) => setSemesterFilter(e.target.value)}
              className="filter-select"
            >
              <option value="all">📅 Tất cả học kỳ</option>
              {semesters.map(sem => (
                <option key={sem} value={sem}>{sem}</option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div className="filter-group">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="filter-select"
            >
              <option value="all">📌 Tất cả trạng thái</option>
              <option value="pending">📨 Chờ tiếp nhận</option>
              <option value="processing">⟳ Đang xử lý</option>
              <option value="completed">✓ Đã hoàn thành</option>
            </select>
          </div>

          {/* Sort Order - Toggle Icon Button */}
          <div className="filter-group sort-group">
            <button 
              className="sort-toggle-btn"
              onClick={toggleSortOrder}
              title={sortOrder === 'newest' ? 'Mới nhất' : 'Cũ nhất'}
            >
              {sortOrder === 'newest' ? (
                <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                  <path d="M3 18h6v-2H3v2zM3 6v2h18V6H3zm0 7h12v-2H3v2z"/>
                </svg>
              ) : (
                <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                  <path d="M3 6h6v2H3V6zm0 12v-2h18v2H3zm0-7h12v2H3v-2z"/>
                </svg>
              )}
              <span className="sort-arrow">{sortOrder === 'newest' ? '↓' : '↑'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Room Info */}
      {(roomInfo || studentInfo?.roomName) && (
        <div className="room-info-banner">
          <span className="room-icon">🚪</span>
          <span className="room-text">
            Phòng: <strong>{roomInfo?.roomName || studentInfo?.roomName}</strong>
            {roomInfo?.totalRoommates > 1 && (
              <span className="roommates-count"> ({roomInfo.totalRoommates} thành viên)</span>
            )}
          </span>
        </div>
      )}

      {/* Table Section - FULL WIDTH */}
      <div className="table-section">
        {/* Summary - Above table */}
        <div className="table-summary-top">
          <p>Hiển thị <strong>{filteredAndSortedData.length}</strong> / <strong>{dormitoryHistory.length}</strong> yêu cầu</p>
        </div>

        <div className="table-container">
          <table className="dormitory-table">
            <thead>
              <tr>
                <th>Mã yêu cầu</th>
                <th>Họ tên</th>
                <th>Danh mục</th>
                <th>Tên thiết bị</th>
                <th>Mô tả</th>
                <th>Học kỳ</th>
                <th>Ngày yêu cầu</th>
                <th>Xác nhận sửa chữa</th>
                <th>Trạng thái</th>
              </tr>
            </thead>
            <tbody>
              {filteredAndSortedData.length > 0 ? (
                filteredAndSortedData.map((item) => {
                  const statusInfo = getStatusInfo(item.status);
                  return (
                    <tr key={item.id} className={`table-row ${item.isOwner ? 'own-request' : 'roommate-request'}`}>
                      <td className="cell-request-code">
                        <strong>{item.requestCode}</strong>
                        {item.isOwner && <span className="owner-badge" title="Yêu cầu của bạn">👤</span>}
                      </td>
                      <td className="cell-fullname">
                        {item.fullName}
                        {item.isOwner && <span className="you-tag">(Bạn)</span>}
                      </td>
                      <td className="cell-category">{item.category}</td>
                      <td className="cell-device">{item.deviceName}</td>
                      <td className="cell-description">{item.description}</td>
                      <td className="cell-semester">{item.semester}</td>
                      <td className="cell-date">
                        {new Date(item.requestDate).toLocaleDateString('vi-VN')}
                      </td>
                      <td className="cell-confirm">
                        {item.status === 'completed' ? (
                          // Đã hoàn thành - hiển thị ngày xác nhận
                          <span className="confirm-date">
                            {item.confirmDate 
                              ? new Date(item.confirmDate).toLocaleDateString('vi-VN')
                              : 'Đã xác nhận'}
                          </span>
                        ) : item.status === 'processing' && item.isOwner ? (
                          // Yêu cầu của mình và Staff đã tiếp nhận (processing) - hiển thị nút xác nhận
                          <button
                            className="btn-confirm-repair"
                            onClick={() => handleOpenConfirmRepair(item.id, item.requestCode)}
                            disabled={confirmingId === item.id}
                            title="Xác nhận đã sửa chữa xong"
                          >
                            {confirmingId === item.id ? (
                              <span className="btn-loading">⏳</span>
                            ) : (
                              <>
                                <span className="btn-icon">✓</span>
                                <span className="btn-text">Xác nhận</span>
                              </>
                            )}
                          </button>
                        ) : item.status === 'processing' ? (
                          // Yêu cầu của bạn cùng phòng đang xử lý - hiển thị chờ xác nhận
                          <span className="waiting-confirm">Chờ xác nhận</span>
                        ) : (
                          // Status là pending - chờ Staff tiếp nhận
                          <span className="waiting-accept">Chờ tiếp nhận</span>
                        )}
                      </td>
                      <td className="cell-status">
                        <span className={`status-badge ${statusInfo.class}`}>
                          <span className="status-icon">{statusInfo.icon}</span>
                          {statusInfo.label}
                        </span>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="9" className="no-data">
                    <div className="no-data-content">
                      <span className="no-data-icon">📭</span>
                      <p>Không tìm thấy yêu cầu nào</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Confirm Dialog for repair confirmation */}
      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        title={confirmDialog.title}
        message={confirmDialog.message}
        type={confirmDialog.type}
        onConfirm={handleConfirmRepair}
        onCancel={handleCloseConfirmDialog}
      />

      {/* Toast notification */}
      {toast.show && (
        <div className={`toast-notification toast-${toast.type}`}>
          <span className="toast-icon">
            {toast.type === 'success' ? '✓' : toast.type === 'error' ? '✕' : 'ℹ'}
          </span>
          <span className="toast-message">{toast.message}</span>
        </div>
      )}
    </div>
  );
};

export default HistoryDormitory;