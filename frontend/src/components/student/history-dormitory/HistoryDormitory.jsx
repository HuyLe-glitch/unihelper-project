import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import '../schedule/Schedule.css';
import { apiClient } from '../../../services/api';

const HistoryDormitory = () => {
  const navigate = useNavigate();

  const [dormitoryHistory, setDormitoryHistory] = useState([]); // current page items
  const [searchFilters, setSearchFilters] = useState({
    studentCode: '',
    fullName: '',
    category: '',
    deviceName: '',
    requestDate: '',
    status: ''
  });
  const [pageSize, setPageSize] = useState(5); // default 5 per page
  const [currentPage, setCurrentPage] = useState(1);
  const [totalRows, setTotalRows] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleCreateRequest = () => {
    navigate('/student/dormitory');
  };

  const getStatusBadge = (status) => {
    const statusClasses = {
      'Approved': 'status-approved',
      'Pending': 'status-pending',
      'Under Review': 'status-review',
      'Rejected': 'status-rejected'
    };
    return (
      <span className={`status-badge ${statusClasses[status] || 'status-default'}`}>
        {status}
      </span>
    );
  };

  const handleFilterChange = (field, value) => {
    setSearchFilters(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const formatDate = (d) => {
    if (!d) return '';
    try {
      return new Date(d).toISOString().slice(0, 10);
    } catch {
      return String(d);
    }
  };

  const mapServerItemToUI = (it) => {
    // Get current user data from localStorage (like ProfilePanel.jsx)
    const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
    const profileData = storedUser.profile || {};
    
    return {
      id: it._id || it.id,
      studentCode: profileData.studentId || storedUser.profile?.studentId || '',
      fullName: storedUser.name || profileData.user?.name || '',
      category: it.category || '',
      deviceName: it.deviceName || '',
      description: it.description || '',
      requestDate: formatDate(it.requestDate || it.createdAt),
      confirmDate: formatDate(it.confirmDate),
      status: it.status || 'Pending'
    };
  };


  const fetchRequests = useCallback(async (page = 1, limit = 5) => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiClient.get('/dormitory/requests/my', {
        params: { page, limit }
      });
      const payload = res?.data;
      let items = [];

      if (!payload) {
        items = [];
      } else if (Array.isArray(payload)) {
        items = payload;
      } else if (payload.data && Array.isArray(payload.data)) {
        items = payload.data;
      } else if (payload.success && Array.isArray(payload.data)) {
        items = payload.data;
      } else {
        items = payload.data || [];
      }

      const mapped = items.map(mapServerItemToUI);
      setDormitoryHistory(mapped);

      const totalFromMeta = payload?.meta?.total || payload?.meta?.count || payload?.total;
      if (typeof totalFromMeta === 'number') {
        setTotalRows(totalFromMeta);
      } else {
        // fallback: estimate totalRows (use current page count if unknown)
        setTotalRows(prev => {
          // if we already had a total keep it, otherwise guess as page * limit when items full else mapped.length
          if (prev && prev > 0) return prev;
          return mapped.length === limit ? page * limit : ( (page - 1) * limit + mapped.length );
        });
      }
    } catch (err) {
      console.error('fetchRequests error', err);
      setError(err?.response?.data?.message || err.message || 'Failed to load requests');
      setDormitoryHistory([]);
      setTotalRows(0);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch when page or pageSize changes (server-side pagination)
  useEffect(() => {
    fetchRequests(currentPage, pageSize);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, pageSize]);

  // client-side filtering applied to current page items
  const filteredHistory = dormitoryHistory.filter(item => {
    return (
      item.studentCode.toLowerCase().includes(searchFilters.studentCode.toLowerCase()) &&
      item.fullName.toLowerCase().includes(searchFilters.fullName.toLowerCase()) &&
      item.category.toLowerCase().includes(searchFilters.category.toLowerCase()) &&
      item.deviceName.toLowerCase().includes(searchFilters.deviceName.toLowerCase()) &&
      item.requestDate.includes(searchFilters.requestDate) &&
      item.status.toLowerCase().includes(searchFilters.status.toLowerCase())
    );
  });

  const totalPages = Math.max(1, Math.ceil((totalRows || filteredHistory.length) / pageSize));
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + filteredHistory.length; // number shown on this page
  const paginatedHistory = filteredHistory; // current page items (already from server)

  return (
    <div className="schedule-container">
      <div className="schedule-header">
        <h1 className="schedule-title">Lịch sử yêu cầu xử lý sự cố</h1>
        <button
          className="create-request-btn"
          onClick={handleCreateRequest}
        >
          <span className="btn-icon">+</span>
          Tạo yêu cầu KTX
        </button>
      </div>

      <div className="history-section">
        <div className="top-controls">
          <div className="display-controls">
            <label>Hiển thị</label>
            <select
              value={pageSize}
              onChange={(e) => { setPageSize(Number(e.target.value)); setCurrentPage(1); }}
              className="page-size-select"
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
            <span>dòng dữ liệu</span>
          </div>
          <div className="search-box">
            <input
              type="text"
              placeholder="Tìm kiếm..."
              className="global-search-input"
              onChange={(e) => {
                const q = e.target.value || '';
                setSearchFilters(prev => ({
                  ...prev,
                  studentCode: q,
                  fullName: q,
                  deviceName: q,
                  category: q
                }));
              }}
            />
            <button
              className="search-btn-global"
              onClick={() => { setCurrentPage(1); fetchRequests(1, pageSize); }}
              disabled={loading}
            >
              Tìm kiếm
            </button>
          </div>
        </div>

        <div className="table-container">
          <table className="history-table">
            <thead>
              <tr>
                <th>Thao tác</th>
                <th>STT</th>
                <th>Mã số sinh viên</th>
                <th>Họ tên</th>
                <th>Danh mục</th>
                <th>Tên thiết bị</th>
                <th>Mô tả</th>
                <th>Ngày yêu cầu</th>
                <th>Xác nhận sửa chữa</th>
                <th>Trạng thái</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="10" className="no-data">Loading...</td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan="10" className="no-data">Error: {error}</td>
                </tr>
              ) : paginatedHistory.length > 0 ? (
                paginatedHistory.map((item, index) => (
                  <tr key={item.id || index}>
                    <td>
                      <button className="action-btn">Xem</button>
                    </td>
                    <td>{startIndex + index + 1}</td>
                    <td>{item.studentCode}</td>
                    <td>{item.fullName}</td>
                    <td>{item.category}</td>
                    <td>{item.deviceName}</td>
                    <td>{item.description || '-'}</td>
                    <td>{item.requestDate}</td>
                    <td>{item.confirmDate || '-'}</td>
                    <td>{getStatusBadge(item.status)}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="10" className="no-data">
                    No data available in table
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="pagination">
          <span className="pagination-info">
            Hiển thị {totalRows === 0 ? 0 : startIndex + 1} đến {Math.min(startIndex + pageSize, totalRows)} trong {totalRows} dòng dữ liệu
          </span>
          <div className="pagination-controls">
            <span className="page-info">Trang {currentPage} / {totalPages}</span>
            <button
              className="pagination-btn"
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1 || loading}
            >
              Trang trước
            </button>
            <button
              className="pagination-btn"
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage >= totalPages || loading}
            >
              Trang kế tiếp
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HistoryDormitory;