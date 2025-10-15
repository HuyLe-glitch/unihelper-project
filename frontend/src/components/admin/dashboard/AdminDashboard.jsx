import React, {useState,useMemo} from 'react';
import{Modal} from '../../common';
import './AdminDashboard.css';

const AdminDashboard = () => {
    const [isModalOpen,setIsModalOpen] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState('');
    const [modalTitle, setModalTitle] = useState('');

    //Admin's stats
    const adminStats = useMemo(() => ({
        totalStudents: 2847,
        totalStaff: 156,
        pendingRequests: 89,
        systemAlerts: 3,
        activeUsers: 1243,
        totalRequests: 1247
    }), []);

    //Comprehensive request data from all departments 
    const allRequests = useMemo(() => [
        {
            id: 'REQ-001',
            type: 'Student Certification',
            department: 'Student Affairs',
            student: 'Nguyễn Văn An',
            staff: 'Trần Thị Lan',
            status: 'processing',
            priority: 'high',
            submittedAt: '2024-10-12',
            deadline: '2024-10-15'
        },
        {
            id: 'REQ-002',
            type: 'Dormitory Application',
            department: 'Housing',
            student: 'Lê Thị Bình',
            staff: 'Phạm Văn Cường',
            status: 'completed',
            priority: 'medium',
            submittedAt: '2024-10-11',
            deadline: '2024-10-18' 
        },{
            id: 'REQ-003',
            type: 'Grade Appeal',
            department: 'Academic',
            student: 'Hoàng Minh Nam',
            staff: 'Đỗ Thị Hoa',
            status: 'rejected',
            priority: 'low',
            submittedAt: '2024-10-10',
            deadline: '2024-10-12'
        }
    ],[]);

    //System performance metrics 
    const systemMetrics = useMemo(() => ({
        serverUptime: '99.9%',
        responseTime: '245ms',
        activeConnections: 1243,
        storageUsed: '68%',
        lastBackup: '2024-10-12 02:00'
    }),[]);

    //Department performance data
    const departmentPerformance = useMemo(() => [
        { name: 'Student Affairs', requests: 45, completion: '92%', avgTime: '2.3 days' },
        { name: 'Housing', requests: 32, completion: '88%', avgTime: '1.8 days' },
        { name: 'Academic', requests: 28, completion: '95%', avgTime: '3.1 days' },
        { name: 'Financial', requests: 15, completion: '87%', avgTime: '2.7 days' }
    ],[]);

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
    const getPriorityClass = (priority) => {
        switch (priority) {
          case 'high': return 'priority-high';
          case 'medium': return 'priority-medium';
          case 'low': return 'priority-low';
          default: return '';
        }
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
    const filteredRequests = selectedCategory ? 
        allRequests.filter(req => req.department.toLowerCase().includes(selectedCategory.toLowerCase())) : 
        allRequests;
    return (
        <div className="admin-dashboard">
        <div className="admin-dashboard__header">
            <div>
            <h1>Admin Dashboard</h1>
            <p>Tổng quan hệ thống và quản lý toàn trường</p>
            </div>
            <div className="admin-dashboard__header-actions">
            <button type="button" className="btn primary">Tạo thông báo hệ thống</button>
            <button type="button" className="btn ghost">Xuất báo cáo</button>
            <button type="button" className="btn secondary">Cài đặt hệ thống</button>
            </div>
        </div>

      {/* Main Stats Grid */}
      <section className="admin-stats-grid">
        <div 
          className="stat-card stat-card--primary"
          onClick={() => handleCardClick('students')}
        >
          <div className="stat-icon">👥</div>
          <div className="stat-content">
            <h3>Tổng số sinh viên</h3>
            <div className="stat-number">{adminStats.totalStudents.toLocaleString()}</div>
          </div>
        </div>

        <div 
          className="stat-card stat-card--secondary"
          onClick={() => handleCardClick('staff')}
        >
          <div className="stat-icon">👨‍💼</div>
          <div className="stat-content">
            <h3>Tổng số nhân viên</h3>
            <div className="stat-number">{adminStats.totalStaff}</div>
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

        <div 
          className="stat-card stat-card--danger"
          onClick={() => handleCardClick('alerts')}
        >
          <div className="stat-icon">⚠️</div>
          <div className="stat-content">
            <h3>Cảnh báo hệ thống</h3>
            <div className="stat-number">{adminStats.systemAlerts}</div>
          </div>
        </div>

        <div 
          className="stat-card stat-card--success"
          onClick={() => handleCardClick('users')}
        >
          <div className="stat-icon">🟢</div>
          <div className="stat-content">
            <h3>Người dùng đang hoạt động</h3>
            <div className="stat-number">{adminStats.activeUsers.toLocaleString()}</div>
          </div>
        </div>

        <div 
          className="stat-card stat-card--info"
          onClick={() => handleCardClick('total')}
        >
          <div className="stat-icon">📊</div>
          <div className="stat-content">
            <h3>Tổng yêu cầu tháng</h3>
            <div className="stat-number">{adminStats.totalRequests.toLocaleString()}</div>
          </div>
        </div>
      </section>
      {/* Main Content Grid */}
      <section className="admin-dashboard__grid">
        {/* All Requests Overview */}
        <article className="panel panel--large">
          <div className="panel__heading">
            <h2>Tất cả yêu cầu hệ thống</h2>
            <span className="badge">{allRequests.length}</span>
          </div>
          <div className="requests-table-container">
            <table className="admin-requests-table">
              <thead>
                <tr>
                  <th>Mã yêu cầu</th>
                  <th>Loại</th>
                  <th>Phòng ban</th>
                  <th>Sinh viên</th>
                  <th>Nhân viên xử lý</th>
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
                    <td>{request.department}</td>
                    <td>{request.student}</td>
                    <td>{request.staff}</td>
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
                <div className="dept-name">{dept.name}</div>
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
              <span className="action-icon">👤</span>
              Quản lý người dùng
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
            <button type="button" className="action-btn action-btn--danger">
              <span className="action-icon">🚨</span>
              Xem cảnh báo
            </button>
            <button type="button" className="action-btn action-btn--info">
              <span className="action-icon">💾</span>
              Sao lưu dữ liệu
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
                      <p>{request.student} - {request.department}</p>
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