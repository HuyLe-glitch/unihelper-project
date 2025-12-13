#!/bin/bash

# Script setup MongoDB Atlas cho Windows (Git Bash hoặc WSL)
# Chạy: bash backend/setup-atlas.sh

echo "════════════════════════════════════════════════════════════"
echo "🚀 Setup MongoDB Atlas cho UniHelper"
echo "════════════════════════════════════════════════════════════"
echo ""

# Kiểm tra file .env
if [ -f "backend/.env" ]; then
    echo "✅ File .env đã tồn tại"
    read -p "❓ Bạn có muốn ghi đè file .env? (y/n): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "⏭️  Bỏ qua tạo file .env"
    else
        echo "📝 Đang tạo file .env mới..."
        cat > backend/.env << 'EOF'
# MongoDB Atlas Configuration
MONGO_URI=mongodb+srv://admin:admin@cluster0.aexcjwz.mongodb.net/unihelper?retryWrites=true&w=majority

# JWT Configuration
JWT_SECRET=unihelper_jwt_secret_key_2024_very_secure
JWT_EXPIRE=7d

# Bcrypt
BCRYPT_SALT_ROUNDS=12

# Server
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
EOF
        echo "✅ File .env đã được tạo"
    fi
else
    echo "📝 Đang tạo file .env..."
    cat > backend/.env << 'EOF'
# MongoDB Atlas Configuration
MONGO_URI=mongodb+srv://admin:admin@cluster0.aexcjwz.mongodb.net/unihelper?retryWrites=true&w=majority

# JWT Configuration
JWT_SECRET=unihelper_jwt_secret_key_2024_very_secure
JWT_EXPIRE=7d

# Bcrypt
BCRYPT_SALT_ROUNDS=12

# Server
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
EOF
    echo "✅ File .env đã được tạo"
fi

echo ""
echo "════════════════════════════════════════════════════════════"
echo "📋 Các bước tiếp theo:"
echo "════════════════════════════════════════════════════════════"
echo "1. cd backend"
echo "2. npm install"
echo "3. node test-connection.js     (test kết nối)"
echo "4. node scripts/seedAll.js     (tạo dữ liệu)"
echo "5. npm run dev                 (khởi động server)"
echo ""
echo "💡 Lưu ý:"
echo "   - Đảm bảo IP của bạn đã được whitelist trong MongoDB Atlas"
echo "   - Truy cập: https://cloud.mongodb.com/v2/[YOUR_PROJECT]/security/network/accessList"
echo ""
echo "════════════════════════════════════════════════════════════"

