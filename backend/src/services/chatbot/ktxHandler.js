/**
 * KTX Handler
 * Xử lý các intent liên quan đến KTX: báo sự cố thiết bị, kiểm tra trạng thái
 * 
 * NGUYÊN TẮC:
 * - Dialogflow là nguồn chân lý duy nhất cho NLU
 * - EquipmentStatusMapping để phân biệt category vs item
 * - MongoDB Context chỉ dùng cho Quick Replies (button click)
 * 
 * FLOW HYBRID:
 * 1. User nói "Hư đồ điện" → entityType='category' → Hỏi chi tiết thiết bị
 * 2. User nói "Hư máy lạnh" → entityType='item' → Tư vấn + Hỏi tạo ngay (đi tắt)
 */
const chatbotRepository = require('../../repositories/chatbotRepository');
const studentRepository = require('../../repositories/studentRepository');
const studentNotificationService = require('../studentNotificationService');
const { getStatusEmoji, getStatusLabel } = require('./constants');
const { getParamFromContext } = require('../../config/dialogflow');

/**
 * Helper function để extract ObjectId string từ bất kỳ format nào
 * Handle các case:
 * - String ObjectId hợp lệ: "69454650847ae2961402bb98"
 * - Object có _id: { _id: ObjectId(...), name: "..." }
 * - ObjectId instance: ObjectId("...")
 * - String representation của object: "{ _id: new ObjectId(...) }"
 */
const extractObjectId = (value) => {
  if (!value) return null;
  
  // Case 1: Đã là string ObjectId hợp lệ (24 hex chars)
  if (typeof value === 'string' && /^[0-9a-fA-F]{24}$/.test(value)) {
    return value;
  }
  
  // Case 2: Object có _id property
  if (typeof value === 'object' && value !== null && value._id) {
    const id = value._id;
    if (typeof id === 'string' && /^[0-9a-fA-F]{24}$/.test(id)) {
      return id;
    }
    if (id.toString && typeof id.toString === 'function') {
      const str = id.toString();
      if (/^[0-9a-fA-F]{24}$/.test(str)) {
        return str;
      }
    }
  }
  
  // Case 3: ObjectId instance với toString()
  if (value.toString && typeof value.toString === 'function') {
    const str = value.toString();
    if (/^[0-9a-fA-F]{24}$/.test(str)) {
      return str;
    }
  }
  
  // Case 4: String representation của object "{ _id: new ObjectId('...') }"
  if (typeof value === 'string') {
    // Regex để tìm ObjectId trong string representation
    const match = value.match(/ObjectId\(['"]([0-9a-fA-F]{24})['"]\)/);
    if (match) {
      return match[1];
    }
    // Thử tìm _id trong string
    const idMatch = value.match(/_id:\s*['"]?([0-9a-fA-F]{24})['"]?/);
    if (idMatch) {
      return idMatch[1];
    }
  }
  
  return null;
};

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
   * ═══════════════════════════════════════════════════════════════════════════
   * GATEKEEPER - Kiểm tra sinh viên có phải cư dân KTX không
   * ═══════════════════════════════════════════════════════════════════════════
   * 
   * Logic: Sinh viên phải có roomId (đang được xếp phòng KTX) mới được sử dụng
   * các tính năng báo hỏng, kiểm tra trạng thái KTX.
   * 
   * @param {Object} student - Student document từ database
   * @returns {Object|null} - Trả về response từ chối nếu không phải cư dân KTX, null nếu hợp lệ
   */
  checkKtxResident(student) {
    // Kiểm tra student có tồn tại không
    if (!student) {
      return {
        message: `<div class="highlight-box">
          <span class="highlight-box-icon">⚠️</span>
          <div>Không tìm thấy thông tin sinh viên. Vui lòng liên hệ phòng CTSV.</div>
        </div>`,
        quickReplies: [
          { id: 'menu', icon: '🏠', label: 'Menu chính', action: 'main_menu' }
        ]
      };
    }

    // Kiểm tra sinh viên có phải cư dân KTX không (có roomId)
    if (!student.roomId) {
      console.log(`🚫 GATEKEEPER: Sinh viên ${student.fullName || student._id} KHÔNG phải cư dân KTX (roomId = null)`);
      return {
        message: `<div class="highlight-box" style="border-color: #f59e0b; background: linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%);">
          <span class="highlight-box-icon">🏠</span>
          <div>
            <strong>Chức năng dành cho sinh viên nội trú</strong><br/><br/>
            Xin lỗi bạn, tính năng <strong>báo cáo sự cố thiết bị KTX</strong> chỉ dành cho sinh viên đang ở ký túc xá.<br/><br/>
            Nếu bạn có nhu cầu đăng ký nội trú, vui lòng liên hệ:<br/>
            📞 <strong>Phòng Quản lý KTX</strong>: (028) 1234 5678<br/>
            📧 <strong>Email</strong>: ktx@tdtu.edu.vn
          </div>
        </div>`,
        quickReplies: [
          { id: 'ctsv', icon: '📋', label: 'Yêu cầu CTSV', action: 'ctsv_request' },
          { id: 'menu', icon: '🏠', label: 'Menu chính', action: 'main_menu' }
        ]
      };
    }

    // Sinh viên hợp lệ (là cư dân KTX)
    console.log(`✅ GATEKEEPER: Sinh viên ${student.fullName || student._id} là cư dân KTX (Phòng: ${student.roomId?.name || student.roomId})`);
    return null; // null = hợp lệ, tiếp tục xử lý
  }

  /**
   * Lấy trạng thái báo cáo sự cố thiết bị (KTX)
   * 
   * Logic giới hạn kết quả:
   * - Hỏi về CATEGORY (danh mục: điện, nước...) → Trả về tối đa 3 yêu cầu gần nhất
   * - Hỏi về ITEM (thiết bị cụ thể: máy lạnh, bồn cầu...) → Trả về 1 yêu cầu gần nhất
   * 
   * Cách phân biệt: Sử dụng entityType từ EquipmentStatusMapping
   */
  async getKtxStatus(userId, parameters = {}) {
    try {
      console.log('🔧 getKtxStatus - Parameters:', JSON.stringify(parameters));

      const student = await studentRepository.findByUser(userId);
      
      // ════════════════════════════════════════════════════════════════
      // GATEKEEPER: Kiểm tra sinh viên có phải cư dân KTX không
      // ════════════════════════════════════════════════════════════════
      const gatekeeperResult = this.checkKtxResident(student);
      if (gatekeeperResult) {
        return gatekeeperResult; // Trả về thông báo từ chối nếu không phải cư dân KTX
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
          quickReplies: []
        };
      }

      // Biến lưu thông tin filter
      let filterDescription = '';
      let filterType = null; // 'category' hoặc 'item'
      let filterReferenceValue = null;
      let statusMapping = null;

      // 1. Thử lấy từ parameters trước (Dialogflow đã extract)
      if (parameters.equipment_category) {
        filterReferenceValue = parameters.equipment_category;
        filterDescription = parameters.equipment_category;
        console.log(`🔎 Tra cứu EquipmentStatusMapping cho: "${filterReferenceValue}"`);
        statusMapping = await chatbotRepository.findEquipmentStatusMapping(filterReferenceValue);
        if (statusMapping) {
          filterType = statusMapping.entityType; // 'category' hoặc 'item'
        }
      } else if (parameters.equipment_item) {
        filterReferenceValue = parameters.equipment_item;
        filterDescription = parameters.equipment_item;
        console.log(`🔎 Tra cứu EquipmentStatusMapping cho: "${filterReferenceValue}"`);
        statusMapping = await chatbotRepository.findEquipmentStatusMapping(filterReferenceValue);
        if (statusMapping) {
          filterType = statusMapping.entityType;
        }
      }

      // 2. Nếu tìm thấy StatusMapping, dùng để filter
      if (statusMapping) {
        filterDescription = statusMapping.displayName;
        console.log(`✅ Tìm thấy StatusMapping: ${filterType} → "${filterDescription}"`);
        
        if (filterType === 'category' && statusMapping.equipmentCategory) {
          // Filter theo category._id
          const targetCategoryId = statusMapping.equipmentCategory._id.toString();
          console.log(`🔎 Filtering by category._id: ${targetCategoryId}`);
          
          requests = requests.filter(r => {
            const reqCategoryId = r.category?._id?.toString() || '';
            const isMatch = reqCategoryId === targetCategoryId;
            console.log(`   Checking: ${reqCategoryId} === ${targetCategoryId} = ${isMatch}`);
            return isMatch;
          });
        } else if (filterType === 'item' && statusMapping.equipmentItem) {
          // Filter theo item._id
          const targetItemId = statusMapping.equipmentItem._id.toString();
          console.log(`🔎 Filtering by item._id: ${targetItemId}`);
          
          requests = requests.filter(r => {
            const reqItemId = r.item?._id?.toString() || '';
            const isMatch = reqItemId === targetItemId;
            console.log(`   Checking: ${reqItemId} === ${targetItemId} = ${isMatch}`);
            return isMatch;
          });
        }
        
        console.log(`📊 Filtered results (by ObjectId): ${requests.length} requests`);
        
        // Sort theo thời gian tạo mới nhất
        requests.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        
        // Giới hạn số lượng dựa trên entityType:
        // - CATEGORY (danh mục thiết bị) → Lấy tối đa 3 yêu cầu gần nhất
        // - ITEM (thiết bị cụ thể) → Chỉ lấy 1 yêu cầu gần nhất
        if (filterType === 'item' && requests.length > 1) {
          requests = [requests[0]];
          console.log(`📊 Lấy 1 yêu cầu gần nhất cho thiết bị cụ thể`);
        } else if (filterType === 'category' && requests.length > 3) {
          requests = requests.slice(0, 3);
          console.log(`📊 Lấy 3 yêu cầu gần nhất cho danh mục thiết bị`);
        }
      }

      // 3. Xử lý kết quả
      if (requests.length === 0) {
        const filterText = filterDescription ? filterDescription.replace(/_/g, ' ') : '';
        return {
          message: `<div class="info-card">
            <div class="info-card-title">📭 KHÔNG TÌM THẤY</div>
            <div class="info-card-content">
              Không tìm thấy yêu cầu báo sự cố ${filterText ? `về "<strong>${filterText}</strong>"` : ''}.
            </div>
          </div>`,
          quickReplies: [
            { id: 'tatca', icon: '📋', label: 'Xem tất cả báo cáo', action: 'check_ktx_status' },
            { id: 'baocao', icon: '🔧', label: 'Báo cáo sự cố mới', action: 'ktx_report' }
          ]
        };
      }

      // Nhiều yêu cầu → Hiển thị danh sách
      if (requests.length > 1) {
        const filterText = filterDescription ? ` - ${filterDescription.replace(/_/g, ' ')}` : '';
        const listHtml = requests.slice(0, 5).map((req, idx) => {
          const statusEmoji = getStatusEmoji(req.status);
          const statusLabel = getStatusLabel(req.status);
          const categoryName = req.category?.name || 'N/A';
          const itemName = req.item?.name || 'N/A';
          return `<li style="margin: 8px 0; padding: 10px; background: rgba(102, 126, 234, 0.05); border-radius: 8px;">
            <strong>${req.requestCode || `#${idx + 1}`}</strong>
            <br/><small>📦 Danh mục: ${categoryName}</small>
            <br/><small>🔧 Thiết bị: ${itemName}</small>
            <br/><small>${statusEmoji} ${statusLabel}</small>
          </li>`;
        }).join('');

        return {
          message: `<div class="info-card">
            <div class="info-card-title">📋 DANH SÁCH BÁO CÁO SỰ CỐ${filterText ? ` (${filterText})` : ''} (${requests.length})</div>
            <div class="info-card-content">
              <ul style="margin: 0; padding: 0; list-style: none;">
                ${listHtml}
              </ul>
              ${requests.length > 5 ? `<small>... và ${requests.length - 5} yêu cầu khác</small>` : ''}
            </div>
          </div>`,
          quickReplies: [
            { id: 'chitiet', icon: '📜', label: 'Chi tiết gần nhất', action: 'ktx_detail' }
          ]
        };
      }

      // 1 yêu cầu → Hiển thị chi tiết
      const latestRequest = requests[0];
      return {
        message: `<div class="info-card">
          <div class="info-card-title">🔧 CHI TIẾT BÁO CÁO SỰ CỐ</div>
          <div class="info-card-content">Dưới đây là thông tin báo cáo của bạn:</div>
        </div>`,
        statusCard: {
          type: 'ktx',
          data: {
            requestCode: latestRequest.requestCode || `KTX-${latestRequest._id.toString().slice(-8).toUpperCase()}`,
            createdAt: latestRequest.createdAt,
            equipmentCategory: latestRequest.category?.name || 'N/A',
            equipmentName: latestRequest.item?.name || 'N/A',
            description: latestRequest.description || null,
            status: latestRequest.status,
            estimatedTime: '1-3 ngày làm việc',
            reason: latestRequest.reason || null
          }
        },
        quickReplies: []
      };
    } catch (error) {
      console.error('Error getting KTX status:', error);
      return {
        message: `<div class="highlight-box">
          <span class="highlight-box-icon">⚠️</span>
          <div>Có lỗi xảy ra khi kiểm tra trạng thái. Vui lòng thử lại sau.</div>
        </div>`,
        quickReplies: []
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
        { id: 'trangthai', icon: '📋', label: 'Kiểm tra yêu cầu', action: 'check_ktx_status' }
      ]
    };
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // HYBRID FLOW - BÁO SỰ CỐ THIẾT BỊ
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Entry Point - Xử lý Intent ktx.bao_su_co_nhom
   * Phân nhánh dựa trên entityType từ EquipmentStatusMapping:
   * - Không có entity → Trả fulfillmentText (hỏi tư vấn) + Quick Replies tùy chọn
   * - category → Nhánh 1: Hỏi chi tiết thiết bị
   * - item → Nhánh 2: Đi tắt, tư vấn + hỏi tạo ngay
   * 
   * @param {Object} dialogflowResult - Kết quả từ Dialogflow (outputContexts để lấy context)
   */
  async handleEquipmentReport(userId, sessionId, parameters = {}, fulfillmentText = '', dialogflowResult = null) {
    try {
      console.log('📋 handleEquipmentReport - Parameters:', JSON.stringify(parameters));
      console.log('📋 handleEquipmentReport - fulfillmentText:', fulfillmentText);

      const student = await studentRepository.findByUser(userId);
      
      // ════════════════════════════════════════════════════════════════
      // GATEKEEPER: Kiểm tra sinh viên có phải cư dân KTX không
      // ════════════════════════════════════════════════════════════════
      const gatekeeperResult = this.checkKtxResident(student);
      if (gatekeeperResult) {
        return gatekeeperResult; // Trả về thông báo từ chối nếu không phải cư dân KTX
      }

      // Lấy equipment_category từ Dialogflow (nguồn chân lý duy nhất)
      const equipmentCode = parameters.equipment_category;

      // ════════════════════════════════════════════════════════════════
      // CASE 0: Không có entity → Trả fulfillmentText + Quick Replies tùy chọn
      // User có thể GÕ CHỮ trả lời hoặc BẤM NÚT chọn
      // ════════════════════════════════════════════════════════════════
      if (!equipmentCode) {
        console.log('📋 Không có equipment_category → Trả fulfillmentText tư vấn');
        
        // Lấy danh sách danh mục để tạo Quick Replies (optional)
        const categories = await chatbotRepository.getEquipmentCategories();
        
        const categoryReplies = categories.slice(0, 6).map((cat) => ({
          id: `cat_${cat._id}`,
          icon: '🔧',
          label: cat.name,
          action: `select_category_${cat._id}`
        }));
        categoryReplies.push({ id: 'cancel', icon: '❌', label: 'Hủy', action: 'cancel_ktx_request' });

        // Lưu context cho Quick Replies
        await chatbotRepository.saveConversationContext(sessionId, {
          step: 'waiting_category',
          studentId: student._id.toString(),
          type: 'ktx_report'
        });

        // Trả về fulfillmentText từ Dialogflow + Quick Replies
        return {
          message: fulfillmentText 
            ? `<div class="info-card">
                <div class="info-card-title">🔧 BÁO CÁO SỰ CỐ THIẾT BỊ</div>
                <div class="info-card-content">
                  ${fulfillmentText}<br/><br/>
                  <small style="color: #6b7280;">Bạn có thể gõ trực tiếp hoặc chọn từ danh sách bên dưới:</small>
                </div>
              </div>`
            : `<div class="info-card">
                <div class="info-card-title">🔧 BÁO CÁO SỰ CỐ THIẾT BỊ</div>
                <div class="info-card-content">
                  Bạn đang gặp sự cố với thiết bị gì?<br/>
                  Hãy cho tôi biết (điện, nước, nội thất...) để tôi tư vấn cho bạn.<br/><br/>
                  <small style="color: #6b7280;">Bạn có thể gõ trực tiếp hoặc chọn từ danh sách bên dưới:</small>
                </div>
              </div>`,
          quickReplies: categoryReplies
        };
      }

      console.log('📋 equipment_category từ Dialogflow:', equipmentCode);

      // Query EquipmentStatusMapping để biết đây là CATEGORY hay ITEM
      const mapping = await chatbotRepository.findEquipmentStatusMapping(equipmentCode);

      if (!mapping) {
        console.log('❌ Không tìm thấy mapping cho:', equipmentCode);
        // Không tìm thấy mapping → Hỏi lại với fulfillmentText
        const categories = await chatbotRepository.getEquipmentCategories();
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
              Mình chưa nhận diện được loại thiết bị "<strong>${equipmentCode.replace(/_/g, ' ')}</strong>".<br/>
              Bạn có thể cho mình biết rõ hơn hoặc chọn từ danh sách bên dưới:
            </div>
          </div>`,
          quickReplies: categoryReplies
        };
      }

      console.log(`✅ Mapping found: entityType="${mapping.entityType}", displayName="${mapping.displayName}"`);

      // ════════════════════════════════════════════════════════════════
      // NHÁNH 1: entityType = 'category' → Hỏi chi tiết thiết bị
      // ════════════════════════════════════════════════════════════════
      if (mapping.entityType === 'category') {
        console.log('📋 NHÁNH 1: Category → Hiển thị danh sách thiết bị');
        
        const categoryId = mapping.equipmentCategory?._id || mapping.equipmentCategory;
        const categoryName = mapping.displayName;

        // Lấy danh sách thiết bị trong danh mục
        const equipments = await chatbotRepository.getEquipmentsByCategory(categoryId);

        if (!equipments || equipments.length === 0) {
          return {
            message: `<div class="info-card">
              <div class="info-card-title">🔧 ${categoryName.toUpperCase()}</div>
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

        // Lưu context vào MongoDB (cho Quick Replies)
        await chatbotRepository.saveConversationContext(sessionId, {
          step: 'select_equipment_from_category',
          studentId: student._id.toString(),
          categoryId: categoryId.toString(),
          categoryName: categoryName,
          type: 'ktx_report'
        });

        // Tạo Quick Replies cho thiết bị
        const equipmentReplies = equipments.slice(0, 6).map((eq) => ({
          id: `eq_${eq._id}`,
          icon: '🔧',
          label: eq.name,
          action: `select_equipment_${eq._id}`
        }));

        equipmentReplies.push({ id: 'other', icon: '📋', label: 'Danh mục khác', action: 'ktx_report' });
        equipmentReplies.push({ id: 'cancel', icon: '❌', label: 'Hủy', action: 'cancel_ktx_request' });

        return {
          message: `<div class="info-card">
            <div class="info-card-title">🔧 SỰ CỐ ${categoryName.toUpperCase()}</div>
            <div class="info-card-content">
              Bạn đang gặp sự cố với <strong>${categoryName}</strong>.<br/><br/>
              Thiết bị cụ thể nào đang bị hỏng? Bạn có thể gõ tên hoặc chọn bên dưới:
            </div>
          </div>`,
          quickReplies: equipmentReplies
        };
      }

      // ════════════════════════════════════════════════════════════════
      // NHÁNH 2: entityType = 'item' → Đi tắt, tư vấn + hỏi tạo ngay
      // ════════════════════════════════════════════════════════════════
      if (mapping.entityType === 'item') {
        console.log('📋 NHÁNH 2: Item → Đi tắt, hiển thị tư vấn');
        
        const equipmentId = mapping.equipmentItem?._id || mapping.equipmentItem;
        const equipmentName = mapping.displayName;

        // Lấy thông tin đầy đủ của thiết bị (bao gồm category)
        const equipment = await chatbotRepository.getEquipmentById(equipmentId);
        const categoryName = equipment?.category?.name || 'N/A';
        const categoryId = equipment?.category?._id?.toString() || '';

        // Hiển thị tư vấn
        return await this.showEquipmentAdvice(userId, sessionId, {
          studentId: student._id.toString(),
          equipmentId: equipmentId.toString(),
          equipmentName: equipmentName,
          categoryId: categoryId,
          categoryName: categoryName
        });
      }

      // Fallback nếu không match
      return await this.startKtxReport(userId, sessionId);

    } catch (error) {
      console.error('Error in handleEquipmentReport:', error);
      return {
        message: `<div class="highlight-box">
          <span class="highlight-box-icon">⚠️</span>
          <div>Có lỗi xảy ra. Vui lòng thử lại.</div>
        </div>`,
        quickReplies: []
      };
    }
  }

  /**
   * Xử lý Intent ktx.bao_su_co_thiet_bi (Follow-up)
   * Xảy ra khi user GÕ CHỮ tên thiết bị sau khi được hỏi ở Nhánh 1
   * 
   * @param {Object} dialogflowResult - Để lấy category từ Dialogflow Context
   */
  async handleEquipmentFollowUp(userId, sessionId, parameters = {}, dialogflowResult = null) {
    try {
      console.log('📋 handleEquipmentFollowUp - Parameters:', JSON.stringify(parameters));

      const student = await studentRepository.findByUser(userId);
      if (!student) {
        return {
          message: `<div class="highlight-box">
            <span class="highlight-box-icon">⚠️</span>
            <div>Chỉ sinh viên KTX mới có thể báo cáo sự cố thiết bị.</div>
          </div>`,
          quickReplies: []
        };
      }

      const equipmentCode = parameters.equipment_category;

      if (!equipmentCode) {
        return await this.startKtxReport(userId, sessionId);
      }

      // Query mapping
      const mapping = await chatbotRepository.findEquipmentStatusMapping(equipmentCode);

      if (!mapping || mapping.entityType !== 'item') {
        return await this.startKtxReport(userId, sessionId);
      }

      const equipmentId = mapping.equipmentItem?._id || mapping.equipmentItem;
      const equipmentName = mapping.displayName;

      // Lấy thông tin đầy đủ của thiết bị
      const equipment = await chatbotRepository.getEquipmentById(equipmentId);
      
      // Lấy category từ Dialogflow Context (nếu có) hoặc từ equipment
      let categoryName = equipment?.category?.name || 'N/A';
      let categoryId = equipment?.category?._id?.toString() || '';

      // Thử lấy từ Dialogflow outputContexts
      if (dialogflowResult?.outputContexts) {
        const categoryFromContext = getParamFromContext(
          dialogflowResult.outputContexts,
          'session_tao_yeu_cau',
          'equipment_category'
        );
        if (categoryFromContext) {
          const categoryMapping = await chatbotRepository.findEquipmentStatusMapping(categoryFromContext);
          if (categoryMapping?.entityType === 'category') {
            categoryName = categoryMapping.displayName;
            categoryId = categoryMapping.equipmentCategory?._id?.toString() || categoryId;
          }
        }
      }

      // Hiển thị tư vấn
      return await this.showEquipmentAdvice(userId, sessionId, {
        studentId: student._id.toString(),
        equipmentId: equipmentId.toString(),
        equipmentName: equipmentName,
        categoryId: categoryId,
        categoryName: categoryName
      });

    } catch (error) {
      console.error('Error in handleEquipmentFollowUp:', error);
      return {
        message: `<div class="highlight-box">
          <span class="highlight-box-icon">⚠️</span>
          <div>Có lỗi xảy ra. Vui lòng thử lại.</div>
        </div>`,
        quickReplies: []
      };
    }
  }

  /**
   * Hiển thị TƯ VẤN về thiết bị + Hỏi có tạo báo cáo không
   * (Giống flow CTSV: tư vấn trước, user đồng ý mới tạo)
   */
  async showEquipmentAdvice(userId, sessionId, context) {
    const { studentId, equipmentId, equipmentName, categoryId, categoryName } = context;

    // ═══════════════════════════════════════════════════════════
    // FIX: Đảm bảo lưu đúng ObjectId string vào MongoDB
    // ═══════════════════════════════════════════════════════════
    const safeStudentId = extractObjectId(studentId) || studentId;
    const safeEquipmentId = extractObjectId(equipmentId) || equipmentId;
    const safeCategoryId = extractObjectId(categoryId) || categoryId;

    console.log('📝 showEquipmentAdvice - Saving context:', {
      studentId: safeStudentId,
      equipmentId: safeEquipmentId,
      categoryId: safeCategoryId
    });

    // Lưu context vào MongoDB (step: ready_to_create)
    await chatbotRepository.saveConversationContext(sessionId, {
      step: 'ready_to_create',
      studentId: safeStudentId,
      equipmentId: safeEquipmentId,
      equipmentName,
      categoryId: safeCategoryId,
      categoryName,
      type: 'ktx_report'
    });

    return {
      message: `<div class="info-card">
        <div class="info-card-title">📋 TƯ VẤN BÁO SỰ CỐ - ${equipmentName.toUpperCase()}</div>
        <div class="info-card-content">
          <div style="background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%); border-radius: 10px; padding: 15px; margin: 8px 0;">
            📦 <strong>Danh mục:</strong> ${categoryName}<br/>
            🔧 <strong>Thiết bị:</strong> ${equipmentName}
          </div>
          <br/>
          <strong>💡 Lưu ý trước khi báo sự cố:</strong>
          <ul style="margin: 8px 0; padding-left: 20px;">
            <li>Kiểm tra nguồn điện/nước trước khi báo cáo</li>
            <li>Đảm bảo thiết bị thực sự bị hỏng, không phải do sử dụng sai cách</li>
            <li>Thời gian xử lý dự kiến: <strong>1-3 ngày làm việc</strong></li>
          </ul>
          <br/>
          <div style="background: #fef3c7; border-radius: 8px; padding: 12px; margin-bottom: 10px;">
            <strong>🖥️ Tự thao tác trên hệ thống:</strong><br/>
            <span style="font-size: 13px;">
              Vào <strong>Gửi yêu cầu → Ký túc xá</strong><br/>
              → Chọn danh mục "<strong>${categoryName}</strong>"<br/>
              → Chọn thiết bị "<strong>${equipmentName}</strong>"<br/>
              → Nhập mô tả sự cố và gửi
            </span>
          </div>
          <div style="background: #d1fae5; border-radius: 8px; padding: 12px;">
            <strong>🤖 Hoặc để tôi hỗ trợ:</strong><br/>
            <span style="font-size: 13px;">Tôi có thể tạo giúp bạn ngay bây giờ! Bạn có muốn tôi gửi yêu cầu KTX cho bạn không?</span>
          </div>
        </div>
      </div>`,
      quickReplies: [
        { id: 'create', icon: '✅', label: 'Tạo giúp tôi', action: 'create_ktx_from_advice' },
        { id: 'other', icon: '🔧', label: 'Chọn thiết bị khác', action: 'ktx_report' },
        { id: 'cancel', icon: '❌', label: 'Không cần nữa', action: 'cancel_ktx_request' }
      ]
    };
  }

  /**
   * Xử lý khi user đồng ý tạo báo cáo sau tư vấn
   * Hỗ trợ cả 2 case:
   * - User GÕ CHỮ "ok tạo đi" → Lấy từ Dialogflow Context
   * - User BẤM NÚT "Tạo báo cáo" → Lấy từ MongoDB Context
   */
  async handleCreateFromAdvice(userId, sessionId, dialogflowResult = null) {
    try {
      console.log('📝 handleCreateFromAdvice - sessionId:', sessionId);
      
      let context = null;
      let contextSource = null;

      // ═══════════════════════════════════════════════════════════
      // CASE 1: User GÕ CHỮ → Ưu tiên Dialogflow Context
      // ═══════════════════════════════════════════════════════════
      if (dialogflowResult?.outputContexts?.length > 0) {
        const equipmentFromDF = getParamFromContext(
          dialogflowResult.outputContexts,
          'session_tao_yeu_cau',
          'equipment_category'
        );

        if (equipmentFromDF) {
          console.log('📋 Lấy equipment từ Dialogflow Context:', equipmentFromDF);
          
          const mapping = await chatbotRepository.findEquipmentStatusMapping(equipmentFromDF);
          
          if (mapping?.entityType === 'item') {
            const equipment = await chatbotRepository.getEquipmentById(mapping.equipmentItem);
            const student = await studentRepository.findByUser(userId);
            
            context = {
              step: 'waiting_description',
              studentId: student._id.toString(),
              equipmentId: mapping.equipmentItem.toString(),
              equipmentName: mapping.displayName,
              categoryId: equipment?.category?._id?.toString() || '',
              categoryName: equipment?.category?.name || 'N/A',
              type: 'ktx_report'
            };
            contextSource = 'dialogflow';
            
            // Lưu vào MongoDB cho bước tiếp theo
            await chatbotRepository.saveConversationContext(sessionId, context);
          }
        }
      }

      // ═══════════════════════════════════════════════════════════
      // CASE 2: User BẤM NÚT → Lấy từ MongoDB Context
      // ═══════════════════════════════════════════════════════════
      if (!context) {
        const mongoContext = await chatbotRepository.getConversationContext(sessionId);
        console.log('📋 MongoDB Context:', mongoContext);

        if (mongoContext?.step === 'ready_to_create' && mongoContext?.equipmentId) {
          context = {
            ...mongoContext,
            step: 'waiting_description'
          };
          contextSource = 'mongodb';
          
          // Cập nhật step trong MongoDB
          await chatbotRepository.saveConversationContext(sessionId, context);
        }
      }

      // Không tìm thấy context
      if (!context) {
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

      console.log(`✅ Context source: ${contextSource}, equipment: ${context.equipmentName}`);

      // Yêu cầu nhập mô tả sự cố
      return {
        message: `<div class="info-card">
          <div class="info-card-title">📝 MÔ TẢ SỰ CỐ - ${context.equipmentName.toUpperCase()}</div>
          <div class="info-card-content">
            <div style="background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%); border-radius: 10px; padding: 15px; margin: 8px 0;">
              📋 <strong>Danh mục:</strong> ${context.categoryName}<br/>
              🔧 <strong>Thiết bị:</strong> ${context.equipmentName}
            </div>
            <br/>
            <div style="background: #fef3c7; border-radius: 8px; padding: 12px;">
              ✏️ <strong>Vui lòng mô tả chi tiết sự cố bạn gặp phải:</strong><br/>
              <small style="color: #6b7280;">Ví dụ: "Máy lạnh không lạnh, chạy kêu to", "Vòi nước bị rò rỉ"...</small>
            </div>
          </div>
        </div>`,
        quickReplies: [
          { id: 'cancel', icon: '❌', label: 'Hủy', action: 'cancel_ktx_request' }
        ]
      };

    } catch (error) {
      console.error('Error in handleCreateFromAdvice:', error);
      return {
        message: `<div class="highlight-box">
          <span class="highlight-box-icon">⚠️</span>
          <div>Có lỗi xảy ra. Vui lòng thử lại.</div>
        </div>`,
        quickReplies: []
      };
    }
  }

  /**
   * Bắt đầu báo cáo sự cố - Bước 1: Chọn danh mục thiết bị
   */
  async startKtxReport(userId, sessionId) {
    try {
      const student = await studentRepository.findByUser(userId);
      
      // ════════════════════════════════════════════════════════════════
      // GATEKEEPER: Kiểm tra sinh viên có phải cư dân KTX không
      // ════════════════════════════════════════════════════════════════
      const gatekeeperResult = this.checkKtxResident(student);
      if (gatekeeperResult) {
        return gatekeeperResult; // Trả về thông báo từ chối nếu không phải cư dân KTX
      }

      // Lấy danh sách danh mục thiết bị
      const categories = await chatbotRepository.getEquipmentCategories();
      
      if (!categories || categories.length === 0) {
        return {
          message: `<div class="highlight-box">
            <span class="highlight-box-icon">⚠️</span>
            <div>Hiện tại chưa có danh mục thiết bị nào. Vui lòng liên hệ ban quản lý KTX.</div>
          </div>`,
          quickReplies: []
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
        quickReplies: []
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
        label: eq.name,
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
        quickReplies: []
      };
    }
  }

  /**
   * Xử lý khi user chọn thiết bị từ Quick Reply
   * → Hiển thị TƯ VẤN (giống flow CTSV)
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
      const student = await studentRepository.findByUser(userId);

      // Hiển thị TƯ VẤN (giống flow CTSV)
      return await this.showEquipmentAdvice(userId, sessionId, {
        studentId: student._id.toString(),
        equipmentId: equipmentId,
        equipmentName: equipment?.name || 'N/A',
        categoryId: equipment?.category?._id?.toString() || context?.categoryId || '',
        categoryName: equipment?.category?.name || context?.categoryName || 'N/A'
      });

    } catch (error) {
      console.error('Error selecting equipment:', error);
      return {
        message: `<div class="highlight-box">
          <span class="highlight-box-icon">⚠️</span>
          <div>Có lỗi xảy ra. Vui lòng thử lại.</div>
        </div>`,
        quickReplies: []
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
      // ════════════════════════════════════════════════════════════════
      // GATEKEEPER: Kiểm tra lại một lần nữa trước khi tạo yêu cầu
      // Đảm bảo không có trường hợp bypass qua session manipulation
      // ════════════════════════════════════════════════════════════════
      const student = await studentRepository.findByUser(userId);
      const gatekeeperResult = this.checkKtxResident(student);
      if (gatekeeperResult) {
        // Xóa context để tránh retry
        await chatbotRepository.clearConversationContext(sessionId);
        return gatekeeperResult;
      }

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

      // ═══════════════════════════════════════════════════════════
      // FIX: Đảm bảo lấy đúng ObjectId string từ context
      // Sử dụng helper function extractObjectId đã định nghĩa ở đầu file
      // ═══════════════════════════════════════════════════════════
      const studentId = extractObjectId(context.studentId) || context.studentId;
      const categoryId = extractObjectId(context.categoryId) || context.categoryId;
      const equipmentId = extractObjectId(context.equipmentId) || context.equipmentId;

      console.log('📝 Creating DormitoryRequest with:', {
        studentId,
        categoryId,
        equipmentId,
        description: context.description
      });

      // Tạo yêu cầu - status theo enum của DormitoryRequest model
      const newRequest = await chatbotRepository.createDormitoryRequest({
        requestCode,
        student: studentId,
        semester: semesterName,
        category: categoryId,
        item: equipmentId,
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
        quickReplies: []
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
      quickReplies: []
    };
  }
}

module.exports = new KtxHandler();
