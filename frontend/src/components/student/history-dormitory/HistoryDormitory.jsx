import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import '../schedule/Schedule.css';
import { apiClient } from '../../../services/api';

const HistoryDormitory = () => {
  const navigate = useNavigate();

  const [dormitoryHistory, setDormitoryHistory] = useState([]);
  const [searchFilters, setSearchFilters] = useState({
    studentCode: '',
    fullName: '',
    category: '',
    deviceName: '',
    requestDate: '',
    status: ''
  });
  const [pageSize, setPageSize] = useState(10);
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

  const mapServerItemToUI = (it) => ({
    id: it._id || it.id,
    studentCode:
      it.student?.studentCode ||
      it.student?.code ||
      it.student?.student_id ||
      it.student?.username ||
      '',
    fullName:
      it.student?.fullName ||
      it.student?.name ||
      [it.student?.firstName, it.student?.lastName].filter(Boolean).join(' ') ||
      '',
    category: it.category || '',
    deviceName: it.deviceName || '',
    description: it.description || '',
    requestDate: formatDate(it.requestDate || it.createdAt),
    confirmDate: formatDate(it.confirmDate),
    status: it.status || 'Pending'
  });

  const fetchRequests = useCallback(async (page = 1, limit = 10) => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiClient.get('/dormitory/requests/my', {
        params: { page, limit }
      });
      // support responses shaped as { success, data, meta } or direct array
      const payload = res?.data;
      let items = [];
      if (payload === undefined || payload === null) {
        items = [];
      } else if (Array.isArray(payload)) {
        items = payload;
      } else if (payload.data && Array.isArray(payload.data)) {
        items = payload.data;
        if (payload.meta && typeof payload.meta.total === 'number') setTotalRows(payload.meta.total);
      } else if (payload.success && Array.isArray(payload.data)) {
        items = payload.data;
        if (payload.meta && typeof payload.meta.total === 'number') setTotalRows(payload.meta.total);
      } else {
        // fallback: try to read payload.data.results
        items = payload.data || [];
      }

      const mapped = items.map(mapServerItemToUI);
      setDormitoryHistory(mapped);
      if (!totalRows) {
        // try to infer total if provided in meta
        const totalFromMeta = payload?.meta?.total || payload?.meta?.count || payload?.total;
        if (typeof totalFromMeta === 'number') setTotalRows(totalFromMeta);
        else setTotalRows(mapped.length);
      }
    } catch (err) {
      console.error('fetchRequests error', err);
      setError(err?.response?.data?.message || err.message || 'Failed to load requests');
      setDormitoryHistory([]);
      setTotalRows(0);
    } finally {
      setLoading(false);
    }
  }, [totalRows]);

  useEffect(() => {
    fetchRequests(currentPage, pageSize);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, pageSize]);

  // client-side filters (applied after server fetch)
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
  const endIndex = startIndex + pageSize;
  const paginatedHistory = filteredHistory.slice(0, pageSize); // server paging already applied; keep client slice minimal

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
                // global search: apply to studentCode/fullName/deviceName/category concatenated
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
              onClick={() => fetchRequests(1, pageSize)}
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
                <th>Mã học viên</th>
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
            Hiển thị {Math.min(startIndex + 1, totalRows || 0)} đến {Math.min(endIndex, totalRows || filteredHistory.length)} trong {totalRows || filteredHistory.length} dòng dữ liệu
          </span>
          <div className="pagination-controls">
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
              disabled={currentPage === totalPages || loading}
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