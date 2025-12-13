# 🔄 API Tạo Yêu Cầu Chứng Nhận - Cấu Trúc Mới

## 📋 Luồng Frontend Logic

### 1️⃣ **Bước 1: Lấy danh sách loại chứng nhận**
```http
GET /api/certificates/types
Authorization: Bearer <token>
```

**Response:**
```json
{
  "status": "success",
  "data": [
    {
      "_id": "671234567890abcdef123456",
      "name": "Xác nhận sinh viên",
      "description": "Các loại giấy xác nhận liên quan đến tình trạng sinh viên"
    },
    {
      "_id": "671234567890abcdef123457", 
      "name": "Bảng điểm",
      "description": "Các loại bảng điểm và chứng nhận học tập"
    }
  ]
}
```

### 2️⃣ **Bước 2: Khi user chọn loại → Lấy tên chứng nhận tương ứng**
```http
GET /api/certificates/types/{selectedTypeId}/names/active
Authorization: Bearer <token>
```

**Ví dụ khi chọn "Xác nhận sinh viên":**
```http
GET /api/certificates/types/671234567890abcdef123456/names/active
```

**Response:**
```json
{
  "status": "success",
  "data": [
    {
      "_id": "671234567890abcdef789012",
      "name": "Xác nhận sinh viên đang học",
      "description": "Giấy xác nhận sinh viên đang theo học tại trường",
      "purpose": "Xin việc làm, thực tập",
      "processingTime": 3,
      "fee": 0
    },
    {
      "_id": "671234567890abcdef789013",
      "name": "Xác nhận sinh viên có học bổng", 
      "description": "Giấy xác nhận sinh viên đang học và nhận học bổng",
      "purpose": "Xin visa, du học",
      "processingTime": 5,
      "fee": 0
    }
  ]
}
```

### 3️⃣ **Bước 3: Tạo yêu cầu với type và name đã chọn**
```http
POST /api/certificate-requests
Authorization: Bearer <student_token>
Content-Type: application/json

{
  "certificateType": "671234567890abcdef123456",
  "certificateName": "671234567890abcdef789012", 
  "semester": "HK1 2024-2025",
  "notes": "Cần để xin việc làm part-time"
}
```

**Response Success:**
```json
{
  "status": "success",
  "message": "Tạo yêu cầu chứng nhận thành công",
  "data": {
    "_id": "671234567890abcdef999999",
    "requestCode": "00000001",
    "certificateType": "671234567890abcdef123456",
    "certificateName": "671234567890abcdef789012",
    "semester": "HK1 2024-2025",
    "status": "PENDING",
    "notes": "Cần để xin việc làm part-time",
    "createdAt": "2024-10-25T10:00:00Z"
  }
}
```

---

## ✅ **Thay đổi so với API cũ:**

### **❌ Cấu trúc CŨ (Không dùng nữa):**
```json
{
  "certificateTypeId": "...",
  "certificateName": "Tên nhập tay", // String
  "semester": "..."
}
```

### **✅ Cấu trúc MỚI (Hiện tại):**
```json
{
  "certificateType": "ObjectId của loại",
  "certificateName": "ObjectId của tên",  // ObjectId reference
  "semester": "...",
  "notes": "Ghi chú thêm (optional)"
}
```

---

## 🚀 **Thứ tự chạy scripts để setup test data:**

```bash
# Bước 1: Tạo certificate types
node scripts/seedCertificateType.js

# Bước 2: Tạo certificate names (phụ thuộc vào types)
node scripts/seedCertificateName.js

# Bước 3: Tạo student account
node scripts/seedStudent.js

# Bước 4: Tạo certificate requests mẫu
node scripts/seedCertificateRequest.js

# Bước 5: Khởi động server
npm run dev
```

---

## 🎯 **Test Workflow với Postman:**

### **Test 1: Login và lấy token**
```http
POST http://localhost:5000/api/auth/login
{
  "email": "student@example.com",
  "password": "Password123!"
}
```
→ Copy token từ response

### **Test 2: Lấy danh sách loại chứng nhận**
```http
GET http://localhost:5000/api/certificates/types
Authorization: Bearer <token>
```
→ Copy một `_id` từ response (ví dụ: typeId)

### **Test 3: Lấy tên chứng nhận theo loại**
```http
GET http://localhost:5000/api/certificates/types/{typeId}/names/active
Authorization: Bearer <token>
```
→ Copy một `_id` từ response (ví dụ: nameId)

### **Test 4: Tạo yêu cầu mới**
```http
POST http://localhost:5000/api/certificate-requests
Authorization: Bearer <token>
Content-Type: application/json

{
  "certificateType": "{typeId từ step 2}",
  "certificateName": "{nameId từ step 3}",
  "semester": "HK1 2024-2025",
  "notes": "Test tạo yêu cầu"
}
```

### **Test 5: Xem yêu cầu đã tạo**
```http
GET http://localhost:5000/api/certificate-requests/my
Authorization: Bearer <token>
```

### **Test 6: Test Dashboard APIs**

#### Test 6.1: Lấy yêu cầu đang xử lý
```http
GET http://localhost:5000/api/certificate-requests/dashboard/processing
Authorization: Bearer <token>
```

#### Test 6.2: Lấy yêu cầu hợp lệ 
```http
GET http://localhost:5000/api/certificate-requests/dashboard/valid
Authorization: Bearer <token>
```

#### Test 6.3: Lấy yêu cầu không hợp lệ
```http
GET http://localhost:5000/api/certificate-requests/dashboard/invalid
Authorization: Bearer <token>
```

---

## 💡 **Lợi ích của cấu trúc mới:**

1. **Tính nhất quán:** Không còn nhập tên thủ công → Giảm lỗi chính tả
2. **Quản lý tập trung:** Admin có thể quản lý tất cả tên chứng nhận
3. **Thông tin phong phú:** Mỗi tên có `purpose`, `processingTime`, `fee`
4. **Linh hoạt:** Một loại có nhiều tên khác nhau
5. **Frontend dễ làm:** Dropdown cascade (chọn loại → hiện tên)

---

## 📊 **Data Structure Relationships:**

```
CertificateType (1) ──→ (Many) CertificateName
     ↓                           ↓
     └──────────→ CertificateRequest ←──┘
                       ↓
                   Student
```

**Ví dụ thực tế:**
- **Type:** "Xác nhận sinh viên"
  - **Name 1:** "Xác nhận sinh viên đang học" 
  - **Name 2:** "Xác nhận sinh viên có học bổng"
  - **Name 3:** "Xác nhận sinh viên tạm ngừng học"
- **Request:** Sinh viên chọn Type + Name cụ thể → Tạo request

---

## 🔧 **Validation Rules:**

1. **certificateType:** Bắt buộc, phải là ObjectId hợp lệ
2. **certificateName:** Bắt buộc, phải thuộc về certificateType đã chọn
3. **semester:** Bắt buộc, string không rỗng
4. **notes:** Tùy chọn, string

Cấu trúc này hoàn toàn phù hợp với logic frontend của bạn và đảm bảo tính nhất quán dữ liệu!
