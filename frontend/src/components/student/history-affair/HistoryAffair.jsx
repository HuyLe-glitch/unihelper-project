import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../schedule/Schedule.css';

const HistoryAffair = () => {
  const navigate = useNavigate();
  
  const [affairsHistory, setAffairsHistory] = useState([
    {
      id: 1,
      date: '2024-01-15',
      type: 'Academic Request',
      description: 'Request for grade review',
      status: 'Approved'
    },
    {
      id: 2,
      date: '2024-01-10',
      type: 'Document Request',
      description: 'Transcript request',
      status: 'Pending'
    },
    {
      id: 3,
      date: '2024-01-05',
      type: 'Leave Request',
      description: 'Medical leave application',
      status: 'Approved'
    }
  ]);

  const [affairsSearch, setAffairsSearch] = useState('');
  const [affairsPageSize, setAffairsPageSize] = useState(10);

  const handleCreateRequest = () => {
    navigate('/student/student-affairs/');
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

  const filteredAffairsHistory = affairsHistory.filter(item =>
    item.description.toLowerCase().includes(affairsSearch.toLowerCase()) ||
    item.type.toLowerCase().includes(affairsSearch.toLowerCase())
  );

  return (
    <div className="schedule-container">
      <div className="schedule-header">
        <h1 className="schedule-title">Lịch sử Công tác sinh viên</h1>
        <button 
          className="create-request-btn"
          onClick={handleCreateRequest}
        >
          <span className="btn-icon">+</span>
          Tạo yêu cầu CTSV
        </button>
      </div>

      <div className="history-section">
        <div className="section-header">
          <h2>Student Affairs History</h2>
          <div className="controls">
            <div className="display-controls">
              <label>Hiển thị</label>
              <input 
                type="number" 
                value={affairsPageSize}
                onChange={(e) => setAffairsPageSize(e.target.value)}
                min="1"
                max="100"
              />
              <span>dòng dữ liệu</span>
            </div>
            <div className="search-controls">
              <input 
                type="text"
                placeholder="Tìm kiếm..."
                value={affairsSearch}
                onChange={(e) => setAffairsSearch(e.target.value)}
                className="search-input"
              />
              <button className="search-btn">Tìm kiếm</button>
            </div>
          </div>
        </div>

        <div className="table-container">
          <table className="history-table">
            <thead>
              <tr>
                <th className="sortable">
                  <span>Thao tác</span>
                  <span className="sort-icon">◆</span>
                </th>
                <th className="sortable">
                  <span>STT</span>
                  <span className="sort-icon">◆</span>
                </th>
                <th className="sortable">
                  <span>Ngày</span>
                  <span className="sort-icon">◆</span>
                </th>
                <th className="sortable">
                  <span>Loại yêu cầu</span>
                  <span className="sort-icon">◆</span>
                </th>
                <th className="sortable">
                  <span>Mô tả</span>
                  <span className="sort-icon">◆</span>
                </th>
                <th className="sortable">
                  <span>Trạng thái</span>
                  <span className="sort-icon">◆</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredAffairsHistory.length > 0 ? (
                filteredAffairsHistory.map((item, index) => (
                  <tr key={item.id}>
                    <td>
                      <button className="action-btn">Xem</button>
                    </td>
                    <td>{index + 1}</td>
                    <td>{item.date}</td>
                    <td>{item.type}</td>
                    <td>{item.description}</td>
                    <td>{getStatusBadge(item.status)}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="no-data">
                    No data available
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="pagination">
          <span className="pagination-info">
            Hiển thị 0 đến {filteredAffairsHistory.length} trong {filteredAffairsHistory.length} dòng dữ liệu
          </span>
          <div className="pagination-controls">
            <button className="pagination-btn" disabled>Trang trước</button>
            <button className="pagination-btn">Trang kế tiếp</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HistoryAffair;