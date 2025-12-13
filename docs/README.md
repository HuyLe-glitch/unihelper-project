# 📚 Tài liệu dự án UniHelper

## Danh sách tài liệu

| File | Mô tả |
|------|-------|
| [PROJECT_OVERVIEW.md](./PROJECT_OVERVIEW.md) | Tổng quan dự án, cấu trúc, vai trò người dùng |
| [API_DOCUMENTATION.md](./API_DOCUMENTATION.md) | Chi tiết các API endpoints |
| [BACKEND_STRUCTURE_DOCS.md](./BACKEND_STRUCTURE_DOCS.md) | Cấu trúc backend |
| [frontend-structure.md](./frontend-structure.md) | Cấu trúc frontend |
| [STAFF_API_DOCUMENTATION.md](./STAFF_API_DOCUMENTATION.md) | API cho staff |
| [STAFF_API_TEST_GUIDE.md](./STAFF_API_TEST_GUIDE.md) | Hướng dẫn test API staff |

---

## 🎯 Tóm tắt hệ thống

### Vai trò người dùng (Đã cập nhật)

```
┌─────────────────────────────────────────────────────────────────┐
│                        HỆ THỐNG UNIHELPER                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│   👑 ADMIN (1 tài khoản CỐ ĐỊNH)                                │
│   └── admin@university.edu.vn                                   │
│                                                                  │
│   👨‍💼 STAFF (2 tài khoản CỐ ĐỊNH)                               │
│   ├── CTSV: ctsv@university.edu.vn                             │
│   └── KTX:  ktx@university.edu.vn                              │
│                                                                  │
│   🎓 STUDENT (Nhiều tài khoản)                                   │
│   └── Đăng ký và đăng nhập tự do                               │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### Tính năng chính

| Vai trò | Tính năng |
|---------|-----------|
| **Student** | Gửi yêu cầu CTSV, Gửi yêu cầu KTX, Xem lịch sử, Chat |
| **Staff CTSV** | Xử lý yêu cầu CTSV, Xem thống kê CTSV |
| **Staff KTX** | Xử lý yêu cầu KTX, Xem thống kê KTX |
| **Admin** | Quản lý sinh viên, Xem tổng quan, Cài đặt hệ thống |

### Tài khoản test

| Vai trò | Email | Password |
|---------|-------|----------|
| Admin | admin@university.edu.vn | Password123! |
| Staff CTSV | ctsv@university.edu.vn | Password123! |
| Staff KTX | ktx@university.edu.vn | Password123! |
| Student | student@example.com | Password123! |

---

## 🚀 Quick Start

```bash
# 1. Cài đặt dependencies
cd backend && npm install
cd frontend && npm install

# 2. Cấu hình .env (backend/.env)
MONGO_URI=mongodb://localhost:27017/unihelper
JWT_SECRET=your_secret
JWT_EXPIRE=7d

# 3. Seed dữ liệu
cd backend
node scripts/seedAll.js

# 4. Chạy ứng dụng
npm run dev  # Backend
npm run dev  # Frontend (terminal mới)
```

---

*Cập nhật lần cuối: December 2024*
