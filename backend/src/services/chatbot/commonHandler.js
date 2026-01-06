/**
 * Common Handler
 * Xử lý các intent chung: greeting, fallback, FAQ, menu, liên hệ
 */
const { MAIN_MENU_QUICK_REPLIES } = require('./constants');

class CommonHandler {
  /**
   * Xử lý greeting intent
   */
  handleGreeting(fulfillmentText = '') {
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

  /**
   * Xử lý fallback intent (không hiểu câu hỏi)
   */
  handleFallback(fulfillmentText = '') {
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

  /**
   * Xử lý kiểm tra trạng thái chung - hỏi loại yêu cầu
   */
  handleCheckStatus(fulfillmentText = '') {
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

  /**
   * Xử lý FAQ và các intent thông tin khác
   * Sử dụng 100% fulfillmentText từ Dialogflow
   */
  handleFAQ(fulfillmentText = '') {
    if (fulfillmentText && fulfillmentText.trim()) {
      return {
        message: `<div class="info-card">
          <div class="info-card-content">${fulfillmentText}</div>
        </div>`,
        quickReplies: MAIN_MENU_QUICK_REPLIES
      };
    }

    // Fallback nếu Dialogflow không trả về gì
    console.warn('⚠️ No fulfillmentText from Dialogflow');
    return {
      message: `<div class="info-card">
        <div class="info-card-content">Xin lỗi, có lỗi xảy ra. Vui lòng thử lại.</div>
      </div>`,
      quickReplies: MAIN_MENU_QUICK_REPLIES
    };
  }

  /**
   * Tạo error response
   */
  createErrorResponse(errorMessage = 'Có lỗi xảy ra. Vui lòng thử lại sau.') {
    return {
      message: `<div class="highlight-box">
        <span class="highlight-box-icon">⚠️</span>
        <div>${errorMessage}</div>
      </div>`,
      quickReplies: MAIN_MENU_QUICK_REPLIES
    };
  }

  /**
   * Tạo not found response
   */
  createNotFoundResponse(resourceName = 'thông tin') {
    return {
      message: `<div class="highlight-box">
        <span class="highlight-box-icon">⚠️</span>
        <div>Không tìm thấy ${resourceName}. Vui lòng liên hệ phòng CTSV.</div>
      </div>`,
      quickReplies: MAIN_MENU_QUICK_REPLIES
    };
  }
}

module.exports = new CommonHandler();
