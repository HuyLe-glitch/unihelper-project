import React from 'react';
import './QuickReplies.css';

/**
 * QuickReplies - Các nút gợi ý nhanh cho người dùng
 * @param {Array} replies - Danh sách các quick reply
 * @param {Function} onSelect - Callback khi chọn một reply
 */
const QuickReplies = ({ replies = [], onSelect }) => {
  if (!replies || replies.length === 0) return null;

  // Default quick replies
  const defaultReplies = [
    { id: 'ktx', icon: '🏠', label: 'KTX', action: 'ktx_info' },
    { id: 'giayto', icon: '📄', label: 'Giấy tờ', action: 'document_info' },
    { id: 'trangthai', icon: '📋', label: 'Trạng thái', action: 'check_status' },
    { id: 'faq', icon: '❓', label: 'Hỏi đáp', action: 'faq' },
    { id: 'lienhe', icon: '📞', label: 'Liên hệ', action: 'contact' }
  ];

  const displayReplies = replies.length > 0 ? replies : defaultReplies;

  return (
    <div className="quick-replies">
      <div className="quick-replies-container">
        {displayReplies.map((reply) => (
          <button
            key={reply.id}
            className="quick-reply-btn"
            onClick={() => onSelect(reply)}
            aria-label={reply.label}
          >
            {reply.icon && <span className="quick-reply-icon">{reply.icon}</span>}
            <span className="quick-reply-label">{reply.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default QuickReplies;

