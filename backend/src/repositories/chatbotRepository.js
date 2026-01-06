/**
 * Chatbot Repository - Data Access Layer
 * Xử lý các thao tác database liên quan đến Chatbot
 */
const ChatbotConversation = require('../models/ChatbotConversation');
const DormitoryRequest = require('../models/DormitoryRequest');
const CertificateRequest = require('../models/CertificateRequest');
const CertificateType = require('../models/CertificateType');
const Certificate = require('../models/Certificate');
const Semester = require('../models/Semester');
const PurposeMapping = require('../models/PurposeMapping');
const EquipmentCategory = require('../models/EquipmentCategory');
const EquipmentItem = require('../models/EquipmentItem');

class ChatbotRepository {
  /**
   * Tạo conversation mới
   */
  async createConversation(data) {
    const conversation = new ChatbotConversation(data);
    return await conversation.save();
  }

  /**
   * Tìm conversation theo sessionId
   */
  async findBySessionId(sessionId) {
    return await ChatbotConversation.findOne({ sessionId, isActive: true });
  }

  /**
   * Tìm conversation gần nhất của user
   */
  async findLatestByUser(userId) {
    return await ChatbotConversation.findOne({ 
      user: userId, 
      isActive: true 
    }).sort({ 'metadata.lastActivityAt': -1 });
  }

  /**
   * Thêm message vào conversation
   */
  async addMessage(sessionId, message) {
    return await ChatbotConversation.findOneAndUpdate(
      { sessionId },
      { 
        $push: { messages: message },
        $set: { 'metadata.lastActivityAt': new Date() }
      },
      { new: true }
    );
  }

  /**
   * Lấy lịch sử conversation của user
   */
  async getConversationHistory(userId, options = {}) {
    const { page = 1, limit = 10 } = options;
    const skip = (page - 1) * limit;

    const [conversations, total] = await Promise.all([
      ChatbotConversation.find({ user: userId })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .select('-messages'),
      ChatbotConversation.countDocuments({ user: userId })
    ]);

    return { conversations, total, page, limit };
  }

  /**
   * Đóng conversation
   */
  async closeConversation(sessionId) {
    return await ChatbotConversation.findOneAndUpdate(
      { sessionId },
      { isActive: false },
      { new: true }
    );
  }

  /**
   * Lấy yêu cầu KTX của sinh viên
   */
  async getKtxRequestsByStudent(studentId) {
    return await DormitoryRequest.find({ student: studentId })
      .populate('semester', 'name')
      .sort({ createdAt: -1 })
      .limit(5);
  }

  /**
   * Lấy yêu cầu giấy tờ của sinh viên
   */
  async getCertificateRequestsByStudent(studentId) {
    return await CertificateRequest.find({ student: studentId })
      .populate('certificateType', 'name')
      .sort({ createdAt: -1 })
      .limit(5);
  }

  // ==========================================
  // CERTIFICATE TYPE & CERTIFICATE - Hỗ trợ tạo yêu cầu
  // ==========================================

  /**
   * Lấy tất cả loại chứng nhận (cho chatbot chọn)
   */
  async getAllCertificateTypes() {
    return await CertificateType.find({ isActive: true })
      .select('_id name description')
      .sort({ name: 1 });
  }

  /**
   * Lấy danh sách chứng nhận theo loại (cho chatbot chọn)
   */
  async getCertificatesByType(certificateTypeId) {
    return await Certificate.find({ certificateType: certificateTypeId })
      .select('_id name description')
      .sort({ name: 1 });
  }

  /**
   * Tìm Certificate phù hợp theo mục đích (purpose)
   * 
   * SỬ DỤNG PURPOSEMAPPING - SINGLE SOURCE OF TRUTH
   * - Dialogflow trả về raw text hoặc reference value
   * - PurposeMapping.synonyms chứa các từ khóa đồng nghĩa
   * - Quản lý qua Admin UI, KHÔNG cần chạy script
   * 
   * @param {string} purposeCode - Purpose code từ Dialogflow (reference value hoặc raw text)
   * @returns {Object|null} - { certificate, adviceNote, description } hoặc null
   */
  async findCertificateByPurpose(purposeCode) {
    if (!purposeCode) return null;
    
    // Normalize: lowercase, trim
    const normalizedInput = purposeCode.toLowerCase().trim();
    
    // Normalize không dấu để so sánh
    const normalizedNoDiacritics = normalizedInput
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .replace(/\s+/g, '_');
    
    console.log(`🔍 findCertificateByPurpose - Input: "${purposeCode}", Normalized: "${normalizedNoDiacritics}"`);
    
    // Bước 1: Tìm chính xác theo purposeCode
    let mapping = await PurposeMapping.findOne({
      purposeCode: normalizedNoDiacritics,
      isActive: true
    }).populate({
      path: 'certificate',
      populate: {
        path: 'certificateType',
        select: '_id name description'
      }
    });
    
    if (mapping) {
      console.log(`✅ Tìm thấy theo purposeCode: ${mapping.purposeCode}`);
    }
    
    // Bước 2: Nếu không tìm thấy, tìm theo synonyms trong DB
    if (!mapping) {
      console.log(`🔍 Không tìm thấy exact match, tìm theo synonyms trong DB...`);
      
      // Tìm PurposeMapping có synonyms chứa input (có dấu hoặc không dấu)
      mapping = await PurposeMapping.findOne({
        isActive: true,
        $or: [
          { synonyms: normalizedInput },  // Match có dấu
          { synonyms: normalizedNoDiacritics },  // Match không dấu
          { synonyms: { $regex: new RegExp(`^${normalizedInput}$`, 'i') } },  // Case-insensitive
          { synonyms: { $regex: new RegExp(`^${normalizedNoDiacritics}$`, 'i') } }
        ]
      }).populate({
        path: 'certificate',
        populate: {
          path: 'certificateType',
          select: '_id name description'
        }
      });
      
      if (mapping) {
        console.log(`✅ Tìm thấy theo synonyms: ${mapping.purposeCode} (synonym matched: "${normalizedInput}")`);
      }
    }
    
    // Bước 3: Fallback - tìm theo keyword trong displayName/description
    if (!mapping) {
      console.log(`🔍 Không tìm thấy trong synonyms, tìm theo displayName/description...`);
      
      const allMappings = await PurposeMapping.find({ isActive: true }).populate({
        path: 'certificate',
        populate: { path: 'certificateType', select: '_id name description' }
      });
      
      // Tìm mapping có displayName/description khớp keyword
      mapping = allMappings.find(m => {
        const displayNorm = (m.displayName || '').toLowerCase()
          .normalize('NFD').replace(/[\u0300-\u036f]/g, '');
        const descNorm = (m.description || '').toLowerCase()
          .normalize('NFD').replace(/[\u0300-\u036f]/g, '');
        
        return displayNorm.includes(normalizedNoDiacritics) || 
               descNorm.includes(normalizedNoDiacritics) ||
               normalizedNoDiacritics.includes(displayNorm.replace(/\s+/g, '_'));
      });
      
      if (mapping) {
        console.log(`✅ Tìm thấy qua displayName/description: ${mapping.purposeCode}`);
      }
    }
    
    if (mapping && mapping.certificate) {
      return {
        certificate: mapping.certificate,
        adviceNote: mapping.adviceNote,
        description: mapping.description || mapping.certificate.description
      };
    }
    
    console.log(`❌ Không tìm thấy mapping cho: "${purposeCode}"`);
    return null;
  }

  /**
   * Tìm purposeCode từ message gốc của user
   * Dùng khi Dialogflow không extract được purpose
   * @param {string} message - Message gốc từ user
   * @returns {Object|null} - { purposeCode, displayName } hoặc null
   */
  async findPurposeFromMessage(message) {
    if (!message) return null;
    
    const normalizedMessage = message.toLowerCase().trim();
    console.log(`🔍 findPurposeFromMessage - Message: "${message}"`);
    
    // Lấy tất cả PurposeMapping với synonyms
    const allMappings = await PurposeMapping.find({ isActive: true });
    
    // Tìm mapping có synonym xuất hiện trong message
    for (const mapping of allMappings) {
      if (!mapping.synonyms || mapping.synonyms.length === 0) continue;
      
      for (const synonym of mapping.synonyms) {
        const normalizedSynonym = synonym.toLowerCase().trim();
        
        // Check nếu message chứa synonym
        if (normalizedMessage.includes(normalizedSynonym)) {
          console.log(`✅ Tìm thấy synonym "${synonym}" trong message -> purposeCode: ${mapping.purposeCode}`);
          return {
            purposeCode: mapping.purposeCode,
            displayName: mapping.displayName
          };
        }
      }
    }
    
    console.log(`❌ Không tìm thấy purpose nào từ message`);
    return null;
  }
  /**
   * Lấy tất cả PurposeMapping (cho Admin UI)
   */
  async getAllPurposeMappings() {
    return await PurposeMapping.find({ isActive: true })
      .populate({
        path: 'certificate',
        populate: { path: 'certificateType', select: 'name' }
      })
      .sort({ purposeCode: 1 });
  }

  /**
   * Lấy học kỳ hiện tại (hoặc học kỳ gần nhất nếu không có)
   */
  async getCurrentSemester() {
    const now = new Date();
    console.log('📅 getCurrentSemester - Checking date:', now.toISOString());
    
    // Tìm học kỳ đang diễn ra (dùng Semester model, không phải SemesterTemplate)
    let semester = await Semester.findOne({
      startDate: { $lte: now },
      endDate: { $gte: now },
      isActive: true
    }).select('_id name startDate endDate');
    
    console.log('📅 Current semester (by date range):', semester ? semester.name : 'Not found');
    
    // Nếu không có học kỳ hiện tại, lấy học kỳ gần nhất (mới nhất)
    if (!semester) {
      console.log('📅 Looking for most recent semester...');
      semester = await Semester.findOne({ isActive: true })
        .sort({ startDate: -1 })
        .select('_id name startDate endDate');
      console.log('📅 Most recent semester:', semester ? semester.name : 'Not found');
    }
    
    console.log('📅 getCurrentSemester result:', semester?.name || 'Không tìm thấy');
    return semester;
  }

  /**
   * Lấy danh sách học kỳ gần đây (cho chatbot chọn)
   */
  async getRecentSemesters(limit = 5) {
    return await Semester.find({ isActive: true })
      .select('_id name startDate endDate')
      .sort({ startDate: -1 })
      .limit(limit);
  }

  /**
   * Tạo yêu cầu chứng nhận mới từ chatbot
   */
  async createCertificateRequest(requestData) {
    const request = new CertificateRequest(requestData);
    return await request.save();
  }

  /**
   * Lấy yêu cầu chứng nhận theo ID (populate đầy đủ)
   */
  async getCertificateRequestById(requestId) {
    return await CertificateRequest.findById(requestId)
      .populate('certificateType', 'name')
      .populate('certificateName', 'name')
      .populate({
        path: 'student',
        select: 'fullName phone user major',
        populate: [
          { path: 'user', select: 'name email' },
          { 
            path: 'major', 
            select: 'name faculty',
            populate: { path: 'faculty', select: 'name' }
          }
        ]
      });
  }
  /**
   * Lấy mã yêu cầu tiếp theo
   */
  async getNextCertificateRequestCode() {
    const requests = await CertificateRequest.find({
      requestCode: { $exists: true, $ne: null, $regex: /^CTSV\d+$/ }
    }).select('requestCode').lean();

    let maxNumber = 0;
    for (const req of requests) {
      const match = req.requestCode.match(/^CTSV(\d+)$/);
      if (match) {
        const num = parseInt(match[1], 10);
        if (num > maxNumber) maxNumber = num;
      }
    }

    return `CTSV${maxNumber + 1}`;
  }

  /**
   * Lưu context của conversation (cho multi-step form)
   */
  async saveConversationContext(sessionId, context) {
    return await ChatbotConversation.findOneAndUpdate(
      { sessionId },
      { 
        $set: { 
          'metadata.formContext': context,
          'metadata.lastActivityAt': new Date()
        }
      },
      { new: true }
    );
  }

  /**
   * Lấy context của conversation
   */
  async getConversationContext(sessionId) {
    const conversation = await ChatbotConversation.findOne({ sessionId });
    return conversation?.metadata?.formContext || null;
  }

  /**
   * Xóa context của conversation
   */
  async clearConversationContext(sessionId) {
    return await ChatbotConversation.findOneAndUpdate(
      { sessionId },
      { $unset: { 'metadata.formContext': '' } },
      { new: true }
    );
  }

  // ==========================================
  // KTX / DORMITORY - Hỗ trợ báo sự cố thiết bị
  // ==========================================

  /**
   * Lấy tất cả danh mục thiết bị (cho chatbot chọn)
   */
  async getEquipmentCategories() {
    return await EquipmentCategory.find({})
      .select('_id name description')
      .sort({ name: 1 });
  }

  /**
   * Lấy danh sách thiết bị theo danh mục (cho chatbot chọn)
   */
  async getEquipmentsByCategory(categoryId) {
    return await EquipmentItem.find({ category: categoryId })
      .select('_id name description')
      .sort({ name: 1 });
  }

  /**
   * Lấy thông tin thiết bị theo ID
   */
  async getEquipmentById(equipmentId) {
    return await EquipmentItem.findById(equipmentId)
      .populate('category', '_id name');
  }

  /**
   * Tạo yêu cầu báo sự cố KTX từ chatbot
   */
  async createDormitoryRequest(requestData) {
    const request = new DormitoryRequest(requestData);
    return await request.save();
  }

  /**
   * Lấy yêu cầu KTX theo ID (populate đầy đủ)
   */
  async getDormitoryRequestById(requestId) {
    return await DormitoryRequest.findById(requestId)
      .populate('category', 'name')
      .populate('item', 'name')
      .populate({
        path: 'student',
        populate: { path: 'user', select: 'name email' }
      });
  }

  /**
   * Lấy mã yêu cầu KTX tiếp theo
   */
  async getNextDormitoryRequestCode() {
    const requests = await DormitoryRequest.find({
      requestCode: { $exists: true, $ne: null, $regex: /^KTX\d+$/ }
    }).select('requestCode').lean();

    let maxNumber = 0;
    for (const req of requests) {
      const match = req.requestCode.match(/^KTX(\d+)$/);
      if (match) {
        const num = parseInt(match[1], 10);
        if (num > maxNumber) maxNumber = num;
      }
    }

    return `KTX${maxNumber + 1}`;
  }
}

module.exports = new ChatbotRepository();

