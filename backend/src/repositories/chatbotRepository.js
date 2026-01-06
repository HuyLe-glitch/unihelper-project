/**
 * Chatbot Repository - Data Access Layer
 * Xử lý các thao tác database liên quan đến Chatbot
 */
const ChatbotConversation = require('../models/ChatbotConversation');
const DormitoryRequest = require('../models/DormitoryRequest');
const CertificateRequest = require('../models/CertificateRequest');

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
}

module.exports = new ChatbotRepository();

