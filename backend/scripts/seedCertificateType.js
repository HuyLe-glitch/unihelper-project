// Script: chèn một CertificateType để test
// Cách dùng: từ thư mục backend chạy: node scripts\seedCertificateType.js

require('dotenv').config();
const mongoose = require('mongoose');

const CertificateType = require('../src/models/CertificateType');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/unihelper';

async function main() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Xóa dữ liệu cũ
    await CertificateType.deleteMany({});
    console.log('🗑️ Cleared existing certificate types');

    // Dữ liệu certificate types phong phú hơn
    const certificateTypesData = [
      {
        name: 'Xác nhận sinh viên',
        description: 'Các loại giấy xác nhận liên quan đến tình trạng sinh viên',
        requirements: ['Học phí đã đóng', 'Không vi phạm nội quy học đường'],
        isActive: true
      },
      {
        name: 'Bảng điểm',
        description: 'Các loại bảng điểm và chứng nhận học tập',
        requirements: ['Hoàn thành đủ tín chỉ theo yêu cầu', 'Không nợ môn học'],
        isActive: true
      },
      {
        name: 'Giấy chứng nhận tốt nghiệp',
        description: 'Bằng tốt nghiệp và các giấy tờ liên quan',
        requirements: ['Hoàn thành chương trình đào tạo', 'Đạt điều kiện tốt nghiệp', 'Không nợ học phí'],
        isActive: true
      },
      {
        name: 'Nghĩa vụ quân sự',
        description: 'Giấy xác nhận tạm hoãn nghĩa vụ quân sự',
        requirements: ['Đang trong thời gian học tập', 'Độ tuổi phù hợp với quy định'],
        isActive: true
      },
      {
        name: 'Chứng nhận khác',
        description: 'Các loại chứng nhận đặc biệt khác',
        requirements: ['Theo yêu cầu cụ thể của từng loại'],
        isActive: true
      }
    ];

    // Tạo certificate types
    const createdTypes = await CertificateType.create(certificateTypesData);

    console.log('🎉 Certificate types created successfully:');
    createdTypes.forEach(type => {
      console.log(`   📋 ${type.name} - ID: ${type._id}`);
    });

    console.log(`\n--- THỐNG KÊ ---`);
    console.log(`📊 Tổng số loại chứng nhận: ${createdTypes.length}`);

    console.log('\n--- KẾT QUẢ ---');
    console.log('certificateTypeId:', createdTypes.map(ct => ct._id.toString()).join(', '));

    await mongoose.connection.close();
    console.log('📴 Connection closed');
    process.exit(0);
  } catch (err) {
    console.error('❌ Seeder failed:', err);
    process.exit(1);
  }
}

main();
