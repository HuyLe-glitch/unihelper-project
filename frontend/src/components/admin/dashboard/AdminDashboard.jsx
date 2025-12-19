import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);

  // Mock data - Thay bằng API call thực tế
  const [dashboardData, setDashboardData] = useState({
    totalStudents: 0,
    totalStaff: 0,
    totalFaculties: 0,
    totalMajors: 0,
    pendingRequests: 0,
    completedRequests: 0,
    activeUsers: 0,
    systemAlerts: 0
  });

  // Simulate loading data
  useEffect(() => {
    // TODO: Replace with actual API calls
    setTimeout(() => {
      setDashboardData({
        totalStudents: 2847,
        totalStaff: 156,
        totalFaculties: 8,
        totalMajors: 24,
        pendingRequests: 89,
        completedRequests: 1247,
        activeUsers: 1243,
        systemAlerts: 3
      });
      setIsLoading(false);
    }, 500);
  }, []);

  // Recent activities mock data
  const recentActivities = useMemo(() => [
    {
      id: 1,
      type: 'student',
      action: 'Sinh viên mới đăng ký',
      details: 'Nguyễn Văn A - MSSV: 519H0001',
      time: '5 phút trước',
      icon: '👤'
    },
    {
      id: 2,
      type: 'request',
      action: 'Yêu cầu chứng nhận',
      details: 'Trần Thị B yêu cầu xác nhận sinh viên',
      time: '15 phút trước',
      icon: '📋'
    },
    {
      id: 3,
      type: 'staff',
      action: 'Nhân viên mới',
      details: 'Lê Văn C - Phòng CTSV',
      time: '1 giờ trước',
      icon: '👨‍💼'
    },
    {
      id: 4,
      type: 'system',
      action: 'Cập nhật hệ thống',
      details: 'Module chứng nhận đã được cập nhật',
      time: '2 giờ trước',
      icon: '⚙️'
    }
  ], []);

  // Quick stats for cards
  const statsCards = [
    {
      id: 'students',
      title: 'Sinh viên',
      value: dashboardData.totalStudents,
      icon: '👨‍🎓',
      color: 'blue',
      change: '+12%',
      link: '/admin/students'
    },
    {
      id: 'staff',
      title: 'Nhân viên',
      value: dashboardData.totalStaff,
      icon: '👨‍💼',
      color: 'purple',
      change: '+3%',
      link: '/admin/staff'
    },
    {
      id: 'faculties',
      title: 'Khoa',
      value: dashboardData.totalFaculties,
      icon: '🏛️',
      color: 'green',
      change: '+2',
      link: '/admin/faculty-major'
    },
    {
      id: 'majors',
      title: 'Chuyên ngành',
      value: dashboardData.totalMajors,
      icon: '📚',
      color: 'teal',
      change: '+5',
      link: '/admin/faculty-major'
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

  return (
    <div className="admin-dashboard">
      {/* Header */}
      <div className="dashboard-header">
        <div className="header-content">
          <div>
            <h1 className="dashboard-title">Dashboard - Bảng điều khiển</h1>
            <p className="dashboard-subtitle">Tổng quan hệ thống quản lý UniHelper</p>
          </div>
          <div className="header-actions">
            <button className="btn btn-outline">
              <span className="btn-icon">📊</span>
              Xuất báo cáo
            </button>
            <button className="btn btn-primary">
              <span className="btn-icon">⚙️</span>
              Cài đặt hệ thống
            </button>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="stats-grid">
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
              <div className="stat-card-change">
                <span className={card.change.startsWith('+') ? 'change-up' : 'change-down'}>
                  {card.change}
                </span>
                <span className="change-label">so với tháng trước</span>
              </div>
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
            <button className="btn-text">Xem tất cả</button>
          </div>
          <div className="activities-list">
            {recentActivities.map((activity) => (
              <div key={activity.id} className="activity-item">
                <div className="activity-icon">{activity.icon}</div>
                <div className="activity-content">
                  <div className="activity-action">{activity.action}</div>
                  <div className="activity-details">{activity.details}</div>
                </div>
                <div className="activity-time">{activity.time}</div>
              </div>
            ))}
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
              className="quick-action-btn action-purple"
              onClick={() => navigate('/admin/staff')}
            >
              <span className="action-icon">👨‍💼</span>
              <span className="action-text">Quản lý nhân viên</span>
            </button>
            <button
              className="quick-action-btn action-green"
              onClick={() => navigate('/admin/faculty-major')}
            >
              <span className="action-icon">🏛️</span>
              <span className="action-text">Quản lý khoa & ngành</span>
            </button>
            <button
              className="quick-action-btn action-orange"
              onClick={() => navigate('/admin/certificate-requests')}
            >
              <span className="action-icon">📋</span>
              <span className="action-text">Yêu cầu chứng nhận</span>
            </button>
            <button
              className="quick-action-btn action-teal"
              onClick={() => navigate('/admin/dormitory-requests')}
            >
              <span className="action-icon">🏠</span>
              <span className="action-text">Yêu cầu KTX</span>
            </button>
            <button
              className="quick-action-btn action-red"
              onClick={() => navigate('/admin/users')}
            >
              <span className="action-icon">👥</span>
              <span className="action-text">Quản lý người dùng</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
