import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../schedule/Schedule.css';
import { apiClient } from '../../../services/api'; // adjust path

const HistoryDormitory = () => {
  const navigate = useNavigate();

  const [dormitoryHistory, setDormitoryHistory] = useState([
    {
      id: 1,
      studentCode: '519H0237',
      fullName: 'Nguyen Van A',
      category: 'Đăng ký mới',
      deviceName: 'Giường tầng',
      requestDate: '2024-01-20',
      confirmDate: '2024-01-22',
      status: 'Approved'
    },
    {
      id: 2,
      studentCode: '519H0145',
      fullName: 'Tran Thi B',
      category: 'Gia hạn',
      deviceName: 'Tủ quần áo',
      requestDate: '2024-01-15',
      confirmDate: '2024-01-18',
      status: 'Under Review'
    },
    {
      id: 3,
      studentCode: '519H0298',
      fullName: 'Le Van C',
      category: 'Đăng ký mới',
      deviceName: 'Bàn học',
      requestDate: '2024-01-10',
      confirmDate: '2024-01-12',
      status: 'Rejected'
    },
    {
      id: 4,
      studentCode: '519H0321',
      fullName: 'Pham Thi D',
      category: 'Chuyển phòng',
      deviceName: 'Giường đơn',
      requestDate: '2024-01-05',
      confirmDate: '2024-01-08',
      status: 'Approved'
    }
  ]);

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

  const totalPages = Math.ceil(filteredHistory.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedHistory = filteredHistory.slice(startIndex, endIndex);

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
              onChange={(e) => setPageSize(Number(e.target.value))}
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
            />
            <button className="search-btn-global">Tìm kiếm</button>
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
              {/*<tr className="filter-row">
                <th></th>
                <th></th>
                <th>
                  <input 
                    type="text"
                    placeholder="Tìm theo Mã"
                    value={searchFilters.studentCode}
                    onChange={(e) => handleFilterChange('studentCode', e.target.value)}
                    className="column-filter"
                  />
                </th>
                <th>
                  <input 
                    type="text"
                    placeholder="Tìm theo Họ tên"
                    value={searchFilters.fullName}
                    onChange={(e) => handleFilterChange('fullName', e.target.value)}
                    className="column-filter"
                  />
                </th>
                <th>
                  <input 
                    type="text"
                    placeholder="Tìm theo Danh mục"
                    value={searchFilters.category}
                    onChange={(e) => handleFilterChange('category', e.target.value)}
                    className="column-filter"
                  />
                </th>
                <th>
                  <input 
                    type="text"
                    placeholder="Tìm theo Tên"
                    value={searchFilters.deviceName}
                    onChange={(e) => handleFilterChange('deviceName', e.target.value)}
                    className="column-filter"
                  />
                </th>
                <th>
                  <input 
                    type="text"
                    placeholder="Tìm theo Mô tả"
                    className="column-filter"
                  />
                </th>
                <th>
                  <input 
                    type="text"
                    placeholder="Tìm theo Ngày"
                    value={searchFilters.requestDate}
                    onChange={(e) => handleFilterChange('requestDate', e.target.value)}
                    className="column-filter"
                  />
                </th>
                <th>
                  <input 
                    type="text"
                    placeholder="Tìm theo Xác nhận"
                    className="column-filter"
                  />
                </th>
                <th>
                  <input 
                    type="text"
                    placeholder="Tìm theo Trạng thái"
                    value={searchFilters.status}
                    onChange={(e) => handleFilterChange('status', e.target.value)}
                    className="column-filter"
                  />
                </th>
              </tr> */}
            </thead>
            <tbody>
              {paginatedHistory.length > 0 ? (
                paginatedHistory.map((item, index) => (
                  <tr key={item.id}>
                    <td>
                      <button className="action-btn">Xem</button>
                    </td>
                    <td>{startIndex + index + 1}</td>
                    <td>{item.studentCode}</td>
                    <td>{item.fullName}</td>
                    <td>{item.category}</td>
                    <td>{item.deviceName}</td>
                    <td>-</td>
                    <td>{item.requestDate}</td>
                    <td>{item.confirmDate}</td>
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
            Hiển thị {startIndex + 1} đến {Math.min(endIndex, filteredHistory.length)} trong {filteredHistory.length} dòng dữ liệu
          </span>
          <div className="pagination-controls">
            <button 
              className="pagination-btn" 
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
            >
              Trang trước
            </button>
            <button 
              className="pagination-btn"
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
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