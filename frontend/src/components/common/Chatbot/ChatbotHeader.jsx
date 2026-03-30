import React from 'react';
import './ChatbotHeader.css';

/**
 * ChatbotHeader - Header của cửa sổ chat
 * Hiển thị avatar, title, status và nút đóng
 */
const ChatbotHeader = ({ onClose, isTyping = false }) => {
  return (
    <header className="chatbot-header">
      <div className="chatbot-header-left">
        <div className="chatbot-avatar">
          <div className="chatbot-avatar-inner">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2a4 4 0 0 1 4 4v2a4 4 0 0 1-8 0V6a4 4 0 0 1 4-4z" />
              <path d="M6 10v1a6 6 0 0 0 12 0v-1" />
              <path d="M12 18v4" />
              <path d="M8 22h8" />
              <circle cx="9" cy="7" r="1" fill="currentColor" />
              <circle cx="15" cy="7" r="1" fill="currentColor" />
            </svg>
          </div>
          <span className="chatbot-status-dot" title="Online" />
        </div>
        <div className="chatbot-header-info">
          <h2 className="chatbot-title">UniHelper Bot</h2>
          <span className="chatbot-status">
            {isTyping ? (
              <>
                <span className="typing-text">Đang nhập</span>
                <span className="typing-dots">
                  <span>.</span><span>.</span><span>.</span>
                </span>
              </>
            ) : (
              '🟢 Luôn sẵn sàng hỗ trợ bạn'
            )}
          </span>
        </div>
      </div>
      <button 
        className="chatbot-close-btn" 
        onClick={onClose}
        aria-label="Đóng chatbot"
        title="Đóng"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </button>
    </header>
  );
};

export default ChatbotHeader;

