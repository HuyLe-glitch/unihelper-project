// Script: seed toàn bộ dữ liệu theo đúng thứ tự
// Cách dùng: từ thư mục backend chạy: node scripts/seedAll.js

require('dotenv').config();
const { execSync } = require('child_process');

const runScript = (scriptName) => {
  return new Promise((resolve, reject) => {
    try {
      console.log(`\n🔄 Đang chạy ${scriptName}...`);
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
    console.log('🚀 Bắt đầu seed toàn bộ dữ liệu...\n');

    // Thứ tự quan trọng: phải seed theo dependency
    const scripts = [
      'seedCertificateType.js',   // 1. Tạo certificate types trước
      'seedStudent.js',           // 2. Tạo user và student
      'seedStaff.js',             // 3. Tạo users và staff
      'seedCertificateName.js',   // 4. Tạo certificate names (cần certificate types)
      'seedCertificateRequest.js' // 5. Tạo requests (cần tất cả các model trên)
    ];

    for (const script of scripts) {
      await runScript(script);
      // Nghỉ 1 giây giữa các script để tránh conflict
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    console.log('\n🎉 HOÀN THÀNH SEED TOÀN BỘ DỮ LIỆU!');
    console.log('📊 Database hiện tại đã có:');
    console.log('   - Certificate Types');
    console.log('   - Users & Students');
    console.log('   - Users & Staff (CTSV & KTX)');
    console.log('   - Certificate Names');
    console.log('   - Certificate Requests');

  } catch (error) {
    console.error('\n❌ Quá trình seed bị lỗi:', error.message);
    console.log('\n💡 Khuyến nghị:');
    console.log('   1. Chạy: node scripts/clearDatabase.js');
    console.log('   2. Sau đó chạy lại: node scripts/seedAll.js');
    process.exit(1);
  }
};

seedAll();
