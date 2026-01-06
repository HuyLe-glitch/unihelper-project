/**
 * KTX Handler
 * Xử lý các intent liên quan đến KTX: báo sự cố thiết bị, kiểm tra trạng thái
 */
const chatbotRepository = require('../../repositories/chatbotRepository');
const studentRepository = require('../../repositories/studentRepository');
const studentNotificationService = require('../studentNotificationService');
const { MAIN_MENU_QUICK_REPLIES, getStatusEmoji } = require('./constants');
const { findReferenceValueFromMessage } = require('../../config/dialogflow');

class KtxHandler {
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
          const statusEmoji = getStatusEmoji(req.status);
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
   * Hiển thị thông tin KTX
   */
  async getKtxInfo(fulfillmentText = '') {
    return {
      message: fulfillmentText || `<div class="info-card">
        <div class="info-card-title">🏠 THÔNG TIN KÝ TÚC XÁ</div>
        <div class="info-card-content">
          <strong>Các dịch vụ hỗ trợ:</strong>
          <ul style="margin: 8px 0; padding-left: 20px;">
            <li>🔧 Báo cáo sự cố thiết bị</li>
            <li>📋 Kiểm tra trạng thái yêu cầu</li>
            <li>📞 Liên hệ ban quản lý</li>
          </ul>
        </div>
      </div>`,
      quickReplies: [
        { id: 'baocao', icon: '🔧', label: 'Báo sự cố', action: 'ktx_report' },
        { id: 'trangthai', icon: '📋', label: 'Kiểm tra yêu cầu', action: 'check_ktx_status' },
        { id: 'quaylai', icon: '🔙', label: 'Quay lại', action: 'main_menu' }
      ]
    };
  }

  /**
   * Tư vấn thiết bị - Khi user nói "hỏng thiết bị điện/nước"
   * Flow: Detect equipment_category → Hiển thị danh sách thiết bị trong danh mục
   */
  async getEquipmentAdvice(userId, sessionId, parameters = {}, fulfillmentText = '', originalMessage = '') {
    try {
      console.log('📋 getEquipmentAdvice - Parameters:', JSON.stringify(parameters));
      console.log('📋 getEquipmentAdvice - Original message:', originalMessage);

      const student = await studentRepository.findByUser(userId);
      if (!student) {
        return {
          message: `<div class="highlight-box">
            <span class="highlight-box-icon">⚠️</span>
            <div>Chỉ sinh viên KTX mới có thể báo cáo sự cố thiết bị.</div>
          </div>`,
          quickReplies: MAIN_MENU_QUICK_REPLIES
        };
      }

      // Lấy equipment_category từ Dialogflow hoặc tìm từ message
      let categoryCode = parameters.equipment_category;
      
      // Nếu Dialogflow không extract được, thử tìm từ message gốc
      if (!categoryCode && originalMessage) {
        console.log('🔍 equipment_category rỗng, thử tìm từ message gốc...');
        categoryCode = await findReferenceValueFromMessage(originalMessage, 'equipment_category');
      }

      if (!categoryCode) {
        // Không detect được danh mục → Hiển thị menu chọn danh mục
        return await this.startKtxReport(userId, sessionId);
      }

      console.log('📋 Detected equipment_category:', categoryCode);

      // Tìm danh mục từ code
      const categories = await chatbotRepository.getEquipmentCategories();
      const matchedCategory = categories.find(cat => {
        const catCode = cat.name.toLowerCase()
          .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
          .replace(/đ/g, 'd').replace(/\s+/g, '_');
        return catCode === categoryCode || 
               cat.name.toLowerCase().includes(categoryCode.replace(/_/g, ' ')) ||
               categoryCode.includes(cat.name.toLowerCase().replace(/\s+/g, '_'));
      });

      if (!matchedCategory) {
        console.log('❌ Không tìm thấy danh mục cho code:', categoryCode);
        return await this.startKtxReport(userId, sessionId);
      }

      // Lấy danh sách thiết bị trong danh mục
      const equipments = await chatbotRepository.getEquipmentsByCategory(matchedCategory._id);

      if (!equipments || equipments.length === 0) {
        return {
          message: `<div class="info-card">
            <div class="info-card-title">🔧 ${matchedCategory.name.toUpperCase()}</div>
            <div class="info-card-content">
              Hiện tại chưa có thiết bị nào trong danh mục này.<br/>
              Vui lòng liên hệ ban quản lý KTX.
            </div>
          </div>`,
          quickReplies: [
            { id: 'other', icon: '🔧', label: 'Chọn danh mục khác', action: 'ktx_report' },
            { id: 'menu', icon: '🏠', label: 'Menu chính', action: 'main_menu' }
          ]
        };
      }

      // Lưu context
      await chatbotRepository.saveConversationContext(sessionId, {
        step: 'select_equipment_from_advice',
        studentId: student._id.toString(),
        categoryId: matchedCategory._id.toString(),
        categoryName: matchedCategory.name,
        type: 'ktx_report'
      });

      // Tạo danh sách quick replies cho thiết bị
      const equipmentReplies = equipments.slice(0, 6).map((eq) => ({
        id: `eq_${eq._id}`,
        icon: '🔧',
        label: eq.name.length > 20 ? eq.name.substring(0, 20) + '...' : eq.name,
        action: `select_equipment_${eq._id}`
      }));

      equipmentReplies.push({ id: 'other', icon: '📋', label: 'Danh mục khác', action: 'ktx_report' });
      equipmentReplies.push({ id: 'cancel', icon: '❌', label: 'Hủy', action: 'cancel_ktx_request' });

      return {
        message: `<div class="info-card">
          <div class="info-card-title">🔧 SỰ CỐ ${matchedCategory.name.toUpperCase()}</div>
          <div class="info-card-content">
            Bạn đang gặp sự cố với <strong>${matchedCategory.name}</strong>.<br/><br/>
            <strong>Vui lòng chọn thiết bị cụ thể bạn gặp sự cố:</strong>
          </div>
        </div>`,
        quickReplies: equipmentReplies
      };
    } catch (error) {
      console.error('Error in getEquipmentAdvice:', error);
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
   * Bắt đầu báo cáo sự cố - Bước 1: Chọn danh mục thiết bị
   */
  async startKtxReport(userId, sessionId) {
    try {
      const student = await studentRepository.findByUser(userId);
      if (!student) {
        return {
          message: `<div class="highlight-box">
            <span class="highlight-box-icon">⚠️</span>
            <div>Chỉ sinh viên KTX mới có thể báo cáo sự cố thiết bị.</div>
          </div>`,
          quickReplies: MAIN_MENU_QUICK_REPLIES
        };
      }

      // TODO: Kiểm tra sinh viên có ở KTX không
      // const isKtxStudent = await chatbotRepository.checkKtxStudent(student._id);

      // Lấy danh sách danh mục thiết bị
      const categories = await chatbotRepository.getEquipmentCategories();
      
      if (!categories || categories.length === 0) {
        return {
          message: `<div class="highlight-box">
            <span class="highlight-box-icon">⚠️</span>
            <div>Hiện tại chưa có danh mục thiết bị nào. Vui lòng liên hệ ban quản lý KTX.</div>
          </div>`,
          quickReplies: MAIN_MENU_QUICK_REPLIES
        };
      }

      await chatbotRepository.saveConversationContext(sessionId, {
        step: 'select_category',
        studentId: student._id.toString(),
        type: 'ktx_report'
      });

      const categoryReplies = categories.slice(0, 6).map((cat) => ({
        id: `cat_${cat._id}`,
        icon: '🔧',
        label: cat.name,
        action: `select_category_${cat._id}`
      }));

      categoryReplies.push({ id: 'cancel', icon: '❌', label: 'Hủy', action: 'cancel_ktx_request' });

      return {
        message: `<div class="info-card">
          <div class="info-card-title">🔧 BÁO CÁO SỰ CỐ THIẾT BỊ</div>
          <div class="info-card-content">
            <strong>Bước 1/3:</strong> Chọn danh mục thiết bị<br/><br/>
            Vui lòng chọn danh mục thiết bị bị hỏng:
          </div>
        </div>`,
        quickReplies: categoryReplies
      };
    } catch (error) {
      console.error('Error starting KTX report:', error);
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
   * Bước 2: Chọn thiết bị cụ thể trong danh mục
   */
  async handleSelectCategory(userId, sessionId, parameters) {
    try {
      const categoryId = parameters.category_id;
      
      if (!categoryId) {
        return {
          message: `<div class="highlight-box">
            <span class="highlight-box-icon">⚠️</span>
            <div>Vui lòng chọn danh mục thiết bị từ danh sách.</div>
          </div>`,
          quickReplies: [
            { id: 'retry', icon: '🔄', label: 'Thử lại', action: 'ktx_report' },
            { id: 'cancel', icon: '❌', label: 'Hủy', action: 'cancel_ktx_request' }
          ]
        };
      }

      // Lấy danh sách thiết bị trong danh mục
      const equipments = await chatbotRepository.getEquipmentsByCategory(categoryId);
      
      if (!equipments || equipments.length === 0) {
        return {
          message: `<div class="highlight-box">
            <span class="highlight-box-icon">⚠️</span>
            <div>Danh mục này chưa có thiết bị nào. Vui lòng chọn danh mục khác.</div>
          </div>`,
          quickReplies: [
            { id: 'retry', icon: '🔄', label: 'Chọn danh mục khác', action: 'ktx_report' },
            { id: 'cancel', icon: '❌', label: 'Hủy', action: 'cancel_ktx_request' }
          ]
        };
      }

      const context = await chatbotRepository.getConversationContext(sessionId);
      await chatbotRepository.saveConversationContext(sessionId, {
        ...context,
        step: 'select_equipment',
        categoryId: categoryId
      });

      const equipmentReplies = equipments.slice(0, 6).map((eq) => ({
        id: `eq_${eq._id}`,
        icon: '🔧',
        label: eq.name.length > 20 ? eq.name.substring(0, 20) + '...' : eq.name,
        action: `select_equipment_${eq._id}`
      }));

      equipmentReplies.push({ id: 'back', icon: '🔙', label: 'Quay lại', action: 'ktx_report' });
      equipmentReplies.push({ id: 'cancel', icon: '❌', label: 'Hủy', action: 'cancel_ktx_request' });

      return {
        message: `<div class="info-card">
          <div class="info-card-title">🔧 BÁO CÁO SỰ CỐ THIẾT BỊ</div>
          <div class="info-card-content">
            <strong>Bước 2/3:</strong> Chọn thiết bị<br/><br/>
            Vui lòng chọn thiết bị cần báo sự cố:
          </div>
        </div>`,
        quickReplies: equipmentReplies
      };
    } catch (error) {
      console.error('Error selecting category:', error);
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
   * Bước: User chọn thiết bị → Yêu cầu nhập mô tả sự cố
   */
  async handleSelectEquipment(userId, sessionId, parameters) {
    try {
      const equipmentId = parameters.equipment_id;
      
      if (!equipmentId) {
        return {
          message: `<div class="highlight-box">
            <span class="highlight-box-icon">⚠️</span>
            <div>Vui lòng chọn thiết bị từ danh sách.</div>
          </div>`,
          quickReplies: [
            { id: 'retry', icon: '🔄', label: 'Thử lại', action: 'ktx_report' },
            { id: 'cancel', icon: '❌', label: 'Hủy', action: 'cancel_ktx_request' }
          ]
        };
      }

      // Lấy thông tin thiết bị
      const equipment = await chatbotRepository.getEquipmentById(equipmentId);
      
      const context = await chatbotRepository.getConversationContext(sessionId);
      
      // Lưu context và chuyển sang bước nhập mô tả
      await chatbotRepository.saveConversationContext(sessionId, {
        ...context,
        step: 'waiting_description',
        equipmentId: equipmentId,
        equipmentName: equipment?.name || 'N/A',
        categoryName: equipment?.category?.name || context?.categoryName || 'N/A',
        type: 'ktx_report'
      });

      // Yêu cầu nhập mô tả sự cố ngay
      return {
        message: `<div class="info-card">
          <div class="info-card-title">📝 MÔ TẢ SỰ CỐ ${(equipment?.name || 'THIẾT BỊ').toUpperCase()}</div>
          <div class="info-card-content">
            <div style="background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%); border-radius: 10px; padding: 15px; margin: 8px 0;">
              📋 <strong>Danh mục:</strong> ${equipment?.category?.name || context?.categoryName || 'N/A'}<br/>
              🔧 <strong>Thiết bị:</strong> ${equipment?.name || 'N/A'}
            </div>
            <br/>
            <strong>💡 Lưu ý:</strong>
            <ul style="margin: 8px 0; padding-left: 20px;">
              <li>Kiểm tra nguồn điện/nước trước khi báo cáo</li>
              <li>Thời gian xử lý dự kiến: 1-3 ngày làm việc</li>
            </ul>
            <br/>
            <div style="background: #fef3c7; border-radius: 8px; padding: 12px;">
              ✏️ <strong>Vui lòng mô tả chi tiết sự cố bạn gặp phải:</strong><br/>
              <small style="color: #6b7280;">Ví dụ: "Máy lạnh không lạnh, chạy kêu to", "Vòi nước bị rò rỉ"...</small>
            </div>
          </div>
        </div>`,
        quickReplies: [
          { id: 'other', icon: '🔧', label: 'Chọn thiết bị khác', action: 'ktx_report' },
          { id: 'cancel', icon: '❌', label: 'Hủy', action: 'cancel_ktx_request' }
        ]
      };
    } catch (error) {
      console.error('Error selecting equipment:', error);
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
   * Bước: User chọn "Tạo yêu cầu" → Hỏi mô tả sự cố (không còn dùng nữa, giữ lại để tương thích)
   */
  async handleCreateKtxFromAdvice(userId, sessionId) {
    try {
      console.log('📝 handleCreateKtxFromAdvice - sessionId:', sessionId);
      const context = await chatbotRepository.getConversationContext(sessionId);
      console.log('📝 handleCreateKtxFromAdvice - context:', context);
      
      if (!context || !context.equipmentId) {
        return {
          message: `<div class="highlight-box">
            <span class="highlight-box-icon">⚠️</span>
            <div>Phiên làm việc đã hết hạn. Vui lòng bắt đầu lại.</div>
          </div>`,
          quickReplies: [
            { id: 'retry', icon: '🔧', label: 'Báo sự cố mới', action: 'ktx_report' },
            { id: 'menu', icon: '🏠', label: 'Menu chính', action: 'main_menu' }
          ]
        };
      }

      // Cập nhật context - chờ nhập mô tả
      await chatbotRepository.saveConversationContext(sessionId, {
        ...context,
        step: 'waiting_description'
      });
      
      console.log('📝 Context updated to waiting_description');

      return {
        message: `<div class="info-card">
          <div class="info-card-title">📝 MÔ TẢ SỰ CỐ</div>
          <div class="info-card-content">
            <div style="background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%); border-radius: 10px; padding: 15px; margin: 8px 0;">
              🔧 <strong>Thiết bị:</strong> ${context.equipmentName}
            </div>
            <br/>
            <strong>Vui lòng mô tả chi tiết sự cố bạn gặp phải:</strong><br/>
            <small style="color: #6b7280;">Ví dụ: "Máy lạnh không lạnh, chạy kêu to", "Vòi nước bị rò rỉ"...</small>
          </div>
        </div>`,
        quickReplies: [
          { id: 'cancel', icon: '❌', label: 'Hủy', action: 'cancel_ktx_request' }
        ]
      };
    } catch (error) {
      console.error('Error in handleCreateKtxFromAdvice:', error);
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
   * Bước: User nhập mô tả → Hiển thị xác nhận
   */
  async handleDescriptionInput(userId, sessionId, description) {
    try {
      const context = await chatbotRepository.getConversationContext(sessionId);
      
      if (!context || context.step !== 'waiting_description') {
        return null; // Không phải context đang chờ mô tả
      }

      // Cập nhật context với mô tả
      await chatbotRepository.saveConversationContext(sessionId, {
        ...context,
        step: 'confirm_ktx',
        description: description
      });

      return {
        message: `<div class="info-card">
          <div class="info-card-title">📝 XÁC NHẬN TẠO YÊU CẦU</div>
          <div class="info-card-content">
            <div style="background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%); border-radius: 10px; padding: 15px; margin: 8px 0;">
              📋 <strong>Danh mục:</strong> ${context.categoryName}<br/>
              🔧 <strong>Thiết bị:</strong> ${context.equipmentName}<br/>
              📝 <strong>Mô tả:</strong> ${description}
            </div>
            <br/>
            <strong>Bạn xác nhận gửi báo cáo sự cố này?</strong>
          </div>
        </div>`,
        quickReplies: [
          { id: 'confirm', icon: '✅', label: 'Xác nhận gửi', action: 'confirm_ktx_request' },
          { id: 'edit', icon: '✏️', label: 'Sửa mô tả', action: 'create_ktx_from_advice' },
          { id: 'cancel', icon: '❌', label: 'Hủy', action: 'cancel_ktx_request' }
        ]
      };
    } catch (error) {
      console.error('Error in handleDescriptionInput:', error);
      return null;
    }
  }

  /**
   * Xác nhận và tạo báo cáo sự cố
   */
  async handleConfirmKtxRequest(userId, sessionId) {
    try {
      const context = await chatbotRepository.getConversationContext(sessionId);
      
      if (!context || context.step !== 'confirm_ktx') {
        return {
          message: `<div class="highlight-box">
            <span class="highlight-box-icon">⚠️</span>
            <div>Phiên làm việc đã hết hạn. Vui lòng bắt đầu lại.</div>
          </div>`,
          quickReplies: [
            { id: 'retry', icon: '🔧', label: 'Báo sự cố mới', action: 'ktx_report' },
            { id: 'menu', icon: '🏠', label: 'Menu chính', action: 'main_menu' }
          ]
        };
      }

      // Lấy mã yêu cầu tiếp theo
      const requestCode = await chatbotRepository.getNextDormitoryRequestCode();

      // Lấy học kỳ hiện tại
      const currentSemester = await chatbotRepository.getCurrentSemester();
      const semesterName = currentSemester?.name || 'Học kỳ hiện tại';

      // Tạo yêu cầu - status theo enum của DormitoryRequest model
      const newRequest = await chatbotRepository.createDormitoryRequest({
        requestCode,
        student: context.studentId,
        semester: semesterName,
        category: context.categoryId,
        item: context.equipmentId, // field đúng theo model
        description: context.description || 'Báo cáo qua Chatbot',
        status: 'Pending' // enum: 'Pending', 'Under Review', 'Approved'
      });

      // Lấy thông tin đầy đủ để emit socket
      const populatedRequest = await chatbotRepository.getDormitoryRequestById(newRequest._id);

      // Emit socket event để cập nhật realtime
      if (this.io) {
        console.log('📡 Emitting DORMITORY_REQUEST_CREATED via socket');
        this.io.emit('DORMITORY_REQUEST_CREATED', {
          request: {
            _id: populatedRequest._id,
            requestCode: populatedRequest.requestCode,
            category: populatedRequest.category,
            item: populatedRequest.item,
            description: populatedRequest.description,
            status: populatedRequest.status,
            semester: populatedRequest.semester,
            createdAt: populatedRequest.createdAt,
            student: populatedRequest.student
          },
          studentId: context.studentId,
          message: `Báo cáo sự cố mới ${requestCode} đã được tạo qua Chatbot`
        });
      }

      // Tạo thông báo cho sinh viên
      try {
        await studentNotificationService.createKtxRequestCreated(
          userId, // Use userId (User document ID) not studentId
          {
            requestCode,
            requestId: newRequest._id,
            equipmentName: context.equipmentName,
            categoryName: context.categoryName
          }
        );
        console.log('📬 Created notification for KTX request:', requestCode);
      } catch (notifyError) {
        console.error('Error creating notification:', notifyError);
        // Don't fail the request creation if notification fails
      }

      await chatbotRepository.clearConversationContext(sessionId);

      return {
        message: `<div class="info-card">
          <div class="info-card-title">✅ GỬI BÁO CÁO THÀNH CÔNG!</div>
          <div class="info-card-content">
            <div style="background: linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%); border-radius: 10px; padding: 15px; margin-bottom: 12px;">
              <strong style="font-size: 18px; color: #065f46;">Mã yêu cầu: ${requestCode}</strong>
            </div>
            � <strong>Danh mục:</strong> ${context.categoryName}<br/>
            🔧 <strong>Thiết bị:</strong> ${context.equipmentName}<br/>
            📝 <strong>Mô tả:</strong> ${context.description || 'N/A'}<br/>
            📋 <strong>Trạng thái:</strong> Đang chờ xử lý<br/>
            <strong>⏱️ Thời gian dự kiến:</strong> 1-3 ngày làm việc<br/><br/>
            <div style="background: #fef3c7; border-radius: 8px; padding: 10px;">
              💡 <strong>Lưu ý:</strong> Ban quản lý KTX sẽ liên hệ bạn để xử lý sự cố.
            </div>
          </div>
        </div>`,
        quickReplies: [
          { id: 'status', icon: '📋', label: 'Xem trạng thái', action: 'check_ktx_status' },
          { id: 'new', icon: '🔧', label: 'Báo sự cố khác', action: 'ktx_report' },
          { id: 'menu', icon: '🏠', label: 'Menu chính', action: 'main_menu' }
        ]
      };
    } catch (error) {
      console.error('Error confirming KTX request:', error);
      return {
        message: `<div class="highlight-box">
          <span class="highlight-box-icon">⚠️</span>
          <div>Có lỗi xảy ra khi gửi báo cáo. Vui lòng thử lại.</div>
        </div>`,
        quickReplies: [
          { id: 'retry', icon: '🔄', label: 'Thử lại', action: 'ktx_report' },
          { id: 'menu', icon: '🏠', label: 'Menu chính', action: 'main_menu' }
        ]
      };
    }
  }

  /**
   * Hủy báo cáo sự cố
   */
  async handleCancelKtxRequest(sessionId) {
    await chatbotRepository.clearConversationContext(sessionId);

    return {
      message: `<div class="info-card">
        <div class="info-card-title">❌ ĐÃ HỦY</div>
        <div class="info-card-content">
          Đã hủy báo cáo sự cố. Bạn có thể bắt đầu lại bất kỳ lúc nào.
        </div>
      </div>`,
      quickReplies: MAIN_MENU_QUICK_REPLIES
    };
  }
}

module.exports = new KtxHandler();
