import React from 'react';
import PropTypes from 'prop-types';

/**
 * DormitoryActivityLog Component - Hiển thị lịch sử hoạt động của Staff KTX
 * 
 * Tracking mọi hoạt động của staff với yêu cầu sửa chữa KTX
 * Bao gồm: tiếp nhận yêu cầu, hoàn thành, thêm ghi chú
 * 
 * @param {Array} activityLog - Lịch sử hoạt động từ database
 */
const DormitoryActivityLog = ({ activityLog = [] }) => {
  // Sắp xếp theo thời gian mới nhất
  const sortedActivities = [...activityLog].sort(
    (a, b) => new Date(b.timestamp) - new Date(a.timestamp)
  );

  // Không có hoạt động nào
  if (sortedActivities.length === 0) {
    return (
      <div className="dormitory-activity-empty">
        <span className="empty-icon">📋</span>
        <p>Chưa có hoạt động nào</p>
      </div>
    );
  }

  return (
    <div className="dormitory-activity-log">
      <div className="dormitory-activity-timeline">
        {sortedActivities.map((activity, index) => {
          const type = getActivityType(activity.action);
          // Hỗ trợ cả staffId và studentId
          const actorName = activity.studentId?.fullName ||
                           activity.staffId?.user?.name || 
                           activity.staffId?.staffType || 
                           activity.staff || 
                           (activity.action === 'STUDENT_CONFIRM' ? 'Sinh viên' : 'Staff');
          const actorRole = activity.studentId ? 'Sinh viên' : 'Staff';
          
          return (
            <div 
              key={activity._id || index} 
              className={`dormitory-activity-item ${type}`}
            >
              <div className={`dormitory-activity-dot ${type}`}>
                {getActivityIcon(activity.action)}
              </div>
              <div className="dormitory-activity-content">
                <div className="dormitory-activity-header">
                  <span className="dormitory-activity-action">{getActionDescription(activity.action)}</span>
                  <span className={`dormitory-activity-badge ${type}`}>
                    {getActivityBadge(activity.action)}
                  </span>
                </div>
                <div className="dormitory-activity-meta">
                  <span className="dormitory-activity-staff">
                    <span className="meta-icon">{activity.studentId ? '🎓' : '👤'}</span>
                    {actorRole}
                  </span>
                  <span className="dormitory-activity-time">
                    <span className="meta-icon">🕐</span>
                    {formatTimestamp(activity.timestamp)}
                  </span>
                </div>
                {activity.details && (
                  <div className="dormitory-activity-details">
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
    'ACCEPT': 'accept',
    'COMPLETE': 'complete',
    'ADD_NOTE': 'add-note',
    'UPDATE_NOTE': 'update-note',
    'STUDENT_CONFIRM': 'student-confirm'
  };
  return types[action] || 'update';
}

function getActionDescription(action) {
  const descriptions = {
    'ACCEPT': 'Tiếp nhận yêu cầu',
    'COMPLETE': 'Hoàn thành xử lý',
    'ADD_NOTE': 'Thêm ghi chú',
    'UPDATE_NOTE': 'Cập nhật ghi chú',
    'STUDENT_CONFIRM': 'Xác nhận hoàn thành'
  };
  return descriptions[action] || action;
}

function getActivityIcon(action) {
  const icons = {
    'ACCEPT': '📥',
    'COMPLETE': '✅',
    'ADD_NOTE': '💬',
    'UPDATE_NOTE': '✏️',
    'STUDENT_CONFIRM': '✔️'
  };
  return icons[action] || '📌';
}

function getActivityBadge(action) {
  const badges = {
    'ACCEPT': 'Tiếp nhận',
    'COMPLETE': 'Hoàn thành',
    'ADD_NOTE': 'Ghi chú',
    'UPDATE_NOTE': 'Sửa ghi chú',
    'STUDENT_CONFIRM': 'SV xác nhận'
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

DormitoryActivityLog.propTypes = {
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

export default DormitoryActivityLog;
