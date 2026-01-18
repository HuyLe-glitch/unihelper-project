# 🎓 UniHelper - Hệ thống Hỗ trợ Sinh viên

## 📋 Mục lục
1. [Giới thiệu](#giới-thiệu)
2. [Yêu cầu hệ thống](#yêu-cầu-hệ-thống)
3. [Cấu trúc dự án](#cấu-trúc-dự-án)
4. [Hướng dẫn cài đặt](#hướng-dẫn-cài-đặt)
5. [Chạy dự án](#chạy-dự-án)
6. [Tài khoản đăng nhập](#tài-khoản-đăng-nhập)
7. [Xử lý lỗi thường gặp](#xử-lý-lỗi-thường-gặp)

---

## Giới thiệu

**UniHelper** là hệ thống hỗ trợ sinh viên với các tính năng:
- 📋 Quản lý yêu cầu chứng nhận CTSV (Công tác Sinh viên)
- 🏠 Quản lý báo cáo sự cố KTX (Ký túc xá)
- 🤖 Chatbot hỗ trợ tích hợp Dialogflow
- 👨‍💼 Dashboard cho Admin và Staff
- 🎓 Portal cho Sinh viên

---

## Yêu cầu hệ thống

### Phần mềm bắt buộc

| Phần mềm | Phiên bản tối thiểu | Kiểm tra |
|----------|---------------------|----------|
| **Node.js** | v18.0.0 trở lên | `node -v` |
| **npm** | v9.0.0 trở lên | `npm -v` |

---

## Cấu trúc dự án

```
unihelper-project/
├── backend/                    # Backend Node.js + Express
│   ├── src/
│   │   ├── config/            # Cấu hình (DB, Firebase, Dialogflow...)
│   │   ├── controllers/       # Controllers
│   │   ├── middleware/        # Middleware (auth, error...)
│   │   ├── models/            # Mongoose Models
│   │   ├── repositories/      # Repository layer
│   │   ├── routes/            # API Routes
│   │   ├── services/          # Business logic
│   │   ├── utils/             # Utilities
│   │   ├── validators/        # Input validators
│   │   ├── app.js             # Express app
│   │   └── server.js          # Server entry point
│   ├── scripts/               # Seed scripts
│   ├── uploads/               # Local file uploads
│   ├── .env                   # Environment variables (đã có sẵn)
│   └── package.json
│
├── frontend/                   # Frontend React + Vite
│   ├── src/
│   │   ├── assets/            # Static assets
│   │   ├── components/        # React components
│   │   ├── contexts/          # React contexts
│   │   ├── hooks/             # Custom hooks
│   │   ├── layouts/           # Layout components
│   │   ├── routes/            # Route configurations
│   │   ├── services/          # API services
│   │   ├── utils/             # Utilities
│   │   ├── App.jsx            # Root component
│   │   └── main.jsx           # Entry point
│   ├── public/                # Public assets
│   └── package.json
│
├── docs/                       # Documentation
├── package.json                # Root package.json
└── README.md                   # File này
```

---

## Hướng dẫn cài đặt

### Bước 1: Giải nén dự án

Giải nén file dự án vào thư mục mong muốn.

> 📁 **Lưu ý:** Thư mục `node_modules` đã được xóa để giảm dung lượng. Bạn cần cài đặt lại dependencies theo bước 2.

### Bước 2: Cài đặt dependencies

Mở terminal tại thư mục gốc của dự án và chạy các lệnh sau:

```bash
# 1. Cài đặt dependencies Backend
cd backend
npm install

# 2. Cài đặt dependencies Frontend
cd ../frontend
npm install

# 3. Quay về thư mục gốc
cd ..
```

**Hoặc cài đặt tất cả cùng lúc (chạy từ thư mục gốc):**

```bash
cd backend && npm install && cd ../frontend && npm install && cd ..
```

> ⚠️ **Lưu ý:** Dự án đã có sẵn file `.env` và các file cấu hình service account (Firebase, Dialogflow) trong thư mục `backend/src/config/`. Database MongoDB Atlas cũng đã có dữ liệu sẵn, không cần chạy seed.

---

## Chạy dự án

### Bước 3: Khởi động Backend và Frontend

**Mở 2 terminal riêng biệt:**

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

### Bước 4: Truy cập ứng dụng

| URL | Mô tả |
|-----|-------|
| http://localhost:5173 | Frontend (React) |
| http://localhost:5000 | Backend API |

---

## Tài khoản đăng nhập

Sử dụng các tài khoản sau để đăng nhập vào hệ thống:

| Vai trò | Email | Password | Ghi chú |
|---------|-------|----------|---------|
| **Admin** | admin@university.edu.vn | Password123! | Quản trị hệ thống |
| **Staff CTSV** | ctsv@university.edu.vn | Password123! | Quản lý yêu cầu CTSV |
| **Staff KTX** | ktx@university.edu.vn | Password123! | Quản lý báo cáo KTX |
| **Student** | sv038@school.edu.vn | 123456 | Tài khoản sinh viên |

> ⚠️ **Lưu ý:** Admin và Staff là tài khoản CỐ ĐỊNH, không thể tạo thêm qua API.

---

## Xử lý lỗi thường gặp

### 1. Lỗi kết nối MongoDB

```
MongooseServerSelectionError: Could not connect to any servers
```

**Giải pháp:**
- Kiểm tra kết nối internet
- Đảm bảo IP của bạn được whitelist trong MongoDB Atlas (Network Access → Add IP Address → Allow Access from Anywhere)

### 2. Lỗi CORS

```
Access to XMLHttpRequest blocked by CORS policy
```

**Giải pháp:**
- Đảm bảo frontend chạy ở port 5173
- Đảm bảo backend chạy ở port 5000

### 3. Lỗi Port đã được sử dụng

```
Error: listen EADDRINUSE: address already in use :::5000
```

**Giải pháp (Windows PowerShell):**
```powershell
netstat -ano | findstr :5000
taskkill /PID <PID> /F
```

### 4. Lỗi node_modules

```
Cannot find module 'xxx'
```

**Giải pháp:**
```bash
# Xóa và cài lại (Windows PowerShell)
Remove-Item -Recurse -Force node_modules
Remove-Item -Force package-lock.json
npm install
```

---

## Thông tin thêm

### Dependencies chính

**Backend:**
- Express.js v5 - Web framework
- Mongoose v8 - MongoDB ODM
- Socket.io v4 - Real-time communication
- Firebase Admin v13 - File storage
- Dialogflow v6 - Chatbot NLP
- JWT - Authentication
- Nodemailer - Email

**Frontend:**
- React v19 - UI framework
- Vite v4 - Build tool
- React Router v7 - Routing
- Axios - HTTP client
- Socket.io Client v4 - Real-time
- Recharts - Charts

### Tài liệu tham khảo

- [API Development Guidelines](./docs/API_DEVELOPMENT_GUIDELINES.md)
- [Chatbot Features Flow](./docs/CHATBOT_FEATURES_FLOW.md)
- [CTSV Module Documentation](./docs/CTSV_MODULE_DOCUMENTATION.md)
- [KTX Module Documentation](./docs/KTX_MODULE_DOCUMENTATION.md)

---

**Chúc bạn chạy dự án thành công! 🎉**
