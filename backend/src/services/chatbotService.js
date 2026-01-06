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
  'ktx.thong_tin': 'ktx_info',
  'ktx.kiem_tra': 'check_ktx_status',
  'kiem_tra.chung': 'check_status'
};

/**
 * Mapping từ mục đích (purpose) sang loại chứng nhận phù hợp
 */
const PURPOSE_TO_CERTIFICATE = {
  'giam_tru_gia_canh': {
    certificateType: 'Xác nhận sinh viên',
    certificateName: 'Xác nhận sinh viên đang học',
    description: 'Giấy xác nhận sinh viên để đăng ký giảm trừ gia cảnh (người phụ thuộc) khi kê khai thuế TNCN',
    note: 'Cần mang theo CMND/CCCD của người nộp thuế khi nhận giấy'
  },
  'nghia_vu_quan_su': {
    certificateType: 'Nghĩa vụ quân sự',
    certificateName: 'Nghĩa vụ quân sự chuẩn',
    description: 'Giấy xác nhận đang là sinh viên để được tạm hoãn nghĩa vụ quân sự',
    note: 'Nộp tại Ban chỉ huy quân sự phường/xã nơi đăng ký hộ khẩu'
  },
  'che_do_chinh_sach': {
    certificateType: 'Xác nhận sinh viên',
    certificateName: 'Xác nhận sinh viên đang học',
    description: 'Giấy xác nhận để hưởng các chế độ ưu đãi: hộ nghèo, cận nghèo, vùng khó khăn, dân tộc thiểu số',
    note: 'Cần kèm theo các giấy tờ chứng minh đối tượng chính sách'
  },
  'the_sinh_vien': {
    certificateType: 'Chứng nhận khác',
    certificateName: 'Chứng nhận khác chuẩn',
    description: 'Làm thẻ sinh viên mới hoặc cấp lại khi mất/hỏng',
    note: 'Cần ảnh 3x4 nền xanh (nếu làm mới)'
  },
  'xin_viec': {
    certificateType: 'Xác nhận sinh viên',
    certificateName: 'Xác nhận sinh viên đang học',
    description: 'Giấy xác nhận sinh viên để nộp hồ sơ xin việc làm hoặc thực tập',
    note: 'Thời gian xử lý: 3 ngày làm việc'
  },
  'xin_visa': {
    certificateType: 'Xác nhận sinh viên',
    certificateName: 'Xác nhận sinh viên có học bổng',
    description: 'Giấy xác nhận sinh viên kèm thông tin học bổng để xin visa du học',
    note: 'Cần bản tiếng Anh nếu nộp đại sứ quán'
  },
  'hoc_bong': {
    certificateType: 'Bảng điểm',
    certificateName: 'Bảng điểm tích lũy',
    description: 'Bảng điểm tích lũy để xin học bổng',
    note: 'Phí: 30,000đ'
  },
  'khac': {
    certificateType: null,
    certificateName: null,
    description: 'Vui lòng liên hệ phòng CTSV để được tư vấn trực tiếp',
    note: 'Hotline: 028 1234 5678'
  }
};

/**
 * Normalize purpose value - convert từ synonym sang reference value
 * Dialogflow có thể trả về synonym hoặc reference value
 */
const normalizePurpose = (purpose) => {
  if (!purpose) return null;
  
  const lowerPurpose = purpose.toLowerCase().trim();
  
  // Nếu đã là reference value
  if (PURPOSE_TO_CERTIFICATE[lowerPurpose]) {
    return lowerPurpose;
  }
  
  // Map từ synonym sang reference value
  const synonymMap = {
    // giam_tru_gia_canh
    'giảm trừ gia cảnh': 'giam_tru_gia_canh',
    'giảm thuế': 'giam_tru_gia_canh',
    'miễn thuế': 'giam_tru_gia_canh',
    'thuế tncn': 'giam_tru_gia_canh',
    'thuế thu nhập cá nhân': 'giam_tru_gia_canh',
    'người phụ thuộc': 'giam_tru_gia_canh',
    'kê khai thuế': 'giam_tru_gia_canh',
    'đăng ký giảm trừ': 'giam_tru_gia_canh',
    'bổ sung hồ sơ cá nhân': 'giam_tru_gia_canh',
    
    // nghia_vu_quan_su
    'nghĩa vụ quân sự': 'nghia_vu_quan_su',
    'quân sự': 'nghia_vu_quan_su',
    'nhập ngũ': 'nghia_vu_quan_su',
    'hoãn nghĩa vụ': 'nghia_vu_quan_su',
    'miễn nghĩa vụ': 'nghia_vu_quan_su',
    'tạm hoãn': 'nghia_vu_quan_su',
    'đi bộ đội': 'nghia_vu_quan_su',
    
    // che_do_chinh_sach
    'chế độ chính sách': 'che_do_chinh_sach',
    'chính sách': 'che_do_chinh_sach',
    'ưu đãi': 'che_do_chinh_sach',
    'hộ nghèo': 'che_do_chinh_sach',
    'cận nghèo': 'che_do_chinh_sach',
    'vùng khó khăn': 'che_do_chinh_sach',
    'dân tộc thiểu số': 'che_do_chinh_sach',
    'miễn giảm học phí': 'che_do_chinh_sach',
    
    // the_sinh_vien
    'thẻ sinh viên': 'the_sinh_vien',
    'làm thẻ': 'the_sinh_vien',
    'cấp thẻ': 'the_sinh_vien',
    'mất thẻ': 'the_sinh_vien',
    'thẻ sv': 'the_sinh_vien',
    'làm lại thẻ': 'the_sinh_vien',
    
    // xin_viec
    'xin việc': 'xin_viec',
    'xin việc làm': 'xin_viec',
    'đi làm': 'xin_viec',
    'thực tập': 'xin_viec',
    'nộp hồ sơ việc làm': 'xin_viec',
    'tuyển dụng': 'xin_viec',
    
    // xin_visa
    'xin visa': 'xin_visa',
    'du học': 'xin_visa',
    'đi nước ngoài': 'xin_visa',
    'làm visa': 'xin_visa',
    'xuất cảnh': 'xin_visa',
    
    // hoc_bong
    'học bổng': 'hoc_bong',
    'xin học bổng': 'hoc_bong',
    'đăng ký học bổng': 'hoc_bong',
    'nhận học bổng': 'hoc_bong'
  };
  
  return synonymMap[lowerPurpose] || 'khac';
};

class ChatbotService {
  /**
   * Xử lý tin nhắn từ người dùng - 100% Dialogflow
   */
  async processMessage(userId, message, sessionId = null) {
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
    
    console.log('📤 Dialogflow Response:', {
      intent,
      confidence: dialogflowResult.intentDetectionConfidence,
      rawParameters: JSON.stringify(rawParameters, null, 2),
      extractedParameters: parameters,
      fulfillmentText: fulfillmentText?.substring(0, 100)
    });

    // Generate response dựa trên intent
    const response = await this.generateResponse(intent, userId, parameters, fulfillmentText);
    
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
   */
  async generateResponse(intent, userId, parameters = {}, fulfillmentText = '') {
    // Map Dialogflow intent sang internal intent
    const mappedIntent = INTENT_MAPPING[intent] || intent;

    // Xử lý intent welcome
    if (mappedIntent === 'greeting' || intent === 'Default Welcome Intent') {
      return {
        message: fulfillmentText || `<div class="info-card">
          <div class="info-card-title">👋 Xin chào!</div>
          <div class="info-card-content">Mình là UniHelper Bot. Mình có thể giúp gì cho bạn?</div>
        </div>`,
        quickReplies: MAIN_MENU_QUICK_REPLIES
      };
    }

    // Xử lý intent kiểm tra yêu cầu KTX (báo cáo sự cố thiết bị)
    if (mappedIntent === 'check_ktx_status' || intent === 'ktx.kiem_tra') {
      return await this.getKtxStatus(userId, parameters);
    }

    // Xử lý intent kiểm tra yêu cầu giấy tờ
    if (mappedIntent === 'check_document_status' || intent === 'ctsv.kiem_tra') {
      return await this.getDocumentStatus(userId, parameters);
    }

    // Xử lý intent kiểm tra chung
    if (mappedIntent === 'check_status' || intent === 'kiem_tra.chung') {
      return {
        message: `<div class="info-card">
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

    // Xử lý intent tư vấn giấy tờ theo mục đích
    if (mappedIntent === 'document_advice' || intent === 'ctsv.tu_van') {
      return this.getDocumentAdvice(parameters);
    }

    // Sử dụng fulfillmentText từ Dialogflow (cho các intent FAQ)
    if (fulfillmentText && fulfillmentText.trim()) {
      return {
        message: `<div class="info-card">
          <div class="info-card-content">${fulfillmentText}</div>
        </div>`,
        quickReplies: MAIN_MENU_QUICK_REPLIES
      };
    }

    // Default Fallback - Dialogflow không hiểu
    return {
      message: `<div class="info-card">
        <div class="info-card-title">🤔 Xin lỗi!</div>
        <div class="info-card-content">
          Mình chưa hiểu câu hỏi của bạn. Bạn có thể thử:
          <ul style="margin: 8px 0; padding-left: 20px;">
            <li>Hỏi về cách xin giấy tờ</li>
            <li>Báo cáo sự cố thiết bị</li>
            <li>Kiểm tra trạng thái yêu cầu</li>
          </ul>
        </div>
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
   */
  getDocumentAdvice(parameters = {}) {
    const rawPurpose = parameters.purpose;
    
    // Nếu không có purpose, hỏi lại người dùng
    if (!rawPurpose) {
      return {
        message: `<div class="info-card">
          <div class="info-card-title">📋 TƯ VẤN GIẤY TỜ</div>
          <div class="info-card-content">
            Bạn cần giấy tờ cho mục đích gì?
            <ul style="margin: 8px 0; padding-left: 20px;">
              <li>Giảm trừ gia cảnh (thuế TNCN)</li>
              <li>Hoãn nghĩa vụ quân sự</li>
              <li>Hưởng chế độ chính sách</li>
              <li>Làm thẻ sinh viên</li>
            </ul>
          </div>
        </div>`,
        quickReplies: [
          { id: 'thue', icon: '💰', label: 'Giảm thuế', action: 'advice_tax' },
          { id: 'quansu', icon: '🎖️', label: 'Quân sự', action: 'advice_military' },
          { id: 'chinhsach', icon: '📑', label: 'Chính sách', action: 'advice_policy' },
          { id: 'thesv', icon: '🪪', label: 'Thẻ SV', action: 'advice_card' }
        ]
      };
    }

    // Normalize purpose từ synonym sang reference value
    const purpose = normalizePurpose(rawPurpose);
    console.log('📋 Document Advice - Raw:', rawPurpose, '→ Normalized:', purpose);

    // Lấy thông tin giấy tờ phù hợp
    const advice = PURPOSE_TO_CERTIFICATE[purpose] || PURPOSE_TO_CERTIFICATE['khac'];

    if (!advice.certificateName) {
      return {
        message: `<div class="info-card">
          <div class="info-card-title">🤔 CẦN TƯ VẤN THÊM</div>
          <div class="info-card-content">
            ${advice.description}<br/><br/>
            📞 <strong>${advice.note}</strong>
          </div>
        </div>`,
        quickReplies: [
          { id: 'lienhe', icon: '📞', label: 'Liên hệ', action: 'contact' },
          { id: 'dsgiayto', icon: '📄', label: 'Xem danh sách', action: 'document_info' },
          { id: 'quaylai', icon: '🔙', label: 'Quay lại', action: 'main_menu' }
        ]
      };
    }

    // Trả về tư vấn cụ thể
    return {
      message: `<div class="info-card">
        <div class="info-card-title">✅ TƯ VẤN GIẤY TỜ</div>
        <div class="info-card-content">
          <div style="background: linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%); border-radius: 10px; padding: 12px; margin-bottom: 12px;">
            <strong>📄 Giấy tờ phù hợp:</strong><br/>
            <span style="font-size: 16px; color: #065f46; font-weight: 600;">${advice.certificateName}</span>
          </div>
          <strong>📝 Mô tả:</strong> ${advice.description}
          <div style="background: #eff6ff; border-radius: 8px; padding: 12px; margin-top: 12px; border-left: 4px solid #3b82f6;">
            <strong>📍 Hướng dẫn tạo yêu cầu:</strong><br/>
            <div style="margin-top: 8px; padding-left: 8px;">
              <strong>Bước 1:</strong> Vào menu <strong>"Yêu cầu chứng nhận"</strong><br/>
              <strong>Bước 2:</strong> Chọn loại: <strong style="color: #2563eb;">${advice.certificateType}</strong><br/>
              <strong>Bước 3:</strong> Chọn tên: <strong style="color: #2563eb;">${advice.certificateName}</strong><br/>
              <strong>Bước 4:</strong> Nhấn <strong>"Tạo yêu cầu"</strong>
            </div>
          </div>
          <div style="background: #fef3c7; border-radius: 8px; padding: 10px; margin-top: 10px;">
            💡 <strong>Lưu ý:</strong> ${advice.note}
          </div>
        </div>
      </div>`,
      quickReplies: [
        { id: 'taoyeucau', icon: '📝', label: 'Tạo yêu cầu', action: 'create_document_request' },
        { id: 'huongdan', icon: '📖', label: 'Xem hướng dẫn', action: 'document_info' },
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
}

module.exports = new ChatbotService();
