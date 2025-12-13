// Script: tạo user STAFF và profile Staff để test API
// Cách dùng: từ thư mục backend chạy: node scripts\seedStaff.js

require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const User = require('../src/models/User');
const Staff = require('../src/models/Staff');
const StaffRole = require('../src/models/StaffRole');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/unihelper';

async function createStaffRole() {
  // Tạo staff roles nếu chưa có
  const roles = [
    {
      name: 'Chuyên viên CTSV',
      description: 'Chuyên viên Phòng Công tác Sinh viên',
      isActive: true
    },
    {
      name: 'Chuyên viên KTX',
      description: 'Chuyên viên Ký túc xá',
      isActive: true
    },
    {
      name: 'Trưởng phòng CTSV',
      description: 'Trưởng phòng Công tác Sinh viên',
      isActive: true
    },
    {
      name: 'Trưởng phòng KTX',
      description: 'Trưởng phòng Ký túc xá',
      isActive: true
    }
  ];

  const createdRoles = {};
  for (const roleData of roles) {
    let role = await StaffRole.findOne({ name: roleData.name });
    if (!role) {
      role = new StaffRole(roleData);
      await role.save();
      console.log(`🆕 StaffRole created: ${roleData.name}`);
    } else {
      console.log(`ℹ️ StaffRole already exists: ${roleData.name}`);
    }
    createdRoles[roleData.name] = role._id;
  }

  return createdRoles;
}

async function createStaffAccounts(staffRoles) {
  const staffAccounts = [
    {
      // CTSV Staff
      user: {
        name: 'Nguyễn Văn CTSV',
        email: 'ctsv@university.edu.vn',
        password: 'Password123!',
        role: 'STAFF'
      },
      staff: {
        staffId: 'CTSV001',
        staffType: 'CTSV',
        department: 'Phòng Công tác Sinh viên',
        email: 'ctsv@university.edu.vn',
        hometown: 'Hà Nội',
        phone: '0123456789',
        staffRole: staffRoles['Chuyên viên CTSV']
      }
    },
    {
      // KTX Staff
      user: {
        name: 'Trần Thị KTX',
        email: 'ktx@university.edu.vn',
        password: 'Password123!',
        role: 'STAFF'
      },
      staff: {
        staffId: 'KTX001',
        staffType: 'KTX',
        department: 'Phòng Ký túc xá',
        email: 'ktx@university.edu.vn',
        hometown: 'Hồ Chí Minh',
        phone: '0987654321',
        staffRole: staffRoles['Chuyên viên KTX']
      }
    },
    {
      // CTSV Manager
      user: {
        name: 'Lê Văn Trưởng CTSV',
        email: 'manager.ctsv@university.edu.vn',
        password: 'Password123!',
        role: 'STAFF'
      },
      staff: {
        staffId: 'CTSV002',
        staffType: 'CTSV',
        department: 'Phòng Công tác Sinh viên',
        email: 'manager.ctsv@university.edu.vn',
        hometown: 'Đà Nẵng',
        phone: '0111222333',
        staffRole: staffRoles['Trưởng phòng CTSV']
      }
    }
  ];

  const createdStaff = [];

  for (const accountData of staffAccounts) {
    const { user: userData, staff: staffData } = accountData;

    // Tạo User
    let user = await User.findOne({ email: userData.email });
    if (!user) {
      const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS) || 12;
      const hashed = await bcrypt.hash(userData.password, saltRounds);

      user = new User({
        ...userData,
        password: hashed
      });
      await user.save();
      console.log(`🆕 Staff User created: ${userData.email}`);
    } else {
      console.log(`ℹ️ Staff User already exists: ${userData.email}`);
    }

    // Tạo Staff profile
    let staff = await Staff.findOne({ user: user._id });
    if (!staff) {
      staff = new Staff({
        ...staffData,
        user: user._id
      });
      await staff.save();
      console.log(`🆕 Staff profile created: ${staffData.staffId} (${staffData.staffType})`);
    } else {
      console.log(`ℹ️ Staff profile already exists: ${staffData.staffId}`);
    }

    createdStaff.push({
      user,
      staff,
      credentials: {
        email: userData.email,
        password: userData.password,
        staffType: staffData.staffType
      }
    });
  }

  return createdStaff;
}

async function main() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Tạo staff roles
    const staffRoles = await createStaffRole();

    // Tạo staff accounts
    const staffAccounts = await createStaffAccounts(staffRoles);

    console.log('\n--- KẾT QUẢ STAFF ACCOUNTS ---');
    staffAccounts.forEach(account => {
      console.log(`\n📋 ${account.credentials.staffType} Staff:`);
      console.log(`   Email: ${account.credentials.email}`);
      console.log(`   Password: ${account.credentials.password}`);
      console.log(`   Staff ID: ${account.staff.staffId}`);
      console.log(`   Department: ${account.staff.department}`);
    });

    console.log('\n💡 Hướng dẫn test API:');
    console.log('1. Dùng credentials trên để login: POST /api/auth/login');
    console.log('2. Lấy token từ response');
    console.log('3. Test staff APIs: GET /api/staff/dashboard');
    console.log('4. CTSV staff chỉ thấy yêu cầu CTSV, KTX staff chỉ thấy yêu cầu KTX');

    await mongoose.connection.close();
    console.log('\n📴 Connection closed');
    process.exit(0);
  } catch (err) {
    console.error('❌ Seeder failed:', err);
    process.exit(1);
  }
}

main();