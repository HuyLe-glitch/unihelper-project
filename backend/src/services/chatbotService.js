/**
 * Chatbot Service
 * Re-export từ folder chatbot/ (đã được refactor)
 * 
 * Cấu trúc mới:
 * - chatbot/index.js         - Main orchestrator
 * - chatbot/constants.js     - Hằng số, quick replies, intent mapping
 * - chatbot/dialogflowHandler.js - Xử lý Dialogflow API
 * - chatbot/commonHandler.js - FAQ, greeting, menu...
 * - chatbot/ctsvHandler.js   - Logic CTSV (giấy tờ, chứng nhận)
 * - chatbot/ktxHandler.js    - Logic KTX (báo sự cố)
 */
module.exports = require('./chatbot');
