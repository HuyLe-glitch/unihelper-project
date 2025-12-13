/**
 * Seed Script: Tạo 2 tài khoản Staff CỐ ĐỊNH
 * 
 * - Staff CTSV: Xử lý yêu cầu Công tác Sinh viên
 * - Staff KTX: Xử lý yêu cầu Ký túc xá
 * 
 * LƯU Ý: KHÔNG tạo thêm staff mới, hệ thống chỉ có 2 staff này
 * 
 * Cách dùng: node scripts/seedStaff.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const User = require('../src/models/User');
const Staff = require('../src/models/Staff');
const { FIXED_ACCOUNTS, STAFF_TYPES } = require('../src/constants/modelConstants');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/unihelper';

// 2 tài khoản staff CỐ ĐỊNH
const STAFF_ACCOUNTS = [
  {
    user: {
      name: 'Nhân viên Công tác Sinh viên',
      email: FIXED_ACCOUNTS.STAFF_CTSV.email,
      password: 'Password123!',
      role: 'STAFF'
    },
    staff: {
      staffId: FIXED_ACCOUNTS.STAFF_CTSV.staffId,
      staffType: STAFF_TYPES.CTSV,
      department: FIXED_ACCOUNTS.STAFF_CTSV.department,
      position: FIXED_ACCOUNTS.STAFF_CTSV.position,
      phone: '0123456789'
    }
  },
  {
    user: {
      name: 'Nhân viên Ký túc xá',
      email: FIXED_ACCOUNTS.STAFF_KTX.email,
      password: 'Password123!',
      role: 'STAFF'
    },
    staff: {
      staffId: FIXED_ACCOUNTS.STAFF_KTX.staffId,
      staffType: STAFF_TYPES.KTX,
      department: FIXED_ACCOUNTS.STAFF_KTX.department,
      position: FIXED_ACCOUNTS.STAFF_KTX.position,
      phone: '0987654321'
    }
  }
];

async function seedStaff() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB');
    console.log('═'.repeat(60));

    const createdStaff = [];

    for (const accountData of STAFF_ACCOUNTS) {
      const { user: userData, staff: staffData } = accountData;

      // Tạo hoặc tìm User
      let user = await User.findOne({ email: userData.email });
      
      if (!user) {
        const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS) || 12;
        const hashedPassword = await bcrypt.hash(userData.password, saltRounds);

        user = new User({
          ...userData,
          password: hashedPassword
        });
        await user.save();
        console.log(`🆕 User created: ${userData.email}`);
      } else {
        console.log(`ℹ️ User exists: ${userData.email}`);
      }

      // Tạo hoặc tìm Staff profile (theo staffType vì chỉ có 1 mỗi loại)
      let staff = await Staff.findOne({ staffType: staffData.staffType });
      
      if (!staff) {
        staff = new Staff({
          ...staffData,
          user: user._id
        });
        await staff.save();
        console.log(`🆕 Staff created: ${staffData.staffId} (${staffData.staffType})`);
      } else {
        // Cập nhật user reference nếu cần
        if (staff.user.toString() !== user._id.toString()) {
          staff.user = user._id;
          await staff.save();
          console.log(`🔄 Staff updated: ${staffData.staffId}`);
        } else {
          console.log(`ℹ️ Staff exists: ${staffData.staffId}`);
        }
      }

      createdStaff.push({
        email: userData.email,
        password: userData.password,
        staffId: staffData.staffId,
        staffType: staffData.staffType,
        department: staffData.department
      });
    }

    // Hiển thị kết quả
    console.log('\n' + '═'.repeat(60));
    console.log('📋 2 STAFF ACCOUNTS CỐ ĐỊNH (KHÔNG TẠO THÊM ĐƯỢC)');
    console.log('═'.repeat(60));

    createdStaff.forEach((account, index) => {
      console.log(`\n${index + 1}. ${account.staffType} Staff:`);
      console.log(`   📧 Email: ${account.email}`);
      console.log(`   🔑 Password: ${account.password}`);
      console.log(`   🆔 Staff ID: ${account.staffId}`);
      console.log(`   🏢 Department: ${account.department}`);
    });

    console.log('\n' + '═'.repeat(60));
    console.log('💡 LƯU Ý QUAN TRỌNG:');
    console.log('═'.repeat(60));
    console.log('✅ Staff CTSV chỉ xem/xử lý yêu cầu Công tác Sinh viên');
    console.log('✅ Staff KTX chỉ xem/xử lý yêu cầu Ký túc xá');
    console.log('❌ KHÔNG thể tạo thêm staff mới');
    console.log('❌ KHÔNG thể xóa staff');

    await mongoose.connection.close();
    console.log('\n📴 Connection closed');
    process.exit(0);

  } catch (err) {
    console.error('❌ Seeder failed:', err);
    process.exit(1);
  }
}

seedStaff();
