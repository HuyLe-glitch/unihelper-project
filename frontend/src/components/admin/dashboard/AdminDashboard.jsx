import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminService } from '../../../services/admin';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Dashboard data từ API
  const [dashboardData, setDashboardData] = useState({
    stats: {
      students: 0,
      faculties: 0,
      majors: 0,
      semesters: 0,
      rooms: 0,
      certificateRequests: 0,
      certificateTypes: 0,
      certificates: 0,
      equipmentCategories: 0,
      equipmentItems: 0
    },
    recentActivities: []
  });

  // Fetch dashboard data từ API
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const response = await adminService.getDashboardData();
        if (response.success) {
          setDashboardData(response.data);
        }
      } catch (err) {
        console.error('Error fetching admin dashboard:', err);
        setError('Không thể tải dữ liệu dashboard. Vui lòng thử lại sau.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const { stats, recentActivities } = dashboardData;

  // Quick stats for cards - Theo sidebar Admin
  const statsCards = [
    {
      id: 'students',
      title: 'Sinh viên',
      value: stats.students,
      icon: '👨‍🎓',
      color: 'blue',
      link: '/admin/students'
    },
    {
      id: 'faculties',
      title: 'Khoa',
      value: stats.faculties,
      icon: '🏛️',
      color: 'green',
      link: '/admin/faculty-major'
    },
    {
      id: 'majors',
      title: 'Chuyên ngành',
      value: stats.majors,
      icon: '📚',
      color: 'teal',
      link: '/admin/faculty-major'
    },
    {
      id: 'semesters',
      title: 'Học kỳ',
      value: stats.semesters,
      icon: '📅',
      color: 'purple',
      link: '/admin/semesters'
    },
    {
      id: 'rooms',
      title: 'Phòng KTX',
      value: stats.rooms,
      icon: '🏠',
      color: 'orange',
      link: '/admin/rooms'
    },
    {
      id: 'certificateTypes',
      title: 'Loại chứng nhận',
      value: stats.certificateTypes,
      icon: '📑',
      color: 'pink',
      link: '/admin/certificate-requests'
    },
    {
      id: 'certificates',
      title: 'Tên chứng nhận',
      value: stats.certificates,
      icon: '📋',
      color: 'indigo',
      link: '/admin/certificate-requests'
    },
    {
      id: 'equipmentCategories',
      title: 'Danh mục thiết bị',
      value: stats.equipmentCategories,
      icon: '🔧',
      color: 'cyan',
      link: '/admin/equipment'
    },
    {
      id: 'equipmentItems',
      title: 'Thiết bị cụ thể',
      value: stats.equipmentItems,
      icon: '⚙️',
      color: 'gray',
      link: '/admin/equipment'
    }
  ];

  const handleCardClick = (link) => {
    if (link) {
      navigate(link);
    }
  };

  if (isLoading) {
    return (
      <div className="dashboard-loading">
        <div className="loading-spinner"></div>
        <p>Đang tải dữ liệu...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-error">
        <div className="error-icon">⚠️</div>
        <p>{error}</p>
        <button className="btn btn-primary" onClick={() => window.location.reload()}>
          Thử lại
        </button>
      </div>
    );
  }

  return (
    <div className="admin-dashboard">
      {/* Header */}
      <div className="dashboard-header">
        <div className="header-content">
          <div>
            <h1 className="dashboard-title">Dashboard - Bảng điều khiển</h1>
            <p className="dashboard-subtitle">Tổng quan hệ thống quản lý UniHelper</p>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="stats-grid stats-grid-7">
        {statsCards.map((card) => (
          <div
            key={card.id}
            className={`stat-card stat-card-${card.color}`}
            onClick={() => handleCardClick(card.link)}
          >
            <div className="stat-card-icon">{card.icon}</div>
            <div className="stat-card-content">
              <h3 className="stat-card-title">{card.title}</h3>
              <div className="stat-card-value">{card.value.toLocaleString()}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="dashboard-grid">
        {/* Recent Activities */}
        <div className="dashboard-panel activities-panel">
          <div className="panel-header">
            <h2 className="panel-title">
              <span className="panel-icon">📝</span>
              Hoạt động gần đây
            </h2>
          </div>
          <div className="activities-list">
            {recentActivities.length === 0 ? (
              <div className="no-activities">
                <p>Chưa có hoạt động nào</p>
              </div>
            ) : (
              recentActivities.map((activity) => (
                <div 
                  key={activity.id} 
                  className="activity-item"
                  onClick={() => activity.link && navigate(activity.link)}
                  style={{ cursor: activity.link ? 'pointer' : 'default' }}
                >
                  <div className="activity-icon">{activity.icon}</div>
                  <div className="activity-content">
                    <div className="activity-action">{activity.action}</div>
                    <div className="activity-details">{activity.details}</div>
                  </div>
                  <div className="activity-time">{activity.timeFormatted}</div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="dashboard-panel quick-actions-panel">
          <div className="panel-header">
            <h2 className="panel-title">
              <span className="panel-icon">⚡</span>
              Thao tác nhanh
            </h2>
          </div>
          <div className="quick-actions-grid">
            <button
              className="quick-action-btn action-blue"
              onClick={() => navigate('/admin/students')}
            >
              <span className="action-icon">👨‍🎓</span>
              <span className="action-text">Quản lý sinh viên</span>
            </button>
            <button
              className="quick-action-btn action-green"
              onClick={() => navigate('/admin/faculty-major')}
            >
              <span className="action-icon">🏛️</span>
              <span className="action-text">Quản lý khoa & ngành</span>
            </button>
            <button
              className="quick-action-btn action-purple"
              onClick={() => navigate('/admin/semesters')}
            >
              <span className="action-icon">📅</span>
              <span className="action-text">Quản lý học kỳ</span>
            </button>
            <button
              className="quick-action-btn action-orange"
              onClick={() => navigate('/admin/rooms')}
            >
              <span className="action-icon">🏠</span>
              <span className="action-text">Quản lý phòng KTX</span>
            </button>
            <button
              className="quick-action-btn action-pink"
              onClick={() => navigate('/admin/certificate-requests')}
            >
              <span className="action-icon">�</span>
              <span className="action-text">Quản lý chứng nhận</span>
            </button>
            <button
              className="quick-action-btn action-teal"
              onClick={() => navigate('/admin/equipment')}
            >
              <span className="action-icon">🔧</span>
              <span className="action-text">Danh mục thiết bị</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
