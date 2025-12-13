# 🧪 Hướng dẫn Test Staff API

## 📋 Chuẩn bị dữ liệu test

### Bước 1: Seed toàn bộ dữ liệu
```bash
# Từ thư mục backend
node scripts/seedAll.js
```

**Kết quả:** Sẽ tạo ra:
- Certificate Types & Names
- Student account: `student@example.com / Password123!`
- Staff accounts:
  - CTSV: `ctsv@university.edu.vn / Password123!`
  - KTX: `ktx@university.edu.vn / Password123!`
  - Manager CTSV: `manager.ctsv@university.edu.vn / Password123!`
- Certificate Requests mẫu

---

## 🔐 Bước 2: Test Authentication

### 2.1 Login Student để tạo requests
```http
POST http://localhost:5000/api/auth/login
Content-Type: application/json

{
  "email": "student@example.com",
  "password": "Password123!"
}
```

**Response mẫu:**
```json
{
  "status": "success",
  "message": "Login successful",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "_id": "...",
      "name": "Test Student",
      "email": "student@example.com",
      "role": "STUDENT"
    }
  }
}
```

**→ Copy student token để test student APIs**

### 2.2 Login CTSV Staff
```http
POST http://localhost:5000/api/auth/login
Content-Type: application/json

{
  "email": "ctsv@university.edu.vn",
  "password": "Password123!"
}
```

**→ Copy CTSV staff token**

### 2.3 Login KTX Staff  
```http
POST http://localhost:5000/api/auth/login
Content-Type: application/json

{
  "email": "ktx@university.edu.vn", 
  "password": "Password123!"
}
```

**→ Copy KTX staff token**

---

## 📝 Bước 3: Test Student APIs (Tạo requests)

### 3.1 Tạo thêm certificate requests
```http
POST http://localhost:5000/api/certificate-requests
Authorization: Bearer <student_token>
Content-Type: application/json

{
  "certificateType": "<certificate_type_id>",
  "certificateName": "<certificate_name_id>",
  "semester": "HK1 2024-2025",
  "notes": "Test request for staff"
}
```

**Lặp lại với các type/name khác nhau để tạo nhiều requests**

### 3.2 Kiểm tra requests đã tạo
```http
GET http://localhost:5000/api/certificate-requests/my
Authorization: Bearer <student_token>
```

---

## 👨‍💼 Bước 4: Test Staff APIs

### 4.1 Test Staff Profile
```http
GET http://localhost:5000/api/staff/profile
Authorization: Bearer <ctsv_staff_token>
```

**Expected Response:**
```json
{
  "status": true,
  "message": "Staff profile retrieved successfully",
  "data": {
    "staffId": "CTSV001",
    "staffType": "CTSV",
    "department": "Phòng Công tác Sinh viên",
    "email": "ctsv@university.edu.vn",
    "hometown": "Hà Nội",
    "user": {
      "fullName": "Nguyễn Văn CTSV"
    }
  }
}
```

### 4.2 Test Staff Dashboard
```http
GET http://localhost:5000/api/staff/dashboard
Authorization: Bearer <ctsv_staff_token>
```

**Expected Response:**
```json
{
  "status": true,
  "message": "Dashboard data retrieved successfully",
  "data": {
    "stats": {
      "staffType": "CTSV",
      "totalRequests": 10,
      "todayRequests": 3,
      "processingCount": 5,
      "approvedCount": 3,
      "rejectedCount": 2
    },
    "recentRequests": [
      {
        "_id": "...",
        "status": "ĐANG XỬ LÝ",
        "student": {
          "studentId": "S20250001",
          "fullName": "Test Student"
        },
        "certificateName": {
          "name": "Xác nhận sinh viên đang học"
        }
      }
    ]
  }
}
```

### 4.3 Test Lấy danh sách requests
```http
GET http://localhost:5000/api/staff/requests?page=1&limit=10&status=pending
Authorization: Bearer <ctsv_staff_token>
```

### 4.4 Test Chi tiết request
```http
GET http://localhost:5000/api/staff/requests/<request_id>
Authorization: Bearer <ctsv_staff_token>
```

### 4.5 Test Cập nhật status request
```http
PUT http://localhost:5000/api/staff/requests/<request_id>/status
Authorization: Bearer <ctsv_staff_token>
Content-Type: application/json

{
  "status": "approved",
  "note": "Hồ sơ đầy đủ và hợp lệ"
}
```

**Expected Response:**
```json
{
  "status": true,
  "message": "Request status updated successfully",
  "data": {
    "_id": "...",
    "status": "HỢP LỆ",
    "notes": "Hồ sơ đầy đủ và hợp lệ",
    "responseTime": "2024-11-01T15:30:00.000Z",
    "staffAssigned": {
      "staffId": "CTSV001",
      "fullName": "Nguyễn Văn CTSV"
    }
  }
}
```

### 4.6 Test Statistics
```http
GET http://localhost:5000/api/staff/requests/stats
Authorization: Bearer <ctsv_staff_token>
```

---

## 🔍 Bước 5: Test Permission Logic

### 5.1 Test KTX Staff không thể truy cập CTSV requests
```http
GET http://localhost:5000/api/staff/ctsv/requests
Authorization: Bearer <ktx_staff_token>
```

**Expected:** 403 Forbidden

### 5.2 Test CTSV Staff không thể truy cập KTX requests
```http
GET http://localhost:5000/api/staff/ktx/requests
Authorization: Bearer <ctsv_staff_token>
```

**Expected:** 403 Forbidden

### 5.3 Test Student không thể truy cập Staff APIs
```http
GET http://localhost:5000/api/staff/profile
Authorization: Bearer <student_token>
```

**Expected:** 403 Forbidden

---

## 📊 Bước 6: Test Status Workflow

### 6.1 Workflow: Pending → Processing → Approved
```http
# 1. Lấy một request với status "ĐANG XỬ LÝ"
GET http://localhost:5000/api/staff/requests?status=pending

# 2. Chuyển sang "processing"
PUT http://localhost:5000/api/staff/requests/<id>/status
{
  "status": "processing",
  "note": "Đang xem xét hồ sơ"
}

# 3. Chuyển sang "approved"
PUT http://localhost:5000/api/staff/requests/<id>/status
{
  "status": "approved", 
  "note": "Hồ sơ hợp lệ, đã duyệt"
}
```

### 6.2 Workflow: Pending → Rejected
```http
PUT http://localhost:5000/api/staff/requests/<id>/status
{
  "status": "rejected",
  "note": "Hồ sơ thiếu giấy tờ"
}
```

---

## 🧪 Bước 7: Test Edge Cases

### 7.1 Test Invalid Status
```http
PUT http://localhost:5000/api/staff/requests/<id>/status
{
  "status": "invalid_status",
  "note": "Test"
}
```

**Expected:** 400 Bad Request với validation error

### 7.2 Test Non-existent Request
```http
GET http://localhost:5000/api/staff/requests/671234567890abcdef999999
Authorization: Bearer <staff_token>
```

**Expected:** 404 Not Found

### 7.3 Test Pagination
```http
GET http://localhost:5000/api/staff/requests?page=999&limit=10
Authorization: Bearer <staff_token>
```

**Expected:** Empty results với pagination info

---

## 🔧 Troubleshooting

### Problem 1: "Staff not found"
**Solution:** Đảm bảo đã seed staff data và đang dùng đúng staff token

### Problem 2: Empty requests list  
**Solution:** Đảm bảo đã tạo certificate requests bằng student account

### Problem 3: Validation errors
**Solution:** Kiểm tra format request body và status values

### Problem 4: Authentication errors
**Solution:** Kiểm tra JWT token có hợp lệ và chưa expired

---

## 📋 Expected Results Summary

Sau khi test xong, bạn nên thấy:

1. ✅ Staff có thể login thành công
2. ✅ Staff có thể xem profile và dashboard  
3. ✅ Staff có thể lấy danh sách requests
4. ✅ Staff có thể xem chi tiết requests
5. ✅ Staff có thể cập nhật status requests
6. ✅ Thống kê hiển thị đúng số liệu
7. ✅ Permission control hoạt động (CTSV vs KTX)
8. ✅ Status workflow hoạt động đúng
9. ✅ Validation và error handling hoạt động

**🎯 Nếu tất cả test cases pass → API hoàn toàn sẵn sàng để integrate với frontend!**