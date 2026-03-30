import React from 'react';
import PropTypes from 'prop-types';

/**
 * ActivityLog Component - Hiển thị lịch sử hoạt động của Staff
 * 
 * Tracking mọi hoạt động của staff với yêu cầu (LƯU VÀO DATABASE)
 * Bao gồm: thêm/sửa/xóa file, cập nhật ghi chú, duyệt/từ chối
 * 
 * @param {Array} activityLog - Lịch sử hoạt động từ database
 */
const ActivityLog = ({ activityLog = [] }) => {
  // Sắp xếp theo thời gian mới nhất
  const sortedActivities = [...activityLog].sort(
    (a, b) => new Date(b.timestamp) - new Date(a.timestamp)
  );

  // Không có hoạt động nào
  if (sortedActivities.length === 0) {
    return (
      <div className="activity-log-empty">
        <span className="empty-icon">📋</span>
        <p>Chưa có hoạt động nào</p>
      </div>
    );
  }

  return (
    <div className="activity-log">
      <div className="activity-timeline">
        {sortedActivities.map((activity, index) => {
          const type = getActivityType(activity.action);
          const staffName = activity.staffId?.user?.name || 
                           activity.staffId?.staffType || 
                           activity.staff || 
                           'Staff';
          
          return (
            <div 
              key={activity._id || index} 
              className={`activity-item ${type}`}
            >
              <div className={`activity-dot ${type}`}>
                {getActivityIcon(activity.action)}
              </div>
              <div className="activity-content">
                <div className="activity-header">
                  <span className="activity-action">{getActionDescription(activity.action)}</span>
                  <span className={`activity-badge ${type}`}>
                    {getActivityBadge(activity.action)}
                  </span>
                </div>
                <div className="activity-meta">
                  <span className="activity-staff">
                    <span className="meta-icon">👤</span>
                    {staffName}
                  </span>
                  <span className="activity-time">
                    <span className="meta-icon">🕐</span>
                    {formatTimestamp(activity.timestamp)}
                  </span>
                </div>
                {activity.details && (
                  <div className="activity-details">
                    {activity.details}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// Helper functions
function getActivityType(action) {
  const types = {
    'ADD_FILE': 'add-file',
    'UPDATE_FILE': 'update-file',
    'DELETE_FILE': 'delete-file',
    'ADD_NOTE': 'add-note',
    'UPDATE_NOTE': 'update-note',
    'APPROVE': 'approve',
    'REJECT': 'reject'
  };
  return types[action] || 'update';
}

function getActionDescription(action) {
  const descriptions = {
    'ADD_FILE': 'Thêm file phản hồi',
    'UPDATE_FILE': 'Cập nhật file phản hồi',
    'DELETE_FILE': 'Xóa file phản hồi',
    'ADD_NOTE': 'Thêm ghi chú',
    'UPDATE_NOTE': 'Cập nhật ghi chú',
    'APPROVE': 'Duyệt yêu cầu',
    'REJECT': 'Từ chối yêu cầu'
  };
  return descriptions[action] || action;
}

function getActivityIcon(action) {
  const icons = {
    'ADD_FILE': '📎',
    'UPDATE_FILE': '📝',
    'DELETE_FILE': '🗑️',
    'ADD_NOTE': '💬',
    'UPDATE_NOTE': '✏️',
    'APPROVE': '✅',
    'REJECT': '❌'
  };
  return icons[action] || '📌';
}

function getActivityBadge(action) {
  const badges = {
    'ADD_FILE': 'Thêm file',
    'UPDATE_FILE': 'Cập nhật file',
    'DELETE_FILE': 'Xóa file',
    'ADD_NOTE': 'Thêm ghi chú',
    'UPDATE_NOTE': 'Sửa ghi chú',
    'APPROVE': 'Duyệt',
    'REJECT': 'Từ chối'
  };
  return badges[action] || 'Hoạt động';
}

function formatTimestamp(timestamp) {
  if (!timestamp) return '';
  return new Date(timestamp).toLocaleString('vi-VN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });
}

ActivityLog.propTypes = {
  activityLog: PropTypes.arrayOf(PropTypes.shape({
    _id: PropTypes.string,
    action: PropTypes.string.isRequired,
    staffId: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.shape({
        staffType: PropTypes.string,
        user: PropTypes.shape({
          name: PropTypes.string
        })
      })
    ]),
    staff: PropTypes.string,
    details: PropTypes.string,
    timestamp: PropTypes.oneOfType([PropTypes.string, PropTypes.instanceOf(Date)])
  }))
};

export default ActivityLog;
