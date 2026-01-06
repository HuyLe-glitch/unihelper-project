/**
 * ChatbotConversation Model
 * Lưu trữ lịch sử hội thoại của chatbot
 */
const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['user', 'bot'],
    required: true
  },
  content: {
    type: String,
    required: true
  },
  intent: {
    type: String,
    default: null
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
}, { _id: false });

const chatbotConversationSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  sessionId: {
    type: String,
    required: true,
    index: true
  },
  messages: [messageSchema],
  metadata: {
    userAgent: String,
    platform: String,
    startedAt: {
      type: Date,
      default: Date.now
    },
    lastActivityAt: {
      type: Date,
      default: Date.now
    },
    // Context cho multi-step form (tạo yêu cầu qua chatbot)
    formContext: {
      type: mongoose.Schema.Types.Mixed,
      default: null
    }
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Index cho tìm kiếm nhanh (sessionId đã có index: true ở schema)
chatbotConversationSchema.index({ user: 1, createdAt: -1 });

// Virtual để đếm số tin nhắn
chatbotConversationSchema.virtual('messageCount').get(function() {
  return this.messages ? this.messages.length : 0;
});

module.exports = mongoose.model('ChatbotConversation', chatbotConversationSchema);

