import React, { useEffect, useRef } from 'react';
import ChatbotMessage from './ChatbotMessage';
import TypingIndicator from './TypingIndicator';
import './ChatbotMessages.css';

/**
 * ChatbotMessages - Container chứa danh sách tin nhắn
 * Features:
 * - Auto scroll to bottom khi có tin nhắn mới
 * - Hiển thị typing indicator khi bot đang trả lời
 */
const ChatbotMessages = ({ messages = [], isTyping = false }) => {
  const messagesEndRef = useRef(null);
  const containerRef = useRef(null);

  // Auto scroll to bottom when new message arrives
  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  return (
    <div 
      className="chatbot-messages" 
      ref={containerRef}
      role="log" 
      aria-live="polite" 
      aria-label="Tin nhắn"
    >
      <div className="chatbot-messages-inner">
        {messages.map((message, index) => (
          <ChatbotMessage
            key={message.id || index}
            type={message.type}
            content={message.content}
            timestamp={message.timestamp}
          >
            {message.customContent}
          </ChatbotMessage>
        ))}
        
        {isTyping && <TypingIndicator />}
        
        <div ref={messagesEndRef} className="messages-end-anchor" />
      </div>
    </div>
  );
};

export default ChatbotMessages;

