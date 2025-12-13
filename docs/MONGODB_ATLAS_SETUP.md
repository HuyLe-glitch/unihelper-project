# 🌐 Kết nối MongoDB Atlas - Database thật

## 📋 Thông tin kết nối

**Connection String:**
```
mongodb+srv://admin:admin@cluster0.aexcjwz.mongodb.net/?appName=Cluster0
```

**Chi tiết:**
- Username: `admin`
- Password: `admin`
- Cluster: `cluster0.aexcjwz.mongodb.net`
- Database sẽ được tạo tự động khi chạy seed

---

## 🚀 Hướng dẫn Setup

### Bước 1: Tạo/Cập nhật file .env

Trong thư mục `backend/`, tạo hoặc cập nhật file `.env`:

```env
# MongoDB Atlas Connection
MONGO_URI=mongodb+srv://admin:admin@cluster0.aexcjwz.mongodb.net/unihelper?retryWrites=true&w=majority

# JWT Configuration
JWT_SECRET=unihelper_jwt_secret_key_2024_very_secure
JWT_EXPIRE=7d

# Bcrypt
BCRYPT_SALT_ROUNDS=12

# Server
PORT=5000
NODE_ENV=development
```

**Lưu ý quan trọng:** 
- Đã thêm tên database `unihelper` vào connection string
- Đã thêm các options `retryWrites=true&w=majority` cho MongoDB Atlas

---

### Bước 2: Cập nhật file db.js (đã tối ưu cho Atlas)

File `backend/src/config/db.js` đã được cập nhật để hỗ trợ MongoDB Atlas tốt hơn:

```javascript
const mongoose = require('mongoose');

/**
 * Database Connection Configuration
 * Hỗ trợ cả Local MongoDB và MongoDB Atlas
 */
const connectDB = async () => {
  try {
    const options = {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      // Thêm options cho MongoDB Atlas
      retryWrites: true,
      w: 'majority',
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    };

    const conn = await mongoose.connect(process.env.MONGO_URI, options);

    console.log('═'.repeat(60));
    console.log('✅ MongoDB Connected Successfully!');
    console.log(`📊 Database: ${conn.connection.name}`);
    console.log(`🌐 Host: ${conn.connection.host}`);
    console.log(`🔌 Port: ${conn.connection.port || 'Atlas Cloud'}`);
    console.log('═'.repeat(60));
  } catch (error) {
    console.error('❌ Database connection error:', error.message);
    process.exit(1);
  }
};

// Handle connection events
mongoose.connection.on('connected', () => {
  console.log('🟢 Mongoose connected to MongoDB');
});

mongoose.connection.on('error', (err) => {
  console.error('🔴 Mongoose connection error:', err);
});

mongoose.connection.on('disconnected', () => {
  console.log('🟡 Mongoose disconnected from MongoDB');
});

// Graceful shutdown
process.on('SIGINT', async () => {
  await mongoose.connection.close();
  console.log('📴 MongoDB connection closed through app termination');
  process.exit(0);
});

module.exports = connectDB;
```

---

### Bước 3: Seed dữ liệu vào MongoDB Atlas

Sau khi cập nhật `.env`, chạy lệnh seed để tạo dữ liệu thật:

```bash
cd backend
npm install
node scripts/seedAll.js
```

Script sẽ tạo:
- ✅ Certificate Types
- ✅ Staff Roles
- ✅ Staff Accounts (CTSV & KTX)
- ✅ Student Test Account
- ✅ Certificate Names
- ✅ Sample Certificate Requests

---

### Bước 4: Khởi động server

```bash
cd backend
npm run dev
```

Bạn sẽ thấy log:

```
✅ MongoDB Connected Successfully!
📊 Database: unihelper
🌐 Host: cluster0-shard-00-01.aexcjwz.mongodb.net
🔌 Port: Atlas Cloud
```

---

## 🔒 Bảo mật (Khuyến nghị)

### ⚠️ QUAN TRỌNG: Đổi mật khẩu MongoDB Atlas

Mật khẩu hiện tại (`admin`) quá đơn giản. Nên đổi thành mật khẩu mạnh hơn:

1. Vào [MongoDB Atlas Console](https://cloud.mongodb.com)
2. Chọn Database Access
3. Edit user `admin` và đổi password
4. Cập nhật lại `MONGO_URI` trong `.env`

### 🔐 Whitelist IP Address

MongoDB Atlas yêu cầu whitelist IP:

1. Vào Network Access trong Atlas
2. Thêm IP hiện tại hoặc chọn "Allow Access from Anywhere" (0.0.0.0/0) cho development
3. Cho production, chỉ whitelist IP cụ thể

---

## 📊 Kiểm tra dữ liệu

### Sử dụng MongoDB Compass

1. Tải và cài đặt [MongoDB Compass](https://www.mongodb.com/products/compass)
2. Kết nối với connection string:
   ```
   mongodb+srv://admin:admin@cluster0.aexcjwz.mongodb.net/unihelper
   ```
3. Xem các collections:
   - `users`
   - `students`
   - `staffs`
   - `certificaterequests`
   - `certificatetypes`
   - `certificatenames`

### Hoặc sử dụng Atlas UI

1. Vào [MongoDB Atlas](https://cloud.mongodb.com)
2. Chọn cluster của bạn
3. Click "Browse Collections"
4. Xem database `unihelper`

---

## 🧪 Test kết nối

Tạo file `backend/test-connection.js`:

```javascript
require('dotenv').config();
const mongoose = require('mongoose');

async function testConnection() {
  try {
    console.log('🔄 Testing MongoDB Atlas connection...');
    console.log('📍 URI:', process.env.MONGO_URI.replace(/admin:.*@/, 'admin:****@'));
    
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    console.log('✅ Connection successful!');
    console.log('📊 Database:', mongoose.connection.name);
    console.log('🌐 Host:', mongoose.connection.host);
    
    // Test query
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log('\n📁 Collections:');
    collections.forEach(col => console.log(`   - ${col.name}`));
    
    await mongoose.connection.close();
    console.log('\n✅ Test completed!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Connection failed:', error.message);
    process.exit(1);
  }
}

testConnection();
```

Chạy test:

```bash
node backend/test-connection.js
```

---

## 🆚 So sánh Local vs Atlas

| Tính năng | Local MongoDB | MongoDB Atlas |
|-----------|--------------|---------------|
| Setup | Cài đặt local | Cloud, không cần cài |
| Truy cập | Chỉ trên máy local | Anywhere có internet |
| Backup | Thủ công | Tự động |
| Scale | Giới hạn RAM/CPU máy | Dễ dàng scale up |
| Giá | Free | Free tier 512MB |
| Production-ready | Không | Có |

---

## 🐛 Troubleshooting

### Lỗi: "MongoServerError: bad auth"

**Nguyên nhân:** Username hoặc password sai

**Giải pháp:**
1. Kiểm tra lại username/password trong Atlas
2. Đảm bảo password không có ký tự đặc biệt cần encode (`, @, :, /`)
3. Nếu có ký tự đặc biệt, encode bằng `encodeURIComponent()`

### Lỗi: "MongoNetworkError: connection timeout"

**Nguyên nhân:** IP chưa được whitelist

**Giải pháp:**
1. Vào Network Access trong Atlas
2. Add Current IP Address hoặc Allow Access from Anywhere

### Lỗi: "Database name is required"

**Nguyên nhân:** Thiếu tên database trong connection string

**Giải pháp:** Thêm `/unihelper` sau `.mongodb.net`:
```
mongodb+srv://admin:admin@cluster0.aexcjwz.mongodb.net/unihelper
```

---

## 📝 Tài khoản test (sau khi seed)

| Vai trò | Email | Password |
|---------|-------|----------|
| Student | student@example.com | Password123! |
| Staff CTSV | ctsv@university.edu.vn | Password123! |
| Staff KTX | ktx@university.edu.vn | Password123! |

---

## ✅ Checklist

- [ ] Tạo file `.env` với MongoDB Atlas URI
- [ ] Whitelist IP trong MongoDB Atlas
- [ ] Chạy `npm install` trong backend
- [ ] Chạy `node scripts/seedAll.js` để seed data
- [ ] Khởi động server: `npm run dev`
- [ ] Test login với tài khoản test
- [ ] Kiểm tra data trên MongoDB Atlas UI hoặc Compass

---

*Cập nhật: December 2024*

