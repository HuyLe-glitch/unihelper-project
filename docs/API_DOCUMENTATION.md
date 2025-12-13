# 📚 UniHelper Backend API Documentation (Updated)

## 🔧 Cấu hình cơ bản

**Base URL:** `http://localhost:5000`
**Port:** 5000
**Database:** MongoDB

### 🔑 Authentication
- Sử dụng JWT Bearer Token
- Header: `Authorization: Bearer <your_token>`
- Token có thời hạn theo cấu hình JWT_EXPIRES_IN

### 🗄️ MongoDB Setup

#### **Windows:**
```bash
# Khởi động MongoDB service
net start MongoDB

# Hoặc nếu bạn cài MongoDB Compass
mongod --dbpath "C:\data\db"

# Kiểm tra MongoDB đang chạy
mongo --eval "db.adminCommand('ismaster')"
```

#### **macOS:**
```bash
# Khởi động MongoDB với Homebrew
brew services start mongodb-community

# Hoặc khởi động thủ công
mongod --config /usr/local/etc/mongod.conf

# Kiểm tra trạng thái
brew services list | grep mongodb
```

#### **Linux (Ubuntu):**
```bash
# Khởi động MongoDB service
sudo systemctl start mongod

# Kiểm tra trạng thái
sudo systemctl status mongod

# Cho phép MongoDB khởi động cùng hệ thống
sudo systemctl enable mongod
```

#### **Kết nối MongoDB:**
- **Connection String:** `mongodb://localhost:27017/unihelper`
- **Database Name:** `unihelper`
- **Port:** `27017` (mặc định)

#### **Kiểm tra kết nối:**
```bash
# Test kết nối bằng MongoDB shell
mongo unihelper

# Hoặc kiểm tra trong ứng dụng
node -e "const mongoose = require('mongoose'); mongoose.connect('mongodb://localhost:27017/unihelper').then(() => console.log('✅ Connected')).catch(err => console.log('❌ Error:', err))"
```

---

## 🎯 Test Account

**Student Account:**
- Email: `student@example.com`
- Password: `Password123!`
- Role: `STUDENT`

*Tạo bằng script: `node scripts/seedStudent.js`*

---

# 📖 API Endpoints

## 🔐 Authentication APIs (`/api/auth`)

### 1. Đăng nhập
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "student@example.com",
  "password": "Password123!"
}
```

**Response Success:**
```json
{
  "status": "success",
  "data": {
    "user": {
      "_id": "...",
      "name": "Test Student",
      "email": "student@example.com",
      "role": "STUDENT"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### 2. Lấy thông tin user hiện tại
```http
GET /api/auth/me
Authorization: Bearer <token>
```

### 3. Đổi mật khẩu
```http
PUT /api/auth/change-password
Authorization: Bearer <token>
Content-Type: application/json

{
  "currentPassword": "Password123!",
  "newPassword": "NewPassword123!"
}
```

### 4. Xác thực token
```http
GET /api/auth/verify
Authorization: Bearer <token>
```

---

## 👤 User Management APIs (`/api/users`)

### 1. Lấy profile của mình
```http
GET /api/users/me
Authorization: Bearer <token>
```

**Response Success:**
```json
{
  "status": "success",
  "data": {
    "user": {
      "_id": "...",
      "name": "Test Student",
      "email": "student@example.com",
      "role": "STUDENT"
    },
    "profile": {
      "studentId": "S20250001",
      "major": "Công nghệ thông tin",
      "faculty": "Khoa Công nghệ thông tin",
      "gpa": 3.5,
      "phone": "0123456789"
    }
  }
}
```

### 2. Cập nhật profile của mình
```http
PUT /api/users/me
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Updated Name",
  "phone": "0987654321"
}
```

---

## 📋 Certificate Request APIs (`/api/certificate-requests`)

### 1. Tạo yêu cầu chứng nhận mới (Student only)
```http
POST /api/certificate-requests
Authorization: Bearer <student_token>
Content-Type: application/json

{
  "certificateType": "64f123...",
  "certificateName": "64f456...",
  "semester": "HK1 2024-2025",
  "notes": "Ghi chú thêm"
}
```

**Response Success:**
```json
{
  "status": "success",
  "data": {
    "request": {
      "_id": "...",
      "requestCode": "00000001",
      "certificateType": "...",
      "certificateName": "...",
      "semester": "HK1 2024-2025",
      "status": "PENDING",
      "createdAt": "2024-10-25T10:00:00Z"
    }
  }
}
```

### 2. Lấy yêu cầu của sinh viên hiện tại
```http
GET /api/certificate-requests/my
Authorization: Bearer <student_token>
Query Parameters:
- page=1
- limit=10
- status=PENDING
- sortBy=createdAt
- sortOrder=desc
```

### 3. Lấy tất cả yêu cầu (Staff/Admin only)
```http
GET /api/certificate-requests
Authorization: Bearer <staff_token>
Query Parameters:
- page=1
- limit=10
- status=PENDING
- studentId=S20250001
- startDate=2024-01-01
- endDate=2024-12-31
```

### 4. Lấy chi tiết yêu cầu
```http
GET /api/certificate-requests/{requestId}
Authorization: Bearer <token>
```

### 5. Cập nhật trạng thái yêu cầu (Staff/Admin only)
```http
PUT /api/certificate-requests/{requestId}/status
Authorization: Bearer <staff_token>
Content-Type: application/json

{
  "status": "APPROVED",
  "reviewNotes": "Đã duyệt yêu cầu"
}
```

**Available Status:**
- `PENDING` - Chờ xử lý
- `PROCESSING` - Đang xử lý
- `APPROVED` - Đã duyệt
- `REJECTED` - Đã từ chối
- `COMPLETED` - Đã hoàn thành

### 6. Lấy thống kê yêu cầu (Admin only)
```http
GET /api/certificate-requests/stats
Authorization: Bearer <admin_token>
```

### 7. API Dashboard - Lấy yêu cầu theo trạng thái (Student only)

#### 7.1. Lấy yêu cầu đang xử lý
```http
GET /api/certificate-requests/dashboard/processing
Authorization: Bearer <student_token>
```

**Response Success:**
```json
{
  "status": "success",
  "message": "Lấy danh sách yêu cầu đang xử lý thành công",
  "data": [
    {
      "_id": "671234567890abcdef999999",
      "requestCode": "00000001",
      "certificateType": {
        "name": "Xác nhận sinh viên"
      },
      "certificateName": {
        "name": "Xác nhận sinh viên đang học"
      },
      "requestDate": "2024-10-25T10:00:00Z",
      "status": "ĐANG XỬ LÝ"
    }
  ]
}
```

#### 7.2. Lấy yêu cầu hợp lệ
```http
GET /api/certificate-requests/dashboard/valid
Authorization: Bearer <student_token>
```

**Response Success:**
```json
{
  "status": "success",
  "message": "Lấy danh sách yêu cầu hợp lệ thành công",
  "data": [
    {
      "_id": "671234567890abcdef999998",
      "requestCode": "00000002",
      "certificateType": {
        "name": "Bảng điểm"
      },
      "certificateName": {
        "name": "Bảng điểm học kỳ"
      },
      "requestDate": "2024-09-10T08:30:00Z",
      "status": "HỢP LỆ"
    }
  ]
}
```

#### 7.3. Lấy yêu cầu không hợp lệ
```http
GET /api/certificate-requests/dashboard/invalid
Authorization: Bearer <student_token>
```

**Response Success:**
```json
{
  "status": "success",
  "message": "Lấy danh sách yêu cầu không hợp lệ thành công",
  "data": [
    {
      "_id": "671234567890abcdef999997",
      "requestCode": "00000003",
      "certificateType": {
        "name": "Bảng điểm"
      },
      "certificateName": {
        "name": "Bảng điểm tích lũy"
      },
      "requestDate": "2024-10-01T14:15:00Z",
      "status": "KHÔNG HỢP LỆ"
    }
  ]
}
```

---

## 🏆 Certificate Management APIs (`/api/certificates`)

### Certificate Types

### 1. Lấy danh sách loại chứng nhận
```http
GET /api/certificates/types
Authorization: Bearer <token>
Query Parameters:
- search=sinh viên
```

**Response Success:**
```json
{
  "status": "success",
  "message": "Lấy danh sách certificate types thành công",
  "data": [
    {
      "_id": "64f123...",
      "name": "Xác nhận sinh viên",
      "description": "Giấy xác nhận tình trạng sinh viên",
      "requirements": ["Học phí đã đóng", "Không vi phạm nội quy"],
      "isActive": true
    }
  ]
}
```

### 2. Tạo loại chứng nhận mới (Admin/Staff only)
```http
POST /api/certificates/types
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "name": "Xác nhận sinh viên",
  "description": "Giấy xác nhận tình trạng sinh viên",
  "requirements": ["Học phí đã đóng", "Không vi phạm nội quy"],
  "isActive": true
}
```

### Certificate Names

### 3. Lấy danh sách tên chứng nhận
```http
GET /api/certificates/names
Authorization: Bearer <token>
Query Parameters:
- search=xác nhận
- certificateType=64f123...
```

**Response Success:**
```json
{
  "status": "success",
  "message": "Lấy danh sách certificate names thành công",
  "data": [
    {
      "_id": "64f456...",
      "name": "Xác nhận sinh viên đang học",
      "description": "Giấy xác nhận sinh viên đang theo học tại trường",
      "certificateType": {
        "_id": "64f123...",
        "name": "Xác nhận sinh viên"
      },
      "purpose": "Xin việc làm, thực tập",
      "processingTime": 3,
      "fee": 0,
      "isActive": true
    }
  ]
}
```

### 4. Lấy tên chứng nhận theo ID
```http
GET /api/certificates/names/{nameId}
Authorization: Bearer <token>
```

### 5. Tạo tên chứng nhận mới (Admin/Staff only)
```http
POST /api/certificates/names
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "name": "Xác nhận sinh viên đang học",
  "description": "Giấy xác nhận sinh viên đang theo học tại trường",
  "certificateType": "64f123...",
  "purpose": "Xin việc làm, thực tập",
  "processingTime": 3,
  "fee": 0,
  "isActive": true
}
```

### 6. Cập nhật tên chứng nhận (Admin/Staff only)
```http
PUT /api/certificates/names/{nameId}
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "name": "Updated Name",
  "description": "Updated Description",
  "processingTime": 5,
  "fee": 10000
}
```

### 7. Xóa tên chứng nhận (Admin only)
```http
DELETE /api/certificates/names/{nameId}
Authorization: Bearer <admin_token>
```

### Nested Routes - Liên kết Type và Name

### 8. Lấy tên chứng nhận theo loại (KEY API cho Frontend)
```http
GET /api/certificates/types/{typeId}/names
Authorization: Bearer <token>
```

**Response Success:**
```json
{
  "status": "success",
  "message": "Lấy certificate names theo type thành công",
  "data": [
    {
      "_id": "64f456...",
      "name": "Xác nhận sinh viên đang học",
      "description": "Giấy xác nhận sinh viên đang theo học tại trường",
      "purpose": "Xin việc làm, thực tập",
      "processingTime: 3,
      "fee": 0
    },
    {
      "_id": "64f457...",
      "name": "Xác nhận sinh viên có học bổng",
      "description": "Giấy xác nhận sinh viên đang học và nhận học bổng",
      "purpose": "Xin visa, du học",
      "processingTime": 5,
      "fee": 0
    }
  ]
}
```

### 9. Lấy tên chứng nhận active theo loại
```http
GET /api/certificates/types/{typeId}/names/active
Authorization: Bearer <token>
```

---

## 🔄 Frontend Integration Workflow

### Luồng tạo yêu cầu chứng nhận:

1. **Lấy danh sách loại chứng nhận:**
```javascript
GET /api/certificates/types
```

2. **Khi user chọn loại, lấy danh sách tên tương ứng:**
```javascript
GET /api/certificates/types/{selectedTypeId}/names/active
```

3. **Tạo yêu cầu với type và name đã chọn:**
```javascript
POST /api/certificate-requests
{
  "certificateType": "selectedTypeId",
  "certificateName": "selectedNameId",
  "semester": "HK1 2024-2025"
}
```

---

## 🧪 Testing với Postman

### Setup Test Data
```bash
# Tạo certificate types
node scripts/seedCertificateType.js

# Tạo certificate names
node scripts/seedCertificateName.js

# Tạo student account
node scripts/seedStudent.js
```

### Test Flow
1. **Login:** `POST /api/auth/login`
2. **Get Types:** `GET /api/certificates/types`
3. **Get Names by Type:** `GET /api/certificates/types/{typeId}/names/active`
4. **Create Request:** `POST /api/certificate-requests`
5. **Get My Requests:** `GET /api/certificate-requests/my`

---

## 📝 Key Changes

### ✅ Model Updates:
- **CertificateTemplate** → **CertificateName**
- **certificateTemplate** field → **certificateName** field
- Thêm các trường: `purpose`, `processingTime`, `fee`

### ✅ API Routes Updates:
- `/api/certificates/templates/*` → `/api/certificates/names/*`
- `/api/certificates/types/{typeId}/templates/*` → `/api/certificates/types/{typeId}/names/*`

### ✅ Quan hệ Models:
```
CertificateType (1) → (Many) CertificateName
CertificateName (1) → (Many) CertificateRequest
```

---

## 🚀 Quick Start Commands

```bash
# 1. Khởi động MongoDB (Chọn theo hệ điều hành)
# Windows:
net start MongoDB

# macOS:
brew services start mongodb-community

# Linux:
sudo systemctl start mongod

# 2. Khởi động server backend
cd backend
npm run dev

# 3. Tạo test data theo thứ tự (Terminal mới)
node scripts/seedCertificateType.js
node scripts/seedCertificateName.js
node scripts/seedStudent.js
node scripts/seedCertificateRequest.js

# 4. Test API workflow trên Postman
# - Login và lấy token: POST /api/auth/login
# - Get types: GET /api/certificates/types
# - Get names: GET /api/certificates/types/{typeId}/names/active  
# - Create request: POST /api/certificate-requests
```

### 🔧 Troubleshooting MongoDB

```bash
# Kiểm tra MongoDB có đang chạy không
mongo --eval "db.adminCommand('ismaster')"

# Nếu gặp lỗi "Access is denied" trên Windows
# Chạy Command Prompt as Administrator rồi chạy lại

# Kiểm tra port MongoDB
netstat -an | findstr :27017

# Reset MongoDB nếu cần
mongod --repair --dbpath "C:\data\db"
```
