import React from 'react';
import './StatusCard.css';

/**
 * StatusCard - Card hiển thị trạng thái yêu cầu
 * @param {Object} props
 * @param {string} props.type - 'ktx' | 'ctsv' | 'certificate'
 * @param {Object} props.data - Dữ liệu yêu cầu
 */
const StatusCard = ({ type = 'ktx', data }) => {
  if (!data) return null;

  // Status configuration
  const statusConfig = {
    'PENDING': { emoji: '🟡', label: 'Chờ xử lý', className: 'status-pending' },
    'CHO_XU_LY': { emoji: '🟡', label: 'Chờ xử lý', className: 'status-pending' },
    'PROCESSING': { emoji: '🔵', label: 'Đang xử lý', className: 'status-processing' },
    'DANG_XU_LY': { emoji: '🔵', label: 'Đang xử lý', className: 'status-processing' },
    'APPROVED': { emoji: '🟢', label: 'Đã duyệt', className: 'status-approved' },
    'DA_DUYET': { emoji: '🟢', label: 'Đã duyệt', className: 'status-approved' },
    'REJECTED': { emoji: '🔴', label: 'Từ chối', className: 'status-rejected' },
    'TU_CHOI': { emoji: '🔴', label: 'Từ chối', className: 'status-rejected' },
    'COMPLETED': { emoji: '✅', label: 'Hoàn thành', className: 'status-completed' },
    'HOAN_THANH': { emoji: '✅', label: 'Hoàn thành', className: 'status-completed' },
    'CANCELLED': { emoji: '⚫', label: 'Đã hủy', className: 'status-cancelled' },
    'DA_HUY': { emoji: '⚫', label: 'Đã hủy', className: 'status-cancelled' }
  };

  const status = statusConfig[data.status] || statusConfig['PENDING'];

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  // Type configuration
  const typeConfig = {
    ktx: { title: 'TRẠNG THÁI YÊU CẦU KTX', icon: '🏠' },
    ctsv: { title: 'TRẠNG THÁI YÊU CẦU CTSV', icon: '📄' },
    certificate: { title: 'TRẠNG THÁI YÊU CẦU GIẤY TỜ', icon: '📋' }
  };

  const typeInfo = typeConfig[type] || typeConfig.ktx;

  return (
    <div className="status-card">
      <div className="status-card-header">
        <span className="status-card-icon">{typeInfo.icon}</span>
        <span className="status-card-title">{typeInfo.title}</span>
      </div>
      
      <div className="status-card-body">
        <div className="status-card-row">
          <span className="status-card-label">Mã yêu cầu</span>
          <span className="status-card-value code">{data.requestCode || data.code || 'N/A'}</span>
        </div>
        
        <div className="status-card-row">
          <span className="status-card-label">Ngày tạo</span>
          <span className="status-card-value">{formatDate(data.createdAt)}</span>
        </div>
        
        {data.semester && (
          <div className="status-card-row">
            <span className="status-card-label">Học kỳ</span>
            <span className="status-card-value">{data.semester}</span>
          </div>
        )}
        
        {data.roomType && (
          <div className="status-card-row">
            <span className="status-card-label">Loại phòng</span>
            <span className="status-card-value">{data.roomType}</span>
          </div>
        )}

        {data.certificateType && (
          <div className="status-card-row">
            <span className="status-card-label">Loại giấy tờ</span>
            <span className="status-card-value">{data.certificateType}</span>
          </div>
        )}

        {data.quantity && (
          <div className="status-card-row">
            <span className="status-card-label">Số lượng</span>
            <span className="status-card-value">{data.quantity}</span>
          </div>
        )}
        
        <div className="status-card-row highlight">
          <span className="status-card-label">Trạng thái</span>
          <span className={`status-badge ${status.className}`}>
            {status.emoji} {status.label}
          </span>
        </div>
      </div>
      
      {data.estimatedTime && (
        <div className="status-card-footer">
          <span className="status-card-estimate">
            ⏱️ Dự kiến xử lý: {data.estimatedTime}
          </span>
        </div>
      )}

      {data.reason && (
        <div className="status-card-reason">
          <span className="reason-label">📝 Lý do:</span>
          <span className="reason-text">{data.reason}</span>
        </div>
      )}
    </div>
  );
};

export default StatusCard;

