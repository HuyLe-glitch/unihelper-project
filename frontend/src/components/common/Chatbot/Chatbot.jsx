import React, { useState, useCallback, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import ChatbotToggle from './ChatbotToggle';
import ChatbotWindow from './ChatbotWindow';
import StatusCard from './StatusCard';
import { useAuthContext } from '../../../contexts/AuthContext';
import { chatbotService } from '../../../services/chatbot';

/**
 * Chatbot - Component tổng hợp chatbot
 * Quản lý state và logic của chatbot
 */
const Chatbot = () => {
  const { user, isAuthenticated, loading } = useAuthContext();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const [quickReplies, setQuickReplies] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  
  // Các trang không hiển thị chatbot (login, role selector, etc.)
  const excludedPaths = ['/', '/login', '/student/login', '/staff/login', '/admin/login'];
  const isExcludedPage = excludedPaths.includes(location.pathname) || 
                          location.pathname.includes('/login');

  // Welcome message khi mở chatbot lần đầu
  const getWelcomeMessage = useCallback(() => {
    const userName = user?.name || 'bạn';
    return {
      id: 'welcome',
      type: 'bot',
      content: `<div class="welcome-message"><div class="welcome-title">👋 Xin chào ${userName}!</div><p>Mình là <strong>UniHelper Bot</strong> - trợ lý ảo hỗ trợ sinh viên.</p><p>Mình có thể giúp bạn:</p><ul><li>📄 Tư vấn & tạo yêu cầu giấy tờ chứng nhận CTSV(công tác sinh viên</li><li>🔧 Báo cáo sự cố thiết bị KTX(Ký túc xá)</li><li>📋 Theo dõi và cho bạn biết trạng thái các yêu cầu của bạn</li></ul><p>Bạn cần hỗ trợ gì?</p></div>`,
      timestamp: new Date().toISOString()
    };
  }, [user]);

  // Initialize với welcome message khi mở lần đầu
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setMessages([getWelcomeMessage()]);
      setQuickReplies([
        { id: 'lienhe', icon: '📞', label: 'Thông tin liên hệ', action: 'contact' },
        { id: 'huongdan', icon: '📖', label: 'Hướng dẫn sử dụng', action: 'user_guide' }
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

  // Send message with custom display text
  const handleSendMessageWithDisplay = useCallback(async (text, displayText = null) => {
    if (!text.trim()) return;

    // Add user message - hiển thị displayText thay vì action code
    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: displayText || text,
      timestamp: new Date().toISOString()
    };
    setMessages(prev => [...prev, userMessage]);
    setQuickReplies([]);
    setIsTyping(true);

    try {
      // Call chatbot API với text gốc (có thể là action code)
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
      console.error('Error sending message:', error);
      const errorMessage = {
        id: Date.now() + 1,
        type: 'bot',
        content: `<div class="highlight-box"><span class="highlight-box-icon">⚠️</span><div>Xin lỗi, có lỗi xảy ra. Vui lòng thử lại.</div></div>`,
        timestamp: new Date().toISOString()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  }, [isOpen]);

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
      'check_ktx_status': 'Kiểm tra trạng thái báo cáo sự cố',
      'check_document_status': 'Kiểm tra trạng thái yêu cầu giấy tờ',
      'faq': 'Tôi có câu hỏi cần hỏi đáp',
      'contact': 'Thông tin liên hệ',
      'main_menu': 'Menu chính',
      'user_guide': 'Hướng dẫn sử dụng',
      // Luồng tư vấn
      'document_advice': 'Tôi cần tư vấn về giấy tờ',
      'advice_tax': 'Tôi cần giấy giảm trừ gia cảnh',
      'advice_military': 'Tôi cần giấy tạm hoãn nghĩa vụ quân sự',
      'advice_policy': 'Tôi cần giấy hưởng chế độ chính sách',
      'advice_job': 'Tôi cần giấy xin việc làm',
      'advice_card': 'Tôi cần làm thẻ sinh viên',
      // Luồng tạo yêu cầu
      'create_from_advice': 'Tạo luôn yêu cầu này cho tôi',
      'create_document_request': 'Tôi muốn tạo yêu cầu chứng nhận',
      'confirm_request': 'Xác nhận tạo yêu cầu',
      'cancel_request': 'Hủy tạo yêu cầu'
    };

    // Xử lý action select_type_xxx và select_name_xxx
    let message = actionMessages[reply.action] || reply.label;
    let displayMessage = reply.label; // Text hiển thị trong chat
    
    // Nếu action bắt đầu bằng select_type_ hoặc select_name_, gửi đặc biệt
    if (reply.action?.startsWith('select_type_')) {
      const typeId = reply.action.replace('select_type_', '');
      message = `__SELECT_TYPE__${typeId}__${reply.label}`;
      displayMessage = reply.label;
    } else if (reply.action?.startsWith('select_name_')) {
      const nameId = reply.action.replace('select_name_', '');
      message = `__SELECT_NAME__${nameId}__${reply.label}`;
      displayMessage = reply.label;
    } else if (reply.action?.startsWith('select_equipment_')) {
      // KTX: Chọn thiết bị - gửi action code trực tiếp
      message = reply.action;
      displayMessage = reply.label;
    } else if (reply.action?.startsWith('select_category_')) {
      // KTX: Chọn danh mục - gửi action code trực tiếp
      message = reply.action;
      displayMessage = reply.label;
    } else if (reply.action?.startsWith('select_certificate_')) {
      // CTSV: Chọn giấy từ danh sách loại (mappingType = 'type')
      const certId = reply.action.replace('select_certificate_', '');
      message = `__SELECT_CERT_FROM_TYPE__${certId}__${reply.label}`;
      displayMessage = reply.label;
    } else if (reply.action === 'create_from_advice') {
      // Action tạo yêu cầu từ tư vấn - gửi action code
      message = '__ACTION__create_from_advice';
      displayMessage = 'Tạo luôn yêu cầu cho tôi';
    } else if (reply.action === 'create_ktx_from_advice') {
      // KTX: Action tạo yêu cầu báo sự cố - gửi action code
      message = 'create_ktx_from_advice';
      displayMessage = 'Tạo yêu cầu';
    } else if (reply.action === 'confirm_ktx_request') {
      // KTX: Xác nhận gửi báo cáo
      message = 'confirm_ktx_request';
      displayMessage = 'Xác nhận gửi';
    } else if (reply.action === 'cancel_ktx_request') {
      // KTX: Hủy báo cáo
      message = 'cancel_ktx_request';
      displayMessage = 'Hủy';
    } else if (reply.action === 'ktx_report') {
      // KTX: Quay lại báo sự cố từ đầu
      message = 'ktx_report';
      displayMessage = reply.label;
    } else if (reply.action === 'confirm_request') {
      // Action xác nhận tạo yêu cầu
      message = '__ACTION__confirm_request';
      displayMessage = 'Xác nhận tạo';
    } else if (reply.action === 'cancel_request') {
      // Action hủy tạo yêu cầu
      message = '__ACTION__cancel_request';
      displayMessage = 'Hủy';
    } else {
      displayMessage = actionMessages[reply.action] || reply.label;
    }

    // Gửi message với displayMessage cho user, nhưng gửi message code đến server
    await handleSendMessageWithDisplay(message, displayMessage);
  }, [handleSendMessage]);

  // Chờ loading hoàn thành trước khi quyết định hiển thị
  // Chỉ hiển thị chatbot cho SINH VIÊN đã đăng nhập (không hiển thị cho admin/staff/guest)
  // VÀ không hiển thị ở trang login/role selector
  
  // Debug log
  console.log('🤖 Chatbot check:', { loading, isAuthenticated, user, role: user?.role, path: location.pathname, isExcludedPage });
  
  // Không hiển thị ở trang login/role selector
  if (isExcludedPage) {
    console.log('🤖 Chatbot: Excluded page, returning null');
    return null;
  }
  
  if (loading) {
    console.log('🤖 Chatbot: Still loading, returning null');
    return null; // Đang loading, chưa biết role
  }
  
  // Kiểm tra chặt: phải đăng nhập VÀ có user VÀ role là student (bất kể viết hoa/thường)
  // VÀ phải đang ở trang student (path bắt đầu với /student)
  const userRole = user?.role?.toLowerCase();
  const isStudent = user && userRole === 'student';
  const isStudentPage = location.pathname.startsWith('/student');
  
  console.log('🤖 Chatbot decision:', { userRole, isStudent, isStudentPage, willRender: isAuthenticated && user && isStudent && isStudentPage });
  
  if (!isAuthenticated || !user || !isStudent || !isStudentPage) {
    console.log('🤖 Chatbot: Not authorized or not on student page, returning null');
    return null; // Không hiển thị chatbot
  }
  
  console.log('🤖 Chatbot: Will render!');

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

