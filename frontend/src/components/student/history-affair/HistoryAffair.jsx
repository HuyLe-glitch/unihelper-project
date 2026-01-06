import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import certificateRequestService from '../../../services/certificateRequest';
import socketService from '../../../services/socket';
import './HistoryAffair.css';

const HistoryAffair = () => {
  const navigate = useNavigate();
  
  // State cho dữ liệu từ API
  const [affairsHistory, setAffairsHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Mapping status từ backend sang frontend UI
  const mapStatusFromBackend = (backendStatus) => {
    const statusMapping = {
      'ĐANG XỬ LÝ': 'processing',
      'HỢP LỆ': 'valid',
      'KHÔNG HỢP LỆ': 'invalid'
    };
    return statusMapping[backendStatus] || 'processing';
  };

  // Format responseTime từ Date sang chuỗi hiển thị
  const formatResponseTime = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    const time = date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
    const dateStr = date.toLocaleDateString('vi-VN');
    return `${time}\n${dateStr}`;
  };

  // Transform dữ liệu từ API sang format UI
  const transformRequestData = useCallback((request) => {
    return {
      id: request.requestCode || request._id,
      certificateType: request.certificateType?.name || 'Không xác định',
      certificateName: request.certificateName?.name || 'Không xác định',
      semester: request.semester || '',
      requestDate: request.requestDate || request.createdAt,
      status: mapStatusFromBackend(request.status),
      responseTime: formatResponseTime(request.responseTime),
      notes: request.notes || '',
      staffFile: request.staffFile?.fileName ? request.staffFile : null
    };
  }, []);

  // Fetch dữ liệu từ API
  const fetchHistory = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await certificateRequestService.getMyRequests({ page: 1, limit: 100 });
      
      if (response.success && response.data) {
        const transformedData = (response.data.requests || []).map(transformRequestData);
        setAffairsHistory(transformedData);
      } else {
        setError(response.message || 'Không thể tải dữ liệu');
      }
    } catch (err) {
      console.error('Error fetching certificate request history:', err);
      setError(err.response?.data?.message || 'Không thể tải lịch sử yêu cầu CTSV');
    } finally {
      setLoading(false);
    }
  }, [transformRequestData]);

  // Fetch data khi component mount
  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  // Socket.IO realtime updates - khi Staff duyệt/từ chối yêu cầu
  useEffect(() => {
    // Kết nối socket
    socketService.connect();

    // Lắng nghe sự kiện yêu cầu được cập nhật (duyệt/từ chối)
    socketService.onCertificateRequestUpdated((data) => {
      // Cập nhật trực tiếp trong state thay vì fetch lại
      setAffairsHistory(prev => prev.map(item => {
        if (item.id === data.requestCode || item.id === data.requestId) {
          return {
            ...item,
            status: mapStatusFromBackend(data.status || data.request?.status),
            responseTime: data.request?.responseTime 
              ? formatResponseTime(data.request.responseTime)
              : item.responseTime,
            staffFile: data.request?.staffFile || item.staffFile
          };
        }
        return item;
      }));
    });

    // Lắng nghe sự kiện yêu cầu mới được tạo (để cập nhật chính trang của mình sau khi gửi)
    socketService.onCertificateRequestCreated((data) => {
      console.log('📩 New certificate request created:', data);
      // Thêm trực tiếp vào state mà không fetch lại (tránh loading)
      if (data.request) {
        const newItem = {
          id: data.request.requestCode || data.request._id,
          certificateType: data.request.certificateType?.name || 'Không xác định',
          certificateName: data.request.certificateName?.name || 'Không xác định',
          semester: data.request.semester || '',
          requestDate: data.request.createdAt || new Date().toISOString(),
          status: mapStatusFromBackend(data.request.status),
          responseTime: '-',
          notes: data.request.notes || '',
          staffFile: null
        };
        // Thêm vào đầu danh sách
        setAffairsHistory(prev => [newItem, ...prev]);
      }
    });

    // Cleanup khi unmount
    return () => {
      socketService.off('CERTIFICATE_REQUEST_UPDATED');
      socketService.off('CERTIFICATE_REQUEST_CREATED');
    };
  }, []);

  // States cho filter và search
  const [searchTerm, setSearchTerm] = useState('');
  const [semesterFilter, setSemesterFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortOrder, setSortOrder] = useState('newest');

  const handleCreateRequest = () => {
    navigate('/student/student-affairs/');
  };

  // Toggle sort order trực tiếp khi click
  const toggleSortOrder = () => {
    setSortOrder(prev => prev === 'newest' ? 'oldest' : 'newest');
  };

  // Hàm lấy label và class cho status
  const getStatusInfo = (status) => {
    const statusMap = {
      valid: { label: 'Hợp lệ', class: 'status-valid', icon: '✓' },
      processing: { label: 'Đang xử lý', class: 'status-processing', icon: '⟳' },
      invalid: { label: 'Không hợp lệ', class: 'status-invalid', icon: '✕' },
    };
    return statusMap[status] || statusMap.processing;
  };

  // Tính toán thống kê
  const statistics = useMemo(() => {
    return {
      total: affairsHistory.length,
      valid: affairsHistory.filter(item => item.status === 'valid').length,
      processing: affairsHistory.filter(item => item.status === 'processing').length,
      invalid: affairsHistory.filter(item => item.status === 'invalid').length,
    };
  }, [affairsHistory]);

  // Lọc và sắp xếp dữ liệu
  const filteredAndSortedData = useMemo(() => {
    let result = [...affairsHistory];

    // Filter theo search term
    if (searchTerm) {
      result = result.filter(item =>
        item.certificateName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.certificateType.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.id.includes(searchTerm) ||
        item.notes.toLowerCase().includes(searchTerm.toLowerCase())
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
  }, [affairsHistory, searchTerm, semesterFilter, statusFilter, sortOrder]);

  // Lấy danh sách semester unique
  const semesters = useMemo(() => {
    return [...new Set(affairsHistory.map(item => item.semester))].filter(Boolean);
  }, [affairsHistory]);

  // Loading state
  if (loading) {
    return (
      <div className="history-affair-container">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Đang tải lịch sử yêu cầu...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="history-affair-container">
        <div className="error-container">
          <span className="error-icon">⚠️</span>
          <p className="error-message">{error}</p>
          <button className="retry-btn" onClick={fetchHistory}>
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="history-affair-container">
      {/* Header */}
      <div className="page-header">
        <div className="header-content">
          <h1 className="page-title">📋 Lịch sử Công tác sinh viên</h1>
          <button className="create-btn" onClick={handleCreateRequest}>
            <span className="btn-icon">+</span>
            Tạo yêu cầu mới
          </button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="stats-grid">
        <div className="stat-card stat-total">
          <div className="stat-icon">📊</div>
          <div className="stat-content">
            <div className="stat-value">{statistics.total}</div>
            <div className="stat-label">Tổng yêu cầu</div>
          </div>
        </div>
        <div className="stat-card stat-valid">
          <div className="stat-icon">✓</div>
          <div className="stat-content">
            <div className="stat-value">{statistics.valid}</div>
            <div className="stat-label">Hợp lệ</div>
          </div>
        </div>
        <div className="stat-card stat-processing">
          <div className="stat-icon">⟳</div>
          <div className="stat-content">
            <div className="stat-value">{statistics.processing}</div>
            <div className="stat-label">Đang xử lý</div>
          </div>
        </div>
        <div className="stat-card stat-invalid">
          <div className="stat-icon">✕</div>
          <div className="stat-content">
            <div className="stat-value">{statistics.invalid}</div>
            <div className="stat-label">Không hợp lệ</div>
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
              placeholder="🔍 Tìm theo mã, loại yêu cầu, nội dung..."
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
              <option value="all">Tất cả học kỳ</option>
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
              <option value="all">Tất cả trạng thái</option>
              <option value="valid">✓ Hợp lệ</option>
              <option value="processing">⟳ Đang xử lý</option>
              <option value="invalid">✕ Không hợp lệ</option>
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

      {/* Table Section - FULL WIDTH */}
      <div className="table-section">
        <div className="table-container">
          <table className="requests-table">
            <thead>
              <tr>
                <th>Mã yêu cầu</th>
                <th>Loại chứng nhận</th>
                <th>Tên chứng nhận</th>
                <th>Học kỳ xét</th>
                <th>Ngày yêu cầu</th>
                <th>Trạng thái</th>
                <th>Phản hồi lúc</th>
                <th>Lưu ý</th>
                <th>File phản hồi</th>
              </tr>
            </thead>
            <tbody>
              {filteredAndSortedData.length > 0 ? (
                filteredAndSortedData.map((item) => {
                  const statusInfo = getStatusInfo(item.status);
                  return (
                    <tr key={item.id} className="table-row">
                      <td className="cell-id">
                        <strong>{item.id}</strong>
                      </td>
                      <td className="cell-type">{item.certificateType}</td>
                      <td className="cell-name">{item.certificateName}</td>
                      <td className="cell-semester">{item.semester}</td>
                      <td className="cell-date">
                        {new Date(item.requestDate).toLocaleDateString('vi-VN')}
                      </td>
                      <td className="cell-status">
                        <span className={`status-badge ${statusInfo.class}`}>
                          <span className="status-icon">{statusInfo.icon}</span>
                          {statusInfo.label}
                        </span>
                      </td>
                      <td className="cell-response">
                        {item.responseTime.split('\n').map((line, i) => (
                          <React.Fragment key={i}>
                            {line}
                            {i === 0 && <br />}
                          </React.Fragment>
                        ))}
                      </td>
                      <td className="cell-notes">
                        <div className="notes-content">{item.notes}</div>
                      </td>
                      <td className="cell-file">
                        {item.staffFile ? (
                          <a href={item.staffFile.filePath || '#'} className="file-link" target="_blank" rel="noopener noreferrer">
                            <span className="file-name">{item.staffFile.fileName}</span>
                          </a>
                        ) : (
                          <span className="no-file">-</span>
                        )}
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
    </div>
  );
};

export default HistoryAffair;
