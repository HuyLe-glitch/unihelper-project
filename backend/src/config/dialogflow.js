/**
 * Dialogflow Configuration
 * Cấu hình client Dialogflow ES cho chatbot NLP
 */
const dialogflow = require('@google-cloud/dialogflow');
const path = require('path');

// Project ID từ Google Cloud Console
const projectId = process.env.DIALOGFLOW_PROJECT_ID || 'unihelper-lkxr';

// Ngôn ngữ mặc định cho Dialogflow
const languageCode = 'vi';

/**
 * Khởi tạo SessionsClient
 * - Local/Dev: Sử dụng service account JSON file
 * - Production (Cloud Run): Sử dụng IAM tự động
 */
let sessionsClient;

const initializeClient = () => {
  if (sessionsClient) return sessionsClient;

  try {
    // Kiểm tra xem có chạy trên Cloud Run không (có IAM tự động)
    if (process.env.K_SERVICE) {
      // Cloud Run - sử dụng IAM credentials tự động
      sessionsClient = new dialogflow.SessionsClient();
      console.log('✅ Dialogflow client initialized with IAM (Cloud Run)');
    } else if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
      // Local với biến môi trường chỉ định path
      sessionsClient = new dialogflow.SessionsClient();
      console.log('✅ Dialogflow client initialized with GOOGLE_APPLICATION_CREDENTIALS');
    } else {
      // Fallback: Sử dụng file JSON trong thư mục config
      const keyFilePath = path.join(__dirname, 'dialogflow-service-account.json');
      sessionsClient = new dialogflow.SessionsClient({
        keyFilename: keyFilePath
      });
      console.log('✅ Dialogflow client initialized with service account file');
    }
  } catch (error) {
    console.error('❌ Failed to initialize Dialogflow client:', error.message);
    sessionsClient = null;
  }

  return sessionsClient;
};

/**
 * Detect intent từ text input
 * @param {string} sessionId - ID phiên hội thoại (unique per user/conversation)
 * @param {string} text - Tin nhắn của người dùng
 * @returns {Object} - Kết quả từ Dialogflow
 */
const detectIntent = async (sessionId, text) => {
  const client = initializeClient();
  
  if (!client) {
    throw new Error('Dialogflow client not initialized');
  }

  // Tạo session path
  const sessionPath = client.projectAgentSessionPath(projectId, sessionId);

  // Tạo request
  const request = {
    session: sessionPath,
    queryInput: {
      text: {
        text: text,
        languageCode: languageCode,
      },
    },
  };

  try {
    // Gửi request đến Dialogflow
    const [response] = await client.detectIntent(request);
    const result = response.queryResult;

    return {
      success: true,
      intent: result.intent?.displayName || 'unknown',
      intentDetectionConfidence: result.intentDetectionConfidence || 0,
      fulfillmentText: result.fulfillmentText || '',
      fulfillmentMessages: result.fulfillmentMessages || [],
      parameters: result.parameters?.fields || {},
      allRequiredParamsPresent: result.allRequiredParamsPresent || false,
      webhookPayload: result.webhookPayload?.fields || null,
      action: result.action || '',
      outputContexts: result.outputContexts || [],
    };
  } catch (error) {
    console.error('❌ Dialogflow detectIntent error:', error.message);
    throw error;
  }
};

/**
 * Trích xuất giá trị từ Dialogflow parameters
 * @param {Object} parameters - Parameters từ Dialogflow response
 * @returns {Object} - Object với các giá trị đã trích xuất
 */
const extractParameters = (parameters) => {
  const extracted = {};
  
  for (const [key, value] of Object.entries(parameters)) {
    if (value.stringValue) {
      extracted[key] = value.stringValue;
    } else if (value.numberValue !== undefined) {
      extracted[key] = value.numberValue;
    } else if (value.listValue) {
      extracted[key] = value.listValue.values.map(v => v.stringValue || v.numberValue);
    } else if (value.structValue) {
      extracted[key] = value.structValue.fields;
    }
  }

  return extracted;
};

/**
 * Kiểm tra xem Dialogflow client có sẵn không
 */
const isDialogflowAvailable = () => {
  try {
    const client = initializeClient();
    return client !== null;
  } catch {
    return false;
  }
};

module.exports = {
  detectIntent,
  extractParameters,
  isDialogflowAvailable,
  projectId,
  languageCode
};
