/**
 * Chatbot Service - Frontend API calls
 * Xử lý tất cả các API calls liên quan đến chatbot
 */
import { apiClient } from './api';

// FAQ responses (fallback khi không có backend)
const FAQ_RESPONSES = {
  'gio_lam_viec': {
    message: `
      <div class="info-card">
        <div class="info-card-title">🕐 GIỜ LÀM VIỆC PHÒNG CTSV</div>
        <div class="info-card-content">
          📅 <strong>Thứ 2 - Thứ 6:</strong> 7:30 - 17:00<br/>
          📅 <strong>Thứ 7:</strong> 7:30 - 11:30<br/>
          🚫 <strong>Chủ nhật:</strong> Nghỉ<br/><br/>
          📍 <strong>Địa chỉ:</strong> Tòa A, Tầng 1
        </div>
      </div>
    `,
    quickReplies: [
      { id: 'lienhe', icon: '📞', label: 'Liên hệ', action: 'contact' },
      { id: 'quaylai', icon: '🔙', label: 'Quay lại', action: 'main_menu' }
    ]
  },
  'lien_he': {
    message: `
      <div class="info-card">
        <div class="info-card-title">📞 THÔNG TIN LIÊN HỆ</div>
        <div class="info-card-content">
          <strong>Phòng Công tác Sinh viên</strong><br/><br/>
          📍 <strong>Địa chỉ:</strong> Tòa A, Tầng 1<br/>
          📞 <strong>Hotline:</strong> 028 1234 5678<br/>
          📧 <strong>Email:</strong> ctsv@university.edu.vn<br/>
          🌐 <strong>Website:</strong> ctsv.university.edu.vn
        </div>
      </div>
    `,
    quickReplies: [
      { id: 'giolam', icon: '🕐', label: 'Giờ làm việc', action: 'working_hours' },
      { id: 'quaylai', icon: '🔙', label: 'Quay lại', action: 'main_menu' }
    ]
  },
  'ktx_info': {
    message: `
      <div class="info-card">
        <div class="info-card-title">🏠 THÔNG TIN KÝ TÚC XÁ</div>
        <div class="info-card-content">
          <strong>Các loại phòng:</strong>
          <ul style="margin: 8px 0; padding-left: 20px;">
            <li>Phòng 4 người: 1.200.000 VNĐ/tháng</li>
            <li>Phòng 6 người: 900.000 VNĐ/tháng</li>
            <li>Phòng 8 người: 700.000 VNĐ/tháng</li>
          </ul>
          <strong>Điều kiện đăng ký:</strong>
          <ul style="margin: 8px 0; padding-left: 20px;">
            <li>✅ Sinh viên đang học tại trường</li>
            <li>✅ Không vi phạm nội quy KTX</li>
          </ul>
        </div>
      </div>
    `,
    quickReplies: [
      { id: 'dangky', icon: '📝', label: 'Đăng ký KTX', action: 'ktx_register' },
      { id: 'trangthai', icon: '📋', label: 'Kiểm tra yêu cầu', action: 'check_ktx_status' },
      { id: 'quaylai', icon: '🔙', label: 'Quay lại', action: 'main_menu' }
    ]
  },
  'ktx_register': {
    message: `
      <div class="info-card">
        <div class="info-card-title">📝 HƯỚNG DẪN ĐĂNG KÝ KTX</div>
        <div class="info-card-content">
          <ol class="step-list" style="margin: 0; padding: 0; list-style: none;">
            <li style="display: flex; align-items: flex-start; gap: 10px; margin: 8px 0; padding: 10px 12px; background: rgba(102, 126, 234, 0.05); border-radius: 10px;">
              <span style="width: 24px; height: 24px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 700; flex-shrink: 0;">1</span>
              <span>Đăng nhập vào UniHelper</span>
            </li>
            <li style="display: flex; align-items: flex-start; gap: 10px; margin: 8px 0; padding: 10px 12px; background: rgba(102, 126, 234, 0.05); border-radius: 10px;">
              <span style="width: 24px; height: 24px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 700; flex-shrink: 0;">2</span>
              <span>Vào mục "Yêu cầu KTX"</span>
            </li>
            <li style="display: flex; align-items: flex-start; gap: 10px; margin: 8px 0; padding: 10px 12px; background: rgba(102, 126, 234, 0.05); border-radius: 10px;">
              <span style="width: 24px; height: 24px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 700; flex-shrink: 0;">3</span>
              <span>Click "Tạo yêu cầu mới"</span>
            </li>
            <li style="display: flex; align-items: flex-start; gap: 10px; margin: 8px 0; padding: 10px 12px; background: rgba(102, 126, 234, 0.05); border-radius: 10px;">
              <span style="width: 24px; height: 24px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 700; flex-shrink: 0;">4</span>
              <span>Điền thông tin và gửi yêu cầu</span>
            </li>
          </ol>
          <div class="highlight-box" style="background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%); border-radius: 10px; padding: 12px 14px; margin-top: 12px; font-size: 13px; color: #92400e; display: flex; align-items: flex-start; gap: 10px;">
            <span>⏱️</span>
            <span><strong>Thời gian xử lý:</strong> 3-5 ngày làm việc</span>
          </div>
        </div>
      </div>
    `,
    quickReplies: [
      { id: 'ktxinfo', icon: '🏠', label: 'Thông tin KTX', action: 'ktx_info' },
      { id: 'quaylai', icon: '🔙', label: 'Quay lại', action: 'main_menu' }
    ]
  },
  'document_info': {
    message: `
      <div class="info-card">
        <div class="info-card-title">📄 HƯỚNG DẪN XIN GIẤY TỜ</div>
        <div class="info-card-content">
          <strong>Các loại giấy tờ có thể xin:</strong>
          <ul style="margin: 8px 0; padding-left: 20px;">
            <li>Giấy xác nhận sinh viên</li>
            <li>Bảng điểm</li>
            <li>Giấy giới thiệu</li>
            <li>Giấy xác nhận vay vốn</li>
            <li>Các loại giấy tờ khác</li>
          </ul>
          <strong>Quy trình:</strong>
          <ol style="margin: 8px 0; padding-left: 20px;">
            <li>Tạo yêu cầu trên hệ thống</li>
            <li>Chờ xử lý (1-3 ngày)</li>
            <li>Nhận giấy tại phòng CTSV</li>
          </ol>
        </div>
      </div>
    `,
    quickReplies: [
      { id: 'taoyeucau', icon: '📝', label: 'Tạo yêu cầu', action: 'create_document_request' },
      { id: 'trangthai', icon: '📋', label: 'Kiểm tra yêu cầu', action: 'check_document_status' },
      { id: 'quaylai', icon: '🔙', label: 'Quay lại', action: 'main_menu' }
    ]
  },
  'main_menu': {
    message: `
      <div class="info-card">
        <div class="info-card-title">📋 MENU CHÍNH</div>
        <div class="info-card-content">
          Bạn muốn hỗ trợ gì?
        </div>
      </div>
    `,
    quickReplies: [
      { id: 'ktx', icon: '🏠', label: 'KTX', action: 'ktx_info' },
      { id: 'giayto', icon: '📄', label: 'Giấy tờ', action: 'document_info' },
      { id: 'trangthai', icon: '📋', label: 'Trạng thái', action: 'check_status' },
      { id: 'faq', icon: '❓', label: 'Hỏi đáp', action: 'faq' },
      { id: 'lienhe', icon: '📞', label: 'Liên hệ', action: 'contact' }
    ]
  }
};

// Intent detection (simple keyword matching - có thể nâng cấp với NLP)
const detectIntent = (message) => {
  const lowerMessage = message.toLowerCase();
  
  // KTX related
  if (lowerMessage.includes('ktx') || lowerMessage.includes('ký túc xá') || lowerMessage.includes('phòng ở')) {
    if (lowerMessage.includes('đăng ký') || lowerMessage.includes('đăng kí')) {
      return 'ktx_register';
    }
    if (lowerMessage.includes('trạng thái') || lowerMessage.includes('kiểm tra')) {
      return 'check_ktx_status';
    }
    return 'ktx_info';
  }
  
  // Document related
  if (lowerMessage.includes('giấy') || lowerMessage.includes('chứng chỉ') || lowerMessage.includes('xác nhận')) {
    if (lowerMessage.includes('trạng thái') || lowerMessage.includes('kiểm tra')) {
      return 'check_document_status';
    }
    return 'document_info';
  }
  
  // Status check
  if (lowerMessage.includes('trạng thái') || lowerMessage.includes('kiểm tra') || lowerMessage.includes('yêu cầu')) {
    return 'check_status';
  }
  
  // Working hours
  if (lowerMessage.includes('giờ') && (lowerMessage.includes('làm') || lowerMessage.includes('mở'))) {
    return 'gio_lam_viec';
  }
  
  // Contact
  if (lowerMessage.includes('liên hệ') || lowerMessage.includes('hotline') || lowerMessage.includes('điện thoại') || lowerMessage.includes('email')) {
    return 'lien_he';
  }
  
  // FAQ / Help
  if (lowerMessage.includes('hỏi đáp') || lowerMessage.includes('faq') || lowerMessage.includes('giúp') || lowerMessage.includes('hỗ trợ')) {
    return 'main_menu';
  }
  
  // Greeting
  if (lowerMessage.includes('xin chào') || lowerMessage.includes('hello') || lowerMessage.includes('hi')) {
    return 'greeting';
  }
  
  return 'unknown';
};

export const chatbotService = {
  /**
   * Gửi tin nhắn đến chatbot
   * @param {string} message - Tin nhắn từ người dùng
   * @returns {Promise<Object>} Response từ chatbot
   */
  sendMessage: async (message) => {
    try {
      // Try to call backend API first
      const response = await apiClient.post('/chatbot/message', { message });
      return response.data.data;
    } catch (error) {
      // Fallback to local processing if API fails
      console.warn('Chatbot API unavailable, using local fallback');
      return chatbotService.processMessageLocally(message);
    }
  },

  /**
   * Xử lý tin nhắn locally (fallback)
   * @param {string} message - Tin nhắn từ người dùng
   * @returns {Object} Response
   */
  processMessageLocally: (message) => {
    const intent = detectIntent(message);
    
    // Handle greeting
    if (intent === 'greeting') {
      return {
        message: `
          <div class="info-card">
            <div class="info-card-title">👋 Xin chào!</div>
            <div class="info-card-content">
              Mình là UniHelper Bot. Mình có thể giúp gì cho bạn?
            </div>
          </div>
        `,
        quickReplies: FAQ_RESPONSES.main_menu.quickReplies
      };
    }
    
    // Handle status check
    if (intent === 'check_status' || intent === 'check_ktx_status' || intent === 'check_document_status') {
      return {
        message: `
          <div class="info-card">
            <div class="info-card-title">📋 KIỂM TRA TRẠNG THÁI</div>
            <div class="info-card-content">
              Để kiểm tra trạng thái yêu cầu, bạn vui lòng chọn loại yêu cầu:
            </div>
          </div>
        `,
        quickReplies: [
          { id: 'ktx_status', icon: '🏠', label: 'Yêu cầu KTX', action: 'check_ktx_status_api' },
          { id: 'doc_status', icon: '📄', label: 'Yêu cầu giấy tờ', action: 'check_document_status_api' },
          { id: 'quaylai', icon: '🔙', label: 'Quay lại', action: 'main_menu' }
        ]
      };
    }
    
    // Check FAQ responses
    if (FAQ_RESPONSES[intent]) {
      return FAQ_RESPONSES[intent];
    }
    
    // Unknown intent
    return {
      message: `
        <div class="info-card">
          <div class="info-card-title">🤔 Xin lỗi!</div>
          <div class="info-card-content">
            Mình chưa hiểu câu hỏi của bạn. Bạn có thể thử:<br/>
            <ul style="margin: 8px 0; padding-left: 20px;">
              <li>Hỏi về thông tin KTX</li>
              <li>Hỏi về cách xin giấy tờ</li>
              <li>Kiểm tra trạng thái yêu cầu</li>
              <li>Hỏi giờ làm việc, liên hệ</li>
            </ul>
            Hoặc chọn một trong các mục bên dưới:
          </div>
        </div>
      `,
      quickReplies: FAQ_RESPONSES.main_menu.quickReplies
    };
  },

  /**
   * Lấy trạng thái yêu cầu KTX
   * @returns {Promise<Object>} Danh sách yêu cầu KTX
   */
  getKtxRequestStatus: async () => {
    try {
      const response = await apiClient.get('/chatbot/ktx-status');
      return response.data;
    } catch (error) {
      console.error('Error fetching KTX status:', error);
      throw error;
    }
  },

  /**
   * Lấy trạng thái yêu cầu giấy tờ
   * @returns {Promise<Object>} Danh sách yêu cầu giấy tờ
   */
  getDocumentRequestStatus: async () => {
    try {
      const response = await apiClient.get('/chatbot/document-status');
      return response.data;
    } catch (error) {
      console.error('Error fetching document status:', error);
      throw error;
    }
  }
};

export default chatbotService;

