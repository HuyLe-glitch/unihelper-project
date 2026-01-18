import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import studentService from '../../../services/student';
import './Dashboard.css';

const Dashboard = () => {
  const navigate = useNavigate();
  
  // State for dashboard data
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dashboardData, setDashboardData] = useState(null);
  const [activeOverviewTab, setActiveOverviewTab] = useState('ctsv'); // Tab cho phần tổng quan
  const [activeRequestTab, setActiveRequestTab] = useState('ctsv'); // Tab cho phần yêu cầu gần đây

  // Fetch dashboard data on mount
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError(null);
        const result = await studentService.getDashboard();
        if (result.success) {
          setDashboardData(result.data);
        } else {
          setError('Không thể tải dữ liệu dashboard');
        }
      } catch (err) {
        console.error('Error fetching dashboard:', err);
        setError(err.response?.data?.message || 'Có lỗi xảy ra khi tải dữ liệu');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const handleViewHistory = () => {
    if (activeRequestTab === 'ctsv') {
      navigate('/student/history-affair');
    } else {
      navigate('/student/history-dormitory');
    }
  };

  const getStatusInfo = (status) => {
    const statusMap = {
      valid: { label: 'Hợp lệ', class: 'status-valid', icon: '✓' },
      processing: { label: 'Đang xử lý', class: 'status-processing', icon: '⟳' },
      invalid: { label: 'Không hợp lệ', class: 'status-invalid', icon: '✕' },
      pending: { label: 'Chờ duyệt', class: 'status-pending', icon: '⏳' },
    };
    return statusMap[status] || statusMap.processing;
  };

  // Loading state
  if (loading) {
    return (
      <div className="student-dashboard-container">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Đang tải dữ liệu...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="student-dashboard-container">
        <div className="error-container">
          <span className="error-icon">⚠️</span>
          <p>{error}</p>
          <button onClick={() => window.location.reload()}>Thử lại</button>
        </div>
      </div>
    );
  }

  const { isDormResident, stats, recentRequests } = dashboardData || {};
  const currentRequests = activeRequestTab === 'ctsv' ? recentRequests?.ctsv : recentRequests?.ktx;

  const handleCreateCTSVRequest = () => {
    navigate('/student/student-affairs');
  };

  const handleCreateKTXRequest = () => {
    navigate('/student/dormitory');
  };

  return (
    <div className="student-dashboard-container">
      {/* Statistics Overview với Tabs */}
      <div className="overview-section">
        <div className="section-header-with-tabs">
          <h2 className="section-title">Tổng quan yêu cầu</h2>
          {/* Tabs cho phần tổng quan */}
          {isDormResident && (
            <div className="overview-tabs">
              <button 
                className={`overview-tab-btn ${activeOverviewTab === 'ctsv' ? 'active' : ''}`}
                onClick={() => setActiveOverviewTab('ctsv')}
              >
                <span className="tab-icon">📋</span>
                CTSV
              </button>
              <button 
                className={`overview-tab-btn ${activeOverviewTab === 'ktx' ? 'active' : ''}`}
                onClick={() => setActiveOverviewTab('ktx')}
              >
                <span className="tab-icon">🏠</span>
                KTX
              </button>
            </div>
          )}
        </div>

        {/* CTSV Stats */}
        {activeOverviewTab === 'ctsv' && (
          <div className="stats-grid">
            <div className="stat-card stat-pending">
              <div className="stat-icon">📋</div>
              <div className="stat-content">
                <div className="stat-label">YÊU CẦU ĐANG XỬ LÝ</div>
                <div className="stat-value">{stats?.ctsv?.pending || 0}</div>
              </div>
            </div>

            <div className="stat-card stat-completed">
              <div className="stat-icon">✅</div>
              <div className="stat-content">
                <div className="stat-label">YÊU CẦU ĐÃ HOÀN THÀNH</div>
                <div className="stat-value">{stats?.ctsv?.completed || 0}</div>
              </div>
            </div>

            <div className="stat-card stat-rejected">
              <div className="stat-icon">❌</div>
              <div className="stat-content">
                <div className="stat-label">YÊU CẦU ĐÃ TỪ CHỐI</div>
                <div className="stat-value">{stats?.ctsv?.rejected || 0}</div>
              </div>
            </div>

            <div className="stat-card stat-create" onClick={handleCreateCTSVRequest}>
              <div className="stat-icon-large">➕</div>
              <div className="stat-content">
                <div className="stat-label-create">THÊM YÊU CẦU</div>
                <div className="stat-sublabel">Tạo yêu cầu mới</div>
              </div>
            </div>
          </div>
        )}

        {/* KTX Stats */}
        {activeOverviewTab === 'ktx' && isDormResident && (
          <div className="stats-grid">
            <div className="stat-card stat-pending ktx-card">
              <div className="stat-icon">📋</div>
              <div className="stat-content">
                <div className="stat-label">SỰ CỐ ĐANG XỬ LÝ</div>
                <div className="stat-value">{stats?.ktx?.pending || 0}</div>
              </div>
            </div>

            <div className="stat-card stat-completed ktx-card">
              <div className="stat-icon">✅</div>
              <div className="stat-content">
                <div className="stat-label">SỰ CỐ ĐÃ HOÀN THÀNH</div>
                <div className="stat-value">{stats?.ktx?.completed || 0}</div>
              </div>
            </div>

            <div className="stat-card stat-rejected ktx-card">
              <div className="stat-icon">❌</div>
              <div className="stat-content">
                <div className="stat-label">SỰ CỐ ĐÃ TỪ CHỐI</div>
                <div className="stat-value">{stats?.ktx?.rejected || 0}</div>
              </div>
            </div>

            <div className="stat-card stat-create ktx-card" onClick={handleCreateKTXRequest}>
              <div className="stat-icon-large">➕</div>
              <div className="stat-content">
                <div className="stat-label-create">BÁO SỰ CỐ</div>
                <div className="stat-sublabel">Tạo yêu cầu KTX</div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Recent Requests */}
      <div className="recent-section">
        <div className="section-header">
          <h2 className="section-title">Yêu cầu gần đây</h2>
          <button className="view-all-btn" onClick={handleViewHistory}>
            Xem tất cả →
          </button>
        </div>

        {/* Tabs - Only show if student is in dormitory */}
        {isDormResident && (
          <div className="request-tabs">
            <button 
              className={`tab-btn ${activeRequestTab === 'ctsv' ? 'active' : ''}`}
              onClick={() => setActiveRequestTab('ctsv')}
            >
              <span className="tab-icon">📋</span>
              Yêu cầu CTSV
              {stats?.ctsv && (
                <span className="tab-badge">{stats.ctsv.pending + stats.ctsv.completed + stats.ctsv.rejected}</span>
              )}
            </button>
            <button 
              className={`tab-btn ${activeRequestTab === 'ktx' ? 'active' : ''}`}
              onClick={() => setActiveRequestTab('ktx')}
            >
              <span className="tab-icon">🏠</span>
              Yêu cầu KTX
              {stats?.ktx && (
                <span className="tab-badge">{stats.ktx.pending + stats.ktx.completed + stats.ktx.rejected}</span>
              )}
            </button>
          </div>
        )}
        
        <div className="recent-requests-grid">
          {currentRequests && currentRequests.length > 0 ? (
            currentRequests.map((request) => {
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
                    {activeRequestTab === 'ctsv' ? (
                      <>
                        <h3 className="request-name">{request.certificateName}</h3>
                        <p className="request-type">{request.certificateType}</p>
                      </>
                    ) : (
                      <>
                        <h3 className="request-name">{request.item}</h3>
                        <p className="request-type">{request.category}</p>
                        {request.description && (
                          <p className="request-description">{request.description}</p>
                        )}
                      </>
                    )}
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
            })
          ) : (
            <div className="no-requests">
              <span className="no-requests-icon">📭</span>
              <p>Chưa có yêu cầu {activeRequestTab === 'ctsv' ? 'CTSV' : 'KTX'} nào</p>
              <button 
                className="create-request-btn" 
                onClick={activeRequestTab === 'ctsv' ? handleCreateCTSVRequest : handleCreateKTXRequest}
              >
                Tạo yêu cầu mới
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
