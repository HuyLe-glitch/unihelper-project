import React, { useState, useCallback, useEffect } from 'react';
import ChatbotToggle from './ChatbotToggle';
import ChatbotWindow from './ChatbotWindow';
import StatusCard from './StatusCard';
import { useAuth } from '../../../hooks/useAuth';
import { chatbotService } from '../../../services/chatbot';

/**
 * Chatbot - Component tổng hợp chatbot
 * Quản lý state và logic của chatbot
 */
const Chatbot = () => {
  const { user, isAuthenticated } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const [quickReplies, setQuickReplies] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  // Welcome message khi mở chatbot lần đầu
  const getWelcomeMessage = useCallback(() => {
    const userName = user?.name || 'bạn';
    return {
      id: 'welcome',
      type: 'bot',
      content: `
        <div class="info-card">
          <div class="info-card-title">👋 Xin chào ${userName}!</div>
          <div class="info-card-content">
            Mình là <strong>UniHelper Bot</strong> - trợ lý ảo của bạn.<br/><br/>
            Mình có thể giúp bạn:
            <ul style="margin: 8px 0; padding-left: 20px;">
              <li>🏠 Hỏi đáp thông tin về KTX</li>
              <li>📄 Hướng dẫn xin giấy tờ, chứng chỉ</li>
              <li>📋 Kiểm tra trạng thái yêu cầu</li>
              <li>❓ Trả lời các câu hỏi thường gặp</li>
            </ul>
            Bạn cần hỗ trợ gì?
          </div>
        </div>
      `,
      timestamp: new Date().toISOString()
    };
  }, [user]);

  // Initialize với welcome message khi mở lần đầu
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setMessages([getWelcomeMessage()]);
      setQuickReplies([
        { id: 'ktx', icon: '🏠', label: 'KTX', action: 'ktx_info' },
        { id: 'giayto', icon: '📄', label: 'Giấy tờ', action: 'document_info' },
        { id: 'trangthai', icon: '📋', label: 'Trạng thái', action: 'check_status' },
        { id: 'faq', icon: '❓', label: 'Hỏi đáp', action: 'faq' },
        { id: 'lienhe', icon: '📞', label: 'Liên hệ', action: 'contact' }
      ]);
    }
  }, [isOpen, messages.length, getWelcomeMessage]);

  // Reset unread count khi mở chat
  useEffect(() => {
    if (isOpen) {
      setUnreadCount(0);
    }
  }, [isOpen]);

  // Toggle chatbot
  const handleToggle = () => {
    setIsOpen(!isOpen);
  };

  // Close chatbot
  const handleClose = () => {
    setIsOpen(false);
  };

  // Send message
  const handleSendMessage = useCallback(async (text) => {
    if (!text.trim()) return;

    // Add user message
    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: text,
      timestamp: new Date().toISOString()
    };
    setMessages(prev => [...prev, userMessage]);
    setQuickReplies([]);
    setIsTyping(true);

    try {
      // Call chatbot API
      const response = await chatbotService.sendMessage(text);
      
      // Simulate typing delay for better UX
      await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 500));

      // Add bot response
      const botMessage = {
        id: Date.now() + 1,
        type: 'bot',
        content: response.message,
        timestamp: new Date().toISOString(),
        customContent: response.statusCard ? (
          <StatusCard type={response.statusCard.type} data={response.statusCard.data} />
        ) : null
      };
      setMessages(prev => [...prev, botMessage]);

      // Update quick replies if provided
      if (response.quickReplies) {
        setQuickReplies(response.quickReplies);
      }

      // Update unread count if chat is closed
      if (!isOpen) {
        setUnreadCount(prev => prev + 1);
      }
    } catch (error) {
      console.error('Chatbot error:', error);
      
      // Add error message
      const errorMessage = {
        id: Date.now() + 1,
        type: 'bot',
        content: `
          <div class="highlight-box">
            <span class="highlight-box-icon">⚠️</span>
            <div>
              <strong>Xin lỗi, có lỗi xảy ra!</strong><br/>
              Vui lòng thử lại sau hoặc liên hệ hotline: <strong>028 1234 5678</strong>
            </div>
          </div>
        `,
        timestamp: new Date().toISOString()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  }, [isOpen]);

  // Handle quick reply selection
  const handleQuickReplySelect = useCallback(async (reply) => {
    // Map quick reply actions to messages
    const actionMessages = {
      'ktx_info': 'Tôi muốn biết thông tin về KTX',
      'document_info': 'Tôi muốn xin giấy tờ',
      'check_status': 'Kiểm tra trạng thái yêu cầu của tôi',
      'faq': 'Tôi có câu hỏi cần hỏi đáp',
      'contact': 'Thông tin liên hệ phòng CTSV'
    };

    const message = actionMessages[reply.action] || reply.label;
    await handleSendMessage(message);
  }, [handleSendMessage]);

  // Chỉ hiển thị chatbot khi đã đăng nhập
  if (!isAuthenticated) {
    return null;
  }

  return (
    <>
      <ChatbotToggle 
        isOpen={isOpen} 
        onClick={handleToggle}
        unreadCount={unreadCount}
      />
      <ChatbotWindow
        isOpen={isOpen}
        onClose={handleClose}
        messages={messages}
        isTyping={isTyping}
        quickReplies={quickReplies}
        onSendMessage={handleSendMessage}
        onQuickReplySelect={handleQuickReplySelect}
      />
    </>
  );
};

export default Chatbot;

