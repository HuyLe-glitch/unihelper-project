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
 * @param {Array} outputContexts - OutputContexts từ Dialogflow (optional, để lấy entity value)
 * @returns {Object} - Object với các giá trị đã trích xuất
 */
const extractParameters = (parameters, outputContexts = []) => {
  const extracted = {};
  
  for (const [key, value] of Object.entries(parameters)) {
    // FIX: Dùng !== undefined thay vì truthy check để không bỏ qua empty string
    if (value.stringValue !== undefined && value.stringValue !== null) {
      // Nếu stringValue rỗng, thử tìm trong outputContexts
      if (value.stringValue === '') {
        const entityFromContext = extractEntityFromContexts(key, outputContexts);
        if (entityFromContext) {
          extracted[key] = entityFromContext;
          console.log(`   🔄 Extracted "${key}" from outputContexts: "${entityFromContext}"`);
        }
        // Nếu không tìm thấy trong context, bỏ qua (không set empty string)
      } else {
        extracted[key] = value.stringValue;
      }
    } else if (value.numberValue !== undefined) {
      extracted[key] = value.numberValue;
    } else if (value.listValue) {
      const listValues = value.listValue.values.map(v => v.stringValue || v.numberValue).filter(v => v);
      if (listValues.length > 0) {
        extracted[key] = listValues;
      }
    } else if (value.structValue) {
      extracted[key] = value.structValue.fields;
    }
  }

  return extracted;
};

/**
 * Trích xuất entity value từ outputContexts
 * Dialogflow thường lưu entity value trong context với key dạng:
 * - "<param_name>" (resolved value)
 * - "<param_name>.original" (original text từ user)
 * @param {string} paramName - Tên parameter cần tìm
 * @param {Array} outputContexts - Mảng outputContexts từ Dialogflow
 * @returns {string|null} - Entity value nếu tìm thấy
 */
const extractEntityFromContexts = (paramName, outputContexts) => {
  if (!outputContexts || outputContexts.length === 0) return null;
  
  for (const ctx of outputContexts) {
    const fields = ctx.parameters?.fields;
    if (!fields) continue;
    
    // Ưu tiên tìm resolved value (không có .original)
    if (fields[paramName]) {
      const value = fields[paramName];
      if (value.stringValue && value.stringValue !== '') {
        return value.stringValue;
      }
    }
    
    // Fallback: tìm .original
    const originalKey = `${paramName}.original`;
    if (fields[originalKey]) {
      const value = fields[originalKey];
      if (value.stringValue && value.stringValue !== '') {
        return value.stringValue;
      }
    }
  }
  
  return null;
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

/**
 * Tìm entity match tốt nhất từ message trong cả certificate_type và certificate_name
 * Ưu tiên: certificate_name (cụ thể hơn) > certificate_type (loại chung)
 * @param {string} message - Message gốc từ user
 * @returns {Object|null} - { entityType: 'type'|'name', referenceValue: string } hoặc null
 */
const findBestEntityMatch = async (message) => {
  const messageLower = message.toLowerCase().normalize('NFC');
  
  console.log(`🔍 findBestEntityMatch - Message: "${message}"`);

  // Lấy entities từ cả 2 loại
  const [typeEntities, nameEntities] = await Promise.all([
    getEntitySynonyms('certificate_type'),
    getEntitySynonyms('certificate_name')
  ]);

  console.log(`   📋 certificate_type entities: ${typeEntities.length}`);
  console.log(`   📋 certificate_name entities: ${nameEntities.length}`);

  // Helper function để tìm match với độ dài synonym
  const findMatchWithLength = (entities) => {
    let bestMatch = null;
    let maxLength = 0;

    for (const entity of entities) {
      for (const synonym of entity.synonyms) {
        const synonymParts = synonym.includes(',') 
          ? synonym.split(',').map(s => s.trim()) 
          : [synonym];
        
        for (const part of synonymParts) {
          const partLower = part.toLowerCase().normalize('NFC');
          
          if (messageLower.includes(partLower) && partLower.length > 2) {
            // Ưu tiên match dài hơn (cụ thể hơn)
            if (partLower.length > maxLength) {
              maxLength = partLower.length;
              bestMatch = {
                referenceValue: entity.referenceValue,
                matchedSynonym: part,
                matchLength: partLower.length
              };
            }
          }
        }
      }
    }
    return bestMatch;
  };

  // Tìm trong certificate_name trước (ưu tiên cụ thể)
  const nameMatch = findMatchWithLength(nameEntities);
  
  // Tìm trong certificate_type
  const typeMatch = findMatchWithLength(typeEntities);

  console.log(`   🔎 certificate_name match:`, nameMatch);
  console.log(`   🔎 certificate_type match:`, typeMatch);

  // Ưu tiên match có độ dài dài hơn
  if (nameMatch && typeMatch) {
    if (nameMatch.matchLength >= typeMatch.matchLength) {
      console.log(`   ✅ Best match: certificate_name → "${nameMatch.referenceValue}"`);
      return { entityType: 'name', referenceValue: nameMatch.referenceValue };
    } else {
      console.log(`   ✅ Best match: certificate_type → "${typeMatch.referenceValue}"`);
      return { entityType: 'type', referenceValue: typeMatch.referenceValue };
    }
  }

  if (nameMatch) {
    console.log(`   ✅ Match found: certificate_name → "${nameMatch.referenceValue}"`);
    return { entityType: 'name', referenceValue: nameMatch.referenceValue };
  }

  if (typeMatch) {
    console.log(`   ✅ Match found: certificate_type → "${typeMatch.referenceValue}"`);
    return { entityType: 'type', referenceValue: typeMatch.referenceValue };
  }

  console.log(`   ❌ No match found in both entities`);
  return null;
};

/**
 * Lấy parameter từ Dialogflow Context
 * Dùng để lấy dữ liệu từ context khi user gõ tự nhiên (VD: "Ok tạo đi")
 * @param {Array} outputContexts - Mảng contexts từ Dialogflow response
 * @param {string} contextName - Tên context cần tìm (VD: "session_tao_yeu_cau")
 * @param {string} paramName - Tên parameter cần lấy (VD: "purpose")
 * @returns {string|null} - Giá trị parameter hoặc null
 */
const getParamFromContext = (outputContexts, contextName, paramName) => {
  if (!outputContexts || outputContexts.length === 0) return null;
  
  // Tìm context theo tên (context name có dạng: projects/.../contexts/<name>)
  const context = outputContexts.find(ctx => 
    ctx.name && ctx.name.includes(`/contexts/${contextName}`)
  );
  
  if (!context?.parameters?.fields) return null;
  
  console.log(`🔍 getParamFromContext - Looking for "${paramName}" in context "${contextName}"`);
  
  // Lấy giá trị parameter
  const param = context.parameters.fields[paramName];
  if (!param) {
    console.log(`   ❌ Parameter "${paramName}" not found in context`);
    return null;
  }
  
  // Xử lý stringValue
  if (param.stringValue && param.stringValue !== '') {
    console.log(`   ✅ Found stringValue: "${param.stringValue}"`);
    return param.stringValue;
  }
  
  // Xử lý listValue (array) - lấy phần tử đầu tiên
  if (param.listValue && param.listValue.values && param.listValue.values.length > 0) {
    const firstValue = param.listValue.values[0];
    if (firstValue.stringValue && firstValue.stringValue !== '') {
      console.log(`   ✅ Found listValue[0]: "${firstValue.stringValue}"`);
      return firstValue.stringValue;
    }
  }
  
  // Thử lấy từ .original nếu không có resolved value
  const originalParam = context.parameters.fields[`${paramName}.original`];
  if (originalParam) {
    if (originalParam.stringValue && originalParam.stringValue !== '') {
      console.log(`   ✅ Found .original stringValue: "${originalParam.stringValue}"`);
      return originalParam.stringValue;
    }
    // Xử lý listValue cho .original
    if (originalParam.listValue && originalParam.listValue.values && originalParam.listValue.values.length > 0) {
      const firstValue = originalParam.listValue.values[0];
      if (firstValue.stringValue && firstValue.stringValue !== '') {
        console.log(`   ✅ Found .original listValue[0]: "${firstValue.stringValue}"`);
        return firstValue.stringValue;
      }
    }
  }
  
  console.log(`   ❌ No valid value found for "${paramName}"`);
  return null;
};

module.exports = {
  detectIntent,
  extractParameters,
  extractEntityFromContexts,
  isDialogflowAvailable,
  getEntitySynonyms,
  findReferenceValueFromMessage,
  findBestEntityMatch,
  getParamFromContext,  // Thêm mới: lấy param từ Dialogflow Context
  projectId,
  languageCode
};
