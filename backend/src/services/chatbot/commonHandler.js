/**
 * Common Handler
 * Xử lý các intent chung: greeting, fallback, FAQ, menu, liên hệ
 * LƯU Ý: Tất cả nội dung text đều lấy từ Dialogflow (fulfillmentText)
 * Code chỉ xử lý format HTML
 */

/**
 * Format text từ Dialogflow để hiển thị đúng trong HTML
 * - Convert \n thành <br> để xuống dòng
 * - Giữ nguyên emoji và ký tự đặc biệt
 */
function formatDialogflowText(text) {
  if (!text) return '';
  return text.replace(/\n/g, '<br>');
}

class CommonHandler {
  /**
   * Xử lý greeting intent
   * Nội dung lấy 100% từ Dialogflow welcome intent
   * Không hiện quickReplies vì Dialogflow đã có menu trong text
   */
  handleGreeting(fulfillmentText = '') {
    return {
      message: `<div class="info-card">
        <div class="info-card-content">${formatDialogflowText(fulfillmentText) || 'Xin chào!'}</div>
      </div>`,
      quickReplies: []  // Không hiện menu vì Dialogflow đã có trong text
    };
  }

  /**
   * Xử lý fallback intent (không hiểu câu hỏi)
   * Nội dung lấy 100% từ Dialogflow Default Fallback Intent
   */
  handleFallback(fulfillmentText = '') {
    return {
      message: `<div class="info-card">
        <div class="info-card-content">${formatDialogflowText(fulfillmentText) || 'Xin lỗi, mình chưa hiểu ý bạn.'}</div>
      </div>`,
      quickReplies: []
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
   * Nội dung lấy 100% từ Dialogflow
   */
  handleFAQ(fulfillmentText = '') {
    return {
      message: `<div class="info-card">
        <div class="info-card-content">${formatDialogflowText(fulfillmentText) || 'Xin lỗi, có lỗi xảy ra. Vui lòng thử lại.'}</div>
      </div>`,
      quickReplies: []
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
      quickReplies: []
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
      quickReplies: []
    };
  }
}

module.exports = new CommonHandler();
