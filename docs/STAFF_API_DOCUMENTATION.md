# Staff API Documentation

## Tổng quan
API này được thiết kế để phục vụ cho nhân viên (Staff) trong hệ thống UniHelper, bao gồm CTSV staff và KTX staff. Mỗi loại staff chỉ có thể xem và xử lý các yêu cầu thuộc phạm vi quản lý của mình.

## Authentication
Tất cả các endpoint yêu cầu JWT token hợp lệ và user phải có quyền Staff.

**Headers required:**
```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

---

## Staff Profile & Dashboard

### GET /staff/profile
Lấy thông tin profile của staff hiện tại.

**Response:**
```json
{
  "status": true,
  "message": "Staff profile retrieved successfully",
  "data": {
    "_id": "64f123abc456789012345678",
    "staffId": "STAFF001",
    "staffType": "CTSV",
    "department": "Phòng Công tác Sinh viên",
    "email": "staff@university.edu.vn",
    "hometown": "Hồ Chí Minh",
    "phone": "0123456789",
    "dateOfJoining": "2023-01-15T00:00:00.000Z",
    "status": "ACTIVE",
    "user": {
      "username": "staff001",
      "fullName": "Nguyễn Văn A",
      "email": "staff@university.edu.vn"
    },
    "staffRole": {
      "name": "Chuyên viên",
      "description": "Chuyên viên xử lý hồ sơ"
    }
  },
  "timestamp": "2024-11-01T14:30:00.000Z"
}
```

### GET /staff/dashboard
Lấy dữ liệu tổng quan cho dashboard của staff.

**Response:**
```json
{
  "status": true,
  "message": "Dashboard data retrieved successfully",
  "data": {
    "stats": {
      "staffType": "CTSV",
      "department": "Phòng Công tác Sinh viên",
      "totalRequests": 45,
      "todayRequests": 8,
      "processingCount": 12,
      "approvedCount": 25,
      "rejectedCount": 5,
      "pendingCount": 3,
      "statusBreakdown": [
        { "_id": "pending", "count": 3 },
        { "_id": "processing", "count": 12 },
        { "_id": "approved", "count": 25 },
        { "_id": "rejected", "count": 5 }
      ]
    },
    "recentRequests": [
      {
        "_id": "64f456def789012345678901",
        "submittedAt": "2024-11-01T10:30:00.000Z",
        "status": "pending",
        "certificateType": "sinh_vien",
        "student": {
          "studentId": "2021123456",
          "fullName": "Trần Thị B"
        }
      }
    ],
    "staffInfo": {
      "id": "64f123abc456789012345678",
      "staffId": "STAFF001",
      "staffType": "CTSV",
      "department": "Phòng Công tác Sinh viên",
      "fullName": "Nguyễn Văn A"
    }
  }
}
```

---

## Request Management

### GET /staff/requests
Lấy danh sách yêu cầu dành cho staff (theo staffType).

**Query Parameters:**
- `page` (integer, optional): Số trang (default: 1)
- `limit` (integer, optional): Số items per page (default: 10, max: 100)
- `status` (string, optional): Lọc theo trạng thái (`pending`, `processing`, `approved`, `rejected`, `needs-update`)
- `sortBy` (string, optional): Sắp xếp theo field (`submittedAt`, `status`, `certificateType`)
- `sortOrder` (string, optional): Thứ tự sắp xếp (`asc`, `desc`)

**Example Request:**
```
GET /staff/requests?page=1&limit=10&status=pending&sortBy=submittedAt&sortOrder=desc
```

**Response:**
```json
{
  "status": true,
  "message": "Requests retrieved successfully",
  "data": {
    "staff": {
      "id": "64f123abc456789012345678",
      "staffId": "STAFF001",
      "staffType": "CTSV",
      "department": "Phòng Công tác Sinh viên",
      "fullName": "Nguyễn Văn A"
    },
    "requests": [
      {
        "_id": "64f456def789012345678901",
        "submittedAt": "2024-11-01T10:30:00.000Z",
        "status": "pending",
        "certificateType": "sinh_vien",
        "note": "",
        "student": {
          "studentId": "2021123456",
          "fullName": "Trần Thị B",
          "email": "student@university.edu.vn",
          "phone": "0987654321"
        },
        "certificateName": {
          "name": "Chứng nhận sinh viên",
          "description": "Chứng nhận tình trạng sinh viên"
        },
        "certificateType": {
          "typeName": "Chứng nhận sinh viên",
          "description": "Loại chứng nhận sinh viên"
        }
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 5,
      "totalCount": 45,
      "hasNext": true,
      "hasPrev": false
    }
  }
}
```

### GET /staff/requests/stats
Lấy thống kê yêu cầu cho staff.

**Response:**
```json
{
  "status": true,
  "message": "Request statistics retrieved successfully",
  "data": {
    "staffType": "CTSV",
    "department": "Phòng Công tác Sinh viên",
    "totalRequests": 45,
    "todayRequests": 8,
    "processingCount": 12,
    "approvedCount": 25,
    "rejectedCount": 5,
    "pendingCount": 3,
    "statusBreakdown": [
      { "_id": "pending", "count": 3 },
      { "_id": "processing", "count": 12 },
      { "_id": "approved", "count": 25 },
      { "_id": "rejected", "count": 5 }
    ]
  }
}
```

### GET /staff/requests/:requestId
Lấy chi tiết một yêu cầu cụ thể.

**Path Parameters:**
- `requestId` (string, required): ID của certificate request

**Response:**
```json
{
  "status": true,
  "message": "Request details retrieved successfully",
  "data": {
    "_id": "64f456def789012345678901",
    "submittedAt": "2024-11-01T10:30:00.000Z",
    "processedAt": null,
    "status": "pending",
    "certificateType": "sinh_vien",
    "note": "",
    "documents": [
      {
        "name": "student_id_card.pdf",
        "url": "/uploads/documents/student_id_card.pdf"
      }
    ],
    "student": {
      "studentId": "2021123456",
      "fullName": "Trần Thị B",
      "email": "student@university.edu.vn",
      "phone": "0987654321"
    },
    "certificateName": {
      "name": "Chứng nhận sinh viên",
      "description": "Chứng nhận tình trạng sinh viên"
    },
    "processedBy": null
  }
}
```

### PUT /staff/requests/:requestId/status
Cập nhật trạng thái của một yêu cầu.

**Path Parameters:**
- `requestId` (string, required): ID của certificate request

**Request Body:**
```json
{
  "status": "approved",
  "note": "Hồ sơ đầy đủ và hợp lệ"
}
```

**Body Parameters:**
- `status` (string, required): Trạng thái mới (`processing`, `approved`, `rejected`, `needs-update`)
- `note` (string, optional): Ghi chú từ staff (max 500 characters)

**Response:**
```json
{
  "status": true,
  "message": "Request status updated successfully",
  "data": {
    "_id": "64f456def789012345678901",
    "submittedAt": "2024-11-01T10:30:00.000Z",
    "processedAt": "2024-11-01T14:30:00.000Z",
    "status": "approved",
    "note": "Hồ sơ đầy đủ và hợp lệ",
    "student": {
      "studentId": "2021123456",
      "fullName": "Trần Thị B",
      "email": "student@university.edu.vn"
    },
    "certificateName": {
      "name": "Chứng nhận sinh viên",
      "description": "Chứng nhận tình trạng sinh viên"
    },
    "processedBy": {
      "staffId": "STAFF001",
      "fullName": "Nguyễn Văn A",
      "department": "Phòng Công tác Sinh viên"
    }
  }
}
```

---

## Specialized Staff Routes

### GET /staff/ctsv/requests
Lấy yêu cầu dành riêng cho CTSV staff (chỉ CTSV staff mới truy cập được).

**Access:** Chỉ dành cho staff có `staffType = "CTSV"`

**Query Parameters:** Giống với `/staff/requests`

**Certificate Types for CTSV:**
- `hoc_phi`: Chứng nhận học phí
- `sinh_vien`: Chứng nhận sinh viên  
- `tot_nghiep`: Chứng nhận tốt nghiệp
- `ket_qua_hoc_tap`: Chứng nhận kết quả học tập

### GET /staff/ktx/requests
Lấy yêu cầu dành riêng cho KTX staff (chỉ KTX staff mới truy cập được).

**Access:** Chỉ dành cho staff có `staffType = "KTX"`

**Certificate Types for KTX:**
- `ktx_confirmation`: Xác nhận ở KTX
- `ktx_registration`: Đăng ký KTX
- `ktx_checkout`: Trả phòng KTX

---

## Department Management

### GET /staff/department/:staffType
Lấy danh sách nhân viên theo phòng ban (CTSV hoặc KTX).

**Path Parameters:**
- `staffType` (string, required): Loại phòng ban (`CTSV` hoặc `KTX`)

**Query Parameters:**
- `page` (integer, optional): Số trang (default: 1)
- `limit` (integer, optional): Số items per page (default: 10, max: 50)
- `status` (string, optional): Lọc theo trạng thái (`ACTIVE`, `INACTIVE`, `SUSPENDED`)
- `sortBy` (string, optional): Sắp xếp theo field (`dateOfJoining`, `staffId`, `department`)
- `sortOrder` (string, optional): Thứ tự sắp xếp (`asc`, `desc`)

**Example Requests:**
```
GET /staff/department/CTSV?page=1&limit=10&status=ACTIVE
GET /staff/department/KTX?sortBy=dateOfJoining&sortOrder=desc
```

**Response:**
```json
{
  "status": true,
  "message": "CTSV staff list retrieved successfully",
  "data": {
    "staff": [
      {
        "_id": "64f123abc456789012345678",
        "staffId": "STAFF001",
        "staffType": "CTSV",
        "department": "Phòng Công tác Sinh viên",
        "email": "staff@university.edu.vn",
        "hometown": "Hồ Chí Minh",
        "phone": "0123456789",
        "dateOfJoining": "2023-01-15T00:00:00.000Z",
        "status": "ACTIVE",
        "user": {
          "username": "staff001",
          "fullName": "Nguyễn Văn A",
          "email": "staff@university.edu.vn"
        },
        "staffRole": {
          "name": "Chuyên viên CTSV",
          "description": "Chuyên viên Phòng Công tác Sinh viên"
        }
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 3,
      "totalCount": 25,
      "hasNext": true,
      "hasPrev": false
    },
    "summary": {
      "departmentType": "CTSV",
      "totalStaff": 25,
      "activeStaff": 23
    }
  },
  "timestamp": "2024-11-01T14:30:00.000Z"
}
```

**Error Response - Invalid Staff Type:**
```json
{
  "status": false,
  "message": "Invalid staff type. Must be CTSV or KTX",
  "timestamp": "2024-11-01T14:30:00.000Z"
}
```

**Use Cases:**
- **Quản lý nhân sự**: Xem danh sách nhân viên từng phòng ban
- **Phân công công việc**: Biết ai đang active trong phòng ban
- **Thống kê nhân sự**: Số lượng nhân viên theo từng loại
- **Contact listing**: Danh bạ nhân viên nội bộ

---

## Error Responses

### 400 Bad Request
```json
{
  "status": false,
  "message": "Validation failed",
  "errors": [
    {
      "field": "status",
      "message": "Invalid status. Allowed values: processing, approved, rejected, needs-update",
      "value": "invalid_status"
    }
  ]
}
```

### 401 Unauthorized
```json
{
  "status": false,
  "message": "Token is invalid or expired"
}
```

### 403 Forbidden
```json
{
  "status": false,
  "message": "Access denied. Staff privileges required."
}
```

### 404 Not Found
```json
{
  "status": false,
  "message": "Certificate request not found"
}
```

### 429 Too Many Requests
```json
{
  "status": false,
  "message": "Too many requests. Please try again later.",
  "retryAfter": 900
}
```

### 500 Internal Server Error
```json
{
  "status": false,
  "message": "Internal server error in staff operations"
}
```

---

## Business Logic

### Staff Type Permissions
- **CTSV Staff**: Chỉ có thể xem và xử lý các yêu cầu chứng nhận học vụ
- **KTX Staff**: Chỉ có thể xem và xử lý các yêu cầu liên quan đến ký túc xá

### Status Transitions
Các chuyển đổi trạng thái hợp lệ:
- `pending` → `processing`, `rejected`
- `processing` → `approved`, `rejected`, `needs-update`  
- `needs-update` → `processing`, `rejected`
- `approved` → (không thể thay đổi)
- `rejected` → `processing` (xem xét lại)

### Rate Limiting
- 100 requests per 15 minutes per staff user
- Áp dụng cho tất cả endpoints

### Logging
Tất cả hoạt động của staff đều được log để audit:
- User ID và IP address
- Action performed
- Timestamp
- Request details

---

## Integration với Frontend

### Cách sử dụng API trong Frontend Staff Dashboard:

1. **Login và lưu token**
2. **Lấy dashboard data:** `GET /staff/dashboard`
3. **Hiển thị danh sách yêu cầu:** `GET /staff/requests`
4. **Xử lý yêu cầu:** `PUT /staff/requests/:id/status`
5. **Xem chi tiết:** `GET /staff/requests/:id`

### Example Frontend Integration:
```javascript
// Lấy dashboard data
const response = await fetch('/api/staff/dashboard', {
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
});

// Cập nhật trạng thái yêu cầu
const updateStatus = await fetch(`/api/staff/requests/${requestId}/status`, {
  method: 'PUT',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    status: 'approved',
    note: 'Hồ sơ hợp lệ'
  })
});
```

---

## Database Schema References

### Staff Model Extensions
Đã cập nhật Staff model với các field mới:
- `email`: Email của staff (required)
- `hometown`: Quê quán của staff (required)

### Related Models
- `User`: Thông tin đăng nhập
- `StaffRole`: Vai trò của staff
- `CertificateRequest`: Yêu cầu chứng nhận
- `CertificateName`: Tên loại chứng nhận
- `CertificateType`: Phân loại chứng nhận
- `Student`: Thông tin sinh viên

---

## Security Considerations

1. **Authentication**: JWT token verification
2. **Authorization**: Staff type permissions 
3. **Input Validation**: Express-validator + custom validation
4. **Rate Limiting**: Prevent API abuse
5. **Logging**: Audit trail cho tất cả actions
6. **Data Sanitization**: Prevent XSS attacks

---

## Performance Optimizations

1. **Database Indexing**: Indexed trên staffType, status, submittedAt
2. **Pagination**: Limit results để tránh overload
3. **Population**: Chỉ populate cần thiết fields
4. **Caching**: Có thể implement Redis cache cho stats
5. **Query Optimization**: Aggregate queries cho statistics