import React, { useState, useMemo } from 'react';
import { Modal } from '../../common';
import './AdminDashboard.css';

/**
 * Admin Dashboard
 * 
 * Hiển thị tổng quan hệ thống với:
 * - Nhiều sinh viên
 * - 2 staff cố định (CTSV & KTX)
 * - 1 admin cố định
 */
const AdminDashboard = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [modalTitle, setModalTitle] = useState('');

  // Admin's stats
  const adminStats = useMemo(() => ({
    totalStudents: 2847,
    fixedStaff: 2,           // 2 staff cố định
    pendingRequests: 89,
    systemAlerts: 3,
    activeUsers: 1243,
    totalRequests: 1247
  }), []);

  // Fixed staff information
  const fixedStaff = useMemo(() => [
    {
      id: 'CTSV001',
      name: 'Nhân viên CTSV',
      type: 'CTSV',
      department: 'Phòng Công tác Sinh viên',
      email: 'ctsv@university.edu.vn',
      status: 'active',
      pendingRequests: 45,
      processedToday: 12
    },
    {
      id: 'KTX001',
      name: 'Nhân viên KTX',
      type: 'KTX',
      department: 'Phòng Ký túc xá',
      email: 'ktx@university.edu.vn',
      status: 'active',
      pendingRequests: 23,
      processedToday: 8
    }
  ], []);

  // All requests overview
  const allRequests = useMemo(() => [
    {
      id: 'REQ-001',
      type: 'Xác nhận sinh viên',
      category: 'CTSV',
      student: 'Nguyễn Văn An',
      staff: 'Nhân viên CTSV',
      status: 'processing',
      priority: 'high',
      submittedAt: '2024-10-12',
      deadline: '2024-10-15'
    },
    {
      id: 'REQ-002',
      type: 'Đăng ký KTX',
      category: 'KTX',
      student: 'Lê Thị Bình',
      staff: 'Nhân viên KTX',
      status: 'completed',
      priority: 'medium',
      submittedAt: '2024-10-11',
      deadline: '2024-10-18'
    },
    {
      id: 'REQ-003',
      type: 'Xác nhận học phí',
      category: 'CTSV',
      student: 'Hoàng Minh Nam',
      staff: 'Nhân viên CTSV',
      status: 'pending',
      priority: 'low',
      submittedAt: '2024-10-10',
      deadline: '2024-10-12'
    },
    {
      id: 'REQ-004',
      type: 'Trả phòng KTX',
      category: 'KTX',
      student: 'Trần Thị Hoa',
      staff: 'Nhân viên KTX',
      status: 'processing',
      priority: 'high',
      submittedAt: '2024-10-12',
      deadline: '2024-10-14'
    }
  ], []);

  // System metrics
  const systemMetrics = useMemo(() => ({
    serverUptime: '99.9%',
    responseTime: '245ms',
    activeConnections: 1243,
    storageUsed: '68%',
    lastBackup: '2024-10-12 02:00'
  }), []);

  // Department performance (chỉ 2 phòng ban)
  const departmentPerformance = useMemo(() => [
    { 
      name: 'CTSV', 
      fullName: 'Phòng Công tác Sinh viên',
      requests: 45, 
      completion: '92%', 
      avgTime: '2.3 ngày',
      staff: 'CTSV001'
    },
    { 
      name: 'KTX', 
      fullName: 'Phòng Ký túc xá',
      requests: 32, 
      completion: '88%', 
      avgTime: '1.8 ngày',
      staff: 'KTX001'
    }
  ], []);

  const getStatusText = (status) => {
    switch (status) {
      case 'pending': return 'Chờ xử lý';
      case 'processing': return 'Đang xử lý';
      case 'completed': return 'Đã hoàn thành';
      case 'rejected': return 'Đã từ chối';
      default: return status;
    }
  };

  const getStatusClass = (status) => {
    switch (status) {
      case 'pending': return 'status-pending';
      case 'processing': return 'status-processing';
      case 'completed': return 'status-completed';
      case 'rejected': return 'status-rejected';
      default: return '';
    }
  };

  const getPriorityClass = (priority) => {
    switch (priority) {
      case 'high': return 'priority-high';
      case 'medium': return 'priority-medium';
      case 'low': return 'priority-low';
      default: return '';
    }
  };

  const getCategoryClass = (category) => {
    return category === 'CTSV' ? 'category-ctsv' : 'category-ktx';
  };

  const handleCardClick = (category) => {
    setSelectedCategory(category);
    setModalTitle(`Quản lý ${category}`);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedCategory('');
    setModalTitle('');
  };

  const filteredRequests = selectedCategory
    ? allRequests.filter(req => 
        req.category.toLowerCase().includes(selectedCategory.toLowerCase())
      )
    : allRequests;

  return (
    <div className="admin-dashboard">
      <div className="admin-dashboard__header">
        <div>
          <h1>Admin Dashboard</h1>
          <p>Tổng quan hệ thống UniHelper</p>
        </div>
        <div className="admin-dashboard__header-actions">
          <button type="button" className="btn primary">📢 Tạo thông báo</button>
          <button type="button" className="btn ghost">📊 Xuất báo cáo</button>
        </div>
      </div>

      {/* System Info Banner */}
      <div className="system-info-banner">
        <div className="banner-item">
          <span className="banner-icon">👑</span>
          <span>1 Admin</span>
        </div>
        <div className="banner-divider">|</div>
        <div className="banner-item">
          <span className="banner-icon">👨‍💼</span>
          <span>2 Staff cố định (CTSV & KTX)</span>
        </div>
        <div className="banner-divider">|</div>
        <div className="banner-item">
          <span className="banner-icon">🎓</span>
          <span>{adminStats.totalStudents.toLocaleString()} Sinh viên</span>
        </div>
      </div>

      {/* Main Stats Grid */}
      <section className="admin-stats-grid">
        <div 
          className="stat-card stat-card--primary"
          onClick={() => handleCardClick('students')}
        >
          <div className="stat-icon">🎓</div>
          <div className="stat-content">
            <h3>Tổng số sinh viên</h3>
            <div className="stat-number">{adminStats.totalStudents.toLocaleString()}</div>
          </div>
        </div>

        <div className="stat-card stat-card--secondary">
          <div className="stat-icon">👨‍💼</div>
          <div className="stat-content">
            <h3>Staff cố định</h3>
            <div className="stat-number">{adminStats.fixedStaff}</div>
            <small>CTSV & KTX</small>
          </div>
        </div>

        <div 
          className="stat-card stat-card--warning"
          onClick={() => handleCardClick('requests')}
        >
          <div className="stat-icon">📋</div>
          <div className="stat-content">
            <h3>Yêu cầu đang chờ</h3>
            <div className="stat-number">{adminStats.pendingRequests}</div>
          </div>
        </div>

        <div className="stat-card stat-card--success">
          <div className="stat-icon">🟢</div>
          <div className="stat-content">
            <h3>Người dùng online</h3>
            <div className="stat-number">{adminStats.activeUsers.toLocaleString()}</div>
          </div>
        </div>
      </section>

      {/* Fixed Staff Status */}
      <section className="fixed-staff-section">
        <h2>🔒 Nhân viên cố định</h2>
        <div className="fixed-staff-grid">
          {fixedStaff.map(staff => (
            <div key={staff.id} className={`staff-card staff-card--${staff.type.toLowerCase()}`}>
              <div className="staff-card-header">
                <span className="staff-type-badge">{staff.type}</span>
                <span className={`status-dot ${staff.status === 'active' ? 'active' : 'inactive'}`}></span>
              </div>
              <h3>{staff.name}</h3>
              <p className="staff-department">{staff.department}</p>
              <p className="staff-email">{staff.email}</p>
              <div className="staff-stats">
                <div className="staff-stat">
                  <span className="stat-label">Chờ xử lý</span>
                  <span className="stat-value warning">{staff.pendingRequests}</span>
                </div>
                <div className="staff-stat">
                  <span className="stat-label">Đã xử lý hôm nay</span>
                  <span className="stat-value success">{staff.processedToday}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Main Content Grid */}
      <section className="admin-dashboard__grid">
        {/* All Requests Overview */}
        <article className="panel panel--large">
          <div className="panel__heading">
            <h2>Yêu cầu gần đây</h2>
            <span className="badge">{allRequests.length}</span>
          </div>
          <div className="requests-table-container">
            <table className="admin-requests-table">
              <thead>
                <tr>
                  <th>Mã</th>
                  <th>Loại</th>
                  <th>Phòng ban</th>
                  <th>Sinh viên</th>
                  <th>Trạng thái</th>
                  <th>Độ ưu tiên</th>
                  <th>Hạn xử lý</th>
                </tr>
              </thead>
              <tbody>
                {allRequests.map(request => (
                  <tr key={request.id}>
                    <td>{request.id}</td>
                    <td>{request.type}</td>
                    <td>
                      <span className={`category-badge ${getCategoryClass(request.category)}`}>
                        {request.category}
                      </span>
                    </td>
                    <td>{request.student}</td>
                    <td>
                      <span className={`status ${getStatusClass(request.status)}`}>
                        {getStatusText(request.status)}
                      </span>
                    </td>
                    <td>
                      <span className={`priority ${getPriorityClass(request.priority)}`}>
                        {request.priority}
                      </span>
                    </td>
                    <td>{request.deadline}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </article>

        {/* System Performance */}
        <article className="panel">
          <h2>Hiệu suất hệ thống</h2>
          <div className="system-metrics">
            <div className="metric-row">
              <span>Thời gian hoạt động</span>
              <strong className="metric-value metric-value--success">{systemMetrics.serverUptime}</strong>
            </div>
            <div className="metric-row">
              <span>Thời gian phản hồi</span>
              <strong className="metric-value">{systemMetrics.responseTime}</strong>
            </div>
            <div className="metric-row">
              <span>Kết nối đang hoạt động</span>
              <strong className="metric-value">{systemMetrics.activeConnections.toLocaleString()}</strong>
            </div>
            <div className="metric-row">
              <span>Dung lượng sử dụng</span>
              <strong className="metric-value metric-value--warning">{systemMetrics.storageUsed}</strong>
            </div>
            <div className="metric-row">
              <span>Backup gần nhất</span>
              <strong className="metric-value">{systemMetrics.lastBackup}</strong>
            </div>
          </div>
        </article>

        {/* Department Performance */}
        <article className="panel">
          <h2>Hiệu suất phòng ban</h2>
          <div className="department-performance">
            {departmentPerformance.map((dept, index) => (
              <div key={index} className="dept-performance-item">
                <div className="dept-header">
                  <span className={`dept-badge ${dept.name.toLowerCase()}`}>{dept.name}</span>
                  <span className="dept-name">{dept.fullName}</span>
                </div>
                <div className="dept-stats">
                  <span className="dept-requests">{dept.requests} yêu cầu</span>
                  <span className="dept-completion">{dept.completion}</span>
                  <span className="dept-time">{dept.avgTime}</span>
                </div>
              </div>
            ))}
          </div>
        </article>

        {/* Quick Actions */}
        <article className="panel panel--actions">
          <h2>Thao tác nhanh</h2>
          <div className="quick-actions">
            <button type="button" className="action-btn action-btn--primary">
              <span className="action-icon">🎓</span>
              Quản lý sinh viên
            </button>
            <button type="button" className="action-btn action-btn--secondary">
              <span className="action-icon">⚙️</span>
              Cài đặt hệ thống
            </button>
            <button type="button" className="action-btn action-btn--success">
              <span className="action-icon">📊</span>
              Tạo báo cáo
            </button>
            <button type="button" className="action-btn action-btn--warning">
              <span className="action-icon">🔔</span>
              Gửi thông báo
            </button>
          </div>
        </article>
      </section>

      {/* Modal for detailed views */}
      <Modal 
        isOpen={isModalOpen} 
        onClose={handleCloseModal} 
        title={modalTitle}
        size="large"
      >
        {selectedCategory && (
          <div className="admin-modal-content">
            <p>Chi tiết về {selectedCategory} sẽ được hiển thị ở đây.</p>
            {filteredRequests.length > 0 && (
              <div className="modal-requests-list">
                {filteredRequests.map(request => (
                  <div key={request.id} className="modal-request-item">
                    <div className="request-info">
                      <h4>{request.id} - {request.type}</h4>
                      <p>{request.student} - {request.category}</p>
                    </div>
                    <div className="request-status">
                      <span className={`status ${getStatusClass(request.status)}`}>
                        {getStatusText(request.status)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default AdminDashboard;
