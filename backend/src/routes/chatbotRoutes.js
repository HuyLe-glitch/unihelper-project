/**
 * Chatbot Routes - Routing Layer
 * Định nghĩa endpoints cho Chatbot API
 * Base path: /api/chatbot
 */
const express = require('express');
const chatbotController = require('../controllers/chatbotController');
const { chatbotValidation } = require('../validators/chatbotValidation');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// Tất cả routes đều yêu cầu đăng nhập
router.use(protect);

/**
 * POST /api/chatbot/message
 * Gửi tin nhắn đến chatbot
 */
router.post('/message',
  chatbotValidation.sendMessage,
  chatbotController.sendMessage
);

/**
 * GET /api/chatbot/ktx-status
 * Lấy trạng thái yêu cầu KTX của user
 */
router.get('/ktx-status',
  chatbotController.getKtxStatus
);

/**
 * GET /api/chatbot/document-status
 * Lấy trạng thái yêu cầu giấy tờ của user
 */
router.get('/document-status',
  chatbotController.getDocumentStatus
);

/**
 * GET /api/chatbot/history
 * Lấy lịch sử hội thoại
 */
router.get('/history',
  chatbotValidation.getHistory,
  chatbotController.getConversationHistory
);

module.exports = router;

