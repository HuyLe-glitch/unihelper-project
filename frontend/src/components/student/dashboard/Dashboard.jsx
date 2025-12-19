import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Dashboard.css';

const Dashboard = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');

  // Dữ liệu mẫu yêu cầu gần đây
  const recentRequests = [
    {
      id: '01146969',
      certificateType: 'Nghĩa vụ quân sự',
      certificateName: 'Tạm hoãn nghĩa vụ quân sự',
      semester: 'HK1 - 2025',
      requestDate: '16/08/2025',
      status: 'valid',
    },
    {
      id: '01136977',
      certificateType: 'Bổ sung hồ sơ cá nhân',
      certificateName: 'Bổ sung hồ sơ cá nhân',
      semester: 'HK1 - 2024',
      requestDate: '30/08/2024',
      status: 'valid',
    },
    {
      id: '01125588',
      certificateType: 'Xác nhận sinh viên',
      certificateName: 'Xác nhận sinh viên đang học',
      semester: 'HK2 - 2024',
      requestDate: '10/12/2024',
      status: 'processing',
    },
  ];

  // Statistics
  const stats = {
    pending: 18,
    completed: 23,
    rejected: 15,
  };

  const handleCreateRequest = () => {
    navigate('/student/student-affairs');
  };

  const handleViewHistory = () => {
    navigate('/student/history-affair');
  };

  const getStatusInfo = (status) => {
    const statusMap = {
      valid: { label: 'Hợp lệ', class: 'status-valid', icon: '✓' },
      processing: { label: 'Đang xử lý', class: 'status-processing', icon: '⟳' },
      invalid: { label: 'Không hợp lệ', class: 'status-invalid', icon: '✕' },
    };
    return statusMap[status] || statusMap.processing;
  };

  return (
    <div className="student-dashboard-container">
      {/* Search and Notifications Bar */}
      <div className="dashboard-header">
        <div className="search-notification-bar">
          <div className="search-box">
            <span className="search-icon">🔍</span>
            <input
              type="text"
              placeholder="Tìm kiếm yêu cầu, thông báo..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>
          <div className="notification-badge">
            <span className="notification-icon">🔔</span>
            <span className="badge-count">3</span>
          </div>
          <div className="welcome-user">
            <div className="user-avatar-small">U</div>
            <div className="welcome-text">
              <span className="welcome-label">Welcome back</span>
              <span className="user-name-display">User</span>
            </div>
          </div>
        </div>
      </div>

      {/* Statistics Overview */}
      <div className="overview-section">
        <h2 className="section-title">Tổng quan</h2>
        <div className="stats-grid">
          <div className="stat-card stat-pending">
            <div className="stat-icon">📋</div>
            <div className="stat-content">
              <div className="stat-label">YÊU CẦU ĐANG XỬ LÝ</div>
              <div className="stat-value">{stats.pending}</div>
            </div>
          </div>

          <div className="stat-card stat-completed">
            <div className="stat-icon">✅</div>
            <div className="stat-content">
              <div className="stat-label">YÊU CẦU ĐÃ HOÀN THÀNH</div>
              <div className="stat-value">{stats.completed}</div>
            </div>
          </div>

          <div className="stat-card stat-rejected">
            <div className="stat-icon">❌</div>
            <div className="stat-content">
              <div className="stat-label">YÊU CẦU ĐÃ TỪ CHỐI</div>
              <div className="stat-value">{stats.rejected}</div>
            </div>
          </div>

          <div className="stat-card stat-create" onClick={handleCreateRequest}>
            <div className="stat-icon-large">➕</div>
            <div className="stat-content">
              <div className="stat-label-create">THÊM YÊU CẦU</div>
              <div className="stat-sublabel">Tạo yêu cầu mới</div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Requests */}
      <div className="recent-section">
        <div className="section-header">
          <h2 className="section-title">Yêu cầu gần đây</h2>
          <button className="view-all-btn" onClick={handleViewHistory}>
            Xem tất cả →
          </button>
        </div>
        
        <div className="recent-requests-grid">
          {recentRequests.map((request) => {
            const statusInfo = getStatusInfo(request.status);
            return (
              <div key={request.id} className="request-card">
                <div className="request-header">
                  <span className="request-id">{request.id}</span>
                  <span className={`status-badge ${statusInfo.class}`}>
                    <span className="status-icon">{statusInfo.icon}</span>
                    {statusInfo.label}
                  </span>
                </div>
                <div className="request-body">
                  <h3 className="request-name">{request.certificateName}</h3>
                  <p className="request-type">{request.certificateType}</p>
                  <div className="request-meta">
                    <span className="meta-item">
                      <span className="meta-icon">📅</span>
                      {request.requestDate}
                    </span>
                    <span className="meta-item">
                      <span className="meta-icon">📚</span>
                      {request.semester}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
