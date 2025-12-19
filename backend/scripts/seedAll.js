/**
 * Seed Script: Tạo toàn bộ dữ liệu
 * 
 * Thứ tự:
 * 1. Certificate Types
 * 2. Admin (1 tài khoản cố định)
 * 3. Staff (2 tài khoản cố định: CTSV & KTX)
 * 4. Student (test account)
 * 5. Certificate Names
 * 6. Certificate Requests (sample)
 * 
 * Cách dùng: node scripts/seedAll.js
 */

require('dotenv').config();
const { execSync } = require('child_process');

const runScript = (scriptName) => {
  return new Promise((resolve, reject) => {
    try {
      console.log(`\n${'─'.repeat(50)}`);
      console.log(`🔄 Running ${scriptName}...`);
      console.log('─'.repeat(50));
      
      const output = execSync(`node scripts/${scriptName}`, {
        encoding: 'utf8',
        cwd: process.cwd()
      });
      console.log(output);
      resolve();
    } catch (error) {
      console.error(`❌ Error in ${scriptName}:`, error.message);
      reject(error);
    }
  });
};

const seedAll = async () => {
  try {
    console.log('═'.repeat(60));
    console.log('🚀 SEED DỮ LIỆU CHO HỆ THỐNG UNIHELPER');
    console.log('═'.repeat(60));
    console.log('\n📋 Hệ thống sẽ tạo:');
    console.log('   👑 1 Admin (CỐ ĐỊNH)');
    console.log('   👨‍💼 2 Staff (CTSV & KTX - CỐ ĐỊNH)');
    console.log('   🎓 Student test account');
    console.log('   📄 Certificate Types & Names');
    console.log('   📝 Sample Requests');

    const scripts = [
      'seedCertificateType.js',
      'seedFacultyAndMajor.js',
      'seedAdmin.js',
      'seedStaff.js',
      'seedStudent.js',
      'seedCertificateName.js',
      'seedCertificateRequest.js'
    ];

    for (const script of scripts) {
      await runScript(script);
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    console.log('\n' + '═'.repeat(60));
    console.log('🎉 HOÀN THÀNH!');
    console.log('═'.repeat(60));
    
    console.log('\n📝 TÀI KHOẢN:');
    console.log('┌─────────────┬──────────────────────────────┬─────────────┐');
    console.log('│ Vai trò     │ Email                        │ Password    │');
    console.log('├─────────────┼──────────────────────────────┼─────────────┤');
    console.log('│ Admin       │ admin@university.edu.vn      │ Password123!│');
    console.log('│ Staff CTSV  │ ctsv@university.edu.vn       │ Password123!│');
    console.log('│ Staff KTX   │ ktx@university.edu.vn        │ Password123!│');
    console.log('│ Student     │ student@example.com          │ Password123!│');
    console.log('└─────────────┴──────────────────────────────┴─────────────┘');

    console.log('\n⚠️ LƯU Ý:');
    console.log('   - Admin và Staff là tài khoản CỐ ĐỊNH');
    console.log('   - KHÔNG thể tạo thêm admin hoặc staff');
    console.log('   - Chỉ có thể tạo thêm sinh viên');

  } catch (error) {
    console.error('\n❌ Seed failed:', error.message);
    console.log('\n💡 Thử:');
    console.log('   1. node scripts/clearDatabase.js');
    console.log('   2. node scripts/seedAll.js');
    process.exit(1);
  }
};

seedAll();
