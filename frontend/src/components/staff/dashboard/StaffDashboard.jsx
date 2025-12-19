import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../../../services';
import { STAFF_TYPE_LABELS } from '../../../constants';
import './StaffDashboard.css';
import { CTSV_REQUESTS, TTX_REQUESTS } from '../mockData';

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

  // State for filter
  const [filterStatus, setFilterStatus] = useState('all');

  // Normalize status to one of 3 main statuses
  const normalizeStatus = (status) => {
    switch(status) {
      case 'approved':
      case 'assigned':
      case 'pending-confirmation':
        return 'approved';
      case 'rejected':
      case 'dropped':
        return 'rejected';
      case 'processing':
      case 'needs-update':
      case 'pending':
      default:
        return 'processing';
    }
  };

  // Get requests based on staff type
  const myRequests = useMemo(() => {
    return isCTSV ? CTSV_REQUESTS : (isKTX ? TTX_REQUESTS : []);
  }, [isCTSV, isKTX]);

  // Calculate statistics
  const stats = useMemo(() => {
    const total = myRequests.length;
    const processing = myRequests.filter((item) => normalizeStatus(item.status) === 'processing').length;
    const approved = myRequests.filter((item) => normalizeStatus(item.status) === 'approved').length;
    const rejected = myRequests.filter((item) => normalizeStatus(item.status) === 'rejected').length;

    return {
      total,
      processing,
      approved,
      rejected,
    };
  }, [myRequests]);

  // Filter requests by status
  const filteredRequests = useMemo(() => {
    if (filterStatus === 'all') return myRequests;
    return myRequests.filter(req => normalizeStatus(req.status) === filterStatus);
  }, [myRequests, filterStatus]);

  // Get status badge class
  const getStatusClass = (status) => {
    switch(status) {
      case 'processing': return 'status-processing';
      case 'approved': return 'status-approved';
      case 'needs-update': return 'status-needs-update';
      case 'rejected': return 'status-rejected';
      case 'pending-confirmation': return 'status-pending';
      case 'assigned': return 'status-assigned';
      default: return 'status-default';
    }
  };

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
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="filter-select"
            >
              <option value="all">Tất cả trạng thái</option>
              <option value="processing">Đang xử lý</option>
              <option value="approved">Đã hoàn thành</option>
              <option value="rejected">Đã từ chối</option>
            </select>
          </div>
        </div>

        <div className="table-container">
          {filteredRequests.length === 0 ? (
            <div className="no-data">
              <div className="no-data-icon">📭</div>
              <p>Không có yêu cầu nào</p>
            </div>
          ) : (
            <table className="requests-table">
              <thead>
                <tr>
                  <th>Mã YC</th>
                  <th>Sinh viên (MSSV)</th>
                  {isCTSV && (
                    <>
                      <th>Loại chứng nhận</th>
                      <th>Tên chứng nhận</th>
                    </>
                  )}
                  {isKTX && (
                    <>
                      <th>Loại yêu cầu</th>
                      <th>Tên yêu cầu</th>
                      <th>Phòng</th>
                    </>
                  )}
                  <th>Ngày gửi</th>
                  <th>Trạng thái</th>
                </tr>
              </thead>
              <tbody>
                {filteredRequests.map((request) => (
                  <tr key={request.id} onClick={() => navigate('/staff/requests')}>
                    <td><strong className="request-id">{request.id}</strong></td>
                    <td>{request.student}</td>
                    {isCTSV && (
                      <>
                        <td>{request.certificateType || 'Chứng nhận'}</td>
                        <td>{request.certificateName || request.type}</td>
                      </>
                    )}
                    {isKTX && (
                      <>
                        <td>{request.requestType || 'Yêu cầu KTX'}</td>
                        <td>{request.requestName || request.type}</td>
                        <td>{request.room || 'N/A'}</td>
                      </>
                    )}
                    <td>{request.submittedAt}</td>
                    <td>
                      <span className={`status-badge ${getStatusClass(normalizeStatus(request.status))}`}>
                        {STATUS_LABELS[normalizeStatus(request.status)]}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default StaffDashboard;
