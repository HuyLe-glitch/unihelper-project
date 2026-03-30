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
    // ========== CTSV Status (Vietnamese) ==========
    'ĐANG XỬ LÝ': { emoji: '🔵', label: 'Đang xử lý', className: 'status-processing' },
    'HỢP LỆ': { emoji: '🟢', label: 'Hợp lệ', className: 'status-approved' },
    'KHÔNG HỢP LỆ': { emoji: '🔴', label: 'Không hợp lệ', className: 'status-rejected' },
    'ĐÃ HỦY': { emoji: '⚫', label: 'Đã hủy', className: 'status-cancelled' },
    
    // ========== KTX Status (English) ==========
    'Pending': { emoji: '🟡', label: 'Chờ tiếp nhận', className: 'status-pending' },
    'Under Review': { emoji: '🔵', label: 'Đang xử lý', className: 'status-processing' },
    'Approved': { emoji: '🟢', label: 'Hoàn thành', className: 'status-approved' },
    'Rejected': { emoji: '🔴', label: 'Từ chối', className: 'status-rejected' },
    
    // ========== Vietnamese alternatives ==========
    'Chờ tiếp nhận': { emoji: '🟡', label: 'Chờ tiếp nhận', className: 'status-pending' },
    'Đang xử lý': { emoji: '🔵', label: 'Đang xử lý', className: 'status-processing' },
    'Hoàn thành': { emoji: '🟢', label: 'Hoàn thành', className: 'status-approved' },
    'Từ chối': { emoji: '🔴', label: 'Từ chối', className: 'status-rejected' },
    
    // ========== Legacy uppercase status ==========
    'PENDING': { emoji: '🟡', label: 'Chờ tiếp nhận', className: 'status-pending' },
    'CHO_XU_LY': { emoji: '🟡', label: 'Chờ tiếp nhận', className: 'status-pending' },
    'PROCESSING': { emoji: '🔵', label: 'Đang xử lý', className: 'status-processing' },
    'DANG_XU_LY': { emoji: '🔵', label: 'Đang xử lý', className: 'status-processing' },
    'APPROVED': { emoji: '🟢', label: 'Hoàn thành', className: 'status-approved' },
    'DA_DUYET': { emoji: '🟢', label: 'Hoàn thành', className: 'status-approved' },
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
            <span className="status-card-label">Loại chứng nhận</span>
            <span className="status-card-value">{data.certificateType}</span>
          </div>
        )}

        {data.certificateName && (
          <div className="status-card-row">
            <span className="status-card-label">Tên giấy tờ</span>
            <span className="status-card-value">{data.certificateName}</span>
          </div>
        )}

        {/* KTX - Danh mục và thiết bị */}
        {data.equipmentCategory && (
          <div className="status-card-row">
            <span className="status-card-label">Danh mục</span>
            <span className="status-card-value">{data.equipmentCategory}</span>
          </div>
        )}

        {data.equipmentName && (
          <div className="status-card-row">
            <span className="status-card-label">Thiết bị</span>
            <span className="status-card-value">{data.equipmentName}</span>
          </div>
        )}

        {data.description && (
          <div className="status-card-row">
            <span className="status-card-label">Mô tả</span>
            <span className="status-card-value">{data.description}</span>
          </div>
        )}
        
        <div className="status-card-row highlight">
          <span className="status-card-label">Trạng thái</span>
          <span className={`status-badge ${status.className}`}>
            {status.emoji} {status.label}
          </span>
        </div>

        {/* Thời gian phản hồi - chỉ hiển thị khi đã xử lý xong (HỢP LỆ/KHÔNG HỢP LỆ) */}
        {data.responseTime && (data.status === 'HỢP LỆ' || data.status === 'KHÔNG HỢP LỆ') && (
          <div className="status-card-row">
            <span className="status-card-label">Phản hồi lúc</span>
            <span className="status-card-value">{formatDate(data.responseTime)}</span>
          </div>
        )}
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

