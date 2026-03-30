/**
 * Chatbot Controller - Presentation Layer
 * Xử lý HTTP requests/responses cho Chatbot
 */
const chatbotService = require('../services/chatbotService');
const { catchAsync } = require('../utils/appError');

class ChatbotController {
  /**
   * POST /api/chatbot/message
   * Gửi tin nhắn đến chatbot
   */
  sendMessage = catchAsync(async (req, res) => {
    console.log('📨 Chatbot request received:', {
      body: req.body,
      userId: req.userData?.id
    });
    
    const { message, sessionId } = req.body;
    const userId = req.userData.id;

    // Truyền io vào service để emit socket events
    const result = await chatbotService.processMessage(userId, message, sessionId, req.io);

    console.log('📤 Chatbot response:', result);
    res.status(200).json(result);
  });

  /**
   * GET /api/chatbot/ktx-status
   * Lấy trạng thái yêu cầu KTX
   */
  getKtxStatus = catchAsync(async (req, res) => {
    const userId = req.userData.id;

    const result = await chatbotService.getKtxStatus(userId);

    res.status(200).json({
      success: true,
      message: 'Lấy trạng thái KTX thành công',
      data: result
    });
  });

  /**
   * GET /api/chatbot/document-status
   * Lấy trạng thái yêu cầu giấy tờ
   */
  getDocumentStatus = catchAsync(async (req, res) => {
    const userId = req.userData.id;

    const result = await chatbotService.getDocumentStatus(userId);

    res.status(200).json({
      success: true,
      message: 'Lấy trạng thái giấy tờ thành công',
      data: result
    });
  });

  /**
   * GET /api/chatbot/history
   * Lấy lịch sử hội thoại
   */
  getConversationHistory = catchAsync(async (req, res) => {
    const userId = req.userData.id;
    const { page, limit } = req.query;

    const options = {
      page: parseInt(page) || 1,
      limit: parseInt(limit) || 10
    };

    const result = await chatbotService.getConversationHistory(userId, options);

    res.status(200).json(result);
  });
}

module.exports = new ChatbotController();

