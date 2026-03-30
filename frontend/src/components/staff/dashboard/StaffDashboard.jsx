import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService, staffService } from '../../../services';
import SDCustomDropdown from './SDCustomDropdown';
import './StaffDashboard.css';

const STATUS_LABELS = {
  processing: 'Đang xử lý',
  approved: 'Đã hoàn thành',
  rejected: 'Đã từ chối',
};

const StaffDashboard = () => {
  const navigate = useNavigate();
  
  // Get staff type from localStorage
  const staffType = authService.getStaffType();
  const isCTSV = staffType === 'CTSV';
  const isKTX = staffType === 'KTX';

  // State
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [stats, setStats] = useState({
    total: 0,
    processing: 0,
    approved: 0,
    rejected: 0
  });
  const [requests, setRequests] = useState([]);

  // Fetch dashboard data
  const fetchDashboard = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      let response;
      if (isCTSV) {
        response = await staffService.getCtsvDashboard({ 
          limit: 10, 
          status: filterStatus !== 'all' ? filterStatus : null 
        });
      } else if (isKTX) {
        response = await staffService.getKtxDashboard({ 
          limit: 10, 
          status: filterStatus !== 'all' ? filterStatus : null 
        });
      }

      if (response?.success && response?.data) {
        setStats(response.data.stats || {
          total: 0,
          processing: 0,
          approved: 0,
          rejected: 0
        });
        setRequests(response.data.recentRequests || []);
      }
    } catch (err) {
      console.error('Error fetching dashboard:', err);
      setError('Không thể tải dữ liệu dashboard. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  }, [isCTSV, isKTX, filterStatus]);

  // Initial fetch
  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  // Get status badge class
  const getStatusClass = (status) => {
    switch(status) {
      case 'processing': return 'status-processing';
      case 'approved': return 'status-approved';
      case 'rejected': return 'status-rejected';
      default: return 'status-default';
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="staff-dashboard">
        <div className="dashboard-loading">
          <div className="loading-spinner"></div>
          <p>Đang tải dữ liệu...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="staff-dashboard">
        <div className="dashboard-error">
          <div className="error-icon">⚠️</div>
          <p>{error}</p>
          <button onClick={fetchDashboard} className="retry-button">
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="staff-dashboard">
      {/* Header */}
      <div className="dashboard-header">
        <div>
          <h1 className="page-title">
            Dashboard {isCTSV ? 'CTSV' : 'KTX'}
          </h1>
          <p className="page-subtitle">
            Tổng quan và quản lý yêu cầu {isCTSV ? 'Công tác Sinh viên' : 'Ký túc xá'}
          </p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="kpi-cards-grid">
        <div className="kpi-card kpi-total">
          <div className="kpi-icon">📊</div>
          <div className="kpi-content">
            <h3 className="kpi-label">Tổng số yêu cầu</h3>
            <div className="kpi-value">{stats.total}</div>
          </div>
        </div>

        <div className="kpi-card kpi-processing">
          <div className="kpi-icon">⏳</div>
          <div className="kpi-content">
            <h3 className="kpi-label">Đang xử lý</h3>
            <div className="kpi-value">{stats.processing}</div>
          </div>
        </div>

        <div className="kpi-card kpi-approved">
          <div className="kpi-icon">✅</div>
          <div className="kpi-content">
            <h3 className="kpi-label">Đã hoàn thành</h3>
            <div className="kpi-value">{stats.approved}</div>
          </div>
        </div>

        <div className="kpi-card kpi-rejected">
          <div className="kpi-icon">❌</div>
          <div className="kpi-content">
            <h3 className="kpi-label">Đã từ chối</h3>
            <div className="kpi-value">{stats.rejected}</div>
          </div>
        </div>
      </div>

      {/* Requests Table */}
      <div className="table-section">
        <div className="table-header-row">
          <h3 className="table-title">
            Yêu cầu {isCTSV ? 'CTSV' : 'KTX'} gần đây
          </h3>
          <div className="table-filters">
            <SDCustomDropdown
              value={filterStatus}
              onChange={(value) => setFilterStatus(value)}
              options={[
                { value: 'all', label: 'Tất cả trạng thái' },
                { value: 'processing', label: 'Đang xử lý' },
                { value: 'approved', label: 'Đã hoàn thành' },
                { value: 'rejected', label: 'Đã từ chối' }
              ]}
              placeholder="Chọn trạng thái"
            />
          </div>
        </div>

        <div className="table-container">
          {requests.length === 0 ? (
            <div className="no-data">
              <div className="no-data-icon">📭</div>
              <p>Không có yêu cầu nào</p>
            </div>
          ) : (
            <>
              {/* Desktop Table */}
              <table className="requests-table desktop-table">
                <thead>
                  <tr>
                    <th>Mã YC</th>
                    <th>Sinh viên</th>
                    {isCTSV && (
                      <>
                        <th>Loại chứng nhận</th>
                        <th>Tên chứng nhận</th>
                      </>
                    )}
                    {isKTX && (
                      <>
                        <th>Danh mục</th>
                        <th>Thiết bị</th>
                        <th>Phòng</th>
                      </>
                    )}
                    <th>Ngày gửi</th>
                    <th>Trạng thái</th>
                  </tr>
                </thead>
                <tbody>
                  {requests.map((request) => (
                    <tr key={request._id || request.id} onClick={() => navigate('/staff/requests')}>
                      <td><strong className="request-id">{request.id}</strong></td>
                      <td>
                        <div>{request.student}</div>
                        <small className="student-id-text">({request.studentEmail})</small>
                      </td>
                      {isCTSV && (
                        <>
                          <td>{request.certificateType}</td>
                          <td>{request.certificateName}</td>
                        </>
                      )}
                      {isKTX && (
                        <>
                          <td>{request.category}</td>
                          <td>{request.item}</td>
                          <td>{request.room}</td>
                        </>
                      )}
                      <td>{request.submittedAt}</td>
                      <td>
                        <span className={`status-badge ${getStatusClass(request.status)}`}>
                          {STATUS_LABELS[request.status] || request.statusOriginal}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Mobile Cards */}
              <div className="mobile-cards">
                {requests.map((request) => (
                  <div 
                    key={request._id || request.id} 
                    className="mobile-request-card"
                    onClick={() => navigate('/staff/requests')}
                  >
                    <div className="mobile-card-header">
                      <span className="mobile-request-id">{request.id}</span>
                      <span className={`status-badge ${getStatusClass(request.status)}`}>
                        {STATUS_LABELS[request.status] || request.statusOriginal}
                      </span>
                    </div>
                    <div className="mobile-card-body">
                      <div className="mobile-info-row">
                        <span className="mobile-label">👤 Sinh viên:</span>
                        <span className="mobile-value">{request.student}</span>
                      </div>
                      <div className="mobile-info-row mobile-email">
                        <span className="mobile-value-small">{request.studentEmail}</span>
                      </div>
                      {isCTSV && (
                        <>
                          <div className="mobile-info-row">
                            <span className="mobile-label">📋 Loại:</span>
                            <span className="mobile-value">{request.certificateType}</span>
                          </div>
                          <div className="mobile-info-row">
                            <span className="mobile-label">📄 Tên:</span>
                            <span className="mobile-value">{request.certificateName}</span>
                          </div>
                        </>
                      )}
                      {isKTX && (
                        <>
                          <div className="mobile-info-row">
                            <span className="mobile-label">🔧 Danh mục:</span>
                            <span className="mobile-value">{request.category}</span>
                          </div>
                          <div className="mobile-info-row">
                            <span className="mobile-label">🛠️ Thiết bị:</span>
                            <span className="mobile-value">{request.item}</span>
                          </div>
                          <div className="mobile-info-row">
                            <span className="mobile-label">🏠 Phòng:</span>
                            <span className="mobile-value">{request.room}</span>
                          </div>
                        </>
                      )}
                      <div className="mobile-info-row">
                        <span className="mobile-label">📅 Ngày gửi:</span>
                        <span className="mobile-value">{request.submittedAt}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default StaffDashboard;
