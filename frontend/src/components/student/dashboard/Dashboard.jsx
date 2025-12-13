import React, { useEffect, useState } from 'react';
import { ProfilePanel } from '../profile';
import { Modal } from '../../common';
import './Dashboard.css';

const Dashboard = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState('');
  const [modalTitle, setModalTitle] = useState('');
  const [userName, setUserName] = useState(''); //  thêm state cho tên

  useEffect(() => {
    // Get user data from localStorage (set by auth service)
    const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
    if (storedUser && storedUser.name) {
      setUserName(storedUser.name.split(' ')[0]);
    } else {
      setUserName('User'); // fallback
    }
  }, []);

  // Mock data - sau này sẽ lấy từ API
  const statsData = {
    processing: 18,
    completed: 23,
    rejected: 15,
    total: 56
  };

  const requestsData = [
    {
      id: 'REQ001',
      type: 'Xác nhận sinh viên',
      date: '2024-10-01',
      status: 'processing'
    },
    {
      id: 'REQ002', 
      type: 'Cấp lại thẻ sinh viên',
      date: '2024-09-30',
      status: 'completed'
    },
    {
      id: 'REQ003',
      type: 'Báo cáo sự cố ký túc xá',
      date: '2024-09-29',
      status: 'rejected'
    },
    {
      id: 'REQ004',
      type: 'Phúc khảo điểm',
      date: '2024-09-28',
      status: 'processing'
    },
    {
      id: 'REQ005',
      type: 'Xin nghỉ học',
      date: '2024-09-27',
      status: 'completed'
    }
  ];

  const getStatusText = (status) => {
    switch (status) {
      case 'processing': return 'Đang xử lý';
      case 'completed': return 'Đã hoàn thành';
      case 'rejected': return 'Đã từ chối';
      default: return status;
    }
  };

  const getStatusClass = (status) => {
    switch (status) {
      case 'processing': return 'status-processing';
      case 'completed': return 'status-completed';
      case 'rejected': return 'status-rejected';
      default: return '';
    }
  };

  const filterRequestsByStatus = (status) => {
    if (status === 'all') return requestsData;
    return requestsData.filter(request => request.status === status);
  };

  const handleCardClick = (status) => {
    if (status === 'add') {
      // Xử lý thêm yêu cầu mới
      console.log('Thêm yêu cầu mới');
      return;
    }
    setSelectedStatus(status);
    setModalTitle(`Danh sách yêu cầu - ${getStatusText(status)}`);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedStatus('');
    setModalTitle('');
  };

  const filteredRequests = filterRequestsByStatus(selectedStatus);

  return (
    <div className="dashboard">{/* Removed list view - now using modal */}
      <div className="dashboard-layout">
        <div className="main-section">
          <div className="header-bar">
            <div className="search-box">
              <span className="search-icon">🔍</span>
              <input 
                type="text" 
                placeholder="Tìm kiếm yêu cầu, thông báo..."
                className="search-input"
              />
            </div>
            
            <div className="header-actions">
              <div className="notification-box">
                <span className="notification-icon">🔔</span>
                <span className="notification-badge">3</span>
              </div>
              
              <div className="account-box">
                <div className="user-avatar">{userName.charAt(0)}</div>
                <div className="user-info">
                  <span className="welcome-text">Welcome back</span>
                  <span className="user-name">{userName}</span>
                </div>
                <div className="profile-link-icon">
                  <span className="link-arrow">→</span>
                </div>
              </div>
            </div>
          </div>

          <div className="overview-section">
            <h2>Tổng quan</h2>
            <div className="stats-grid">
              <div 
                className="stat-card processing"
                onClick={() => handleCardClick('processing')}
              >
                <div className="stat-icon">📋</div>
                <div className="stat-content">
                  <h3>Yêu cầu đang xử lý</h3>
                  <div className="stat-number">{statsData.processing}</div>
                </div>
              </div>

              <div 
                className="stat-card completed"
                onClick={() => handleCardClick('completed')}
              >
                <div className="stat-icon">✅</div>
                <div className="stat-content">
                  <h3>Yêu cầu đã hoàn thành</h3>
                  <div className="stat-number">{statsData.completed}</div>
                </div>
              </div>

              <div 
                className="stat-card rejected"
                onClick={() => handleCardClick('rejected')}
              >
                <div className="stat-icon">❌</div>
                <div className="stat-content">
                  <h3>Yêu cầu đã từ chối</h3>
                  <div className="stat-number">{statsData.rejected}</div>
                </div>
              </div>

              <div 
                className="stat-card add-new"
                onClick={() => handleCardClick('add')}
              >
                <div className="stat-icon">➕</div>
                <div className="stat-content">
                  <h3>Thêm yêu cầu</h3>
                  <div className="stat-description">Tạo yêu cầu mới</div>
                </div>
              </div>
            </div>
          </div>

          <div className="assignments-section">
            <h2>Yêu cầu gần đây</h2>
            <div className="assignments-list">
              {requestsData.slice(0, 3).map(request => (
                <div key={request.id} className="assignment-item">
                  <div className="assignment-icon">
                    {request.status === 'completed' ? '✅' : 
                     request.status === 'rejected' ? '❌' : '📝'}
                  </div>
                  <div className="assignment-content">
                    <h4>{request.type}</h4>
                    <p>{request.date}</p>
                  </div>
                  <div className="assignment-meta">
                    <span className={`status ${getStatusClass(request.status)}`}>
                      {getStatusText(request.status)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <ProfilePanel />
      </div>

      {/* Modal for showing filtered requests */}
      <Modal 
        isOpen={isModalOpen} 
        onClose={handleCloseModal} 
        title={modalTitle}
      >
        {filteredRequests.length > 0 ? (
          <table className="modal-requests-table">
            <thead>
              <tr>
                <th>Mã yêu cầu</th>
                <th>Loại yêu cầu</th>
                <th>Ngày yêu cầu</th>
                <th>Trạng thái</th>
              </tr>
            </thead>
            <tbody>
              {filteredRequests.map(request => (
                <tr key={request.id}>
                  <td>{request.id}</td>
                  <td>{request.type}</td>
                  <td>{request.date}</td>
                  <td>
                    <span className={`status ${getStatusClass(request.status)}`}>
                      {getStatusText(request.status)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="modal-empty-state">
            <div className="empty-icon">📋</div>
            <p>Không có yêu cầu nào trong danh mục này</p>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Dashboard;