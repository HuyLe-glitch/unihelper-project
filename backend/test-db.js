// Script để test database connection
const mongoose = require('mongoose');
require('dotenv').config();

async function testConnection() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Database connected successfully!');

    // Test tạo một document đơn giản
    const testCollection = mongoose.connection.db.collection('test');
    await testCollection.insertOne({ message: 'Hello UniHelper!', timestamp: new Date() });
    console.log('✅ Test document created successfully!');

    await mongoose.connection.close();
    console.log('📴 Connection closed');
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    process.exit(1);
  }
}

testConnection();
