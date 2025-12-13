require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../src/models/User');
const Admin = require('../src/models/Admin');

async function createTestUsers() {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/unihelper');
    console.log('Connected to database');

    // Clear existing admin
    await User.deleteMany({ email: 'admin@tdtu.edu.vn' });
    await Admin.deleteMany({});

    // Create admin user
    const user = new User({
      name: 'Test Admin',
      email: 'admin@tdtu.edu.vn',
      password: '123456',
      role: 'ADMIN'
    });
    const savedUser = await user.save();

    // Create admin profile
    const admin = new Admin({
      user: savedUser._id,
      adminId: 'ADM001',
      department: 'Administration',
      permissions: ['USER_MANAGEMENT', 'SYSTEM_SETTINGS']
    });
    await admin.save();

    console.log('✅ Admin created: admin@tdtu.edu.vn / 123456');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

createTestUsers();