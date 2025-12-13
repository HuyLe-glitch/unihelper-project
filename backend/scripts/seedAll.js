/**
 * Seed Script: Tạo toàn bộ dữ liệu cần thiết
 * 
 * Thứ tự seed:
 * 1. Certificate Types
 * 2. Admin (1 tài khoản duy nhất)
 * 3. Staff (2 tài khoản cố định: CTSV & KTX)
 * 4. Student (tài khoản test)
 * 5. Certificate Names
 * 6. Certificate Requests (test data)
 * 
 * Cách dùng: từ thư mục backend chạy: node scripts/seedAll.js
 */

require('dotenv').config();
const { execSync } = require('child_process');

const runScript = (scriptName) => {
  return new Promise((resolve, reject) => {
    try {
      console.log(`\n${'─'.repeat(50)}`);
      console.log(`🔄 Đang chạy ${scriptName}...`);
      console.log('─'.repeat(50));
      
      const output = execSync(`node scripts/${scriptName}`, {
        encoding: 'utf8',
        cwd: process.cwd()
      });
      console.log(output);
      console.log(`✅ Hoàn thành ${scriptName}`);
      resolve();
    } catch (error) {
      console.error(`❌ Lỗi khi chạy ${scriptName}:`, error.message);
      reject(error);
    }
  });
};

const seedAll = async () => {
  try {
    console.log('═'.repeat(60));
    console.log('🚀 BẮT ĐẦU SEED TOÀN BỘ DỮ LIỆU');
    console.log('═'.repeat(60));
    console.log('\n📋 Hệ thống sẽ tạo:');
    console.log('   - 1 Admin (cố định)');
    console.log('   - 2 Staff (CTSV & KTX - cố định)');
    console.log('   - Student test account');
    console.log('   - Certificate Types & Names');
    console.log('   - Sample Certificate Requests\n');

    // Thứ tự quan trọng: phải seed theo dependency
    const scripts = [
      'seedCertificateType.js',   // 1. Tạo certificate types trước
      'seedAdmin.js',             // 2. Tạo admin (1 tài khoản duy nhất)
      'seedStaff.js',             // 3. Tạo staff (2 tài khoản cố định)
      'seedStudent.js',           // 4. Tạo student test
      'seedCertificateName.js',   // 5. Tạo certificate names (cần certificate types)
      'seedCertificateRequest.js' // 6. Tạo requests (cần tất cả các model trên)
    ];

    for (const script of scripts) {
      await runScript(script);
      // Nghỉ 1 giây giữa các script để tránh conflict
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    console.log('\n' + '═'.repeat(60));
    console.log('🎉 HOÀN THÀNH SEED TOÀN BỘ DỮ LIỆU!');
    console.log('═'.repeat(60));
    
    console.log('\n📊 Database hiện tại có:');
    console.log('   ✅ Certificate Types');
    console.log('   ✅ 1 Admin (admin@university.edu.vn)');
    console.log('   ✅ 2 Staff cố định:');
    console.log('      - CTSV: ctsv@university.edu.vn');
    console.log('      - KTX: ktx@university.edu.vn');
    console.log('   ✅ Student test (student@example.com)');
    console.log('   ✅ Certificate Names');
    console.log('   ✅ Sample Certificate Requests');

    console.log('\n📝 TÀI KHOẢN TEST:');
    console.log('┌─────────────────────────────────────────────────────────┐');
    console.log('│ Role      │ Email                        │ Password    │');
    console.log('├───────────┼──────────────────────────────┼─────────────┤');
    console.log('│ Admin     │ admin@university.edu.vn      │ Password123!│');
    console.log('│ Staff CTSV│ ctsv@university.edu.vn       │ Password123!│');
    console.log('│ Staff KTX │ ktx@university.edu.vn        │ Password123!│');
    console.log('│ Student   │ student@example.com          │ Password123!│');
    console.log('└─────────────────────────────────────────────────────────┘');

    console.log('\n💡 LƯU Ý QUAN TRỌNG:');
    console.log('   - Admin và Staff là tài khoản CỐ ĐỊNH');
    console.log('   - KHÔNG thể tạo thêm admin hoặc staff mới');
    console.log('   - Chỉ có thể tạo thêm sinh viên');

  } catch (error) {
    console.error('\n❌ Quá trình seed bị lỗi:', error.message);
    console.log('\n💡 Khuyến nghị:');
    console.log('   1. Chạy: node scripts/clearDatabase.js');
    console.log('   2. Sau đó chạy lại: node scripts/seedAll.js');
    process.exit(1);
  }
};

seedAll();
