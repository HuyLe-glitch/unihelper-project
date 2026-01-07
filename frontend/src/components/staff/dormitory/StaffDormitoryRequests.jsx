import React, { useState, useEffect, useMemo, useCallback } from 'react';
import './StaffDormitoryRequests.css';
import '../staffPages.css';
import dormitoryRequestService from '../../../services/dormitoryRequest';
import { roomService } from '../../../services/room';
import socketService from '../../../services/socket';
import SemesterFilter from '../../common/SemesterFilter/SemesterFilter';
import ExportCSVButton from '../../common/ExportCSVButton';

/**
 * StaffDormitoryRequests - Giao diện quản lý yêu cầu KTX cho Staff
 */

// Cấu hình trạng thái hiển thị
const STATUS_CONFIG = {
  'Pending': { className: 'pending', icon: '📨', label: 'Gửi yêu cầu', color: '#f59e0b' },
  'Under Review': { className: 'processing', icon: '⏳', label: 'Đang xử lý', color: '#3b82f6' },
  'Approved': { className: 'completed', icon: '✓', label: 'Hoàn thành', color: '#22c55e' }
};

const StaffDormitoryRequests = () => {
  // State cho dữ liệu
  const [requests, setRequests] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({ page: 1, limit: 50, total: 0, pages: 0 });

  // State cho UI
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [roomFilter, setRoomFilter] = useState('all');
  const [semesterFilter, setSemesterFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('');
  const [dateSort, setDateSort] = useState('newest');
  
  // State cho room dropdown
  const [isRoomDropdownOpen, setIsRoomDropdownOpen] = useState(false);
  const [roomSearchTerm, setRoomSearchTerm] = useState('');
  
  // State cho status dropdown
  const [isStatusDropdownOpen, setIsStatusDropdownOpen] = useState(false);
  
  // State cho xử lý
  const [processing, setProcessing] = useState(false);

  // ==========================================
  // API CALLS
  // ==========================================

  /**
   * Lấy danh sách yêu cầu từ API
   */
  const fetchRequests = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const filters = {
        page: pagination.page,
        limit: pagination.limit
      };

      // Thêm filter status nếu không phải 'all'
      if (statusFilter !== 'all') {
        filters.status = statusFilter;
      }

      const response = await dormitoryRequestService.getAllRequests(filters);

      if (response.success) {
        setRequests(response.data || []);
        setPagination(prev => ({
          ...prev,
          total: response.pagination?.total || 0,
          pages: response.pagination?.pages || 0
        }));
      }
    } catch (err) {
      console.error('Error fetching dormitory requests:', err);
      setError(err.response?.data?.message || 'Không thể tải danh sách yêu cầu');
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.limit, statusFilter]);

  /**
   * Lấy danh sách phòng từ API
   */
  const fetchRooms = useCallback(async () => {
    try {
      const response = await roomService.getAllRooms();
      if (response.success) {
        setRooms(response.data || []);
      }
    } catch (err) {
      console.error('Error fetching rooms:', err);
    }
  }, []);

  /**
   * Staff tiếp nhận yêu cầu (Pending -> Under Review)
   */
  const handleAcceptRequest = async (requestId) => {
    try {
      setProcessing(true);
      
      const response = await dormitoryRequestService.acceptRequest(requestId);

      if (response.success) {
        // Cập nhật state local
        setRequests(prev => prev.map(req => 
          req._id === requestId ? { ...req, status: 'Under Review' } : req
        ));

        // Cập nhật selectedRequest nếu đang xem
        if (selectedRequest?._id === requestId) {
          setSelectedRequest(prev => ({ ...prev, status: 'Under Review' }));
        }

        alert('Đã tiếp nhận yêu cầu thành công!');
      }
    } catch (err) {
      console.error('Error accepting request:', err);
      alert(err.response?.data?.message || 'Không thể tiếp nhận yêu cầu');
    } finally {
      setProcessing(false);
    }
  };

  // ==========================================
  // SOCKET.IO REALTIME
  // ==========================================

  useEffect(() => {
    // Kết nối socket
    socketService.connect();

    // Lắng nghe sự kiện có yêu cầu KTX mới
    socketService.onDormitoryRequestCreated((data) => {
      console.log('📡 [Socket] New dormitory request created:', data);
      // Thêm yêu cầu mới vào đầu danh sách
      if (data.request) {
        setRequests(prev => [data.request, ...prev]);
      } else {
        // Nếu không có đủ dữ liệu, fetch lại
        fetchRequests();
      }
    });

    // Lắng nghe sự kiện yêu cầu được cập nhật
    socketService.onDormitoryRequestUpdated((data) => {
      console.log('📡 [Socket] Dormitory request updated:', data);
      if (data.request && data.requestId) {
        // Cập nhật request trong danh sách
        setRequests(prev => prev.map(req => 
          req._id === data.requestId ? { ...req, ...data.request, status: data.status || data.request.status } : req
        ));

        // Cập nhật selectedRequest nếu đang xem
        setSelectedRequest(prev => {
          if (prev?._id === data.requestId) {
            return { ...prev, ...data.request, status: data.status || data.request.status };
          }
          return prev;
        });
      }
    });

    // Cleanup khi unmount
    return () => {
      socketService.off('DORMITORY_REQUEST_CREATED');
      socketService.off('DORMITORY_REQUEST_UPDATED');
    };
  }, [fetchRequests]);

  // ==========================================
  // EFFECTS
  // ==========================================

  // Fetch requests và rooms khi component mount
  useEffect(() => {
    fetchRequests();
    fetchRooms();
  }, [fetchRequests, fetchRooms]);

  // ==========================================
  // COMPUTED VALUES
  // ==========================================

  // Thống kê
  const stats = useMemo(() => ({
    total: requests.length,
    pending: requests.filter(r => r.status === 'Pending').length,
    processing: requests.filter(r => r.status === 'Under Review').length,
    completed: requests.filter(r => r.status === 'Approved').length
  }), [requests]);

  // Lọc phòng theo search term
  const filteredRooms = useMemo(() => {
    if (!roomSearchTerm) return rooms;
    return rooms.filter(room => 
      room.name?.toLowerCase().includes(roomSearchTerm.toLowerCase())
    );
  }, [rooms, roomSearchTerm]);

  // Filter và sort requests
  const filteredRequests = useMemo(() => {
    let result = [...requests];

    // Search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(r =>
        r.requestCode?.toLowerCase().includes(term) ||
        r.student?.fullName?.toLowerCase().includes(term) ||
        r.student?.user?.email?.toLowerCase().includes(term) ||
        r.category?.name?.toLowerCase().includes(term) ||
        r.item?.name?.toLowerCase().includes(term)
      );
    }

    // Room filter
    if (roomFilter !== 'all') {
      result = result.filter(r => 
        (r.student?.roomId?._id || r.student?.roomId) === roomFilter
      );
    }

    // Semester filter
    if (semesterFilter !== 'all') {
      result = result.filter(r => r.semester === semesterFilter);
    }

    // Date filter
    if (dateFilter) {
      result = result.filter(r => {
        const requestDate = new Date(r.requestDate || r.createdAt).toISOString().split('T')[0];
        return requestDate === dateFilter;
      });
    }

    // Date sort
    result.sort((a, b) => {
      const dateA = new Date(a.requestDate || a.createdAt);
      const dateB = new Date(b.requestDate || b.createdAt);
      return dateSort === 'newest' ? dateB - dateA : dateA - dateB;
    });

    return result;
  }, [requests, searchTerm, roomFilter, semesterFilter, dateFilter, dateSort]);

  // ==========================================
  // HANDLERS
  // ==========================================

  const handleSelectRequest = (request) => {
    setSelectedRequest(request);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // ==========================================
  // RENDER
  // ==========================================

  if (loading && requests.length === 0) {
    return (
      <div className="dormitory-management">
        <div className="loading-state">
          <span className="loading-icon">⏳</span>
          <p>Đang tải dữ liệu...</p>
        </div>
      </div>
    );
  }

  if (error && requests.length === 0) {
    return (
      <div className="dormitory-management">
        <div className="error-state">
          <span className="error-icon">❌</span>
          <p>{error}</p>
          <button onClick={fetchRequests} className="btn-retry">Thử lại</button>
        </div>
      </div>
    );
  }

  return (
    <div className="dormitory-management">
      {/* Header */}
      <header className="dormitory-header">
        <div className="dormitory-header__info">
          <div className="dormitory-header__title-row">
            <h1>Quản lý yêu cầu sửa chữa KTX</h1>
            <ExportCSVButton 
              exportFunction={dormitoryRequestService.exportCSV}
              filename="DS_SuCo_KTX.csv"
              label="Xuất CSV"
              filters={{
                status: statusFilter,
                semester: semesterFilter,
                startDate: dateFilter,
                roomId: roomFilter
              }}
            />
          </div>
          <p>Xử lý và theo dõi các yêu cầu sửa chữa thiết bị từ sinh viên</p>
        </div>
      </header>

      {/* Statistics Cards */}
      <div className="dormitory-stats">
        <div className="stat-card stat-card--total">
          <div className="stat-card__icon">📋</div>
          <div className="stat-card__content">
            <span className="stat-card__number">{stats.total}</span>
            <span className="stat-card__label">Tổng yêu cầu</span>
          </div>
        </div>
        <div 
          className={`stat-card stat-card--pending ${statusFilter === 'Pending' ? 'active' : ''}`}
          onClick={() => setStatusFilter(statusFilter === 'Pending' ? 'all' : 'Pending')}
        >
          <div className="stat-card__icon">📨</div>
          <div className="stat-card__content">
            <span className="stat-card__number">{stats.pending}</span>
            <span className="stat-card__label">Gửi yêu cầu</span>
          </div>
          {stats.pending > 0 && <span className="stat-card__badge pulse">Chờ tiếp nhận</span>}
        </div>
        <div 
          className={`stat-card stat-card--processing ${statusFilter === 'Under Review' ? 'active' : ''}`}
          onClick={() => setStatusFilter(statusFilter === 'Under Review' ? 'all' : 'Under Review')}
        >
          <div className="stat-card__icon">⏳</div>
          <div className="stat-card__content">
            <span className="stat-card__number">{stats.processing}</span>
            <span className="stat-card__label">Đang xử lý</span>
          </div>
        </div>
        <div 
          className={`stat-card stat-card--completed ${statusFilter === 'Approved' ? 'active' : ''}`}
          onClick={() => setStatusFilter(statusFilter === 'Approved' ? 'all' : 'Approved')}
        >
          <div className="stat-card__icon">✓</div>
          <div className="stat-card__content">
            <span className="stat-card__number">{stats.completed}</span>
            <span className="stat-card__label">Hoàn thành</span>
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="dormitory-filters">
        <div className="search-box">
          <span className="search-icon">🔍</span>
          <input
            type="text"
            placeholder="Tìm theo mã, tên SV, email, thiết bị..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {searchTerm && (
            <button className="search-clear" onClick={() => setSearchTerm('')}>×</button>
          )}
        </div>
        <div className="filter-group">
          {/* Status Filter - Custom Dropdown */}
          <div className="custom-dropdown">
            <div 
              className="custom-dropdown-trigger"
              onClick={() => setIsStatusDropdownOpen(!isStatusDropdownOpen)}
            >
              <span className="dropdown-value">
                {statusFilter === 'all' 
                  ? 'Tất cả trạng thái' 
                  : STATUS_CONFIG[statusFilter]?.label || statusFilter
                }
              </span>
              <span className={`dropdown-arrow ${isStatusDropdownOpen ? 'open' : ''}`}>▼</span>
            </div>
            {isStatusDropdownOpen && (
              <>
                <div 
                  className="dropdown-backdrop" 
                  onClick={() => setIsStatusDropdownOpen(false)}
                />
                <div className="custom-dropdown-menu">
                  <div className="dropdown-items-list">
                    <div 
                      className={`dropdown-item ${statusFilter === 'all' ? 'active' : ''}`}
                      onClick={() => {
                        setStatusFilter('all');
                        setIsStatusDropdownOpen(false);
                      }}
                    >
                      📋 Tất cả trạng thái
                    </div>
                    <div 
                      className={`dropdown-item ${statusFilter === 'Pending' ? 'active' : ''}`}
                      onClick={() => {
                        setStatusFilter('Pending');
                        setIsStatusDropdownOpen(false);
                      }}
                    >
                      📨 Gửi yêu cầu
                    </div>
                    <div 
                      className={`dropdown-item ${statusFilter === 'Under Review' ? 'active' : ''}`}
                      onClick={() => {
                        setStatusFilter('Under Review');
                        setIsStatusDropdownOpen(false);
                      }}
                    >
                      ⏳ Đang xử lý
                    </div>
                    <div 
                      className={`dropdown-item ${statusFilter === 'Approved' ? 'active' : ''}`}
                      onClick={() => {
                        setStatusFilter('Approved');
                        setIsStatusDropdownOpen(false);
                      }}
                    >
                      ✓ Hoàn thành
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Room Filter - Custom Dropdown */}
          <div className="custom-dropdown">
            <div 
              className="custom-dropdown-trigger"
              onClick={() => {
                setIsRoomDropdownOpen(!isRoomDropdownOpen);
                if (!isRoomDropdownOpen) setRoomSearchTerm('');
              }}
            >
              <span className="dropdown-value">
                {roomFilter === 'all' 
                  ? 'Tất cả phòng' 
                  : rooms.find(r => r._id === roomFilter)?.name || roomFilter
                }
              </span>
              <span className={`dropdown-arrow ${isRoomDropdownOpen ? 'open' : ''}`}>▼</span>
            </div>
            {isRoomDropdownOpen && (
              <>
                <div 
                  className="dropdown-backdrop" 
                  onClick={() => setIsRoomDropdownOpen(false)}
                />
                <div className="custom-dropdown-menu">
                  <div className="dropdown-search">
                    <input
                      type="text"
                      placeholder="Tìm phòng..."
                      value={roomSearchTerm}
                      onChange={(e) => setRoomSearchTerm(e.target.value)}
                      onClick={(e) => e.stopPropagation()}
                      autoFocus
                    />
                  </div>
                  <div className="dropdown-items-list">
                    {!roomSearchTerm && (
                      <div 
                        className={`dropdown-item ${roomFilter === 'all' ? 'active' : ''}`}
                        onClick={() => {
                          setRoomFilter('all');
                          setIsRoomDropdownOpen(false);
                        }}
                      >
                        Tất cả phòng
                      </div>
                    )}
                    {filteredRooms.length === 0 ? (
                      <div className="dropdown-item dropdown-no-result">
                        Không tìm thấy phòng
                      </div>
                    ) : (
                      filteredRooms.map(room => (
                        <div 
                          key={room._id}
                          className={`dropdown-item ${room._id === roomFilter ? 'active' : ''}`}
                          onClick={() => {
                            setRoomFilter(room._id);
                            setIsRoomDropdownOpen(false);
                          }}
                        >
                          {room.name}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Semester Filter Component */}
          <SemesterFilter
            value={semesterFilter}
            onChange={setSemesterFilter}
            dateValue={dateFilter}
            onDateChange={setDateFilter}
            showInfoBar={true}
          />

          {/* Sort Order - Toggle Icon Button */}
          <button 
            className="sort-toggle-btn"
            onClick={() => setDateSort(dateSort === 'newest' ? 'oldest' : 'newest')}
            title={dateSort === 'newest' ? 'Mới nhất trước' : 'Cũ nhất trước'}
          >
            {dateSort === 'newest' ? (
              <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                <path d="M3 18h6v-2H3v2zM3 6v2h18V6H3zm0 7h12v-2H3v2z"/>
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                <path d="M3 6h6v2H3V6zm0 12v-2h18v2H3zm0-7h12v2H3v-2z"/>
              </svg>
            )}
            <span className="sort-arrow">{dateSort === 'newest' ? '↓' : '↑'}</span>
          </button>
        </div>
      </div>

      {/* Main Content - Split View */}
      <div className="dormitory-main">
        {/* Left Panel - Request List */}
        <div className="dormitory-list-panel">
          <div className="panel-header">
            <span className="panel-title">Danh sách yêu cầu</span>
            <span className="panel-count">{filteredRequests.length} yêu cầu</span>
          </div>
          <div className="request-list">
            {filteredRequests.length === 0 ? (
              <div className="empty-state">
                <span className="empty-icon">📭</span>
                <p>Không tìm thấy yêu cầu nào</p>
              </div>
            ) : (
              filteredRequests.map(request => (
                <div
                  key={request._id}
                  className={`request-card ${selectedRequest?._id === request._id ? 'active' : ''} ${request.status === 'Pending' ? 'pending' : ''}`}
                  onClick={() => handleSelectRequest(request)}
                >
                  <div className="request-card__header">
                    <span className="request-code">#{request.requestCode}</span>
                    <span className={`status-badge ${STATUS_CONFIG[request.status]?.className || ''}`}>
                      {STATUS_CONFIG[request.status]?.icon} {STATUS_CONFIG[request.status]?.label || request.status}
                    </span>
                  </div>
                  <div className="request-card__body">
                    <div className="student-brief">
                      <span className="student-avatar">
                        {request.student?.fullName?.charAt(request.student.fullName.lastIndexOf(' ') + 1) || '?'}
                      </span>
                      <div className="student-info">
                        <span className="student-name">{request.student?.fullName || 'Không xác định'}</span>
                        <span className="student-id">{request.student?.user?.email || ''}</span>
                      </div>
                    </div>
                    <div className="request-meta">
                      <div className="meta-row">
                        <span className="room-badge">🏠 {request.student?.roomId?.name || 'N/A'}</span>
                      </div>
                      <div className="meta-row">
                        <span className="device-name">🔧 {request.category?.name || 'N/A'}{request.item?.name ? ` - ${request.item.name}` : ''}</span>
                      </div>
                      <div className="meta-row">
                        <span className="request-date">📅 {formatDate(request.requestDate || request.createdAt)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right Panel - Detail View */}
        <div className={`dormitory-detail-panel ${selectedRequest ? 'has-content' : ''}`}>
          {selectedRequest ? (
            <>
              <div className="detail-header">
                <div className="detail-title">
                  <h2>Chi tiết yêu cầu #{selectedRequest.requestCode}</h2>
                  <span className={`status-badge large ${STATUS_CONFIG[selectedRequest.status]?.className || ''}`}>
                    {STATUS_CONFIG[selectedRequest.status]?.icon} {STATUS_CONFIG[selectedRequest.status]?.label || selectedRequest.status}
                  </span>
                </div>
                <button className="btn-close" onClick={() => setSelectedRequest(null)}>×</button>
              </div>

              <div className="detail-content">
                {/* Student Info Section */}
                <section className="detail-section">
                  <h3 className="section-title">
                    <span className="section-icon">👤</span>
                    Thông tin sinh viên
                  </h3>
                  <div className="info-grid">
                    <div className="info-item">
                      <label>Họ và tên</label>
                      <span>{selectedRequest.student?.fullName || 'N/A'}</span>
                    </div>
                    <div className="info-item">
                      <label>Email</label>
                      <a href={`mailto:${selectedRequest.student?.user?.email}`}>
                        {selectedRequest.student?.user?.email || 'N/A'}
                      </a>
                    </div>
                    <div className="info-item">
                      <label>Phòng</label>
                      <span className="highlight">{selectedRequest.student?.roomId?.name || 'N/A'}</span>
                    </div>
                    <div className="info-item">
                      <label>Học kỳ</label>
                      <span>{selectedRequest.semester || 'N/A'}</span>
                    </div>
                  </div>
                </section>

                {/* Request Info Section */}
                <section className="detail-section">
                  <h3 className="section-title">
                    <span className="section-icon">🔧</span>
                    Thông tin yêu cầu sửa chữa
                  </h3>
                  <div className="info-grid">
                    <div className="info-item">
                      <label>Danh mục</label>
                      <span className="highlight">{selectedRequest.category?.name || 'N/A'}</span>
                    </div>
                    <div className="info-item">
                      <label>Thiết bị</label>
                      <span>{selectedRequest.item?.name || 'Không chỉ định'}</span>
                    </div>
                    <div className="info-item">
                      <label>Ngày yêu cầu</label>
                      <span>{formatDate(selectedRequest.requestDate || selectedRequest.createdAt)}</span>
                    </div>
                    {selectedRequest.confirmDate && (
                      <div className="info-item">
                        <label>Ngày hoàn thành</label>
                        <span>{formatDate(selectedRequest.confirmDate)}</span>
                      </div>
                    )}
                    <div className="info-item full-width">
                      <label>Mô tả chi tiết</label>
                      <div className="description-box">
                        {selectedRequest.description || 'Không có mô tả'}
                      </div>
                    </div>
                  </div>
                </section>
              </div>

              {/* Action Buttons */}
              {selectedRequest.status === 'Pending' && (
                <div className="detail-actions">
                  <button 
                    className="btn-action btn-accept" 
                    onClick={() => handleAcceptRequest(selectedRequest._id)}
                    disabled={processing}
                    style={{
                      background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
                      color: '#ffffff',
                      padding: '14px 24px',
                      border: 'none',
                      borderRadius: '8px',
                      fontWeight: 600,
                      fontSize: '14px',
                      cursor: processing ? 'not-allowed' : 'pointer',
                      boxShadow: '0 4px 12px rgba(59, 130, 246, 0.4)',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}
                  >
                    <span>✓</span> {processing ? 'Đang xử lý...' : 'Tiếp nhận yêu cầu'}
                  </button>
                </div>
              )}

              {/* Hiển thị thông báo khi đang chờ sinh viên xác nhận */}
              {selectedRequest.status === 'Under Review' && (
                <div className="detail-actions">
                  <div className="waiting-notice">
                    <span className="notice-icon">⏳</span>
                    <span>Đang chờ sinh viên xác nhận hoàn thành</span>
                  </div>
                </div>
              )}

              {/* Hiển thị khi đã hoàn thành */}
              {selectedRequest.status === 'Approved' && (
                <div className="detail-actions">
                  <div className="completed-notice">
                    <span className="notice-icon">✓</span>
                    <span>Yêu cầu đã được xử lý hoàn thành</span>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="detail-empty">
              <div className="empty-illustration">
                <span>🔧</span>
              </div>
              <h3>Chọn một yêu cầu để xem chi tiết</h3>
              <p>Click vào yêu cầu bên trái để xem thông tin đầy đủ và xử lý</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StaffDormitoryRequests;
