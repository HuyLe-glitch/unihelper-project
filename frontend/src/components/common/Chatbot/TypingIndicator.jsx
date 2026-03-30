import React from 'react';
import './TypingIndicator.css';

/**
 * TypingIndicator - Hiển thị animation khi bot đang nhập
 */
const TypingIndicator = () => {
  return (
    <div className="typing-indicator-wrapper">
      <div className="typing-indicator-avatar">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 2a4 4 0 0 1 4 4v2a4 4 0 0 1-8 0V6a4 4 0 0 1 4-4z" />
          <path d="M6 10v1a6 6 0 0 0 12 0v-1" />
          <circle cx="9" cy="7" r="1" fill="currentColor" />
          <circle cx="15" cy="7" r="1" fill="currentColor" />
        </svg>
      </div>
      <div className="typing-indicator">
        <div className="typing-indicator-bubble">
          <span className="typing-dot"></span>
          <span className="typing-dot"></span>
          <span className="typing-dot"></span>
        </div>
        <span className="typing-text">Đang nhập...</span>
      </div>
    </div>
  );
};

export default TypingIndicator;

