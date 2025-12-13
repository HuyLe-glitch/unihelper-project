require('dotenv').config();
const mongoose = require('mongoose');

/**
 * Script test kết nối MongoDB Atlas
 * Chạy: node backend/test-connection.js
 */
async function testConnection() {
  try {
    console.log('═'.repeat(60));
    console.log('🔄 Testing MongoDB Atlas connection...');
    console.log('═'.repeat(60));
    
    // Hiển thị URI (ẩn password)
    const safeUri = process.env.MONGO_URI.replace(/:(.*?)@/, ':****@');
    console.log('📍 URI:', safeUri);
    console.log('');
    
    // Kết nối
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      retryWrites: true,
      w: 'majority',
      serverSelectionTimeoutMS: 5000,
    });
    
    console.log('✅ Connection successful!');
    console.log('📊 Database:', mongoose.connection.name);
    console.log('🌐 Host:', mongoose.connection.host);
    console.log('🔌 Port:', mongoose.connection.port || 'Atlas Cloud');
    
    // Lấy danh sách collections
    console.log('\n📁 Checking collections...');
    const collections = await mongoose.connection.db.listCollections().toArray();
    
    if (collections.length === 0) {
      console.log('   ⚠️  No collections found (database is empty)');
      console.log('   💡 Run: node scripts/seedAll.js to create data');
    } else {
      console.log(`   Found ${collections.length} collections:`);
      collections.forEach(col => {
        console.log(`   - ${col.name}`);
      });
    }
    
    // Test query đơn giản
    console.log('\n🔍 Testing query...');
    const db = mongoose.connection.db;
    const stats = await db.stats();
    console.log(`   Collections: ${stats.collections}`);
    console.log(`   Data Size: ${(stats.dataSize / 1024).toFixed(2)} KB`);
    console.log(`   Storage Size: ${(stats.storageSize / 1024).toFixed(2)} KB`);
    
    await mongoose.connection.close();
    console.log('\n✅ Test completed successfully!');
    console.log('═'.repeat(60));
    process.exit(0);
  } catch (error) {
    console.log('\n❌ Connection failed!');
    console.log('═'.repeat(60));
    console.error('Error:', error.message);
    console.log('\n💡 Troubleshooting:');
    console.log('   1. Kiểm tra MONGO_URI trong file .env');
    console.log('   2. Kiểm tra username/password đúng');
    console.log('   3. Kiểm tra IP đã được whitelist trong Atlas');
    console.log('   4. Kiểm tra network/firewall');
    console.log('═'.repeat(60));
    process.exit(1);
  }
}

testConnection();

