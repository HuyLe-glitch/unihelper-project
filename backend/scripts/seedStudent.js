// Script: tạo user STUDENT và profile Student để test API
// Cách dùng: từ thư mục backend chạy: node scripts\seedStudent.js

require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const User = require('../src/models/User');
const Student = require('../src/models/Student');
const Major = require('../src/models/Major');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/unihelper';

async function main() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Lấy major "Công nghệ thông tin"
    const major = await Major.findOne({ code: 'CNTT01' });
    if (!major) {
      console.error('❌ Major not found! Chạy seedFacultyAndMajor.js trước.');
      process.exit(1);
    }

    const email = 'student@example.com';
    const password = 'Password123!';

    // Xóa student cũ nếu có
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      await Student.deleteOne({ user: existingUser._id });
      await User.deleteOne({ email });
      console.log('🗑️ Cleared existing student');
    }

    // Tạo User (không cần hash trước vì User model sẽ tự hash)
    const user = await User.create({
      email,
      password, // User model sẽ tự hash trong pre('save')
      role: 'STUDENT',
      isActive: true
    });
    console.log(`🆕 User created: ${email}`);

    // Tạo Student profile theo model mới
    // Các trường: fullName, dateOfBirth, phone, email(từ User), citizenId, address, major, isDormResident, roomId
    const student = await Student.create({
      user: user._id,
      fullName: 'Nguyễn Văn Test',
      dateOfBirth: new Date('2003-01-15'),
      phone: '0123456789',
      citizenId: '001203012345',
      address: '123 Đường ABC, Quận 1, TP.HCM',
      major: major._id,
      isDormResident: false,
      roomId: null
    });

    console.log('🎉 Student created successfully!');
    console.log(`   👤 Name: ${student.fullName}`);
    console.log(`   📧 Email: ${email}`);
    console.log(`   🔑 Password: ${password}`);
    console.log(`   🏫 Major: ${major.name}`);

    await mongoose.connection.close();
    console.log('📴 Connection closed\n');

  } catch (err) {
    console.error('❌ Seeder failed:', err);
    process.exit(1);
  }
}

main();
