/**
 * Chatbot Service - Main Orchestrator
 * Điều phối các handler và xử lý tin nhắn từ user
 */
const crypto = require('crypto');
const chatbotRepository = require('../../repositories/chatbotRepository');

// Import handlers
const dialogflowHandler = require('./dialogflowHandler');
const commonHandler = require('./commonHandler');
const ctsvHandler = require('./ctsvHandler');
const ktxHandler = require('./ktxHandler');
const { INTENT_MAPPING } = require('./constants');

// Generate UUID using crypto
const generateSessionId = () => crypto.randomUUID();

class ChatbotService {
  /**
   * Xử lý tin nhắn từ người dùng
   * @param {string} userId - ID người dùng
   * @param {string} message - Tin nhắn
   * @param {string} sessionId - Session ID
   * @param {Object} io - Socket.io instance để emit events
   */
  async processMessage(userId, message, sessionId = null, io = null) {
    // Set io cho các handler
    ctsvHandler.setIO(io);
    ktxHandler.setIO(io);
    
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
    const specialResult = await this.handleSpecialMessages(userId, sessionId, message);
    if (specialResult) {
      return this.formatResponse(sessionId, specialResult, specialResult.intent || 'special_action');
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
    const dialogflowResult = await dialogflowHandler.detectIntent(sessionId, message);
    const { intent, parameters, fulfillmentText, confidence } = dialogflowResult;

    // Generate response dựa trên intent
    // Truyền thêm dialogflowResult để hỗ trợ lấy context từ Dialogflow
    const response = await this.generateResponse(intent, userId, sessionId, parameters, fulfillmentText, message, dialogflowResult);
    
    // Lưu tin nhắn bot
    const botMessage = {
      type: 'bot',
      content: response.message,
      intent,
      dialogflowConfidence: confidence,
      timestamp: new Date()
    };

    // Cập nhật conversation
    await chatbotRepository.addMessage(sessionId, userMessage);
    await chatbotRepository.addMessage(sessionId, botMessage);

    return this.formatResponse(sessionId, response, intent, confidence);
  }

  /**
   * Xử lý các message đặc biệt từ quick replies
   */
  async handleSpecialMessages(userId, sessionId, message) {
    // Xử lý chọn loại chứng nhận: __SELECT_TYPE__<id>__<label>
    if (message.startsWith('__SELECT_TYPE__')) {
      const parts = message.split('__');
      const typeId = parts[2];
      const typeLabel = parts[3] || '';
      
      await this.saveUserMessage(sessionId, typeLabel || 'Chọn loại chứng nhận');
      const response = await ctsvHandler.handleSelectCertificateType(userId, sessionId, { 
        certificate_type_id: typeId 
      });
      await this.saveBotMessage(sessionId, response.message, 'ctsv.tao_yeu_cau.chon_loai');
      
      return { ...response, intent: 'ctsv.tao_yeu_cau.chon_loai' };
    }
    
    // Xử lý chọn tên chứng nhận: __SELECT_NAME__<id>__<label>
    if (message.startsWith('__SELECT_NAME__')) {
      const parts = message.split('__');
      const nameId = parts[2];
      const nameLabel = parts[3] || '';
      
      await this.saveUserMessage(sessionId, nameLabel || 'Chọn tên chứng nhận');
      const response = await ctsvHandler.handleSelectCertificateName(userId, sessionId, { 
        certificate_name_id: nameId 
      });
      await this.saveBotMessage(sessionId, response.message, 'ctsv.tao_yeu_cau.chon_ten');
      
      return { ...response, intent: 'ctsv.tao_yeu_cau.chon_ten' };
    }

    // Xử lý chọn Certificate từ danh sách loại (từ tư vấn): __SELECT_CERT_FROM_TYPE__<id>__<label>
    if (message.startsWith('__SELECT_CERT_FROM_TYPE__')) {
      const parts = message.split('__');
      const certId = parts[2];
      const certLabel = parts[3] || '';
      
      await this.saveUserMessage(sessionId, certLabel || 'Chọn loại giấy');
      const response = await ctsvHandler.handleSelectCertificateFromType(userId, sessionId, { 
        certificate_id: certId 
      });
      await this.saveBotMessage(sessionId, response.message, 'ctsv.tu_van.chon_giay');
      
      return { ...response, intent: 'ctsv.tu_van.chon_giay' };
    }

    // Xử lý chọn danh mục thiết bị: __SELECT_CATEGORY__<id>__<label>
    if (message.startsWith('__SELECT_CATEGORY__')) {
      const parts = message.split('__');
      const categoryId = parts[2];
      const categoryLabel = parts[3] || '';
      
      await this.saveUserMessage(sessionId, categoryLabel || 'Chọn danh mục thiết bị');
      const response = await ktxHandler.handleSelectCategory(userId, sessionId, { 
        category_id: categoryId 
      });
      await this.saveBotMessage(sessionId, response.message, 'ktx.bao_su_co.chon_danh_muc');
      
      return { ...response, intent: 'ktx.bao_su_co.chon_danh_muc' };
    }

    // Xử lý chọn thiết bị: __SELECT_EQUIPMENT__<id>__<label>
    if (message.startsWith('__SELECT_EQUIPMENT__')) {
      const parts = message.split('__');
      const equipmentId = parts[2];
      const equipmentLabel = parts[3] || '';
      
      await this.saveUserMessage(sessionId, equipmentLabel || 'Chọn thiết bị');
      const response = await ktxHandler.handleSelectEquipment(userId, sessionId, { 
        equipment_id: equipmentId 
      });
      await this.saveBotMessage(sessionId, response.message, 'ktx.bao_su_co.chon_thiet_bi');
      
      return { ...response, intent: 'ktx.bao_su_co.chon_thiet_bi' };
    }

    // ==========================================
    // XỬ LÝ QUICK REPLY ACTIONS ĐẶC BIỆT
    // ==========================================
    
    // CTSV Actions
    if (message === '__ACTION__create_from_advice' || message.toLowerCase().includes('tạo luôn yêu cầu') || message.toLowerCase().includes('tạo luôn cho tôi')) {
      await this.saveUserMessage(sessionId, 'Tạo luôn yêu cầu cho tôi');
      const response = await ctsvHandler.handleCreateFromAdvice(userId, sessionId);
      await this.saveBotMessage(sessionId, response.message, 'ctsv.tao_tu_tu_van');
      return { ...response, intent: 'ctsv.tao_tu_tu_van' };
    }

    if (message === '__ACTION__confirm_request' || message.toLowerCase().includes('xác nhận tạo')) {
      await this.saveUserMessage(sessionId, 'Xác nhận tạo');
      const response = await ctsvHandler.handleConfirmRequest(userId, sessionId);
      await this.saveBotMessage(sessionId, response.message, 'ctsv.tao_yeu_cau.xac_nhan');
      return { ...response, intent: 'ctsv.tao_yeu_cau.xac_nhan' };
    }

    if (message === '__ACTION__cancel_request' || message.toLowerCase() === 'hủy') {
      await this.saveUserMessage(sessionId, 'Hủy');
      const response = await ctsvHandler.handleCancelRequest(sessionId);
      await this.saveBotMessage(sessionId, response.message, 'ctsv.tao_yeu_cau.huy');
      return { ...response, intent: 'ctsv.tao_yeu_cau.huy' };
    }

    // KTX Actions
    if (message === '__ACTION__create_ktx_from_advice' || message === 'create_ktx_from_advice') {
      await this.saveUserMessage(sessionId, 'Tạo báo cáo sự cố');
      const response = await ktxHandler.handleCreateFromAdvice(userId, sessionId, null);
      await this.saveBotMessage(sessionId, response.message, 'ktx.tao_tu_tu_van');
      return { ...response, intent: 'ktx.tao_tu_tu_van' };
    }

    if (message === '__ACTION__confirm_ktx_request' || message === 'confirm_ktx_request') {
      await this.saveUserMessage(sessionId, 'Xác nhận gửi báo cáo');
      const response = await ktxHandler.handleConfirmKtxRequest(userId, sessionId);
      await this.saveBotMessage(sessionId, response.message, 'ktx.bao_su_co.xac_nhan');
      return { ...response, intent: 'ktx.bao_su_co.xac_nhan' };
    }

    if (message === '__ACTION__cancel_ktx_request' || message === 'cancel_ktx_request') {
      await this.saveUserMessage(sessionId, 'Hủy báo cáo');
      const response = await ktxHandler.handleCancelKtxRequest(sessionId);
      await this.saveBotMessage(sessionId, response.message, 'ktx.bao_su_co.huy');
      return { ...response, intent: 'ktx.bao_su_co.huy' };
    }

    // ==========================================
    // XỬ LÝ QUICK REPLY ACTION DẠNG select_xxx_<id>
    // ==========================================
    
    // Xử lý chọn thiết bị: select_equipment_<id>
    if (message.startsWith('select_equipment_')) {
      const equipmentId = message.replace('select_equipment_', '');
      console.log('📋 Xử lý select_equipment_:', equipmentId);
      
      await this.saveUserMessage(sessionId, 'Chọn thiết bị');
      const response = await ktxHandler.handleSelectEquipment(userId, sessionId, { 
        equipment_id: equipmentId 
      });
      await this.saveBotMessage(sessionId, response.message, 'ktx.bao_su_co.chon_thiet_bi');
      
      return { ...response, intent: 'ktx.bao_su_co.chon_thiet_bi' };
    }

    // Xử lý chọn danh mục: select_category_<id>
    if (message.startsWith('select_category_')) {
      const categoryId = message.replace('select_category_', '');
      console.log('📋 Xử lý select_category_:', categoryId);
      
      await this.saveUserMessage(sessionId, 'Chọn danh mục');
      const response = await ktxHandler.handleSelectCategory(userId, sessionId, { 
        category_id: categoryId 
      });
      await this.saveBotMessage(sessionId, response.message, 'ktx.bao_su_co.chon_danh_muc');
      
      return { ...response, intent: 'ktx.bao_su_co.chon_danh_muc' };
    }

    // Xử lý action quay lại báo sự cố từ đầu
    if (message === 'ktx_report') {
      await this.saveUserMessage(sessionId, 'Báo sự cố thiết bị');
      const response = await ktxHandler.startKtxReport(userId, sessionId);
      await this.saveBotMessage(sessionId, response.message, 'ktx.bao_su_co');
      return { ...response, intent: 'ktx.bao_su_co' };
    }

    // Xử lý hướng dẫn sử dụng
    if (message === 'Hướng dẫn sử dụng' || message === 'user_guide') {
      await this.saveUserMessage(sessionId, 'Hướng dẫn sử dụng');
      // Gọi Dialogflow để lấy fulfillmentText
      const dialogflowResult = await dialogflowHandler.detectIntent(sessionId, 'hướng dẫn sử dụng');
      const response = commonHandler.handleUserGuide(dialogflowResult.fulfillmentText);
      await this.saveBotMessage(sessionId, response.message, 'faq.huong_dan');
      return { ...response, intent: 'faq.huong_dan' };
    }

    // Xử lý thông tin liên hệ
    if (message === 'Thông tin liên hệ' || message === 'contact' || message === 'Liên hệ') {
      await this.saveUserMessage(sessionId, 'Thông tin liên hệ');
      // Gọi Dialogflow để lấy fulfillmentText từ intent faq.lien_he
      const dialogflowResult = await dialogflowHandler.detectIntent(sessionId, 'liên hệ');
      const response = commonHandler.handleFAQ(dialogflowResult.fulfillmentText);
      await this.saveBotMessage(sessionId, response.message, 'faq.lien_he');
      return { ...response, intent: 'faq.lien_he' };
    }

    // Xử lý menu chính
    if (message === 'Menu chính' || message === 'main_menu') {
      await this.saveUserMessage(sessionId, 'Menu chính');
      const response = commonHandler.handleMainMenu();
      await this.saveBotMessage(sessionId, response.message, 'menu.chinh');
      return { ...response, intent: 'menu.chinh' };
    }

    // ==========================================
    // KIỂM TRA CONTEXT - Đang chờ nhập mô tả sự cố
    // ==========================================
    const context = await chatbotRepository.getConversationContext(sessionId);
    console.log('📋 Current context:', context ? { step: context.step, type: context.type } : 'null');
    
    if (context && context.step === 'waiting_description' && context.type === 'ktx_report') {
      // User đang nhập mô tả sự cố
      console.log('📝 User đang nhập mô tả sự cố:', message);
      await this.saveUserMessage(sessionId, message);
      const response = await ktxHandler.handleDescriptionInput(userId, sessionId, message);
      if (response) {
        await this.saveBotMessage(sessionId, response.message, 'ktx.nhap_mo_ta');
        return { ...response, intent: 'ktx.nhap_mo_ta' };
      }
    }

    return null; // Không phải message đặc biệt
  }

  /**
   * Generate response based on Dialogflow intent
   * @param {string} originalMessage - Message gốc từ user
   * @param {Object} dialogflowResult - Kết quả đầy đủ từ Dialogflow (để lấy outputContexts)
   */
  async generateResponse(intent, userId, sessionId, parameters = {}, fulfillmentText = '', originalMessage = '', dialogflowResult = null) {
    const mappedIntent = INTENT_MAPPING[intent] || intent;

    console.log('🎯 generateResponse - Intent:', intent, '| Mapped:', mappedIntent);
    console.log('📋 Parameters:', JSON.stringify(parameters));
    console.log('📦 Has dialogflowResult:', dialogflowResult ? 'YES' : 'NO');

    // ==========================================
    // KIỂM TRA: Nếu Intent là "đồng ý chung" + có MongoDB Context
    // → Xử lý theo step hiện tại (hỗ trợ cả CTSV và KTX)
    // ==========================================
    if (intent === 'dong_y_chung' || intent === 'xac_nhan_chung') {
      const mongoContext = await chatbotRepository.getConversationContext(sessionId);
      console.log('🔍 Kiểm tra MongoDB Context cho dong_y_chung:', mongoContext?.step, mongoContext?.type);
      
      // Case 1: step = 'ready_to_create' + type = 'ktx_report' → KTX
      if (mongoContext && mongoContext.step === 'ready_to_create' && mongoContext.type === 'ktx_report') {
        console.log('✅ Có MongoDB Context ready_to_create (KTX) → handleCreateFromAdvice');
        return await ktxHandler.handleCreateFromAdvice(userId, sessionId, dialogflowResult);
      }
      
      // Case 2: step = 'ready_to_create' (CTSV) → Chuyển sang xác nhận
      if (mongoContext && mongoContext.step === 'ready_to_create') {
        console.log('✅ Có MongoDB Context ready_to_create (CTSV) → handleCreateFromAdvice');
        return await ctsvHandler.handleCreateFromAdvice(userId, sessionId, dialogflowResult);
      }
      
      // Case 3: step = 'confirm_ktx' → Xác nhận KTX
      if (mongoContext && mongoContext.step === 'confirm_ktx') {
        console.log('✅ Có MongoDB Context confirm_ktx → handleConfirmKtxRequest');
        return await ktxHandler.handleConfirmKtxRequest(userId, sessionId);
      }
      
      // Case 4: step = 'confirm' → Xác nhận CTSV
      if (mongoContext && mongoContext.step === 'confirm') {
        console.log('✅ Có MongoDB Context confirm → handleConfirmRequest');
        return await ctsvHandler.handleConfirmRequest(userId, sessionId);
      }
    }

    // ==========================================
    // KIỂM TRA: Nếu có parameter purpose VÀ intent là tư vấn -> chuyển sang tư vấn
    // LƯU Ý: Không chuyển nếu intent là kiểm tra trạng thái (ctsv.kiem_tra)
    // ==========================================
    const purposeValue = parameters.purpose || parameters.document_purpose;
    const isCheckStatusIntent = intent === 'ctsv.kiem_tra' || mappedIntent === 'check_document_status';
    
    // Chỉ chuyển sang tư vấn nếu:
    // 1. Có purpose parameter
    // 2. KHÔNG phải intent kiểm tra trạng thái
    // 3. KHÔNG phải các intent tư vấn đã xác định
    if (purposeValue && !isCheckStatusIntent && !['ctsv.tu_van', 'document_advice'].includes(intent)) {
      console.log('🔄 Có purpose parameter, chuyển sang tư vấn:', purposeValue);
      // Normalize parameter name
      const normalizedParams = { ...parameters, purpose: purposeValue };
      return await ctsvHandler.getDocumentAdvice(userId, sessionId, normalizedParams, fulfillmentText);
    }

    // ==========================================
    // KTX INTENTS
    // ==========================================
    if (mappedIntent === 'check_ktx_status' || intent === 'ktx.kiem_tra') {
      return await ktxHandler.getKtxStatus(userId, parameters);
    }

    if (mappedIntent === 'ktx_info' || intent === 'ktx.thong_tin') {
      return await ktxHandler.getKtxInfo(fulfillmentText);
    }

    // Intent 1: ktx.bao_su_co_nhom - Entry point (Hybrid Flow)
    // Phân nhánh dựa trên entityType từ EquipmentStatusMapping
    if (intent === 'ktx.bao_su_co_nhom' || intent === 'ktx.bao_su_co' || mappedIntent === 'ktx_report') {
      return await ktxHandler.handleEquipmentReport(userId, sessionId, parameters, fulfillmentText, dialogflowResult);
    }

    // Intent 2: ktx.bao_su_co_thiet_bi - Follow-up (khi user gõ tên thiết bị)
    if (intent === 'ktx.bao_su_co_thiet_bi') {
      return await ktxHandler.handleEquipmentFollowUp(userId, sessionId, parameters, dialogflowResult);
    }

    // Intent: ktx.tao_tu_tu_van - User đồng ý tạo sau tư vấn
    if (intent === 'ktx.tao_tu_tu_van' || mappedIntent === 'create_ktx_from_advice') {
      return await ktxHandler.handleCreateFromAdvice(userId, sessionId, dialogflowResult);
    }

    // ==========================================
    // CTSV INTENTS
    // ==========================================
    if (mappedIntent === 'check_document_status' || intent === 'ctsv.kiem_tra') {
      return await ctsvHandler.getDocumentStatus(userId, parameters, originalMessage);
    }

    if (mappedIntent === 'check_status' || intent === 'kiem_tra.chung') {
      return commonHandler.handleCheckStatus(fulfillmentText);
    }

    if (mappedIntent === 'document_advice' || intent === 'ctsv.tu_van') {
      return await ctsvHandler.getDocumentAdvice(userId, sessionId, parameters, fulfillmentText, originalMessage);
    }

    if (mappedIntent === 'create_from_advice' || intent === 'ctsv.tao_tu_tu_van') {
      // Truyền dialogflowResult để hỗ trợ lấy purpose từ Dialogflow Context
      return await ctsvHandler.handleCreateFromAdvice(userId, sessionId, dialogflowResult);
    }

    if (mappedIntent === 'create_document_request' || intent === 'ctsv.tao_yeu_cau') {
      return await ctsvHandler.startCreateRequest(userId, sessionId);
    }

    if (mappedIntent === 'select_certificate_type' || intent === 'ctsv.tao_yeu_cau.chon_loai') {
      return await ctsvHandler.handleSelectCertificateType(userId, sessionId, parameters);
    }

    if (mappedIntent === 'select_certificate_name' || intent === 'ctsv.tao_yeu_cau.chon_ten') {
      return await ctsvHandler.handleSelectCertificateName(userId, sessionId, parameters);
    }

    if (mappedIntent === 'confirm_request' || intent === 'ctsv.tao_yeu_cau.xac_nhan') {
      return await ctsvHandler.handleConfirmRequest(userId, sessionId);
    }

    if (mappedIntent === 'cancel_request' || intent === 'ctsv.tao_yeu_cau.huy') {
      return await ctsvHandler.handleCancelRequest(sessionId);
    }

    // ==========================================
    // COMMON INTENTS
    // ==========================================
    if (mappedIntent === 'greeting' || intent === 'Default Welcome Intent') {
      return commonHandler.handleGreeting(fulfillmentText);
    }

    if (mappedIntent === 'unknown' || intent === 'Default Fallback Intent') {
      return commonHandler.handleFallback(fulfillmentText);
    }

    if (mappedIntent === 'user_guide' || intent === 'faq.huong_dan') {
      return commonHandler.handleUserGuide(fulfillmentText);
    }

    if (mappedIntent === 'main_menu' || intent === 'menu.chinh') {
      return commonHandler.handleMainMenu();
    }

    // ==========================================
    // TẤT CẢ INTENT KHÁC - Sử dụng fulfillmentText từ Dialogflow
    // ==========================================
    return commonHandler.handleFAQ(fulfillmentText);
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

  /**
   * Lấy trạng thái KTX cho user
   */
  async getKtxStatus(userId, parameters = {}) {
    return await ktxHandler.getKtxStatus(userId, parameters);
  }

  /**
   * Lấy trạng thái giấy tờ cho user
   */
  async getDocumentStatus(userId) {
    return await ctsvHandler.getDocumentStatus(userId);
  }

  // ==========================================
  // HELPER METHODS
  // ==========================================

  async saveUserMessage(sessionId, content) {
    await chatbotRepository.addMessage(sessionId, {
      type: 'user',
      content,
      timestamp: new Date()
    });
  }

  async saveBotMessage(sessionId, content, intent) {
    await chatbotRepository.addMessage(sessionId, {
      type: 'bot',
      content,
      intent,
      timestamp: new Date()
    });
  }

  formatResponse(sessionId, response, intent, confidence = 1.0) {
    return {
      success: true,
      message: 'Xử lý tin nhắn thành công',
      data: {
        sessionId,
        message: response.message,
        quickReplies: response.quickReplies || [],
        statusCard: response.statusCard || null,
        intent,
        confidence
      }
    };
  }
}

module.exports = new ChatbotService();
