import React, { useState, useRef, useEffect } from 'react';
import './ChatbotInput.css';

/**
 * ChatbotInput - Khu vực nhập tin nhắn
 * Features:
 * - Auto-resize textarea
 * - Enter để gửi, Shift+Enter để xuống dòng
 * - Disabled state khi đang gửi
 */
const ChatbotInput = ({ onSend, disabled = false, placeholder = 'Nhập tin nhắn...' }) => {
  const [message, setMessage] = useState('');
  const textareaRef = useRef(null);

  // Auto resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  }, [message]);

  // Handle send message
  const handleSend = () => {
    const trimmedMessage = message.trim();
    if (trimmedMessage && !disabled) {
      onSend(trimmedMessage);
      setMessage('');
      // Reset textarea height
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    }
  };

  // Handle key press
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="chatbot-input">
      <div className="chatbot-input-container">
        <textarea
          ref={textareaRef}
          className="chatbot-input-field"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          rows={1}
          aria-label="Nhập tin nhắn"
        />
        <button
          className={`chatbot-send-btn ${message.trim() && !disabled ? 'active' : ''}`}
          onClick={handleSend}
          disabled={!message.trim() || disabled}
          aria-label="Gửi tin nhắn"
          title="Gửi"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="22" y1="2" x2="11" y2="13" />
            <polygon points="22 2 15 22 11 13 2 9 22 2" />
          </svg>
        </button>
      </div>
      <div className="chatbot-input-hint">
        <span>Nhấn Enter để gửi • Shift+Enter để xuống dòng</span>
      </div>
    </div>
  );
};

export default ChatbotInput;

