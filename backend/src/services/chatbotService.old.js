/**
 * Chatbot Service - Business Logic Layer
 * Xử lý logic nghiệp vụ của chatbot với tích hợp Dialogflow ES
 * 100% sử dụng Dialogflow - không có fallback
 */
const crypto = require('crypto');
const chatbotRepository = require('../repositories/chatbotRepository');
const studentRepository = require('../repositories/studentRepository');
const dialogflowConfig = require('../config/dialogflow');

// Generate UUID using crypto (built-in Node.js)
const generateSessionId = () => crypto.randomUUID();

// Quick Replies mặc định cho main menu
const MAIN_MENU_QUICK_REPLIES = [
  { id: 'ktx', icon: '🔧', label: 'Báo sự cố', action: 'ktx_info' },
  { id: 'giayto', icon: '📄', label: 'Giấy tờ', action: 'document_info' },
  { id: 'trangthai', icon: '📋', label: 'Trạng thái', action: 'check_status' },
  { id: 'faq', icon: '❓', label: 'Hỏi đáp', action: 'faq' },
  { id: 'lienhe', icon: '📞', label: 'Liên hệ', action: 'contact' }
];

/**
 * Map từ Dialogflow intent name sang internal intent
 */
const INTENT_MAPPING = {
  'Default Welcome Intent': 'greeting',
  'Default Fallback Intent': 'unknown',
  'faq.gio_lam_viec': 'gio_lam_viec',
  'faq.lien_he': 'lien_he',
  'ctsv.thong_tin': 'document_info',
  'ctsv.kiem_tra': 'check_document_status',
  'ctsv.tu_van': 'document_advice',
  'ctsv.tao_yeu_cau': 'create_document_request',
  'ctsv.tao_yeu_cau.chon_loai': 'select_certificate_type',
  'ctsv.tao_yeu_cau.chon_ten': 'select_certificate_name',
  'ctsv.tao_yeu_cau.xac_nhan': 'confirm_request',
  'ctsv.tao_yeu_cau.huy': 'cancel_request',
  'ctsv.tao_tu_tu_van': 'create_from_advice',
  'ktx.thong_tin': 'ktx_info',
  'ktx.kiem_tra': 'check_ktx_status',
  'kiem_tra.chung': 'check_status'
};

class ChatbotService {
  /**
   * Xử lý tin nhắn từ người dùng - 100% Dialogflow
   * @param {string} userId - ID người dùng
   * @param {string} message - Tin nhắn
   * @param {string} sessionId - Session ID
   * @param {Object} io - Socket.io instance để emit events
   */
  async processMessage(userId, message, sessionId = null, io = null) {
    // Lưu io để dùng trong các handler
    this.io = io;
    
    // Tạo hoặc lấy session
    let conversation;
    if (sessionId) {
      conversation = await chatbotRepository.findBySessionId(sessionId);
    }
    
    if (!conversation) {
      sessionId = generateSessionId();
      conversation = await chatbotRepository.createConversation({
        user: userId,
        sessionId,
        messages: []
      });
    }

    // ==========================================
    // XỬ LÝ MESSAGE ĐẶC BIỆT TỪ QUICK REPLIES
    // ==========================================
    
    // Xử lý chọn loại chứng nhận: __SELECT_TYPE__<id>__<label>
    if (message.startsWith('__SELECT_TYPE__')) {
      const parts = message.split('__');
      const typeId = parts[2];
      const typeLabel = parts[3] || '';
      
      // Lưu message gốc (tên loại) thay vì message code
      const userMessage = {
        type: 'user',
        content: typeLabel || 'Chọn loại chứng nhận',
        timestamp: new Date()
      };
      
      const response = await this.handleSelectCertificateType(userId, sessionId, { 
        certificate_type_id: typeId 
      });
      
      const botMessage = {
        type: 'bot',
        content: response.message,
        intent: 'ctsv.tao_yeu_cau.chon_loai',
        timestamp: new Date()
      };
      
      await chatbotRepository.addMessage(sessionId, userMessage);
      await chatbotRepository.addMessage(sessionId, botMessage);
      
      return {
        success: true,
        message: 'Xử lý tin nhắn thành công',
        data: {
          sessionId,
          message: response.message,
          quickReplies: response.quickReplies || [],
          statusCard: response.statusCard || null,
          intent: 'ctsv.tao_yeu_cau.chon_loai',
          confidence: 1.0
        }
      };
    }
    
    // Xử lý chọn tên chứng nhận: __SELECT_NAME__<id>__<label>
    if (message.startsWith('__SELECT_NAME__')) {
      const parts = message.split('__');
      const nameId = parts[2];
      const nameLabel = parts[3] || '';
      
      const userMessage = {
        type: 'user',
        content: nameLabel || 'Chọn tên chứng nhận',
        timestamp: new Date()
      };
      
      const response = await this.handleSelectCertificateName(userId, sessionId, { 
        certificate_name_id: nameId 
      });
      
      const botMessage = {
        type: 'bot',
        content: response.message,
        intent: 'ctsv.tao_yeu_cau.chon_ten',
        timestamp: new Date()
      };
      
      await chatbotRepository.addMessage(sessionId, userMessage);
      await chatbotRepository.addMessage(sessionId, botMessage);
      
      return {
        success: true,
        message: 'Xử lý tin nhắn thành công',
        data: {
          sessionId,
          message: response.message,
          quickReplies: response.quickReplies || [],
          statusCard: response.statusCard || null,
          intent: 'ctsv.tao_yeu_cau.chon_ten',
          confidence: 1.0
        }
      };
    }

    // ==========================================
    // XỬ LÝ QUICK REPLY ACTIONS ĐẶC BIỆT
    // Các action này xử lý trực tiếp, không qua Dialogflow
    // ==========================================
    
    // Action: Tạo yêu cầu từ tư vấn
    if (message === '__ACTION__create_from_advice' || message.toLowerCase().includes('tạo luôn yêu cầu') || message.toLowerCase().includes('tạo luôn cho tôi')) {
      const userMessage = {
        type: 'user',
        content: 'Tạo luôn yêu cầu cho tôi',
        timestamp: new Date()
      };
      
      const response = await this.handleCreateFromAdvice(userId, sessionId);
      
      const botMessage = {
        type: 'bot',
        content: response.message,
        intent: 'ctsv.tao_tu_tu_van',
        timestamp: new Date()
      };
      
      await chatbotRepository.addMessage(sessionId, userMessage);
      await chatbotRepository.addMessage(sessionId, botMessage);
      
      return {
        success: true,
        message: 'Xử lý tin nhắn thành công',
        data: {
          sessionId,
          message: response.message,
          quickReplies: response.quickReplies || [],
          statusCard: response.statusCard || null,
          intent: 'ctsv.tao_tu_tu_van',
          confidence: 1.0
        }
      };
    }

    // Action: Xác nhận tạo yêu cầu
    if (message === '__ACTION__confirm_request' || message.toLowerCase().includes('xác nhận tạo')) {
      const userMessage = {
        type: 'user',
        content: 'Xác nhận tạo',
        timestamp: new Date()
      };
      
      const response = await this.handleConfirmRequest(userId, sessionId);
      
      const botMessage = {
        type: 'bot',
        content: response.message,
        intent: 'ctsv.tao_yeu_cau.xac_nhan',
        timestamp: new Date()
      };
      
      await chatbotRepository.addMessage(sessionId, userMessage);
      await chatbotRepository.addMessage(sessionId, botMessage);
      
      return {
        success: true,
        message: 'Xử lý tin nhắn thành công',
        data: {
          sessionId,
          message: response.message,
          quickReplies: response.quickReplies || [],
          statusCard: response.statusCard || null,
          intent: 'ctsv.tao_yeu_cau.xac_nhan',
          confidence: 1.0
        }
      };
    }

    // Action: Hủy tạo yêu cầu
    if (message === '__ACTION__cancel_request' || message.toLowerCase() === 'hủy') {
      const userMessage = {
        type: 'user',
        content: 'Hủy',
        timestamp: new Date()
      };
      
      const response = await this.handleCancelRequest(sessionId);
      
      const botMessage = {
        type: 'bot',
        content: response.message,
        intent: 'ctsv.tao_yeu_cau.huy',
        timestamp: new Date()
      };
      
      await chatbotRepository.addMessage(sessionId, userMessage);
      await chatbotRepository.addMessage(sessionId, botMessage);
      
      return {
        success: true,
        message: 'Xử lý tin nhắn thành công',
        data: {
          sessionId,
          message: response.message,
          quickReplies: response.quickReplies || [],
          statusCard: response.statusCard || null,
          intent: 'ctsv.tao_yeu_cau.huy',
          confidence: 1.0
        }
      };
    }

    // ==========================================
    // XỬ LÝ BÌNH THƯỜNG QUA DIALOGFLOW
    // ==========================================

    // Lưu tin nhắn user
    const userMessage = {
      type: 'user',
      content: message,
      timestamp: new Date()
    };

    // Gọi Dialogflow
    const dialogflowResult = await dialogflowConfig.detectIntent(sessionId, message);
    const intent = dialogflowResult.intent;
    const rawParameters = dialogflowResult.parameters;
    const parameters = dialogflowConfig.extractParameters(rawParameters);
    const fulfillmentText = dialogflowResult.fulfillmentText;
    
    console.log('═══════════════════════════════════════════════════');
    console.log('📤 Dialogflow Response:');
    console.log('   Intent:', intent);
    console.log('   Confidence:', dialogflowResult.intentDetectionConfidence);
    console.log('   Parameters:', JSON.stringify(parameters));
    console.log('   FulfillmentText:', fulfillmentText?.substring(0, 100) || '(empty)');
    console.log('═══════════════════════════════════════════════════');

    // Generate response dựa trên intent
    const response = await this.generateResponse(intent, userId, sessionId, parameters, fulfillmentText);
    
    // Lưu tin nhắn bot
    const botMessage = {
      type: 'bot',
      content: response.message,
      intent,
      dialogflowConfidence: dialogflowResult.intentDetectionConfidence || 0,
      timestamp: new Date()
    };

    // Cập nhật conversation
    await chatbotRepository.addMessage(sessionId, userMessage);
    await chatbotRepository.addMessage(sessionId, botMessage);

    return {
      success: true,
      message: 'Xử lý tin nhắn thành công',
      data: {
        sessionId,
        message: response.message,
        quickReplies: response.quickReplies || [],
        statusCard: response.statusCard || null,
        intent,
        confidence: dialogflowResult.intentDetectionConfidence || 0
      }
    };
  }

  /**
   * Generate response based on Dialogflow intent
   * 
   * NGUYÊN TẮC:
   * 1. Ưu tiên sử dụng fulfillmentText từ Dialogflow
   * 2. Chỉ xử lý trong code khi cần logic động (query DB, multi-step form)
   * 3. Quick replies phải định nghĩa trong code vì Dialogflow ES không hỗ trợ
   */
  async generateResponse(intent, userId, sessionId, parameters = {}, fulfillmentText = '') {
    // Map Dialogflow intent sang internal intent
    const mappedIntent = INTENT_MAPPING[intent] || intent;

    // ==========================================
    // KIỂM TRA: Nếu có parameter purpose -> chuyển sang tư vấn
    // Đảm bảo user hỏi về mục đích cụ thể sẽ được tư vấn
    // ==========================================
    if (parameters.purpose && !['ctsv.tu_van', 'document_advice'].includes(intent)) {
      console.log('🔄 Có purpose parameter, chuyển sang tư vấn:', parameters.purpose);
      return await this.getDocumentAdvice(userId, sessionId, parameters, fulfillmentText);
    }

    // ==========================================
    // INTENTS CẦN LOGIC ĐỘNG (QUERY DB, FORM)
    // Những intent này PHẢI xử lý trong code
    // ==========================================

    // Kiểm tra yêu cầu KTX - cần query DB
    if (mappedIntent === 'check_ktx_status' || intent === 'ktx.kiem_tra') {
      return await this.getKtxStatus(userId, parameters);
    }

    // Kiểm tra yêu cầu giấy tờ - cần query DB
    if (mappedIntent === 'check_document_status' || intent === 'ctsv.kiem_tra') {
      return await this.getDocumentStatus(userId, parameters);
    }

    // Kiểm tra chung - cần hiển thị options
    if (mappedIntent === 'check_status' || intent === 'kiem_tra.chung') {
      return {
        message: fulfillmentText || `<div class="info-card">
          <div class="info-card-title">📋 KIỂM TRA TRẠNG THÁI</div>
          <div class="info-card-content">Bạn muốn kiểm tra loại yêu cầu nào?</div>
        </div>`,
        quickReplies: [
          { id: 'ktx_status', icon: '🔧', label: 'Báo cáo sự cố', action: 'check_ktx_status' },
          { id: 'doc_status', icon: '📄', label: 'Yêu cầu giấy tờ', action: 'check_document_status' },
          { id: 'quaylai', icon: '🔙', label: 'Quay lại', action: 'main_menu' }
        ]
      };
    }

    // Tư vấn giấy tờ - cần query DB theo purpose + fulfillmentText từ Dialogflow
    if (mappedIntent === 'document_advice' || intent === 'ctsv.tu_van') {
      return await this.getDocumentAdvice(userId, sessionId, parameters, fulfillmentText);
    }

    // ==========================================
    // LUỒNG TẠO YÊU CẦU - CẦN MULTI-STEP FORM
    // ==========================================
    
    if (mappedIntent === 'create_from_advice' || intent === 'ctsv.tao_tu_tu_van') {
      return await this.handleCreateFromAdvice(userId, sessionId);
    }

    if (mappedIntent === 'create_document_request' || intent === 'ctsv.tao_yeu_cau') {
      return await this.startCreateRequest(userId, sessionId);
    }

    if (mappedIntent === 'select_certificate_type' || intent === 'ctsv.tao_yeu_cau.chon_loai') {
      return await this.handleSelectCertificateType(userId, sessionId, parameters);
    }

    if (mappedIntent === 'select_certificate_name' || intent === 'ctsv.tao_yeu_cau.chon_ten') {
      return await this.handleSelectCertificateName(userId, sessionId, parameters);
    }

    if (mappedIntent === 'confirm_request' || intent === 'ctsv.tao_yeu_cau.xac_nhan') {
      return await this.handleConfirmRequest(userId, sessionId);
    }

    if (mappedIntent === 'cancel_request' || intent === 'ctsv.tao_yeu_cau.huy') {
      return await this.handleCancelRequest(sessionId);
    }

    // ==========================================
    // INTENTS SỬ DỤNG 100% DIALOGFLOW RESPONSE
    // Chỉ thêm quick replies vì Dialogflow ES không hỗ trợ
    // ==========================================

    // Welcome intent - lấy text từ Dialogflow
    if (mappedIntent === 'greeting' || intent === 'Default Welcome Intent') {
      return {
        message: fulfillmentText 
          ? `<div class="info-card"><div class="info-card-content">${fulfillmentText}</div></div>`
          : `<div class="info-card">
              <div class="info-card-title">👋 Xin chào!</div>
              <div class="info-card-content">Mình là UniHelper Bot. Mình có thể giúp gì cho bạn?</div>
            </div>`,
        quickReplies: MAIN_MENU_QUICK_REPLIES
      };
    }

    // Default Fallback - lấy text từ Dialogflow
    if (mappedIntent === 'unknown' || intent === 'Default Fallback Intent') {
      return {
        message: fulfillmentText 
          ? `<div class="info-card"><div class="info-card-content">${fulfillmentText}</div></div>`
          : `<div class="info-card">
              <div class="info-card-title">🤔 Xin lỗi!</div>
              <div class="info-card-content">Mình chưa hiểu câu hỏi của bạn.</div>
            </div>`,
        quickReplies: MAIN_MENU_QUICK_REPLIES
      };
    }

    // ==========================================
    // TẤT CẢ INTENT KHÁC (FAQ, thông tin, liên hệ...)
    // 100% sử dụng fulfillmentText từ Dialogflow
    // ==========================================
    if (fulfillmentText && fulfillmentText.trim()) {
      return {
        message: `<div class="info-card">
          <div class="info-card-content">${fulfillmentText}</div>
        </div>`,
        quickReplies: MAIN_MENU_QUICK_REPLIES
      };
    }

    // Fallback cuối cùng - chỉ khi Dialogflow không trả về gì
    // Trường hợp này KHÔNG nên xảy ra nếu Dialogflow được cấu hình đúng
    console.warn('⚠️ No fulfillmentText from Dialogflow for intent:', intent);
    return {
      message: `<div class="info-card">
        <div class="info-card-content">Xin lỗi, có lỗi xảy ra. Vui lòng thử lại.</div>
      </div>`,
      quickReplies: MAIN_MENU_QUICK_REPLIES
    };
  }

  /**
   * Lấy trạng thái báo cáo sự cố thiết bị (KTX)
   */
  async getKtxStatus(userId, parameters = {}) {
    try {
      const student = await studentRepository.findByUser(userId);
      
      if (!student) {
        return {
          message: `<div class="highlight-box">
            <span class="highlight-box-icon">⚠️</span>
            <div>Không tìm thấy thông tin sinh viên. Vui lòng liên hệ phòng CTSV.</div>
          </div>`,
          quickReplies: MAIN_MENU_QUICK_REPLIES
        };
      }

      let requests = await chatbotRepository.getKtxRequestsByStudent(student._id);

      if (!requests || requests.length === 0) {
        return {
          message: `<div class="info-card">
            <div class="info-card-title">📭 KHÔNG CÓ YÊU CẦU</div>
            <div class="info-card-content">
              Bạn chưa có báo cáo sự cố thiết bị nào.<br/>
              Bạn có muốn tạo báo cáo mới không?
            </div>
          </div>`,
          quickReplies: [
            { id: 'baocao', icon: '🔧', label: 'Báo cáo sự cố', action: 'ktx_report' },
            { id: 'quaylai', icon: '🔙', label: 'Quay lại', action: 'main_menu' }
          ]
        };
      }

      // Lọc theo parameters từ Dialogflow nếu có
      if (parameters.equipment_category) {
        requests = requests.filter(r => 
          r.equipmentCategory?.toLowerCase().includes(parameters.equipment_category.toLowerCase())
        );
      }
      
      if (parameters.equipment_item) {
        requests = requests.filter(r => 
          r.equipmentName?.toLowerCase().includes(parameters.equipment_item.toLowerCase())
        );
      }

      if (requests.length === 0) {
        const filterDesc = parameters.equipment_category || parameters.equipment_item || '';
        return {
          message: `<div class="info-card">
            <div class="info-card-title">📭 KHÔNG TÌM THẤY</div>
            <div class="info-card-content">
              Không tìm thấy yêu cầu báo sự cố ${filterDesc ? `về "${filterDesc}"` : ''}.
            </div>
          </div>`,
          quickReplies: [
            { id: 'tatca', icon: '📋', label: 'Xem tất cả', action: 'check_ktx_status' },
            { id: 'quaylai', icon: '🔙', label: 'Quay lại', action: 'main_menu' }
          ]
        };
      }

      if (requests.length > 1) {
        const listHtml = requests.slice(0, 5).map((req, idx) => {
          const statusEmoji = this.getStatusEmoji(req.status);
          return `<li style="margin: 8px 0; padding: 8px; background: rgba(102, 126, 234, 0.05); border-radius: 8px;">
            <strong>${req.requestCode || `#${idx + 1}`}</strong> - ${req.equipmentName || 'N/A'}
            <br/><small>${statusEmoji} ${req.status}</small>
          </li>`;
        }).join('');

        return {
          message: `<div class="info-card">
            <div class="info-card-title">📋 DANH SÁCH BÁO CÁO SỰ CỐ (${requests.length})</div>
            <div class="info-card-content">
              <ul style="margin: 0; padding: 0; list-style: none;">
                ${listHtml}
              </ul>
              ${requests.length > 5 ? `<small>... và ${requests.length - 5} yêu cầu khác</small>` : ''}
            </div>
          </div>`,
          quickReplies: [
            { id: 'chitiet', icon: '📜', label: 'Chi tiết gần nhất', action: 'ktx_detail' },
            { id: 'quaylai', icon: '🔙', label: 'Quay lại', action: 'main_menu' }
          ]
        };
      }

      const latestRequest = requests[0];
      return {
        message: `<div class="info-card">
          <div class="info-card-title">📋 BÁO CÁO SỰ CỐ GẦN NHẤT</div>
          <div class="info-card-content">Dưới đây là thông tin báo cáo của bạn:</div>
        </div>`,
        statusCard: {
          type: 'equipment',
          data: {
            requestCode: latestRequest.requestCode || `KTX-${latestRequest._id.toString().slice(-8).toUpperCase()}`,
            createdAt: latestRequest.createdAt,
            equipmentName: latestRequest.equipmentName || 'N/A',
            description: latestRequest.description || 'N/A',
            status: latestRequest.status,
            estimatedTime: '1-3 ngày làm việc',
            reason: latestRequest.reason || null
          }
        },
        quickReplies: [
          { id: 'quaylai', icon: '🔙', label: 'Quay lại', action: 'main_menu' }
        ]
      };
    } catch (error) {
      console.error('Error getting KTX status:', error);
      return {
        message: `<div class="highlight-box">
          <span class="highlight-box-icon">⚠️</span>
          <div>Có lỗi xảy ra khi kiểm tra trạng thái. Vui lòng thử lại sau.</div>
        </div>`,
        quickReplies: MAIN_MENU_QUICK_REPLIES
      };
    }
  }

  /**
   * Lấy trạng thái yêu cầu giấy tờ (CTSV)
   */
  async getDocumentStatus(userId, parameters = {}) {
    try {
      const student = await studentRepository.findByUser(userId);
      
      if (!student) {
        return {
          message: `<div class="highlight-box">
            <span class="highlight-box-icon">⚠️</span>
            <div>Không tìm thấy thông tin sinh viên. Vui lòng liên hệ phòng CTSV.</div>
          </div>`,
          quickReplies: MAIN_MENU_QUICK_REPLIES
        };
      }

      let requests = await chatbotRepository.getCertificateRequestsByStudent(student._id);

      if (!requests || requests.length === 0) {
        return {
          message: `<div class="info-card">
            <div class="info-card-title">📭 KHÔNG CÓ YÊU CẦU</div>
            <div class="info-card-content">
              Bạn chưa có yêu cầu giấy tờ nào.<br/>
              Bạn có muốn tạo yêu cầu mới không?
            </div>
          </div>`,
          quickReplies: [
            { id: 'taoyeucau', icon: '📝', label: 'Tạo yêu cầu', action: 'document_info' },
            { id: 'quaylai', icon: '🔙', label: 'Quay lại', action: 'main_menu' }
          ]
        };
      }

      // Lọc theo parameters từ Dialogflow
      if (parameters.certificate_type) {
        requests = requests.filter(r => 
          r.certificateType?.name?.toLowerCase().includes(parameters.certificate_type.toLowerCase())
        );
      }
      
      if (parameters.certificate_name) {
        requests = requests.filter(r => 
          r.certificateType?.name?.toLowerCase().includes(parameters.certificate_name.toLowerCase())
        );
      }

      if (requests.length === 0) {
        const filterDesc = parameters.certificate_type || parameters.certificate_name || '';
        return {
          message: `<div class="info-card">
            <div class="info-card-title">📭 KHÔNG TÌM THẤY</div>
            <div class="info-card-content">
              Không tìm thấy yêu cầu ${filterDesc ? `về "${filterDesc}"` : ''}.
            </div>
          </div>`,
          quickReplies: [
            { id: 'tatca', icon: '📋', label: 'Xem tất cả', action: 'check_document_status' },
            { id: 'quaylai', icon: '🔙', label: 'Quay lại', action: 'main_menu' }
          ]
        };
      }

      if (requests.length > 1) {
        const listHtml = requests.slice(0, 5).map((req, idx) => {
          const statusEmoji = this.getStatusEmoji(req.status);
          return `<li style="margin: 8px 0; padding: 8px; background: rgba(102, 126, 234, 0.05); border-radius: 8px;">
            <strong>${req.requestCode || `#${idx + 1}`}</strong> - ${req.certificateType?.name || 'N/A'}
            <br/><small>${statusEmoji} ${req.status}</small>
          </li>`;
        }).join('');

        return {
          message: `<div class="info-card">
            <div class="info-card-title">📋 DANH SÁCH YÊU CẦU GIẤY TỜ (${requests.length})</div>
            <div class="info-card-content">
              <ul style="margin: 0; padding: 0; list-style: none;">
                ${listHtml}
              </ul>
              ${requests.length > 5 ? `<small>... và ${requests.length - 5} yêu cầu khác</small>` : ''}
            </div>
          </div>`,
          quickReplies: [
            { id: 'chitiet', icon: '📜', label: 'Chi tiết gần nhất', action: 'document_detail' },
            { id: 'quaylai', icon: '🔙', label: 'Quay lại', action: 'main_menu' }
          ]
        };
      }

      const latestRequest = requests[0];
      return {
        message: `<div class="info-card">
          <div class="info-card-title">📋 YÊU CẦU GIẤY TỜ GẦN NHẤT</div>
          <div class="info-card-content">Dưới đây là thông tin yêu cầu giấy tờ của bạn:</div>
        </div>`,
        statusCard: {
          type: 'certificate',
          data: {
            requestCode: latestRequest.requestCode || `CTSV-${latestRequest._id.toString().slice(-8).toUpperCase()}`,
            createdAt: latestRequest.createdAt,
            certificateType: latestRequest.certificateType?.name || 'N/A',
            quantity: latestRequest.quantity || 1,
            status: latestRequest.status,
            estimatedTime: '1-3 ngày làm việc',
            reason: latestRequest.reason || null
          }
        },
        quickReplies: [
          { id: 'quaylai', icon: '🔙', label: 'Quay lại', action: 'main_menu' }
        ]
      };
    } catch (error) {
      console.error('Error getting document status:', error);
      return {
        message: `<div class="highlight-box">
          <span class="highlight-box-icon">⚠️</span>
          <div>Có lỗi xảy ra khi kiểm tra trạng thái. Vui lòng thử lại sau.</div>
        </div>`,
        quickReplies: MAIN_MENU_QUICK_REPLIES
      };
    }
  }

  /**
   * Helper: Lấy emoji cho trạng thái
   */
  getStatusEmoji(status) {
    const statusMap = {
      'pending': '⏳',
      'processing': '🔄',
      'approved': '✅',
      'rejected': '❌',
      'completed': '✅',
      'cancelled': '🚫'
    };
    return statusMap[status?.toLowerCase()] || '📋';
  }

  /**
   * Tư vấn giấy tờ dựa theo mục đích sử dụng
   * 
   * LUỒNG:
   * 1. Dialogflow nhận diện intent + trả về fulfillmentText (hướng dẫn chung)
   * 2. Code query PurposeMapping để tìm Certificate phù hợp
   * 3. Kết hợp: fulfillmentText (từ Dialogflow) + thông tin Certificate (từ DB)
   */
  async getDocumentAdvice(userId, sessionId, parameters = {}, fulfillmentText = '') {
    const rawPurpose = parameters.purpose;
    
    // Nếu không có purpose, lấy danh sách loại chứng nhận từ DB và hỏi lại
    if (!rawPurpose) {
      // Lấy danh sách loại chứng nhận từ database
      const certificateTypes = await chatbotRepository.getAllCertificateTypes();
      
      // Tạo danh sách hiển thị từ DB
      let typeListHtml = '';
      const quickReplies = [];
      
      if (certificateTypes && certificateTypes.length > 0) {
        typeListHtml = certificateTypes.slice(0, 6).map(type => 
          `<li>${type.name}</li>`
        ).join('');
        
        // Tạo quick replies từ DB
        certificateTypes.slice(0, 5).forEach((type, idx) => {
          quickReplies.push({
            id: `advice_${idx}`,
            icon: this.getCertificateTypeIcon(type.name),
            label: type.name.length > 15 ? type.name.substring(0, 15) + '...' : type.name,
            action: `advice_type_${type._id}`
          });
        });
      } else {
        // Fallback nếu DB trống - hướng dẫn liên hệ
        typeListHtml = `
          <li>Xác nhận sinh viên</li>
          <li>Bảng điểm</li>
          <li>Nghĩa vụ quân sự</li>
          <li>Chứng nhận khác</li>
        `;
      }
      
      quickReplies.push({ id: 'quaylai', icon: '🔙', label: 'Quay lại', action: 'main_menu' });

      return {
        message: `<div class="info-card">
          <div class="info-card-title">📋 TƯ VẤN GIẤY TỜ</div>
          <div class="info-card-content">
            Bạn đang cần hỗ trợ về vấn đề gì?<br/><br/>
            Hãy cho mình biết mục đích bạn cần giấy tờ, ví dụ:
            <ul style="margin: 8px 0; padding-left: 20px;">
              <li>Giảm trừ gia cảnh (thuế TNCN)</li>
              <li>Hoãn nghĩa vụ quân sự</li>
              <li>Xin việc / Thực tập</li>
              <li>Xin học bổng</li>
            </ul>
            Hoặc chọn loại giấy tờ bên dưới:
          </div>
        </div>`,
        quickReplies
      };
    }

    console.log('📋 Document Advice - Raw purpose from Dialogflow:', rawPurpose);

    // ====================================================
    // QUERY TỪ PURPOSEMAPPING - Single Source of Truth
    // PurposeMapping quản lý qua Admin UI, không cần script
    // ====================================================
    const mappingResult = await chatbotRepository.findCertificateByPurpose(rawPurpose);

    // Không tìm thấy trong DB -> hướng dẫn liên hệ
    if (!mappingResult || !mappingResult.certificate) {
      return {
        message: `<div class="info-card">
          <div class="info-card-title">🤔 CẦN TƯ VẤN THÊM</div>
          <div class="info-card-content">
            Mình chưa tìm thấy giấy tờ phù hợp với mục đích "<strong>${rawPurpose}</strong>".<br/><br/>
            Vui lòng liên hệ phòng Công tác Sinh viên để được tư vấn trực tiếp.
            <div style="background: #fef3c7; border-radius: 8px; padding: 10px; margin-top: 10px;">
              📞 <strong>Hotline:</strong> 028 1234 5678
            </div>
          </div>
        </div>`,
        quickReplies: [
          { id: 'lienhe', icon: '📞', label: 'Liên hệ', action: 'contact' },
          { id: 'dsgiayto', icon: '📄', label: 'Xem danh sách', action: 'document_info' },
          { id: 'quaylai', icon: '🔙', label: 'Quay lại', action: 'main_menu' }
        ]
      };
    }

    // Tìm thấy certificate phù hợp từ PurposeMapping
    const { certificate, adviceNote, description } = mappingResult;
    const certificateName = certificate.name;
    const certificateTypeName = certificate.certificateType?.name || 'N/A';
    const finalDescription = description || certificate.description || `Giấy ${certificateName} cho mục đích ${rawPurpose}`;
    const finalAdviceNote = adviceNote || 'Thời gian xử lý: 1-3 ngày làm việc';

    // Lấy thông tin sinh viên
    const student = await studentRepository.findByUser(userId);
    
    // Lưu context để có thể tạo yêu cầu sau
    if (student && sessionId) {
      // Lấy học kỳ hiện tại
      const currentSemester = await chatbotRepository.getCurrentSemester();
      
      const contextData = {
        step: 'ready_to_create',
        studentId: student._id.toString(),
        certificateTypeId: certificate.certificateType?._id?.toString(),
        certificateTypeName: certificateTypeName,
        certificateNameId: certificate._id?.toString(),
        certificateName: certificateName,
        semesterId: currentSemester?._id?.toString(),
        semesterName: currentSemester?.name || 'Học kỳ hiện tại',
        purpose: rawPurpose,
        note: finalAdviceNote
      };
      
      console.log('💾 Saving context for create request:', JSON.stringify(contextData, null, 2));
      
      await chatbotRepository.saveConversationContext(sessionId, contextData);
    }

    // Hướng dẫn tự làm - thông tin cụ thể từ database
    const selfGuideText = `
      <ol style="margin: 8px 0; padding-left: 20px;">
        <li>Vào menu <strong>"Yêu cầu chứng nhận"</strong></li>
        <li>Chọn loại chứng nhận: <strong>${certificateTypeName}</strong></li>
        <li>Chọn tên chứng nhận: <strong>${certificateName}</strong></li>
        <li>Điền thông tin và gửi yêu cầu</li>
      </ol>
    `;

    // Trả về tư vấn + đề xuất tạo luôn
    return {
      message: `<div class="info-card">
        <div class="info-card-title">✅ TƯ VẤN GIẤY TỜ</div>
        <div class="info-card-content">
          <div style="background: linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%); border-radius: 10px; padding: 12px; margin-bottom: 12px;">
            <strong>📄 Giấy tờ phù hợp:</strong><br/>
            <span style="font-size: 16px; color: #065f46; font-weight: 600;">${certificateName}</span>
          </div>
          <strong>📁 Loại:</strong> ${certificateTypeName}<br/>
          <strong>📝 Mô tả:</strong> ${finalDescription}
          <div style="background: #fef3c7; border-radius: 8px; padding: 10px; margin-top: 10px;">
            💡 <strong>Lưu ý:</strong> ${finalAdviceNote}
          </div>
          <div style="background: #e0f2fe; border-radius: 8px; padding: 12px; margin-top: 12px; border-left: 4px solid #0284c7;">
            📖 <strong>Hướng dẫn tự làm:</strong>
            ${selfGuideText}
          </div>
          <div style="background: #eff6ff; border-radius: 8px; padding: 12px; margin-top: 12px; border-left: 4px solid #3b82f6;">
            🤔 <strong>Hoặc bạn có muốn tôi tạo yêu cầu này cho bạn không?</strong>
          </div>
        </div>
      </div>`,
      quickReplies: [
        { id: 'taoluon', icon: '✅', label: 'Tạo luôn cho tôi', action: 'create_from_advice' },
        { id: 'huongdan', icon: '📖', label: 'Xem hướng dẫn tự làm', action: 'document_info' },
        { id: 'quaylai', icon: '🔙', label: 'Quay lại', action: 'main_menu' }
      ]
    };
  }

  /**
   * Lấy lịch sử hội thoại
   */
  async getConversationHistory(userId, options = {}) {
    const result = await chatbotRepository.getConversationHistory(userId, options);
    
    return {
      success: true,
      message: 'Lấy lịch sử hội thoại thành công',
      data: result.conversations,
      pagination: {
        total: result.total,
        page: result.page,
        limit: result.limit,
        totalPages: Math.ceil(result.total / result.limit)
      }
    };
  }

  // ==========================================
  // LUỒNG TẠO YÊU CẦU GIẤY TỜ QUA CHATBOT
  // ==========================================

  /**
   * Tạo yêu cầu từ tư vấn (luồng tự nhiên)
   * User đã được tư vấn, context đã lưu, giờ tạo luôn
   */
  async handleCreateFromAdvice(userId, sessionId) {
    try {
      // Lấy context từ tư vấn
      const context = await chatbotRepository.getConversationContext(sessionId);
      
      console.log('🔍 handleCreateFromAdvice - context:', JSON.stringify(context, null, 2));
      
      if (!context || context.step !== 'ready_to_create') {
        console.log('⚠️ Context invalid or step not ready_to_create:', context?.step);
        return {
          message: `<div class="highlight-box">
            <span class="highlight-box-icon">⚠️</span>
            <div>Phiên làm việc đã hết hạn. Vui lòng hỏi lại về loại giấy tờ bạn cần.</div>
          </div>`,
          quickReplies: [
            { id: 'tuvan', icon: '📋', label: 'Tư vấn giấy tờ', action: 'document_advice' },
            { id: 'menu', icon: '🏠', label: 'Menu chính', action: 'main_menu' }
          ]
        };
      }

      // Kiểm tra có đủ thông tin không
      if (!context.certificateTypeId || !context.certificateNameId) {
        return {
          message: `<div class="info-card">
            <div class="info-card-title">📝 XÁC NHẬN TẠO YÊU CẦU</div>
            <div class="info-card-content">
              <div style="background: #f0fdf4; border-radius: 8px; padding: 12px; margin: 8px 0;">
                📋 <strong>Loại:</strong> ${context.certificateTypeName || 'N/A'}<br/>
                📄 <strong>Tên:</strong> ${context.certificateName || 'N/A'}<br/>
                📅 <strong>Học kỳ:</strong> ${context.semesterName || 'Học kỳ hiện tại'}
              </div>
              <div style="background: #fef3c7; border-radius: 8px; padding: 10px; margin-top: 10px;">
                ⚠️ <strong>Lưu ý:</strong> Hệ thống không tìm thấy loại giấy này trong CSDL. 
                Vui lòng tạo yêu cầu thủ công qua menu "Yêu cầu chứng nhận".
              </div>
            </div>
          </div>`,
          quickReplies: [
            { id: 'manual', icon: '📝', label: 'Tạo thủ công', action: 'document_info' },
            { id: 'menu', icon: '🏠', label: 'Menu chính', action: 'main_menu' }
          ]
        };
      }

      // Cập nhật context sang bước xác nhận
      await chatbotRepository.saveConversationContext(sessionId, {
        ...context,
        step: 'confirm'
      });

      // Hiển thị xác nhận
      return {
        message: `<div class="info-card">
          <div class="info-card-title">📝 XÁC NHẬN TẠO YÊU CẦU</div>
          <div class="info-card-content">
            Mình sẽ tạo yêu cầu với thông tin sau:<br/><br/>
            <div style="background: linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%); border-radius: 10px; padding: 15px; margin: 8px 0;">
              📋 <strong>Loại chứng nhận:</strong> ${context.certificateTypeName}<br/>
              📄 <strong>Tên giấy:</strong> ${context.certificateName}<br/>
              📅 <strong>Học kỳ:</strong> ${context.semesterName || 'Học kỳ hiện tại'}<br/>
              📊 <strong>Số lượng:</strong> 1 bản
            </div>
            <br/>
            <strong>Bạn xác nhận tạo yêu cầu này không?</strong>
          </div>
        </div>`,
        quickReplies: [
          { id: 'confirm', icon: '✅', label: 'Xác nhận tạo', action: 'confirm_request' },
          { id: 'cancel', icon: '❌', label: 'Hủy', action: 'cancel_request' }
        ]
      };
    } catch (error) {
      console.error('Error creating from advice:', error);
      return {
        message: `<div class="highlight-box">
          <span class="highlight-box-icon">⚠️</span>
          <div>Có lỗi xảy ra. Vui lòng thử lại.</div>
        </div>`,
        quickReplies: MAIN_MENU_QUICK_REPLIES
      };
    }
  }

  /**
   * Bước 1: Bắt đầu tạo yêu cầu - Hiển thị danh sách loại chứng nhận
   */
  async startCreateRequest(userId, sessionId) {
    try {
      // Kiểm tra sinh viên
      const student = await studentRepository.findByUser(userId);
      if (!student) {
        return {
          message: `<div class="highlight-box">
            <span class="highlight-box-icon">⚠️</span>
            <div>Chỉ sinh viên mới có thể tạo yêu cầu chứng nhận.</div>
          </div>`,
          quickReplies: MAIN_MENU_QUICK_REPLIES
        };
      }

      // Lấy danh sách loại chứng nhận
      const certificateTypes = await chatbotRepository.getAllCertificateTypes();
      
      if (!certificateTypes || certificateTypes.length === 0) {
        return {
          message: `<div class="highlight-box">
            <span class="highlight-box-icon">⚠️</span>
            <div>Hiện tại chưa có loại chứng nhận nào. Vui lòng liên hệ phòng CTSV.</div>
          </div>`,
          quickReplies: MAIN_MENU_QUICK_REPLIES
        };
      }

      // Lưu context - bắt đầu form
      await chatbotRepository.saveConversationContext(sessionId, {
        step: 'select_type',
        studentId: student._id.toString()
      });

      // Tạo quick replies từ danh sách loại chứng nhận
      const typeReplies = certificateTypes.slice(0, 6).map((type, idx) => ({
        id: `type_${type._id}`,
        icon: this.getCertificateTypeIcon(type.name),
        label: type.name,
        action: `select_type_${type._id}`
      }));

      // Thêm nút hủy
      typeReplies.push({ id: 'cancel', icon: '❌', label: 'Hủy', action: 'cancel_request' });

      return {
        message: `<div class="info-card">
          <div class="info-card-title">📝 TẠO YÊU CẦU CHỨNG NHẬN</div>
          <div class="info-card-content">
            <strong>Bước 1/3:</strong> Chọn loại chứng nhận<br/><br/>
            Vui lòng chọn loại chứng nhận bạn cần:
          </div>
        </div>`,
        quickReplies: typeReplies
      };
    } catch (error) {
      console.error('Error starting create request:', error);
      return {
        message: `<div class="highlight-box">
          <span class="highlight-box-icon">⚠️</span>
          <div>Có lỗi xảy ra. Vui lòng thử lại sau.</div>
        </div>`,
        quickReplies: MAIN_MENU_QUICK_REPLIES
      };
    }
  }

  /**
   * Bước 2: Xử lý khi user chọn loại chứng nhận
   */
  async handleSelectCertificateType(userId, sessionId, parameters) {
    try {
      const certificateTypeId = parameters.certificate_type_id;
      
      if (!certificateTypeId) {
        return {
          message: `<div class="highlight-box">
            <span class="highlight-box-icon">⚠️</span>
            <div>Vui lòng chọn loại chứng nhận từ danh sách.</div>
          </div>`,
          quickReplies: [
            { id: 'retry', icon: '🔄', label: 'Thử lại', action: 'create_document_request' },
            { id: 'cancel', icon: '❌', label: 'Hủy', action: 'cancel_request' }
          ]
        };
      }

      // Lấy danh sách tên chứng nhận theo loại
      const certificates = await chatbotRepository.getCertificatesByType(certificateTypeId);
      
      if (!certificates || certificates.length === 0) {
        return {
          message: `<div class="highlight-box">
            <span class="highlight-box-icon">⚠️</span>
            <div>Loại chứng nhận này chưa có giấy cụ thể. Vui lòng chọn loại khác.</div>
          </div>`,
          quickReplies: [
            { id: 'retry', icon: '🔄', label: 'Chọn loại khác', action: 'create_document_request' },
            { id: 'cancel', icon: '❌', label: 'Hủy', action: 'cancel_request' }
          ]
        };
      }

      // Lấy context và cập nhật
      const context = await chatbotRepository.getConversationContext(sessionId);
      await chatbotRepository.saveConversationContext(sessionId, {
        ...context,
        step: 'select_name',
        certificateTypeId: certificateTypeId
      });

      // Tạo quick replies từ danh sách tên chứng nhận
      const nameReplies = certificates.slice(0, 6).map((cert) => ({
        id: `name_${cert._id}`,
        icon: '📄',
        label: cert.name.length > 20 ? cert.name.substring(0, 20) + '...' : cert.name,
        action: `select_name_${cert._id}`
      }));

      nameReplies.push({ id: 'back', icon: '🔙', label: 'Quay lại', action: 'create_document_request' });
      nameReplies.push({ id: 'cancel', icon: '❌', label: 'Hủy', action: 'cancel_request' });

      return {
        message: `<div class="info-card">
          <div class="info-card-title">📝 TẠO YÊU CẦU CHỨNG NHẬN</div>
          <div class="info-card-content">
            <strong>Bước 2/3:</strong> Chọn tên chứng nhận<br/><br/>
            Vui lòng chọn loại giấy cụ thể:
          </div>
        </div>`,
        quickReplies: nameReplies
      };
    } catch (error) {
      console.error('Error selecting certificate type:', error);
      return {
        message: `<div class="highlight-box">
          <span class="highlight-box-icon">⚠️</span>
          <div>Có lỗi xảy ra. Vui lòng thử lại.</div>
        </div>`,
        quickReplies: MAIN_MENU_QUICK_REPLIES
      };
    }
  }

  /**
   * Bước 3: Xử lý khi user chọn tên chứng nhận - Hiển thị xác nhận
   */
  async handleSelectCertificateName(userId, sessionId, parameters) {
    try {
      const certificateNameId = parameters.certificate_name_id;
      
      if (!certificateNameId) {
        return {
          message: `<div class="highlight-box">
            <span class="highlight-box-icon">⚠️</span>
            <div>Vui lòng chọn tên chứng nhận từ danh sách.</div>
          </div>`,
          quickReplies: [
            { id: 'retry', icon: '🔄', label: 'Thử lại', action: 'create_document_request' },
            { id: 'cancel', icon: '❌', label: 'Hủy', action: 'cancel_request' }
          ]
        };
      }

      // Lấy context và cập nhật
      const context = await chatbotRepository.getConversationContext(sessionId);
      
      // Lấy thông tin học kỳ hiện tại
      const currentSemester = await chatbotRepository.getCurrentSemester();
      const semesterName = currentSemester?.name || 'Học kỳ hiện tại';

      await chatbotRepository.saveConversationContext(sessionId, {
        ...context,
        step: 'confirm',
        certificateNameId: certificateNameId,
        semesterId: currentSemester?._id?.toString(),
        semesterName: semesterName
      });

      return {
        message: `<div class="info-card">
          <div class="info-card-title">📝 XÁC NHẬN TẠO YÊU CẦU</div>
          <div class="info-card-content">
            <strong>Bước 3/3:</strong> Xác nhận thông tin<br/><br/>
            <div style="background: #f0fdf4; border-radius: 8px; padding: 12px; margin: 8px 0;">
              📋 <strong>Học kỳ:</strong> ${semesterName}<br/>
              📊 <strong>Số lượng:</strong> 1 bản
            </div>
            <br/>
            Bạn có muốn tạo yêu cầu này không?
          </div>
        </div>`,
        quickReplies: [
          { id: 'confirm', icon: '✅', label: 'Xác nhận tạo', action: 'confirm_request' },
          { id: 'back', icon: '🔙', label: 'Quay lại', action: 'create_document_request' },
          { id: 'cancel', icon: '❌', label: 'Hủy', action: 'cancel_request' }
        ]
      };
    } catch (error) {
      console.error('Error selecting certificate name:', error);
      return {
        message: `<div class="highlight-box">
          <span class="highlight-box-icon">⚠️</span>
          <div>Có lỗi xảy ra. Vui lòng thử lại.</div>
        </div>`,
        quickReplies: MAIN_MENU_QUICK_REPLIES
      };
    }
  }

  /**
   * Bước 4: Xác nhận và tạo yêu cầu
   */
  async handleConfirmRequest(userId, sessionId) {
    try {
      // Lấy context
      const context = await chatbotRepository.getConversationContext(sessionId);
      
      if (!context || context.step !== 'confirm') {
        return {
          message: `<div class="highlight-box">
            <span class="highlight-box-icon">⚠️</span>
            <div>Phiên làm việc đã hết hạn. Vui lòng bắt đầu lại.</div>
          </div>`,
          quickReplies: [
            { id: 'retry', icon: '📝', label: 'Tạo yêu cầu mới', action: 'create_document_request' },
            { id: 'menu', icon: '🏠', label: 'Menu chính', action: 'main_menu' }
          ]
        };
      }

      // Lấy mã yêu cầu tiếp theo
      const requestCode = await chatbotRepository.getNextCertificateRequestCode();

      // Tạo yêu cầu
      const newRequest = await chatbotRepository.createCertificateRequest({
        requestCode,
        student: context.studentId,
        certificateType: context.certificateTypeId,
        certificateName: context.certificateNameId,
        semester: context.semesterName || 'Học kỳ hiện tại',
        status: 'ĐANG XỬ LÝ',
        notes: 'Tạo qua Chatbot'
      });

      // Emit socket event để cập nhật realtime
      if (this.io) {
        console.log('📡 Emitting CERTIFICATE_REQUEST_CREATED via socket');
        this.io.emit('CERTIFICATE_REQUEST_CREATED', {
          request: newRequest,
          message: `Yêu cầu mới ${requestCode} đã được tạo qua Chatbot`
        });
      }

      // Xóa context
      await chatbotRepository.clearConversationContext(sessionId);

      return {
        message: `<div class="info-card">
          <div class="info-card-title">✅ TẠO YÊU CẦU THÀNH CÔNG!</div>
          <div class="info-card-content">
            <div style="background: linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%); border-radius: 10px; padding: 15px; margin-bottom: 12px;">
              <strong style="font-size: 18px; color: #065f46;">Mã yêu cầu: ${requestCode}</strong>
            </div>
            <strong>📋 Trạng thái:</strong> Đang xử lý<br/>
            <strong>⏱️ Thời gian dự kiến:</strong> 1-3 ngày làm việc<br/><br/>
            <div style="background: #fef3c7; border-radius: 8px; padding: 10px;">
              💡 <strong>Lưu ý:</strong> Bạn có thể kiểm tra trạng thái yêu cầu bất kỳ lúc nào bằng cách hỏi "kiểm tra yêu cầu ${requestCode}"
            </div>
          </div>
        </div>`,
        quickReplies: [
          { id: 'status', icon: '📋', label: 'Xem trạng thái', action: 'check_document_status' },
          { id: 'new', icon: '📝', label: 'Tạo yêu cầu mới', action: 'create_document_request' },
          { id: 'menu', icon: '🏠', label: 'Menu chính', action: 'main_menu' }
        ]
      };
    } catch (error) {
      console.error('Error confirming request:', error);
      return {
        message: `<div class="highlight-box">
          <span class="highlight-box-icon">⚠️</span>
          <div>Có lỗi xảy ra khi tạo yêu cầu. Vui lòng thử lại.</div>
        </div>`,
        quickReplies: [
          { id: 'retry', icon: '🔄', label: 'Thử lại', action: 'create_document_request' },
          { id: 'menu', icon: '🏠', label: 'Menu chính', action: 'main_menu' }
        ]
      };
    }
  }

  /**
   * Hủy tạo yêu cầu
   */
  async handleCancelRequest(sessionId) {
    // Xóa context
    await chatbotRepository.clearConversationContext(sessionId);

    return {
      message: `<div class="info-card">
        <div class="info-card-title">❌ ĐÃ HỦY</div>
        <div class="info-card-content">
          Đã hủy tạo yêu cầu. Bạn có thể bắt đầu lại bất kỳ lúc nào.
        </div>
      </div>`,
      quickReplies: MAIN_MENU_QUICK_REPLIES
    };
  }

  /**
   * Helper: Lấy icon cho loại chứng nhận
   */
  getCertificateTypeIcon(typeName) {
    const iconMap = {
      'xác nhận sinh viên': '📋',
      'bảng điểm': '📊',
      'nghĩa vụ quân sự': '🎖️',
      'giấy chứng nhận tốt nghiệp': '🎓',
      'chứng nhận khác': '📄'
    };
    const lowerName = typeName.toLowerCase();
    for (const [key, icon] of Object.entries(iconMap)) {
      if (lowerName.includes(key)) return icon;
    }
    return '📄';
  }
}

module.exports = new ChatbotService();
