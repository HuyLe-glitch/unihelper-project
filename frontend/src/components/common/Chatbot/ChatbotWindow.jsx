import React, { useState, useEffect, useCallback } from 'react';
import ChatbotHeader from './ChatbotHeader';
import ChatbotMessages from './ChatbotMessages';
import ChatbotInput from './ChatbotInput';
import QuickReplies from './QuickReplies';
import './ChatbotWindow.css';

/**
 * ChatbotWindow - Cửa sổ chat chính
 * Features:
 * - Responsive design (desktop, tablet, mobile)
 * - Keyboard navigation (Escape to close)
 * - Animation on open/close
 */
const ChatbotWindow = ({ 
  isOpen, 
  onClose, 
  messages = [], 
  isTyping = false,
  quickReplies = [],
  onSendMessage,
  onQuickReplySelect 
}) => {
  const [isClosing, setIsClosing] = useState(false);

  // Handle close with animation
  const handleClose = useCallback(() => {
    setIsClosing(true);
    setTimeout(() => {
      setIsClosing(false);
      onClose();
    }, 250);
  }, [onClose]);

  // Handle Escape key to close
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        handleClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, handleClose]);

  // Prevent body scroll when chat is open on mobile
  useEffect(() => {
    if (isOpen && window.innerWidth < 768) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen && !isClosing) return null;

  return (
    <div 
      className={`chatbot-window ${isClosing ? 'closing' : 'opening'}`}
      role="dialog"
      aria-labelledby="chatbot-title"
      aria-modal="true"
    >
      <ChatbotHeader onClose={handleClose} isTyping={isTyping} />
      
      <ChatbotMessages messages={messages} isTyping={isTyping} />
      
      {quickReplies.length > 0 && !isTyping && (
        <QuickReplies 
          replies={quickReplies} 
          onSelect={onQuickReplySelect} 
        />
      )}
      
      <ChatbotInput 
        onSend={onSendMessage} 
        disabled={isTyping}
        placeholder="Nhập tin nhắn..."
      />
    </div>
  );
};

export default ChatbotWindow;

