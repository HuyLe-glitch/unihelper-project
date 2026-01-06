# 🤖 CHATBOT UNIHELPER - CHỨC NĂNG VÀ LUỒNG HOẠT ĐỘNG

## 📋 Mục lục
1. [Tổng quan kiến trúc](#1-tổng-quan-kiến-trúc)
2. [Luồng xử lý tin nhắn](#2-luồng-xử-lý-tin-nhắn)
3. [Chi tiết các chức năng](#3-chi-tiết-các-chức-năng)
4. [Mapping Intent và Response](#4-mapping-intent-và-response)
5. [Cấu trúc Response](#5-cấu-trúc-response)

---

## 1. Tổng quan kiến trúc

### 1.1. Sơ đồ kiến trúc

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│                 │     │                 │     │                 │
│  Frontend       │────▶│  Backend API    │────▶│  Dialogflow ES  │
│  (React)        │     │  (Node.js)      │     │  (Google Cloud) │
│                 │◀────│                 │◀────│                 │
└─────────────────┘     └─────────────────┘     └─────────────────┘
        │                       │                       │
        │                       ▼                       │
        │               ┌─────────────────┐             │
        │               │                 │             │
        └──────────────▶│  MongoDB        │◀────────────┘
                        │  (Database)     │
                        │                 │
                        └─────────────────┘
```

### 1.2. Vai trò của từng thành phần

| Thành phần | Vai trò |
|------------|---------|
| **Frontend** | Hiển thị giao diện chat, gửi tin nhắn, nhận response |
| **Backend API** | Xử lý business logic, gọi Dialogflow, truy vấn database |
| **Dialogflow ES** | Nhận diện intent (ý định), trích xuất entities (thông tin) |
| **MongoDB** | Lưu trữ lịch sử chat, thông tin yêu cầu của sinh viên |

---

## 2. Luồng xử lý tin nhắn

### 2.1. Sơ đồ luồng chi tiết

```
                    Người dùng gửi tin nhắn
                            │
                            ▼
            ┌───────────────────────────────┐
            │  1. Frontend gửi message      │
            │     POST /api/chatbot/message │
            └───────────────────────────────┘
                            │
                            ▼
            ┌───────────────────────────────┐
            │  2. Backend nhận message      │
            │     - Tạo/lấy sessionId       │
            │     - Lưu tin nhắn user       │
            └───────────────────────────────┘
                            │
                            ▼
            ┌───────────────────────────────┐
            │  3. Gọi Dialogflow            │
            │     detectIntent(sessionId,   │
            │                  message)     │
            └───────────────────────────────┘
                            │
                            ▼
            ┌───────────────────────────────┐
            │  4. Dialogflow trả về         │
            │     - Intent name             │
            │     - Confidence score        │
            │     - Parameters (entities)   │
            │     - Fulfillment text        │
            └───────────────────────────────┘
                            │
                            ▼
            ┌───────────────────────────────┐
            │  5. Backend xử lý response    │
            │     - Map intent → action     │
            │     - Truy vấn database       │
            │     - Generate HTML response  │
            └───────────────────────────────┘
                            │
                            ▼
            ┌───────────────────────────────┐
            │  6. Trả response cho Frontend │
            │     - message (HTML)          │
            │     - quickReplies            │
            │     - statusCard (nếu có)     │
            └───────────────────────────────┘
                            │
                            ▼
                  Frontend hiển thị kết quả
```

### 2.2. Ví dụ cụ thể

**User gửi**: "kiểm tra yêu cầu nghĩa vụ quân sự"

```
Bước 1: Frontend → Backend
────────────────────────────────
POST /api/chatbot/message
{
  "message": "kiểm tra yêu cầu nghĩa vụ quân sự"
}

Bước 2-3: Backend → Dialogflow
────────────────────────────────
Gọi detectIntent() với text đầu vào

Bước 4: Dialogflow → Backend
────────────────────────────────
{
  "intent": "ctsv.kiem_tra",
  "confidence": 0.89,
  "parameters": {
    "certificate_type": "Nghĩa vụ quân sự"
  }
}

Bước 5: Backend xử lý
────────────────────────────────
- Map intent "ctsv.kiem_tra" → gọi getDocumentStatus()
- Lọc yêu cầu theo certificate_type = "Nghĩa vụ quân sự"
- Truy vấn database lấy danh sách yêu cầu

Bước 6: Backend → Frontend
────────────────────────────────
{
  "message": "<div class='info-card'>...</div>",
  "statusCard": { ... },
  "quickReplies": [...]
}
```

---

## 3. Chi tiết các chức năng

### 3.1. Chào hỏi (Welcome)

**Kích hoạt khi**: User mở chatbot hoặc gửi "xin chào", "hello"

**Luồng xử lý**:
```
User: "xin chào"
    ↓
Dialogflow: Intent = "Default Welcome Intent"
    ↓
Backend: Trả về lời chào + menu chính
    ↓
Response: 
  - Message: "👋 Xin chào! Mình là UniHelper Bot..."
  - Quick Replies: [Báo sự cố, Giấy tờ, Trạng thái, Hỏi đáp, Liên hệ]
```

---

### 3.2. Kiểm tra trạng thái yêu cầu CTSV

**Kích hoạt khi**: User hỏi về trạng thái yêu cầu giấy tờ

**Intent**: `ctsv.kiem_tra`

**Parameters**:
- `certificate_type`: Loại chứng nhận (tùy chọn)
- `certificate_name`: Tên giấy cụ thể (tùy chọn)

**Luồng xử lý**:

```
┌─────────────────────────────────────────────────────────┐
│ User: "kiểm tra yêu cầu nghĩa vụ quân sự"               │
└─────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────┐
│ Dialogflow nhận diện:                                   │
│   - Intent: ctsv.kiem_tra                               │
│   - Parameter: certificate_type = "Nghĩa vụ quân sự"    │
└─────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────┐
│ Backend thực hiện:                                      │
│   1. Lấy thông tin student từ userId                    │
│   2. Query database: getCertificateRequestsByStudent()  │
│   3. Lọc theo certificate_type nếu có                   │
└─────────────────────────────────────────────────────────┘
                          │
                          ▼
              ┌───────────┴───────────┐
              │                       │
              ▼                       ▼
    ┌─────────────────┐     ┌─────────────────┐
    │ Có 1 yêu cầu    │     │ Có nhiều yêu cầu│
    │                 │     │                 │
    │ → Hiển thị      │     │ → Hiển thị      │
    │   StatusCard    │     │   danh sách     │
    └─────────────────┘     └─────────────────┘
```

**Các trường hợp response**:

| Trường hợp | Response |
|------------|----------|
| Không tìm thấy student | "⚠️ Không tìm thấy thông tin sinh viên" |
| Không có yêu cầu nào | "📭 Bạn chưa có yêu cầu giấy tờ nào" |
| Có 1 yêu cầu | Hiển thị StatusCard chi tiết |
| Có nhiều yêu cầu | Hiển thị danh sách (tối đa 5) |

---

### 3.3. Kiểm tra trạng thái báo cáo sự cố KTX

**Kích hoạt khi**: User hỏi về trạng thái báo cáo sự cố thiết bị

**Intent**: `ktx.kiem_tra`

**Parameters**:
- `equipment_category`: Loại thiết bị (tùy chọn)
- `equipment_item`: Tên thiết bị cụ thể (tùy chọn)

**Luồng xử lý**: Tương tự như CTSV nhưng query `getKtxRequestsByStudent()`

---

### 3.4. Tư vấn giấy tờ theo mục đích

**Kích hoạt khi**: User hỏi "cần giấy gì để...", "tư vấn giấy tờ"

**Intent**: `ctsv.tu_van`

**Parameters**:
- `purpose`: Mục đích sử dụng

**Luồng xử lý**:

```
┌─────────────────────────────────────────────────────────┐
│ User: "tôi cần giấy để giảm trừ gia cảnh"               │
└─────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────┐
│ Dialogflow nhận diện:                                   │
│   - Intent: ctsv.tu_van                                 │
│   - Parameter: purpose = "giảm trừ gia cảnh"            │
└─────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────┐
│ Backend thực hiện:                                      │
│   1. normalizePurpose("giảm trừ gia cảnh")              │
│      → "giam_tru_gia_canh"                              │
│   2. Tra cứu PURPOSE_TO_CERTIFICATE mapping             │
│   3. Lấy thông tin: certificateType, certificateName    │
└─────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────┐
│ Response:                                               │
│   ✅ TƯ VẤN GIẤY TỜ                                     │
│                                                         │
│   📄 Giấy tờ phù hợp: Xác nhận sinh viên đang học       │
│                                                         │
│   📝 Mô tả: Giấy xác nhận để đăng ký giảm trừ...        │
│                                                         │
│   📍 Hướng dẫn tạo yêu cầu:                             │
│      Bước 1: Vào menu "Yêu cầu chứng nhận"              │
│      Bước 2: Chọn loại: Xác nhận sinh viên              │
│      Bước 3: Chọn tên: Xác nhận sinh viên đang học      │
│      Bước 4: Nhấn "Tạo yêu cầu"                         │
│                                                         │
│   💡 Lưu ý: Cần mang theo CMND/CCCD...                  │
└─────────────────────────────────────────────────────────┘
```

**Bảng mapping mục đích → giấy tờ**:

| Mục đích | Loại chứng nhận | Tên giấy |
|----------|-----------------|----------|
| Giảm trừ gia cảnh | Xác nhận sinh viên | Xác nhận sinh viên đang học |
| Nghĩa vụ quân sự | Nghĩa vụ quân sự | Nghĩa vụ quân sự chuẩn |
| Chế độ chính sách | Xác nhận sinh viên | Xác nhận sinh viên đang học |
| Thẻ sinh viên | Chứng nhận khác | Chứng nhận khác chuẩn |
| Xin việc/Thực tập | Xác nhận sinh viên | Xác nhận sinh viên đang học |
| Xin visa/Du học | Xác nhận sinh viên | Xác nhận sinh viên có học bổng |
| Học bổng | Bảng điểm | Bảng điểm tích lũy |

---

### 3.5. Kiểm tra chung

**Kích hoạt khi**: User hỏi chung "kiểm tra trạng thái", "xem yêu cầu"

**Intent**: `kiem_tra.chung`

**Luồng xử lý**:
```
User: "kiểm tra trạng thái"
    ↓
Bot hỏi lại: "Bạn muốn kiểm tra loại yêu cầu nào?"
    ↓
Quick Replies: [Báo cáo sự cố, Yêu cầu giấy tờ]
```

---

### 3.6. FAQ - Hỏi đáp thường gặp

| Intent | Trigger | Response |
|--------|---------|----------|
| `faq.gio_lam_viec` | "giờ làm việc", "mấy giờ mở cửa" | Thông tin giờ làm việc |
| `faq.lien_he` | "số điện thoại", "email liên hệ" | Thông tin liên hệ |

**Đặc điểm**: Response lấy trực tiếp từ `fulfillmentText` của Dialogflow (không cần xử lý backend phức tạp).

---

## 4. Mapping Intent và Response

### 4.1. Bảng mapping tổng hợp

| Dialogflow Intent | Internal Action | Handler Function |
|-------------------|-----------------|------------------|
| `Default Welcome Intent` | `greeting` | Trả về lời chào + menu |
| `Default Fallback Intent` | `unknown` | Hướng dẫn user hỏi lại |
| `ctsv.kiem_tra` | `check_document_status` | `getDocumentStatus()` |
| `ctsv.tu_van` | `document_advice` | `getDocumentAdvice()` |
| `ctsv.thong_tin` | `document_info` | Thông tin về giấy tờ |
| `ktx.kiem_tra` | `check_ktx_status` | `getKtxStatus()` |
| `ktx.thong_tin` | `ktx_info` | Thông tin về báo sự cố |
| `kiem_tra.chung` | `check_status` | Hỏi lại loại yêu cầu |
| `faq.gio_lam_viec` | - | Trả fulfillmentText |
| `faq.lien_he` | - | Trả fulfillmentText |

### 4.2. Luồng quyết định xử lý

```
              Nhận intent từ Dialogflow
                        │
                        ▼
              ┌─────────────────┐
              │ Mapping intent  │
              │ → action        │
              └─────────────────┘
                        │
        ┌───────────────┼───────────────┐
        │               │               │
        ▼               ▼               ▼
   ┌─────────┐    ┌─────────┐    ┌─────────┐
   │ CTSV?   │    │ KTX?    │    │ FAQ?    │
   └────┬────┘    └────┬────┘    └────┬────┘
        │               │               │
        ▼               ▼               ▼
  getDocument      getKtxStatus    Trả về
  Status() hoặc    ()              fulfillment
  getDocument                      Text
  Advice()
```

---

## 5. Cấu trúc Response

### 5.1. Cấu trúc chuẩn

```javascript
{
  "success": true,
  "data": {
    "sessionId": "abc-123-xyz",
    "message": "<div class='info-card'>...</div>",
    "quickReplies": [
      { "id": "ktx", "icon": "🔧", "label": "Báo sự cố", "action": "ktx_info" },
      { "id": "giayto", "icon": "📄", "label": "Giấy tờ", "action": "document_info" }
    ],
    "statusCard": {
      "type": "certificate",
      "data": {
        "requestCode": "CTSV-ABC123",
        "createdAt": "2026-01-06T12:00:00Z",
        "certificateType": "Nghĩa vụ quân sự",
        "status": "processing",
        "estimatedTime": "1-3 ngày làm việc"
      }
    },
    "intent": "ctsv.kiem_tra",
    "confidence": 0.89
  }
}
```

### 5.2. Giải thích các field

| Field | Mô tả |
|-------|-------|
| `message` | Nội dung HTML hiển thị trong chat bubble |
| `quickReplies` | Các nút bấm nhanh bên dưới tin nhắn |
| `statusCard` | Card hiển thị thông tin trạng thái (nếu có) |
| `intent` | Intent được Dialogflow nhận diện |
| `confidence` | Độ tin cậy của việc nhận diện (0-1) |

### 5.3. StatusCard types

| Type | Sử dụng cho |
|------|-------------|
| `certificate` | Yêu cầu giấy tờ CTSV |
| `equipment` | Báo cáo sự cố thiết bị KTX |

---

## 📝 Tóm tắt

Chatbot UniHelper hoạt động theo mô hình:

1. **NLP bằng Dialogflow**: Nhận diện ý định và trích xuất thông tin
2. **Business Logic bằng Backend**: Xử lý nghiệp vụ, truy vấn database
3. **Response có cấu trúc**: message + quickReplies + statusCard

Các chức năng chính:
- ✅ Kiểm tra trạng thái yêu cầu CTSV (có lọc theo loại)
- ✅ Kiểm tra trạng thái báo cáo sự cố KTX (có lọc theo thiết bị)
- ✅ Tư vấn giấy tờ theo mục đích sử dụng
- ✅ Trả lời FAQ (giờ làm việc, liên hệ)
- ✅ Xử lý fallback khi không hiểu câu hỏi
