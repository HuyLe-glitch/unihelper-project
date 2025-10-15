import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Schedule.css';

const Schedule = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('affairs');
  
  // Sample data - replace with actual API calls
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
    }
  ]);

  const [dormitoryHistory, setDormitoryHistory] = useState([
    {
      id: 1,
      requestDate: '2024-01-20',
      dormitory: 'Block A',
      roomType: 'Double Room',
      status: 'Under Review'
    },
    {
      id: 2,
      requestDate: '2023-12-15',
      dormitory: 'Block B',
      roomType: 'Single Room',
      status: 'Approved'
    }
  ]);

  const [affairsSearch, setAffairsSearch] = useState('');
  const [dormitorySearch, setDormitorySearch] = useState('');
  const [affairsPageSize, setAffairsPageSize] = useState(10);
  const [dormitoryPageSize, setDormitoryPageSize] = useState(10);

  // Update this function to handle both tabs
  const handleCreateRequest = () => {
    if (activeTab === 'affairs') {
      navigate('/student/student-affairs/');
    } else {
      navigate('/student/dormitory');
    }
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

  const filteredDormitoryHistory = dormitoryHistory.filter(item =>
    item.dormitory.toLowerCase().includes(dormitorySearch.toLowerCase()) ||
    item.roomType.toLowerCase().includes(dormitorySearch.toLowerCase())
  );

  return (
    <div className="schedule-container">
      <div className="schedule-header">
        <h1 className="schedule-title">Student History & Requests</h1>
        <button 
          className="create-request-btn"
          onClick={handleCreateRequest}
        >
          <span className="btn-icon">+</span>
          {activeTab === 'affairs' ? 'Tạo yêu cầu CTSV' : 'Tạo yêu cầu ký túc xá'}
        </button>
      </div>

      <div className="tabs-container">
        <button 
          className={`tab-btn ${activeTab === 'affairs' ? 'active' : ''}`}
          onClick={() => setActiveTab('affairs')}
        >
          Student Affairs History
        </button>
        <button 
          className={`tab-btn ${activeTab === 'dormitory' ? 'active' : ''}`}
          onClick={() => setActiveTab('dormitory')}
        >
          Dormitory Request History
        </button>
      </div>

      {activeTab === 'affairs' && (
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
      )}

      {activeTab === 'dormitory' && (
        <div className="history-section">
          <div className="section-header">
            <h2>Dormitory Request History</h2>
            <div className="controls">
              <div className="display-controls">
                <label>Hiển thị</label>
                <input 
                  type="number" 
                  value={dormitoryPageSize}
                  onChange={(e) => setDormitoryPageSize(e.target.value)}
                  min="1"
                  max="100"
                />
                <span>dòng dữ liệu</span>
              </div>
              <div className="search-controls">
                <input 
                  type="text"
                  placeholder="Tìm kiếm..."
                  value={dormitorySearch}
                  onChange={(e) => setDormitorySearch(e.target.value)}
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
                    <span>Ngày yêu cầu</span>
                    <span className="sort-icon">◆</span>
                  </th>
                  <th className="sortable">
                    <span>Ký túc xá</span>
                    <span className="sort-icon">◆</span>
                  </th>
                  <th className="sortable">
                    <span>Loại phòng</span>
                    <span className="sort-icon">◆</span>
                  </th>
                  <th className="sortable">
                    <span>Trạng thái</span>
                    <span className="sort-icon">◆</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredDormitoryHistory.length > 0 ? (
                  filteredDormitoryHistory.map((item, index) => (
                    <tr key={item.id}>
                      <td>
                        <button className="action-btn">Xem</button>
                      </td>
                      <td>{index + 1}</td>
                      <td>{item.requestDate}</td>
                      <td>{item.dormitory}</td>
                      <td>{item.roomType}</td>
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
              Hiển thị 0 đến {filteredDormitoryHistory.length} trong {filteredDormitoryHistory.length} dòng dữ liệu
            </span>
            <div className="pagination-controls">
              <button className="pagination-btn" disabled>Trang trước</button>
              <button className="pagination-btn">Trang kế tiếp</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Schedule;