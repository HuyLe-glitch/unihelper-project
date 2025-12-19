import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import './HistoryDormitory.css';

const HistoryDormitory = () => {
  const navigate = useNavigate();

  // Dữ liệu mẫu
  const [dormitoryHistory] = useState([
    {
      id: 'KTX001',
      requestCode: 'REQ001',
      studentCode: '2051063001',
      fullName: 'Nguyễn Văn A',
      room: 'A101',
      category: 'Thiết bị điện',
      deviceName: 'Quạt trần',
      description: 'Quạt trần phòng A101 không hoạt động, có tiếng kêu lạ',
      requestDate: '2025-12-10',
      confirmDate: '2025-12-12',
      semester: 'HK1 2024-2025',
      status: 'completed'
    },
    {
      id: 'KTX002',
      requestCode: 'REQ002',
      studentCode: '2051063001',
      fullName: 'Nguyễn Văn A',
      room: 'A101',
      category: 'Thiết bị nước',
      deviceName: 'Vòi nước',
      description: 'Vòi nước nhà vệ sinh bị rò rỉ',
      requestDate: '2025-12-11',
      confirmDate: '',
      semester: 'HK1 2024-2025',
      status: 'processing'
    },
    {
      id: 'KTX003',
      requestCode: 'REQ003',
      studentCode: '2051063001',
      fullName: 'Nguyễn Văn A',
      room: 'A101',
      category: 'Nội thất',
      deviceName: 'Giường',
      description: 'Giường bị gãy chân, cần thay mới',
      requestDate: '2025-12-05',
      confirmDate: '',
      semester: 'HK2 2023-2024',
      status: 'rejected'
    },
    {
      id: 'KTX004',
      requestCode: 'REQ004',
      studentCode: '2051063001',
      fullName: 'Nguyễn Văn A',
      room: 'A101',
      category: 'Cửa',
      deviceName: 'Khóa cửa',
      description: 'Khóa cửa phòng bị hỏng, không đóng được',
      requestDate: '2025-12-08',
      confirmDate: '2025-12-09',
      semester: 'HK1 2024-2025',
      status: 'completed'
    }
  ]);

  // States cho filter và search
  const [searchTerm, setSearchTerm] = useState('');
  const [semesterFilter, setSemesterFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortOrder, setSortOrder] = useState('newest');

  const handleCreateRequest = () => {
    navigate('/student/dormitory');
  };

  // Hàm lấy label và class cho status
  const getStatusInfo = (status) => {
    const statusMap = {
      completed: { label: 'Đã hoàn thành', class: 'status-completed', icon: '✓' },
      processing: { label: 'Đang xử lý', class: 'status-processing', icon: '⟳' },
      rejected: { label: 'Đã từ chối', class: 'status-rejected', icon: '✕' },
    };
    return statusMap[status] || statusMap.processing;
  };

  // Tính toán thống kê
  const statistics = useMemo(() => {
    return {
      total: dormitoryHistory.length,
      completed: dormitoryHistory.filter(item => item.status === 'completed').length,
      processing: dormitoryHistory.filter(item => item.status === 'processing').length,
      rejected: dormitoryHistory.filter(item => item.status === 'rejected').length,
    };
  }, [dormitoryHistory]);

  // Lấy thông tin phòng từ yêu cầu đầu tiên
  const roomInfo = dormitoryHistory.length > 0 ? dormitoryHistory[0].room : '';

  // Lọc và sắp xếp dữ liệu
  const filteredAndSortedData = useMemo(() => {
    let result = [...dormitoryHistory];

    // Filter theo search term
    if (searchTerm) {
      result = result.filter(item =>
        item.requestCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.studentCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
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

      {/* Statistics Cards */}
      <div className="stats-grid">
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
        <div className="stat-card stat-rejected">
          <div className="stat-icon">✕</div>
          <div className="stat-content">
            <div className="stat-value">{statistics.rejected}</div>
            <div className="stat-label">Đã từ chối</div>
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
              placeholder="🔍 Tìm theo mã yêu cầu, MSSV, tên, thiết bị..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>

          {/* Semester Filter */}
          <div className="filter-group">
            <label className="filter-label">📅 Học kỳ</label>
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
            <label className="filter-label">📌 Trạng thái</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="filter-select"
            >
              <option value="all">Tất cả trạng thái</option>
              <option value="completed">Đã hoàn thành</option>
              <option value="processing">Đang xử lý</option>
              <option value="rejected">Đã từ chối</option>
            </select>
          </div>

          {/* Sort Order */}
          <div className="filter-group">
            <label className="filter-label">⏰ Sắp xếp</label>
            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
              className="filter-select"
            >
              <option value="newest">Mới nhất</option>
              <option value="oldest">Cũ nhất</option>
            </select>
          </div>
        </div>
      </div>

      {/* Room Info */}
      {roomInfo && (
        <div className="room-info-banner">
          <span className="room-icon">🚪</span>
          <span className="room-text">Phòng: <strong>{roomInfo}</strong></span>
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
                <th>Mã sinh viên</th>
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
              {filteredAndSortedData.length > 0 ? (
                filteredAndSortedData.map((item) => {
                  const statusInfo = getStatusInfo(item.status);
                  return (
                    <tr key={item.id} className="table-row">
                      <td className="cell-request-code">
                        <strong>{item.requestCode}</strong>
                      </td>
                      <td className="cell-student-code">{item.studentCode}</td>
                      <td className="cell-fullname">{item.fullName}</td>
                      <td className="cell-category">{item.category}</td>
                      <td className="cell-device">{item.deviceName}</td>
                      <td className="cell-description">{item.description}</td>
                      <td className="cell-date">
                        {new Date(item.requestDate).toLocaleDateString('vi-VN')}
                      </td>
                      <td className={`cell-confirm ${!item.confirmDate ? 'empty' : ''}`}>
                        {item.confirmDate 
                          ? new Date(item.confirmDate).toLocaleDateString('vi-VN')
                          : 'Chưa xác nhận'}
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
    </div>
  );
};

export default HistoryDormitory;