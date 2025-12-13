const mongoose = require('mongoose');
require('dotenv').config();

const CertificateType = require('../src/models/CertificateType');
const CertificateName = require('../src/models/CertificateName');

const connectDB = async () => {
  try {
    console.log('🔗 Connecting to MongoDB with URI:', process.env.MONGO_URI ? 'Found' : 'NOT FOUND');
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('✅ Connected to MongoDB');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
};

const seedCertificateNames = async () => {
  try {
    // Xóa dữ liệu cũ
    await CertificateName.deleteMany({});
    console.log('🗑️ Cleared existing certificate names');

    // Lấy danh sách CertificateType
    const types = await CertificateType.find({ isActive: true });

    if (types.length === 0) {
      console.log('⚠️ No certificate types found. Please run seedCertificateType.js first');
      return;
    }

    // Dữ liệu mẫu cho tên chứng nhận
    const certificateNamesData = [];

    for (const type of types) {
      switch (type.name) {
        case 'Xác nhận sinh viên':
          certificateNamesData.push(
            {
              name: 'Xác nhận sinh viên đang học',
              description: 'Giấy xác nhận sinh viên đang theo học tại trường',
              certificateType: type._id,
              purpose: 'Xin việc làm, thực tập',
              processingTime: 3,
              fee: 0
            },
            {
              name: 'Xác nhận sinh viên có học bổng',
              description: 'Giấy xác nhận sinh viên đang học và nhận học bổng',
              certificateType: type._id,
              purpose: 'Xin visa, du học',
              processingTime: 5,
              fee: 0
            },
            {
              name: 'Xác nhận sinh viên tạm ngừng học',
              description: 'Giấy xác nhận sinh viên tạm ngừng học có lý do',
              certificateType: type._id,
              purpose: 'Hoãn nghĩa vụ quân sự',
              processingTime: 3,
              fee: 0
            }
          );
          break;

        case 'Bảng điểm':
          certificateNamesData.push(
            {
              name: 'Bảng điểm học kỳ',
              description: 'Bảng điểm chi tiết theo từng học kỳ',
              certificateType: type._id,
              purpose: 'Xin học bổng, chuyển trường',
              processingTime: 5,
              fee: 20000
            },
            {
              name: 'Bảng điểm tích lũy',
              description: 'Bảng điểm tích lũy toàn khóa học',
              certificateType: type._id,
              purpose: 'Xin việc làm, du học',
              processingTime: 7,
              fee: 30000
            },
            {
              name: 'Bảng điểm có xếp loại',
              description: 'Bảng điểm kèm xếp loại học lực',
              certificateType: type._id,
              purpose: 'Tốt nghiệp, xin việc',
              processingTime: 7,
              fee: 35000
            }
          );
          break;

        case 'Giấy chứng nhận tốt nghiệp':
          certificateNamesData.push(
            {
              name: 'Bằng tốt nghiệp chính thức',
              description: 'Bằng tốt nghiệp chính thức có đóng dấu',
              certificateType: type._id,
              purpose: 'Xin việc làm, chứng minh trình độ',
              processingTime: 14,
              fee: 100000
            },
            {
              name: 'Bản sao bằng tốt nghiệp',
              description: 'Bản sao bằng tốt nghiệp có chứng thực',
              certificateType: type._id,
              purpose: 'Nộp hồ sơ xin việc',
              processingTime: 7,
              fee: 50000
            }
          );
          break;

        default:
          // Tên chứng nhận mặc định cho các loại khác
          certificateNamesData.push({
            name: `${type.name} chuẩn`,
            description: `${type.description} theo mẫu chuẩn`,
            certificateType: type._id,
            purpose: 'Mục đích chung',
            processingTime: 7,
            fee: 0
          });
      }
    }

    // Tạo certificate names
    const createdNames = await CertificateName.create(certificateNamesData);

    console.log('🎉 Certificate names created successfully:');
    createdNames.forEach(name => {
      console.log(`   📋 ${name.name} (${name.certificateType})`);
    });

    console.log(`\n--- THỐNG KÊ ---`);
    console.log(`📊 Tổng số loại chứng nhận: ${types.length}`);
    console.log(`📊 Tổng số tên chứng nhận: ${createdNames.length}`);

  } catch (error) {
    console.error('❌ Error seeding certificate names:', error);
  }
};

const runSeed = async () => {
  await connectDB();
  await seedCertificateNames();
  await mongoose.connection.close();
  console.log('📴 Connection closed');
};

runSeed();
