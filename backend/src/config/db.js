const mongoose = require('mongoose');

/**
 * Database Connection Configuration
 * Hỗ trợ cả Local MongoDB và MongoDB Atlas
 */
const connectDB = async () => {
  try {
    // Options tối ưu cho cả Local và Atlas
    const options = {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      // Options cho MongoDB Atlas
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
    console.error('💡 Kiểm tra:');
    console.error('   1. MONGO_URI trong file .env');
    console.error('   2. MongoDB service đang chạy (nếu local)');
    console.error('   3. IP đã được whitelist (nếu Atlas)');
    console.error('   4. Username/password đúng');
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
