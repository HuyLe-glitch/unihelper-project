// Script: xóa toàn bộ database để làm lại từ đầu
// Cách dùng: từ thư mục backend chạy: node scripts/clearDatabase.js

require('dotenv').config();
const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('✅ Connected to MongoDB');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
};

const clearDatabase = async () => {
  try {
    console.log('🗑️ Bắt đầu xóa toàn bộ database...');

    // Lấy danh sách tất cả collections
    const collections = await mongoose.connection.db.listCollections().toArray();

    if (collections.length === 0) {
      console.log('📭 Database đã trống rồi!');
      return;
    }

    console.log(`📊 Tìm thấy ${collections.length} collections:`);
    collections.forEach(collection => {
      console.log(`   - ${collection.name}`);
    });

    // Xóa từng collection
    for (const collection of collections) {
      await mongoose.connection.db.dropCollection(collection.name);
      console.log(`🗑️ Đã xóa collection: ${collection.name}`);
    }

    console.log('✅ Đã xóa toàn bộ database thành công!');
    console.log('💡 Bây giờ bạn có thể chạy lại các seed scripts theo thứ tự:');
    console.log('   1. node scripts/seedCertificateType.js');
    console.log('   2. node scripts/seedStudent.js');
    console.log('   3. node scripts/seedCertificateName.js');
    console.log('   4. node scripts/seedCertificateRequest.js');

  } catch (error) {
    console.error('❌ Lỗi khi xóa database:', error);
    throw error;
  }
};

const runClear = async () => {
  await connectDB();
  await clearDatabase();
  await mongoose.connection.close();
  console.log('📴 Đã đóng kết nối database');
};

runClear();
