/**
 * CTSV Handler
 * Xử lý các intent liên quan đến CTSV: giấy tờ, chứng nhận
 */
const chatbotRepository = require('../../repositories/chatbotRepository');
const studentRepository = require('../../repositories/studentRepository');
const studentNotificationService = require('../studentNotificationService');
const { MAIN_MENU_QUICK_REPLIES, getStatusEmoji, getCertificateTypeIcon } = require('./constants');
const { findReferenceValueFromMessage } = require('../../config/dialogflow');

class CtsvHandler {
  constructor() {
    this.io = null;
  }

  /**
   * Set socket.io instance
   */
  setIO(io) {
    this.io = io;
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
          const statusEmoji = getStatusEmoji(req.status);
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
   * Tư vấn giấy tờ dựa theo mục đích sử dụng
   * @param {string} originalMessage - Message gốc từ user (dùng khi Dialogflow không extract được purpose)
   */
  async getDocumentAdvice(userId, sessionId, parameters = {}, fulfillmentText = '', originalMessage = '') {
    // Dialogflow có thể trả về purpose hoặc document_purpose
    let rawPurpose = parameters.purpose || parameters.document_purpose;
    
    console.log('📋 getDocumentAdvice - Parameters received:', JSON.stringify(parameters));
    console.log('📋 getDocumentAdvice - Raw purpose from Dialogflow:', rawPurpose);
    console.log('📋 getDocumentAdvice - Original message:', originalMessage);
    
    // Nếu Dialogflow không extract được purpose, thử tìm từ message gốc
    // bằng cách lấy synonyms trực tiếp từ Dialogflow Entity
    if (!rawPurpose && originalMessage) {
      console.log('🔍 Purpose rỗng, thử tìm reference value từ Dialogflow Entity...');
      rawPurpose = await findReferenceValueFromMessage(originalMessage, 'purpose');
      if (rawPurpose) {
        console.log('✅ Tìm thấy reference value từ Dialogflow Entity:', rawPurpose);
      }
    }
    
    // Nếu vẫn không có purpose, lấy danh sách loại chứng nhận từ DB và hỏi lại
    if (!rawPurpose) {
      const certificateTypes = await chatbotRepository.getAllCertificateTypes();
      
      let typeListHtml = '';
      const quickReplies = [];
      
      if (certificateTypes && certificateTypes.length > 0) {
        typeListHtml = certificateTypes.slice(0, 6).map(type => 
          `<li>${type.name}</li>`
        ).join('');
        
        certificateTypes.slice(0, 5).forEach((type, idx) => {
          quickReplies.push({
            id: `advice_${idx}`,
            icon: getCertificateTypeIcon(type.name),
            label: type.name.length > 15 ? type.name.substring(0, 15) + '...' : type.name,
            action: `advice_type_${type._id}`
          });
        });
      } else {
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

    // Query từ PurposeMapping
    const mappingResult = await chatbotRepository.findCertificateByPurpose(rawPurpose);

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

    const { certificate, adviceNote, description } = mappingResult;
    const certificateName = certificate.name;
    const certificateTypeName = certificate.certificateType?.name || 'N/A';
    const finalDescription = description || certificate.description || `Giấy ${certificateName} cho mục đích ${rawPurpose}`;
    const finalAdviceNote = adviceNote || 'Thời gian xử lý: 1-3 ngày làm việc';

    // Lấy thông tin sinh viên và lưu context
    const student = await studentRepository.findByUser(userId);
    
    if (student && sessionId) {
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

    const selfGuideText = `
      <ol style="margin: 8px 0; padding-left: 20px;">
        <li>Vào menu <strong>"Yêu cầu chứng nhận"</strong></li>
        <li>Chọn loại chứng nhận: <strong>${certificateTypeName}</strong></li>
        <li>Chọn tên chứng nhận: <strong>${certificateName}</strong></li>
        <li>Điền thông tin và gửi yêu cầu</li>
      </ol>
    `;

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
   * Tạo yêu cầu từ tư vấn (luồng tự nhiên)
   */
  async handleCreateFromAdvice(userId, sessionId) {
    try {
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

      await chatbotRepository.saveConversationContext(sessionId, {
        step: 'select_type',
        studentId: student._id.toString()
      });

      const typeReplies = certificateTypes.slice(0, 6).map((type, idx) => ({
        id: `type_${type._id}`,
        icon: getCertificateTypeIcon(type.name),
        label: type.name,
        action: `select_type_${type._id}`
      }));

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

      const context = await chatbotRepository.getConversationContext(sessionId);
      await chatbotRepository.saveConversationContext(sessionId, {
        ...context,
        step: 'select_name',
        certificateTypeId: certificateTypeId
      });

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
   * Bước 3: Xử lý khi user chọn tên chứng nhận
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

      const context = await chatbotRepository.getConversationContext(sessionId);
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

      const requestCode = await chatbotRepository.getNextCertificateRequestCode();

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
        
        // Lấy thông tin đầy đủ từ DB để gửi qua socket
        const populatedRequest = await chatbotRepository.getCertificateRequestById(newRequest._id);
        
        // Gửi thông tin đầy đủ để frontend có thể thêm trực tiếp vào state
        this.io.emit('CERTIFICATE_REQUEST_CREATED', {
          request: {
            _id: populatedRequest._id,
            requestCode: populatedRequest.requestCode,
            certificateType: populatedRequest.certificateType,
            certificateName: populatedRequest.certificateName,
            semester: populatedRequest.semester,
            status: populatedRequest.status,
            createdAt: populatedRequest.createdAt,
            notes: populatedRequest.notes,
            student: populatedRequest.student
          },
          studentId: context.studentId,
          message: `Yêu cầu mới ${requestCode} đã được tạo qua Chatbot`
        });
      }

      // Tạo thông báo cho sinh viên
      try {
        await studentNotificationService.createCtsvRequestCreated(
          userId, // Use userId (User document ID) not studentId
          {
            requestCode,
            requestId: newRequest._id,
            certificateType: context.certificateTypeName || 'Giấy tờ CTSV',
            certificateName: context.certificateName || 'Giấy tờ CTSV'
          }
        );
        console.log('📬 Created notification for CTSV request:', requestCode);
      } catch (notifyError) {
        console.error('Error creating notification:', notifyError);
        // Don't fail the request creation if notification fails
      }

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
}

module.exports = new CtsvHandler();
