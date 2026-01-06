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

    // Debug: Log FULL queryResult để tìm entity reference value
    console.log('═══════════════════════════════════════════════════');
    console.log('📤 Dialogflow FULL Response:');
    console.log('   QueryText:', result.queryText);
    console.log('   Intent:', result.intent?.displayName);
    console.log('   Confidence:', result.intentDetectionConfidence);
    console.log('   Parameters (raw):', JSON.stringify(result.parameters));
    console.log('   FulfillmentText:', result.fulfillmentText || '(empty)');
    console.log('   Action:', result.action || '(empty)');
    
    // Debug: Log chi tiết parameters để tìm entity value
    if (result.parameters?.fields) {
      for (const [key, value] of Object.entries(result.parameters.fields)) {
        console.log(`   Param "${key}" FULL OBJECT:`, JSON.stringify(value, null, 2));
        // Check tất cả các field có thể chứa reference value
        if (value.structValue) {
          console.log(`   Param "${key}" structValue:`, JSON.stringify(value.structValue, null, 2));
        }
      }
    }
    
    // Debug: Log outputContexts để tìm entity original/resolved value
    if (result.outputContexts && result.outputContexts.length > 0) {
      console.log('   OutputContexts:');
      for (const ctx of result.outputContexts) {
        const ctxName = ctx.name.split('/').pop();
        if (ctx.parameters?.fields) {
          for (const [key, value] of Object.entries(ctx.parameters.fields)) {
            console.log(`     Context ${ctxName} - Param "${key}":`, JSON.stringify(value, null, 2));
            // Check .original field - thường chứa resolved entity value
            if (key.endsWith('.original')) {
              console.log(`     🎯 FOUND .original for ${key}:`, JSON.stringify(value, null, 2));
            }
          }
        }
      }
    }
    
    console.log('═══════════════════════════════════════════════════');

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

// ============================================================
// ENTITY TYPE CLIENT - Lấy synonyms từ Dialogflow
// ============================================================
let entityTypesClient;
let entityCache = null; // Cache entity data
let entityCacheTime = null;
const CACHE_DURATION = 5 * 60 * 1000; // 5 phút

/**
 * Khởi tạo EntityTypesClient
 */
const initializeEntityClient = () => {
  if (entityTypesClient) return entityTypesClient;

  try {
    if (process.env.K_SERVICE) {
      entityTypesClient = new dialogflow.EntityTypesClient();
    } else if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
      entityTypesClient = new dialogflow.EntityTypesClient();
    } else {
      const keyFilePath = path.join(__dirname, 'dialogflow-service-account.json');
      entityTypesClient = new dialogflow.EntityTypesClient({
        keyFilename: keyFilePath
      });
    }
    console.log('✅ Dialogflow EntityTypesClient initialized');
  } catch (error) {
    console.error('❌ Failed to initialize EntityTypesClient:', error.message);
    entityTypesClient = null;
  }

  return entityTypesClient;
};

/**
 * Lấy tất cả Entity Types và entities từ Dialogflow
 * @param {string} entityTypeName - Tên entity type (VD: "purpose")
 * @returns {Array} - Mảng các entities với synonyms và reference value
 */
const getEntitySynonyms = async (entityTypeName = 'purpose') => {
  // Kiểm tra cache
  if (entityCache && entityCacheTime && (Date.now() - entityCacheTime < CACHE_DURATION)) {
    console.log('📦 Using cached entity data');
    return entityCache[entityTypeName] || [];
  }

  const client = initializeEntityClient();
  if (!client) {
    console.error('❌ EntityTypesClient not available');
    return [];
  }

  try {
    const agentPath = client.projectAgentPath(projectId);
    const [entityTypes] = await client.listEntityTypes({ parent: agentPath });

    // Parse all entity types
    entityCache = {};
    for (const entityType of entityTypes) {
      const typeName = entityType.displayName;
      entityCache[typeName] = (entityType.entities || []).map(entity => ({
        referenceValue: entity.value, // Reference value (VD: "bo_sung_ho_so")
        synonyms: entity.synonyms || [] // Synonyms (VD: ["giảm trừ gia cảnh", "miễn thuế", ...])
      }));
    }
    entityCacheTime = Date.now();

    console.log(`✅ Loaded ${entityTypes.length} entity types from Dialogflow`);
    return entityCache[entityTypeName] || [];
  } catch (error) {
    console.error('❌ Error fetching entity types:', error.message);
    return [];
  }
};

/**
 * Tìm reference value từ message bằng cách so sánh với synonyms từ Dialogflow
 * @param {string} message - Message gốc từ user
 * @param {string} entityTypeName - Tên entity type
 * @returns {string|null} - Reference value nếu tìm thấy, null nếu không
 */
const findReferenceValueFromMessage = async (message, entityTypeName = 'purpose') => {
  const entities = await getEntitySynonyms(entityTypeName);
  // Normalize Unicode để so sánh chính xác tiếng Việt
  const messageLower = message.toLowerCase().normalize('NFC');

  console.log(`🔍 Searching for "${entityTypeName}" in message: "${message}"`);
  console.log(`   Available entities: ${entities.length}`);
  
  // Debug: Log tất cả entities và synonyms
  console.log('   📋 Entity details from Dialogflow:');
  for (const entity of entities) {
    console.log(`      - ${entity.referenceValue}: [${entity.synonyms.join(', ')}]`);
  }

  for (const entity of entities) {
    // Check từng synonym
    for (const synonym of entity.synonyms) {
      // Split bằng dấu phẩy nếu có nhiều synonyms trong 1 string
      const synonymParts = synonym.includes(',') 
        ? synonym.split(',').map(s => s.trim()) 
        : [synonym];
      
      for (const part of synonymParts) {
        const partLower = part.toLowerCase().normalize('NFC');
        const isMatch = messageLower.includes(partLower);
        
        // Debug log cho các synonym liên quan đến "giảm"
        if (partLower.includes('giảm') || partLower.includes('giam')) {
          console.log(`   🔎 Checking: "${partLower}" in "${messageLower}" = ${isMatch}`);
        }
        
        if (isMatch && partLower.length > 2) { // Chỉ match nếu từ dài hơn 2 ký tự
          console.log(`   ✅ Found match: "${part}" → "${entity.referenceValue}"`);
          return entity.referenceValue;
        }
      }
    }
  }

  console.log(`   ❌ No match found`);
  return null;
};

module.exports = {
  detectIntent,
  extractParameters,
  isDialogflowAvailable,
  getEntitySynonyms,
  findReferenceValueFromMessage,
  projectId,
  languageCode
};
