require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../src/models/User');
const Student = require('../src/models/Student');
const Staff = require('../src/models/Staff');
const Admin = require('../src/models/Admin');

async function createTestUsers() {
  try {
    // Connect to database
    // Change this line
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/unihelper');

    console.log('Connected to database');

    // Clear existing test users
    await User.deleteMany({ email: { $in: ['student@tdtu.edu.vn', 'staff@tdtu.edu.vn', 'admin@tdtu.edu.vn'] } });
    await Student.deleteMany({});
    await Staff.deleteMany({});
    await Admin.deleteMany({});

    // Create test users
    const users = [
      {
        name: 'Test Student',
        email: 'student@tdtu.edu.vn',
        password: '123456',
        role: 'STUDENT'
      },
      {
        name: 'Test Staff',
        email: 'staff@tdtu.edu.vn',
        password: '123456',
        role: 'STAFF'
      },
      {
        name: 'Test Admin',
        email: 'admin@tdtu.edu.vn',
        password: '123456',
        role: 'ADMIN'
      }
    ];

    for (const userData of users) {
      // Create user with plain password (User model will hash it)
      const user = new User(userData);
      const savedUser = await user.save();
      console.log(`Created user: ${userData.email}`);
      console.log(`Password hash: ${savedUser.password.substring(0, 20)}...`);

      // Create profile based on role
      if (userData.role === 'STUDENT') {
      const student = new Student({
        user: savedUser._id,
        studentId: '522H0030', // Case-sensitive in database
        major: 'Computer Science',
        faculty: 'Information Technology',
        academicYear: '2024',
        dateOfBirth: new Date('2002-03-15'),
        class: 'CNTT02-K20',
        course: 'K20 (2020-2024)'
      });
        await student.save();
        console.log('Created student profile - Login with: 522H0030');
      } else if (userData.role === 'STAFF') {
        const staff = new Staff({
          user: savedUser._id,
          staffId: 'STF001',
          staffType: 'CTSV',
          department: 'IT Department',
          position: 'Lecturer'
        });
        await staff.save();
        console.log('Created staff profile');
      } else if (userData.role === 'ADMIN') {
        const admin = new Admin({
          user: savedUser._id,
          adminId: 'ADM001',
          department: 'Administration',
          permissions: ['USER_MANAGEMENT', 'SYSTEM_SETTINGS']
        });
        await admin.save();
        console.log('Created admin profile');
      }
    }

    console.log('✅ Test users created successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating test users:', error);
    process.exit(1);
  }
}

createTestUsers();