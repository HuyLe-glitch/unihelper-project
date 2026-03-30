import React from 'react';
import './ChatbotMessage.css';

/**
 * ChatbotMessage - Component hiển thị một tin nhắn
 * @param {Object} props
 * @param {string} props.type - 'bot' | 'user'
 * @param {string} props.content - Nội dung tin nhắn (có thể là HTML)
 * @param {string} props.timestamp - Thời gian gửi
 * @param {React.ReactNode} props.children - Custom content (StatusCard, etc.)
 */
const ChatbotMessage = ({ type = 'bot', content, timestamp, children }) => {
  const isBot = type === 'bot';

  // Format timestamp
  const formatTime = (ts) => {
    if (!ts) return '';
    const date = new Date(ts);
    return date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className={`chatbot-message ${isBot ? 'bot' : 'user'}`}>
      {isBot && (
        <div className="chatbot-message-avatar">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2a4 4 0 0 1 4 4v2a4 4 0 0 1-8 0V6a4 4 0 0 1 4-4z" />
            <path d="M6 10v1a6 6 0 0 0 12 0v-1" />
            <circle cx="9" cy="7" r="1" fill="currentColor" />
            <circle cx="15" cy="7" r="1" fill="currentColor" />
          </svg>
        </div>
      )}
      <div className="chatbot-message-content">
        <div className="chatbot-message-bubble" role="article" aria-label={`Tin nhắn từ ${isBot ? 'bot' : 'bạn'}`}>
          {children || (
            <div 
              className="chatbot-message-text"
              dangerouslySetInnerHTML={{ __html: content }}
            />
          )}
        </div>
        {timestamp && (
          <span className="chatbot-message-time">{formatTime(timestamp)}</span>
        )}
      </div>
      {!isBot && (
        <div className="chatbot-message-avatar user-avatar">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
          </svg>
        </div>
      )}
    </div>
  );
};

export default ChatbotMessage;

