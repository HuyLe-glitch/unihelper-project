/**
 * Dialogflow Handler
 * Xử lý giao tiếp với Dialogflow API
 */
const dialogflowConfig = require('../../config/dialogflow');

class DialogflowHandler {
  /**
   * Gọi Dialogflow API để detect intent
   * @param {string} sessionId - Session ID
   * @param {string} message - Tin nhắn từ user
   * @returns {Object} Kết quả từ Dialogflow
   */
  async detectIntent(sessionId, message) {
    try {
      const result = await dialogflowConfig.detectIntent(sessionId, message);
      
      console.log('═══════════════════════════════════════════════════');
      console.log('📤 Dialogflow Response:');
      console.log('   Intent:', result.intent);
      console.log('   Confidence:', result.intentDetectionConfidence);
      console.log('   Parameters:', JSON.stringify(result.parameters));
      console.log('   FulfillmentText:', result.fulfillmentText?.substring(0, 100) || '(empty)');
      console.log('═══════════════════════════════════════════════════');
      
      return {
        intent: result.intent,
        confidence: result.intentDetectionConfidence || 0,
        parameters: dialogflowConfig.extractParameters(result.parameters),
        fulfillmentText: result.fulfillmentText
      };
    } catch (error) {
      console.error('❌ Dialogflow error:', error);
      return {
        intent: 'Default Fallback Intent',
        confidence: 0,
        parameters: {},
        fulfillmentText: 'Xin lỗi, có lỗi xảy ra. Vui lòng thử lại.'
      };
    }
  }
}

module.exports = new DialogflowHandler();
