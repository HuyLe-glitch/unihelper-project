# 📚 CTSV Chatbot Architecture Documentation

## 1. Tổng quan kiến trúc

### 1.1 Nguyên tắc cốt lõi

```
┌─────────────────────────────────────────────────────────────────────┐
│                         DIALOGFLOW ES                               │
│  - Nguồn chân lý DUY NHẤT cho NLU (Natural Language Understanding)  │
│  - Extract intent + entities từ message                             │
│  - Trả về fulfillmentText (nội dung response)                       │
│  - Quản lý context (session_tao_yeu_cau)                            │
└─────────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────────┐
│                         BACKEND (Node.js)                           │
│  - KHÔNG parse message thủ công, KHÔNG fallback                     │
│  - Chỉ xử lý business logic                                         │
│  - Map entities → Database objects                                  │
│  - MongoDB Context chỉ để quản lý step (ready_to_create, confirm)   │
└─────────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────────┐
│                         MONGODB                                      │
│  - Lưu trữ data: Certificate, CertificateType, CertificateRequest   │
│  - PurposeMapping: Map Dialogflow entity → Certificate/Type         │
│  - ChatbotConversation: Lưu context step                            │
└─────────────────────────────────────────────────────────────────────┘
```

### 1.2 Không có Fallback thủ công

**QUAN TRỌNG**: Backend KHÔNG cố parse message khi Dialogflow không extract được entity. Nếu Dialogflow không hiểu → trả về Default Fallback Intent → Bot hỏi lại user.

---

## 2. Dialogflow Configuration

### 2.1 Entities

| Entity Name | Loại | Mô tả | Ví dụ |
|-------------|------|-------|-------|
| `@purpose` | Custom | Mục đích xin giấy tờ | "giảm trừ gia cảnh", "nghĩa vụ quân sự" |
| `@certificate_name` | Custom | Tên giấy tờ cụ thể | "bổ sung hồ sơ cá nhân", "thẻ sinh viên" |
| `@certificate_type` | Custom | Loại chứng nhận | "xác nhận sinh viên", "bảng điểm" |

### 2.2 Intents chính cho CTSV

| Intent | Training Phrases | Entities | Output Context |
|--------|------------------|----------|----------------|
| `ctsv.tu_van` | "tôi cần giấy giảm trừ gia cảnh" | @purpose | session_tao_yeu_cau (lifespan: 15) |
| `ctsv.tao_tu_tu_van` | "tạo đi", "ok tạo luôn" | - | session_tao_yeu_cau (lifespan: 5) |
| `ctsv.kiem_tra` | "kiểm tra giấy bổ sung hồ sơ" | @certificate_name, @certificate_type | - |
| `dong_y.chung` | "ok", "đồng ý", "xác nhận" | - | - |

### 2.3 Context: session_tao_yeu_cau

Dialogflow Context được sử dụng để lưu trữ thông tin qua nhiều turns:

```json
{
  "name": "projects/xxx/agent/sessions/xxx/contexts/session_tao_yeu_cau",
  "lifespanCount": 15,
  "parameters": {
    "purpose": "giam_tru_gia_canh",
    "purpose.original": "giảm trừ gia cảnh"
  }
}
```

---

## 3. Database Models

### 3.1 PurposeMapping

Map Dialogflow entity value → Certificate hoặc CertificateType

```javascript
{
  purposeCode: "giam_tru_gia_canh",        // Dialogflow entity value
  displayName: "Giảm trừ gia cảnh",
  mappingType: "certificate",              // "certificate" hoặc "type"
  certificate: ObjectId("..."),            // Nếu mappingType = "certificate"
  certificateType: ObjectId("..."),        // Nếu mappingType = "type"
  synonyms: ["thuế tncn", "gia cảnh"]      // Không dùng cho fallback, chỉ để tham khảo
}
```

**mappingType**:
- `"certificate"`: Map trực tiếp đến một Certificate cụ thể (VD: "Giấy xác nhận giảm trừ gia cảnh")
- `"type"`: Map đến một CertificateType (VD: loại "Xác nhận sinh viên")

### 3.2 CertificateStatusMapping

Map Dialogflow entity value → ObjectId cho query

```javascript
{
  entityType: "certificate_name",           // "certificate_name" hoặc "certificate_type"
  referenceValue: "bo_sung_ho_so_ca_nhan",  // Dialogflow entity value
  referenceId: ObjectId("..."),             // Certificate._id hoặc CertificateType._id
  displayName: "Bổ sung hồ sơ cá nhân"
}
```

### 3.3 Certificate

```javascript
{
  _id: ObjectId,
  name: "Giấy xác nhận giảm trừ gia cảnh",
  certificateType: ObjectId,  // Reference to CertificateType
  description: "...",
  processingTime: 3,
  isActive: true
}
```

### 3.4 CertificateRequest

```javascript
{
  _id: ObjectId,
  requestCode: "CTSV-2026-001",
  student: ObjectId,
  certificateType: ObjectId,
  certificateName: ObjectId,    // Reference to Certificate
  semester: ObjectId,
  status: "pending",
  description: "...",
  createdAt: Date
}
```

### 3.5 ChatbotConversation

```javascript
{
  sessionId: "session_xxx",
  userId: ObjectId,
  messages: [...],
  formContext: {                // MongoDB Context - CHỈ để quản lý step
    step: "ready_to_create",    // hoặc "confirm", "waiting_description"
    studentId: "...",
    certificateTypeId: "...",
    certificateNameId: "...",
    certificateName: "...",
    semesterId: "..."
  }
}
```

---

## 4. Luồng xử lý chi tiết

### 4.1 Luồng Tư vấn → Tạo yêu cầu

```
User: "tôi cần giấy giảm trừ gia cảnh"
        │
        ▼
┌─────────────────────────────────────────┐
│ Dialogflow                              │
│ Intent: ctsv.tu_van                     │
│ Entity: purpose = "giam_tru_gia_canh"   │
│ Output Context: session_tao_yeu_cau     │
│   - purpose: "giam_tru_gia_canh"        │
│   - lifespan: 15                        │
└─────────────────────────────────────────┘
        │
        ▼
┌─────────────────────────────────────────┐
│ Backend: ctsvHandler.getDocumentAdvice()│
│ 1. Lấy purpose từ parameters            │
│ 2. Query PurposeMapping → Certificate   │
│ 3. Trả về thông tin + quickReplies      │
│ 4. Lưu context vào MongoDB              │
└─────────────────────────────────────────┘
        │
        ▼
Bot: "📄 GIẤY XÁC NHẬN GIẢM TRỪ GIA CẢNH
      Thời gian xử lý: 3 ngày...
      Bạn có muốn tạo yêu cầu không?"
      [Tạo yêu cầu] [Quay lại]
        │
        ▼
User: "ok tạo đi" (hoặc bấm nút "Tạo yêu cầu")
        │
        ▼
┌─────────────────────────────────────────┐
│ Dialogflow                              │
│ Intent: ctsv.tao_tu_tu_van              │
│   HOẶC dong_y.chung                     │
│ Input Context: session_tao_yeu_cau      │
│   - purpose: "giam_tru_gia_canh" (kế thừa)
└─────────────────────────────────────────┘
        │
        ▼
┌─────────────────────────────────────────┐
│ Backend: handleCreateFromAdvice()       │
│                                         │
│ CASE 1: User GÕ CHỮ                     │
│ → Lấy purpose từ Dialogflow Context     │
│   (outputContexts → session_tao_yeu_cau)│
│                                         │
│ CASE 2: User BẤM NÚT                    │
│ → Lấy context từ MongoDB đã lưu         │
│                                         │
│ Sau đó:                                 │
│ → Query PurposeMapping → Certificate    │
│ → Hiển thị form xác nhận                │
└─────────────────────────────────────────┘
        │
        ▼
Bot: "📋 XÁC NHẬN TẠO YÊU CẦU
      Loại: Xác nhận sinh viên
      Tên: Giấy xác nhận giảm trừ gia cảnh
      [Xác nhận] [Hủy]"
        │
        ▼
User: "xác nhận"
        │
        ▼
┌─────────────────────────────────────────┐
│ Backend: handleConfirmRequest()         │
│ 1. Lấy context từ MongoDB               │
│ 2. Tạo CertificateRequest               │
│ 3. Xóa context                          │
│ 4. Gửi notification                     │
└─────────────────────────────────────────┘
        │
        ▼
Bot: "✅ Đã tạo yêu cầu thành công!
      Mã yêu cầu: CTSV-2026-001"
```

### 4.2 Luồng Kiểm tra trạng thái

```
User: "kiểm tra giấy bổ sung hồ sơ cá nhân"
        │
        ▼
┌─────────────────────────────────────────┐
│ Dialogflow                              │
│ Intent: ctsv.kiem_tra                   │
│ Entity: certificate_name =              │
│         "bo_sung_ho_so_ca_nhan"         │
└─────────────────────────────────────────┘
        │
        ▼
┌─────────────────────────────────────────┐
│ Backend: getDocumentStatus()            │
│                                         │
│ 1. Lấy certificate_name từ parameters  │
│ 2. Query CertificateStatusMapping       │
│    → Lấy referenceId (Certificate._id)  │
│ 3. Query CertificateRequest             │
│    filter: { certificateName: refId }   │
│    sort: { createdAt: -1 }              │
│    limit: 1 (chỉ lấy request gần nhất)  │
│ 4. Trả về StatusCard                    │
└─────────────────────────────────────────┘
        │
        ▼
Bot: [StatusCard]
     Mã yêu cầu: CTSV-2026-001
     Loại: Xác nhận sinh viên
     Tên: Bổ sung hồ sơ cá nhân
     Trạng thái: ⏳ Đang chờ xử lý
```

---

## 5. Code quan trọng

### 5.1 getParamFromContext() - Lấy param từ Dialogflow Context

**File**: `backend/src/config/dialogflow.js`

```javascript
/**
 * Lấy parameter từ Dialogflow outputContexts
 * @param {Array} outputContexts - Mảng contexts từ Dialogflow response
 * @param {string} contextName - Tên context (VD: "session_tao_yeu_cau")
 * @param {string} paramName - Tên parameter (VD: "purpose")
 */
function getParamFromContext(outputContexts, contextName, paramName) {
  if (!outputContexts || !Array.isArray(outputContexts)) return null;
  
  // Tìm context theo tên (có thể là full path hoặc short name)
  const context = outputContexts.find(ctx => 
    ctx.name && ctx.name.includes(contextName)
  );
  
  if (!context || !context.parameters) return null;
  
  const param = context.parameters[paramName];
  if (!param) return null;
  
  // Handle cả stringValue và listValue
  if (param.stringValue) return param.stringValue;
  if (param.listValue && param.listValue.values) {
    return param.listValue.values[0]?.stringValue || null;
  }
  
  // Nếu là primitive value
  if (typeof param === 'string') return param;
  
  return null;
}
```

### 5.2 handleCreateFromAdvice() - Logic ưu tiên context

**File**: `backend/src/services/chatbot/ctsvHandler.js`

```javascript
async handleCreateFromAdvice(userId, sessionId, dialogflowResult = null) {
  let context = null;
  let contextSource = null;
  
  // ========================================
  // CASE 1: User GÕ CHỮ (có Dialogflow response)
  // → ƯU TIÊN Dialogflow Context
  // ========================================
  if (dialogflowResult?.outputContexts?.length > 0) {
    const purposeFromDF = getParamFromContext(
      dialogflowResult.outputContexts,
      'session_tao_yeu_cau',
      'purpose'
    );
    
    if (purposeFromDF) {
      const purposeResult = await chatbotRepository.findCertificateByPurpose(purposeFromDF);
      if (purposeResult?.certificate) {
        context = {
          step: 'ready_to_create',
          certificateNameId: cert._id.toString(),
          // ... other fields
        };
        contextSource = 'dialogflow';
        
        // Lưu vào MongoDB cho bước tiếp theo
        await chatbotRepository.saveConversationContext(sessionId, context);
      }
    }
  }
  
  // ========================================
  // CASE 2: User BẤM NÚT (không qua Dialogflow)
  // → Lấy context đã lưu từ MongoDB
  // ========================================
  if (!context) {
    const mongoContext = await chatbotRepository.getConversationContext(sessionId);
    if (mongoContext?.step === 'ready_to_create' && mongoContext?.certificateNameId) {
      context = mongoContext;
      contextSource = 'mongodb';
    }
  }
  
  // ... xử lý tiếp
}
```

### 5.3 findCertificateByPurpose() - Exact match only

**File**: `backend/src/repositories/chatbotRepository.js`

```javascript
async findCertificateByPurpose(purposeCode) {
  // Chỉ exact match, KHÔNG có fallback
  const mapping = await PurposeMapping.findOne({ purposeCode })
    .populate('certificate')
    .populate('certificateType');
  
  if (!mapping) return null;
  
  if (mapping.mappingType === 'certificate' && mapping.certificate) {
    return {
      certificate: mapping.certificate,
      mappingType: 'certificate'
    };
  }
  
  if (mapping.mappingType === 'type' && mapping.certificateType) {
    return {
      certificateType: mapping.certificateType,
      mappingType: 'type'
    };
  }
  
  return null;
}
```

---

## 6. Files quan trọng

### Backend

| File | Chức năng |
|------|-----------|
| `services/chatbot/index.js` | Orchestrator chính, route intents đến handlers |
| `services/chatbot/ctsvHandler.js` | Xử lý tất cả intent CTSV |
| `services/chatbot/commonHandler.js` | Xử lý greeting, fallback, FAQ |
| `services/chatbot/dialogflowHandler.js` | Wrapper gọi Dialogflow API |
| `services/chatbot/constants.js` | INTENT_MAPPING, helper functions |
| `config/dialogflow.js` | Dialogflow config, getParamFromContext() |
| `repositories/chatbotRepository.js` | Data access layer |
| `models/PurposeMapping.js` | Model map purpose → certificate |
| `models/CertificateStatusMapping.js` | Model map entity → ObjectId |

### Frontend

| File | Chức năng |
|------|-----------|
| `components/common/Chatbot/Chatbot.jsx` | Component chính |
| `components/common/Chatbot/QuickReplies.jsx` | Nút gợi ý nhanh |
| `components/common/Chatbot/StatusCard.jsx` | Hiển thị trạng thái yêu cầu |

---

## 7. Quy tắc quan trọng

### ✅ NÊN làm

1. **Dialogflow là nguồn chân lý duy nhất** cho NLU
2. **Thêm training phrases** trong Dialogflow khi cần hỗ trợ câu mới
3. **Thêm PurposeMapping** khi có certificate mới
4. **Lấy entity từ Dialogflow parameters** hoặc outputContexts
5. **MongoDB Context** chỉ để quản lý step (ready_to_create, confirm)

### ❌ KHÔNG nên làm

1. **KHÔNG parse message thủ công** trong backend
2. **KHÔNG dùng fallback** tìm entity từ synonyms/displayName
3. **KHÔNG hardcode response text** - lấy từ Dialogflow fulfillmentText
4. **KHÔNG cắt text** trong quickReplies label

---

## 8. Troubleshooting

### Vấn đề: Entity không được extract

**Nguyên nhân**: Dialogflow không có training phrase tương ứng

**Giải pháp**: 
1. Vào Dialogflow Console
2. Thêm training phrase với annotation entity
3. Train lại agent

### Vấn đề: purpose không tìm thấy Certificate

**Nguyên nhân**: Thiếu PurposeMapping trong database

**Giải pháp**:
```javascript
// Thêm vào seed hoặc database
await PurposeMapping.create({
  purposeCode: "entity_value_from_dialogflow",
  displayName: "Tên hiển thị",
  mappingType: "certificate",
  certificate: ObjectId("certificate_id")
});
```

### Vấn đề: Context không được truyền qua các turns

**Nguyên nhân**: Dialogflow Context lifespan hết

**Giải pháp**: Tăng lifespan trong Dialogflow (khuyến nghị: 15 cho tu_van, 5 cho dong_y)

---

## 9. Diagram tổng quan

```
┌──────────────────────────────────────────────────────────────────────────┐
│                              DIALOGFLOW ES                                │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────────────────┐   │
│  │   Intents   │  │  Entities   │  │         Contexts                │   │
│  │             │  │             │  │                                 │   │
│  │ ctsv.tu_van │  │ @purpose    │  │ session_tao_yeu_cau             │   │
│  │ ctsv.kiem_tra│ │ @cert_name  │  │   - purpose: "giam_tru_gia_canh"│   │
│  │ dong_y.chung│  │ @cert_type  │  │   - lifespan: 15                │   │
│  └─────────────┘  └─────────────┘  └─────────────────────────────────┘   │
└──────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌──────────────────────────────────────────────────────────────────────────┐
│                              BACKEND                                      │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────────────┐   │
│  │ dialogflowHandler│  │   ctsvHandler   │  │ chatbotRepository       │   │
│  │                 │  │                 │  │                         │   │
│  │ detectIntent()  │──▶│ getDocumentAdvice()│──▶│ findCertificateByPurpose()│
│  │ outputContexts  │  │ getDocumentStatus()│  │ getCertificateRequests() │
│  └─────────────────┘  │ handleCreateFrom│  └─────────────────────────┘   │
│                       │   Advice()      │                                 │
│                       └─────────────────┘                                 │
└──────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌──────────────────────────────────────────────────────────────────────────┐
│                              MONGODB                                      │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────────┐  │
│  │ Certificate │  │ PurposeMap  │  │ CertStatus  │  │ ChatbotConvers  │  │
│  │             │  │             │  │   Mapping   │  │                 │  │
│  │ name        │  │ purposeCode │  │ entityType  │  │ formContext     │  │
│  │ certType    │  │ certificate │  │ referenceId │  │   - step        │  │
│  └─────────────┘  │ mappingType │  └─────────────┘  │   - certNameId  │  │
│                   └─────────────┘                    └─────────────────┘  │
└──────────────────────────────────────────────────────────────────────────┘
```

---

*Cập nhật lần cuối: 14/01/2026*
