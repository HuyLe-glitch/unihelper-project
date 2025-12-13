# 📚 UniHelper Project Overview

## 📋 Tổng quan dự án

**UniHelper** là hệ thống quản lý yêu cầu sinh viên tại trường đại học, cho phép sinh viên gửi yêu cầu đến các phòng ban và theo dõi trạng thái xử lý.

---

## 🎯 Yêu cầu hệ thống (Đã cập nhật)

### Vai trò người dùng

| Vai trò | Số lượng | Mô tả |
|---------|----------|-------|
| **Student** | Nhiều | Sinh viên đăng nhập để gửi yêu cầu CTSV và KTX |
| **Staff CTSV** | 1 | Nhân viên xử lý yêu cầu Công tác Sinh viên |
| **Staff KTX** | 1 | Nhân viên xử lý yêu cầu Ký túc xá |
| **Admin** | 1 | Quản trị viên hệ thống |

### Tài khoản cố định

```
┌─────────────────────────────────────────────────────────────────┐
│                        HỆ THỐNG UNIHELPER                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│   👑 ADMIN (1 tài khoản)                                        │
│   └── Quản lý toàn bộ hệ thống, sinh viên, cài đặt             │
│                                                                  │
│   👨‍💼 STAFF (2 tài khoản cố định)                               │
│   ├── Staff CTSV: Xử lý yêu cầu Công tác Sinh viên             │
│   └── Staff KTX: Xử lý yêu cầu Ký túc xá                       │
│                                                                  │
│   🎓 STUDENT (Nhiều tài khoản)                                   │
│   └── Gửi yêu cầu, theo dõi trạng thái, xem lịch sử            │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 📁 Cấu trúc dự án

```
unihelper-project/
├── backend/                    # Server Node.js + Express
│   ├── src/
│   │   ├── config/            # Cấu hình DB, JWT
│   │   ├── constants/         # Hằng số (roles, status)
│   │   ├── controllers/       # Xử lý HTTP requests
│   │   ├── middleware/        # Auth, validation middleware
│   │   ├── models/            # Mongoose schemas
│   │   ├── repositories/      # Data access layer
│   │   ├── routes/            # API routes
│   │   ├── services/          # Business logic
│   │   ├── utils/             # Helper functions
│   │   └── validators/        # Input validation
│   ├── scripts/               # Seed data scripts
│   └── package.json
│
├── frontend/                   # React + Vite
│   ├── src/
│   │   ├── components/        # UI Components
│   │   │   ├── admin/         # Admin pages
│   │   │   ├── staff/         # Staff pages
│   │   │   ├── student/       # Student pages
│   │   │   ├── auth/          # Login components
│   │   │   └── common/        # Shared components
│   │   ├── constants/         # Menu configs, roles
│   │   ├── contexts/          # React contexts (Auth)
│   │   ├── hooks/             # Custom hooks
│   │   ├── layouts/           # Page layouts
│   │   ├── routes/            # Route definitions
│   │   ├── services/          # API services
│   │   └── utils/             # Helper functions
│   └── package.json
│
└── docs/                       # Tài liệu dự án
```

---

## 🗄️ Database Models

### User Model
```javascript
{
  name: String,           // Họ tên
  email: String,          // Email (unique)
  password: String,       // Password (hashed)
  role: 'STUDENT' | 'STAFF' | 'ADMIN',
  isActive: Boolean
}
```

### Student Model
```javascript
{
  user: ObjectId,         // Ref to User
  studentId: String,      // Mã sinh viên
  major: String,          // Ngành học
  faculty: String,        // Khoa
  academicYear: String,   // Khóa học
  gpa: Number,
  phone: String,
  address: String,
  dateOfBirth: Date,
  status: 'ACTIVE' | 'INACTIVE' | 'GRADUATED' | 'SUSPENDED'
}
```

### Staff Model
```javascript
{
  user: ObjectId,         // Ref to User
  staffId: String,        // Mã nhân viên
  staffType: 'CTSV' | 'KTX',  // Loại nhân viên (cố định)
  department: String,     // Phòng ban
  position: String,       // Chức vụ
  phone: String,
  status: 'ACTIVE' | 'INACTIVE' | 'ON_LEAVE'
}
```

### Admin Model
```javascript
{
  user: ObjectId,         // Ref to User
  adminId: String,        // Mã admin
  phone: String,
  status: 'ACTIVE' | 'INACTIVE'
}
```

---

## 🔐 Phân quyền

### Student có thể:
- ✅ Đăng nhập
- ✅ Gửi yêu cầu CTSV
- ✅ Gửi yêu cầu KTX
- ✅ Xem lịch sử yêu cầu
- ✅ Xem trạng thái yêu cầu
- ✅ Cập nhật thông tin cá nhân

### Staff CTSV có thể:
- ✅ Đăng nhập
- ✅ Xem danh sách yêu cầu CTSV
- ✅ Xử lý yêu cầu CTSV (approve/reject)
- ✅ Xem thống kê yêu cầu CTSV
- ❌ KHÔNG xem/xử lý yêu cầu KTX

### Staff KTX có thể:
- ✅ Đăng nhập
- ✅ Xem danh sách yêu cầu KTX
- ✅ Xử lý yêu cầu KTX (approve/reject)
- ✅ Xem thống kê yêu cầu KTX
- ❌ KHÔNG xem/xử lý yêu cầu CTSV

### Admin có thể:
- ✅ Đăng nhập
- ✅ Xem tổng quan hệ thống
- ✅ Quản lý sinh viên (CRUD)
- ✅ Xem tất cả yêu cầu
- ✅ Xem báo cáo thống kê
- ✅ Cài đặt hệ thống
- ❌ KHÔNG tạo/xóa staff (2 staff là cố định)
- ❌ KHÔNG tạo/xóa admin (1 admin là cố định)

---

## 🌐 API Endpoints

### Authentication
```
POST /api/auth/login          # Đăng nhập
GET  /api/auth/me             # Lấy thông tin user hiện tại
PUT  /api/auth/change-password # Đổi mật khẩu
```

### Student APIs
```
GET  /api/students/profile    # Lấy profile sinh viên
PUT  /api/students/profile    # Cập nhật profile
POST /api/certificate-requests # Tạo yêu cầu mới
GET  /api/certificate-requests/my # Lấy yêu cầu của tôi
```

### Staff APIs
```
GET  /api/staff/profile       # Lấy profile staff
GET  /api/staff/dashboard     # Lấy dữ liệu dashboard
GET  /api/staff/requests      # Lấy yêu cầu theo staffType
PUT  /api/staff/requests/:id/status # Cập nhật trạng thái
GET  /api/staff/requests/stats # Thống kê yêu cầu
```

### Admin APIs
```
GET  /api/admin/dashboard     # Tổng quan hệ thống
GET  /api/admin/students      # Danh sách sinh viên
POST /api/admin/students      # Tạo sinh viên mới
PUT  /api/admin/students/:id  # Cập nhật sinh viên
DELETE /api/admin/students/:id # Xóa sinh viên
GET  /api/admin/requests      # Tất cả yêu cầu
GET  /api/admin/reports       # Báo cáo thống kê
```

---

## 🚀 Hướng dẫn cài đặt

### 1. Cài đặt dependencies
```bash
# Backend
cd backend
npm install

# Frontend
cd frontend
npm install
```

### 2. Cấu hình environment
```bash
# backend/.env
MONGO_URI=mongodb://localhost:27017/unihelper
JWT_SECRET=your_jwt_secret
JWT_EXPIRE=7d
BCRYPT_SALT_ROUNDS=12
PORT=5000
```

### 3. Seed dữ liệu
```bash
cd backend
node scripts/seedAll.js
```

### 4. Chạy ứng dụng
```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm run dev
```

---

## 📝 Tài khoản test

| Vai trò | Email | Password |
|---------|-------|----------|
| Student | student@example.com | Password123! |
| Staff CTSV | ctsv@university.edu.vn | Password123! |
| Staff KTX | ktx@university.edu.vn | Password123! |
| Admin | admin@university.edu.vn | Password123! |

---

## 📊 Workflow

### Luồng gửi yêu cầu (Student)
```
1. Student đăng nhập
2. Chọn loại yêu cầu (CTSV hoặc KTX)
3. Điền form yêu cầu
4. Submit → Tạo CertificateRequest với status = 'pending'
5. Theo dõi trạng thái qua Dashboard hoặc Lịch sử
```

### Luồng xử lý yêu cầu (Staff)
```
1. Staff đăng nhập
2. Xem danh sách yêu cầu (tự động lọc theo staffType)
3. Chọn yêu cầu cần xử lý
4. Xem chi tiết, đánh giá
5. Approve/Reject → Cập nhật status
6. Student nhận thông báo kết quả
```

### Luồng quản trị (Admin)
```
1. Admin đăng nhập
2. Xem tổng quan hệ thống
3. Quản lý sinh viên (thêm/sửa/xóa)
4. Xem báo cáo thống kê
5. Cấu hình hệ thống
```

---

## 🔄 Thay đổi so với phiên bản trước

### Trước đây:
- ❌ Nhiều tài khoản staff có thể được tạo động
- ❌ Admin có thể tạo/xóa staff
- ❌ Phức tạp với StaffRole, Department models

### Hiện tại:
- ✅ Chỉ 2 tài khoản staff cố định (CTSV & KTX)
- ✅ Chỉ 1 tài khoản admin cố định
- ✅ Đơn giản hóa: không cần StaffRole, Department models
- ✅ Staff tự động được phân loại theo staffType

---

## 📁 Files cần xóa/đơn giản hóa

### Backend:
- `models/StaffRole.js` - Không cần (staff cố định)
- `models/Department.js` - Không cần
- `services/staffRoleService.js` - Không cần
- `routes/staffRoleRoutes.js` - Không cần
- `controllers/staffRoleController.js` - Không cần

### Frontend:
- Loại bỏ UI quản lý staff trong Admin
- Loại bỏ UI quản lý phòng ban
- Đơn giản hóa Dashboard admin

---

*Tài liệu được cập nhật: $(date)*

