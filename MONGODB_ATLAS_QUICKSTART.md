# 🚀 Quick Start - MongoDB Atlas

## Bước 1: Setup MongoDB Atlas Connection

### Windows (PowerShell/CMD):
```bash
cd backend
setup-atlas.bat
```

### Windows (Git Bash) hoặc Linux/Mac:
```bash
cd backend
bash setup-atlas.sh
```

Hoặc tạo file `.env` thủ công trong thư mục `backend/`:

```env
MONGO_URI=mongodb+srv://admin:admin@cluster0.aexcjwz.mongodb.net/unihelper?retryWrites=true&w=majority
JWT_SECRET=unihelper_jwt_secret_key_2024_very_secure
JWT_EXPIRE=7d
BCRYPT_SALT_ROUNDS=12
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
```

---

## Bước 2: Whitelist IP trong MongoDB Atlas

⚠️ **QUAN TRỌNG:** MongoDB Atlas yêu cầu whitelist IP

1. Truy cập: https://cloud.mongodb.com
2. Chọn project của bạn
3. Vào **Network Access** (menu bên trái)
4. Click **Add IP Address**
5. Chọn:
   - **Add Current IP Address** (cho IP hiện tại)
   - Hoặc **Allow Access from Anywhere** (`0.0.0.0/0`) cho development

---

## Bước 3: Cài đặt Dependencies

```bash
cd backend
npm install
```

---

## Bước 4: Test Kết nối

```bash
node test-connection.js
```

**Kết quả mong đợi:**
```
✅ Connection successful!
📊 Database: unihelper
🌐 Host: cluster0-shard-00-01.aexcjwz.mongodb.net
🔌 Port: Atlas Cloud
```

**Nếu lỗi:**
- ❌ `MongoServerError: bad auth` → Kiểm tra username/password
- ❌ `MongoNetworkError: connection timeout` → Whitelist IP trong Atlas
- ❌ `Database name is required` → Thêm `/unihelper` vào connection string

---

## Bước 5: Seed Dữ liệu

```bash
node scripts/seedAll.js
```

Script sẽ tạo:
- ✅ Certificate Types
- ✅ Staff Roles & Accounts (CTSV, KTX)  
- ✅ Student Test Account
- ✅ Certificate Names
- ✅ Sample Requests

---

## Bước 6: Khởi động Server

```bash
npm run dev
```

Server sẽ chạy tại: `http://localhost:5000`

---

## Bước 7: Khởi động Frontend

Terminal mới:

```bash
cd frontend
npm install
npm run dev
```

Frontend sẽ chạy tại: `http://localhost:5173`

---

## 📝 Tài khoản Test

| Vai trò | Email | Password |
|---------|-------|----------|
| Student | student@example.com | Password123! |
| Staff CTSV | ctsv@university.edu.vn | Password123! |
| Staff KTX | ktx@university.edu.vn | Password123! |

---

## 🔍 Kiểm tra Dữ liệu

### Sử dụng MongoDB Compass:

1. Tải [MongoDB Compass](https://www.mongodb.com/products/compass)
2. Kết nối với connection string:
   ```
   mongodb+srv://admin:admin@cluster0.aexcjwz.mongodb.net/unihelper
   ```
3. Xem các collections đã tạo

### Hoặc sử dụng MongoDB Atlas UI:

1. Vào https://cloud.mongodb.com
2. Chọn cluster của bạn
3. Click **Browse Collections**
4. Xem database `unihelper`

---

## 🐛 Troubleshooting

### Lỗi kết nối?

```bash
# Test lại kết nối
node test-connection.js

# Kiểm tra biến môi trường
node -e "require('dotenv').config(); console.log(process.env.MONGO_URI)"
```

### Database trống?

```bash
# Chạy lại seed
node scripts/seedAll.js
```

### Port đã được sử dụng?

Đổi `PORT=5000` thành `PORT=5001` trong file `.env`

---

## 📚 Tài liệu chi tiết

- [MongoDB Atlas Setup](./docs/MONGODB_ATLAS_SETUP.md)
- [API Documentation](./docs/API_DOCUMENTATION.md)
- [Project Overview](./docs/PROJECT_OVERVIEW.md)

---

*Cập nhật: December 2024*

