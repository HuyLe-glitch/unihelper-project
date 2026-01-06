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
const { INTENT_MAPPING, MAIN_MENU_QUICK_REPLIES } = require('./constants');

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

    // Generate response dựa trên intent (truyền thêm message gốc để fallback tìm purpose)
    const response = await this.generateResponse(intent, userId, sessionId, parameters, fulfillmentText, message);
    
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
      await this.saveUserMessage(sessionId, 'Tạo yêu cầu báo sự cố');
      const response = await ktxHandler.handleCreateKtxFromAdvice(userId, sessionId);
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
   * @param {string} originalMessage - Message gốc từ user (để fallback tìm purpose khi Dialogflow không extract được)
   */
  async generateResponse(intent, userId, sessionId, parameters = {}, fulfillmentText = '', originalMessage = '') {
    const mappedIntent = INTENT_MAPPING[intent] || intent;

    console.log('🎯 generateResponse - Intent:', intent, '| Mapped:', mappedIntent);
    console.log('📋 Parameters:', JSON.stringify(parameters));

    // ==========================================
    // KIỂM TRA: Nếu có parameter purpose hoặc document_purpose -> chuyển sang tư vấn
    // ==========================================
    const purposeValue = parameters.purpose || parameters.document_purpose;
    if (purposeValue && !['ctsv.tu_van', 'document_advice'].includes(intent)) {
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

    // Xử lý intent ktx.bao_su_co - có thể có parameter equipment_category
    if (mappedIntent === 'ktx_report' || intent === 'ktx.bao_su_co') {
      // Kiểm tra nếu có equipment_category -> gọi getEquipmentAdvice
      const equipmentCategory = parameters.equipment_category;
      if (equipmentCategory) {
        return await ktxHandler.getEquipmentAdvice(userId, sessionId, parameters, fulfillmentText, originalMessage);
      }
      // Không có category -> gọi startKtxReport (chọn danh mục)
      return await ktxHandler.startKtxReport(userId, sessionId);
    }

    // Xử lý khi Dialogflow không detect được parameter nhưng message có keyword thiết bị
    if (intent === 'ktx.bao_su_co' || (originalMessage && (originalMessage.includes('thiết bị') || originalMessage.includes('hỏng')))) {
      // Thử tìm equipment_category từ message
      return await ktxHandler.getEquipmentAdvice(userId, sessionId, parameters, fulfillmentText, originalMessage);
    }

    // ==========================================
    // CTSV INTENTS
    // ==========================================
    if (mappedIntent === 'check_document_status' || intent === 'ctsv.kiem_tra') {
      return await ctsvHandler.getDocumentStatus(userId, parameters);
    }

    if (mappedIntent === 'check_status' || intent === 'kiem_tra.chung') {
      return commonHandler.handleCheckStatus(fulfillmentText);
    }

    if (mappedIntent === 'document_advice' || intent === 'ctsv.tu_van') {
      return await ctsvHandler.getDocumentAdvice(userId, sessionId, parameters, fulfillmentText, originalMessage);
    }

    if (mappedIntent === 'create_from_advice' || intent === 'ctsv.tao_tu_tu_van') {
      return await ctsvHandler.handleCreateFromAdvice(userId, sessionId);
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
  async getKtxStatus(userId) {
    return await ktxHandler.getKtxStatus(userId);
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
