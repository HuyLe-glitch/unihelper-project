// Script: tạo user STUDENT và profile Student để test API
// Cách dùng: từ thư mục backend chạy: node scripts\seedStudent.js

require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const User = require('../src/models/User');
const Student = require('../src/models/Student');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/unihelper';

async function main() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB');

    const email = 'student@example.com';
    const password = 'Password123!';
    const name = 'Test Student';

    let user = await User.findOne({ email });
    if (!user) {
      const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS) || 12;
      const hashed = await bcrypt.hash(password, saltRounds);

      user = new User({ name, email, password: hashed, role: 'STUDENT' });
      await user.save();
      console.log(`🆕 User created: ${email} / ${password}`);
    } else {
      console.log(`ℹ️ User already exists: ${email}`);
    }

    let student = await Student.findOne({ user: user._id });
    if (!student) {
      student = new Student({
        user: user._id,
        studentId: 'S20250001',
        major: 'Công nghệ thông tin',
        faculty: 'Khoa Công nghệ thông tin',
        academicYear: '2025',
        gpa: 3.5,
        phone: '0123456789',
        className: 'CNTT-01',
        currentAddress: 'Hà Nội',
        permanentAddress: 'Hà Nội',
        dateOfBirth: new Date('2003-01-15'),
        citizenId: '123456789',
        citizenIdIssueDate: new Date('2020-01-01'),
        citizenIdIssuePlace: 'Hà Nội'
      });

      await student.save();
      console.log('🆕 Student profile created');
    } else {
      console.log('ℹ️ Student profile already exists for this user');
    }

    console.log('\n--- KẾT QUẢ ---');
    console.log('Email:', email);
    console.log('Password:', password);
    console.log('Bạn có thể dùng credentials trên để gọi API POST /api/auth/login để lấy token.');

    await mongoose.connection.close();
    console.log('📴 Connection closed');
    process.exit(0);
  } catch (err) {
    console.error('❌ Seeder failed:', err);
    process.exit(1);
  }
}

main();
