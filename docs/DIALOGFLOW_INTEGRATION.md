# Hướng dẫn Tích hợp Dialogflow ES vào UniHelper

## Tổng quan

Tài liệu này hướng dẫn cách cấu hình Dialogflow ES để hoạt động với UniHelper chatbot.

## 1. Cấu trúc Intents đã tạo

| Intent Name | Loại | Mô tả | Webhook |
|-------------|------|-------|---------|
| `Default Welcome Intent` | Built-in | Chào mừng người dùng | ❌ |
| `Default Fallback Intent` | Built-in | Xử lý câu không hiểu | ❌ |
| `faq.gio_lam_viec` | FAQ | Giờ làm việc phòng CTSV | ❌ |
| `faq.lien_he` | FAQ | Thông tin liên hệ | ❌ |
| `ctsv.thong_tin` | CTSV | Thông tin xin giấy tờ | ❌ |
| `ctsv.kiem_tra` | CTSV | Kiểm tra yêu cầu giấy tờ | ✅ (Query DB) |
| `ktx.thong_tin` | KTX | Thông tin báo sự cố thiết bị | ❌ |
| `ktx.kiem_tra` | KTX | Kiểm tra báo cáo sự cố | ✅ (Query DB) |
| `kiem_tra.chung` | General | Kiểm tra yêu cầu chung | ❌ |

## 2. Cấu trúc Entities

### `@certificate_type` - Loại giấy tờ
- Xác nhận → xác nhận, giấy xác nhận, xac nhan
- Bảng điểm → bảng điểm, transcript, diem
- Giới thiệu → giới thiệu, giay gioi thieu

### `@certificate_name` - Tên cụ thể
- Giấy xác nhận sinh viên → xác nhận sinh viên, giấy XNSV
- Giấy xác nhận vay vốn → xác nhận vay vốn, giấy vay
- Bảng điểm tích lũy → bảng điểm tổng, điểm tích lũy

### `@equipment_category` - Danh mục thiết bị
- Điện → điện, hệ thống điện, điện lực
- Điều hòa → điều hòa, máy lạnh, AC
- Nội thất → nội thất, bàn ghế, furniture

### `@equipment_item` - Thiết bị cụ thể
- Máy lạnh → máy lạnh, điều hòa, AC
- Quạt → quạt, fan, quạt trần
- Đèn → đèn, bóng đèn, light
- Ổ cắm → ổ cắm, ổ điện, socket

## 3. Cấu hình Service Account

### Bước 1: Tạo Service Account trong Google Cloud Console

1. Truy cập [Google Cloud Console](https://console.cloud.google.com/)
2. Chọn project **unihelper-lkxr**
3. Vào **IAM & Admin** → **Service Accounts**
4. Click **+ CREATE SERVICE ACCOUNT**
5. Đặt tên: `dialogflow-client`
6. Mô tả: `Service account for UniHelper chatbot`
7. Click **CREATE AND CONTINUE**

### Bước 2: Cấp quyền

1. Thêm role: **Dialogflow API Client** (`roles/dialogflow.client`)
2. Click **CONTINUE** → **DONE**

### Bước 3: Tạo Key JSON

1. Click vào service account vừa tạo
2. Chuyển sang tab **KEYS**
3. Click **ADD KEY** → **Create new key**
4. Chọn **JSON** → **CREATE**
5. File JSON sẽ tự động tải về

### Bước 4: Đặt file vào project

1. Đổi tên file thành `dialogflow-service-account.json`
2. Di chuyển vào thư mục: `backend/src/config/`

```
backend/
  src/
    config/
      dialogflow.js
      dialogflow-service-account.json  ← Đặt file ở đây
      firebase-service-account.json
```

### Bước 5: Cấu hình .env

Thêm vào file `.env` trong thư mục `backend/`:

```env
# Dialogflow Configuration
DIALOGFLOW_PROJECT_ID=unihelper-lkxr
```

## 4. Cấu hình cho Cloud Run (Production)

Khi deploy lên Cloud Run, bạn **KHÔNG cần** file JSON key vì Cloud Run sử dụng IAM tự động.

### Bước 1: Cấp quyền cho Cloud Run Service Account

1. Vào **IAM & Admin** → **IAM**
2. Tìm service account của Cloud Run (thường là `PROJECT_NUMBER-compute@developer.gserviceaccount.com`)
3. Click **Edit** (biểu tượng bút chì)
4. Click **+ ADD ANOTHER ROLE**
5. Thêm: **Dialogflow API Client**
6. Click **SAVE**

### Bước 2: Cấu hình Environment Variable

Trong Cloud Run, thêm biến môi trường:

```
DIALOGFLOW_PROJECT_ID=unihelper-lkxr
```

## 5. Kiểm tra tích hợp

### Test Local

```bash
cd backend
npm run dev
```

Gửi request test:

```bash
curl -X POST http://localhost:5000/api/chatbot/message \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"message": "xin chào"}'
```

### Kết quả mong đợi

```json
{
  "success": true,
  "data": {
    "sessionId": "abc-123",
    "message": "<div class='info-card'>...</div>",
    "quickReplies": [...],
    "intent": "Default Welcome Intent",
    "confidence": 0.95
  }
}
```

## 6. Flow xử lý tin nhắn

```
┌─────────────────┐
│  User Message   │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  chatbotService │
│  .processMessage│
└────────┬────────┘
         │
         ▼
┌─────────────────┐     ┌──────────────────┐
│ Dialogflow API  │────▶│ detectIntent()   │
│ (dialogflow.js) │     │ extractParameters│
└────────┬────────┘     └──────────────────┘
         │
         │ intent + parameters
         ▼
┌─────────────────┐
│ generateResponse│
│ (check intent)  │
└────────┬────────┘
         │
    ┌────┴────┐
    │         │
    ▼         ▼
┌───────┐  ┌─────────────┐
│  FAQ  │  │ Database    │
│Response│  │ Query       │
└───────┘  │(KTX/CTSV)   │
           └─────────────┘
         │
         ▼
┌─────────────────┐
│  Bot Response   │
│ + Quick Replies │
│ + Status Card   │
└─────────────────┘
```

## 7. Fallback khi không có Dialogflow

Nếu Dialogflow không khả dụng (lỗi network, chưa cấu hình, etc.), hệ thống sẽ tự động sử dụng **fallback keyword matching**:

```javascript
// Ví dụ:
"kiểm tra giấy tờ" → ctsv.kiem_tra
"báo sự cố máy lạnh" → ktx.kiem_tra
"giờ làm việc" → faq.gio_lam_viec
```

## 8. Lưu ý bảo mật

⚠️ **QUAN TRỌNG:**

1. **KHÔNG** commit file `dialogflow-service-account.json` lên Git
2. Thêm vào `.gitignore`:
   ```
   backend/src/config/dialogflow-service-account.json
   ```
3. Sử dụng IAM cho production (Cloud Run)

## 9. Troubleshooting

### Lỗi: "Dialogflow client not initialized"

**Nguyên nhân:** Không tìm thấy file service account JSON

**Giải pháp:**
- Kiểm tra file tồn tại: `backend/src/config/dialogflow-service-account.json`
- Hoặc set biến môi trường: `GOOGLE_APPLICATION_CREDENTIALS`

### Lỗi: "Permission denied"

**Nguyên nhân:** Service account không có quyền Dialogflow

**Giải pháp:**
- Thêm role `Dialogflow API Client` cho service account

### Lỗi: "Project not found"

**Nguyên nhân:** Project ID sai

**Giải pháp:**
- Kiểm tra `DIALOGFLOW_PROJECT_ID` trong `.env`
- Đảm bảo project ID khớp với Dialogflow agent

---

## Files đã tạo/sửa đổi

| File | Hành động | Mô tả |
|------|-----------|-------|
| `backend/package.json` | Sửa | Thêm `@google-cloud/dialogflow` |
| `backend/src/config/dialogflow.js` | Tạo mới | Dialogflow client config |
| `backend/src/services/chatbotService.js` | Sửa | Tích hợp Dialogflow |
| `backend/.env.example` | Sửa | Thêm Dialogflow env vars |
| `docs/DIALOGFLOW_INTEGRATION.md` | Tạo mới | Tài liệu này |
