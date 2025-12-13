// Script: tạo CertificateRequest mẫu với cấu trúc mới
// Cách dùng: từ thư mục backend chạy: node scripts\seedCertificateRequest.js
// Lưu ý: Phải chạy seedCertificateType.js và seedCertificateName.js trước

require('dotenv').config();
const mongoose = require('mongoose');

const User = require('../src/models/User');
const Student = require('../src/models/Student');
const CertificateType = require('../src/models/CertificateType');
const CertificateName = require('../src/models/CertificateName');
const CertificateRequest = require('../src/models/CertificateRequest');

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

const seedCertificateRequests = async () => {
  try {
    // Xóa dữ liệu cũ
    await CertificateRequest.deleteMany({});
    console.log('🗑️ Cleared existing certificate requests');

    // Tìm user student đã tạo
    const user = await User.findOne({ email: 'student@example.com' });
    if (!user) {
      console.log('❌ User student không tồn tại. Hãy chạy seedStudent.js trước.');
      return;
    }

    const student = await Student.findOne({ user: user._id });
    if (!student) {
      console.log('❌ Student profile không tồn tại.');
      return;
    }

    // Lấy danh sách certificate types và names
    const types = await CertificateType.find({ isActive: true });
    if (types.length === 0) {
      console.log('❌ Không có certificate types. Hãy chạy seedCertificateType.js trước.');
      return;
    }

    const names = await CertificateName.find({ isActive: true }).populate('certificateType');
    if (names.length === 0) {
      console.log('❌ Không có certificate names. Hãy chạy seedCertificateName.js trước.');
      return;
    }

    // Tạo các yêu cầu mẫu với dữ liệu thực tế
    const requestsData = [
      {
        student: student._id,
        certificateType: names.find(n => n.name === 'Xác nhận sinh viên đang học')?.certificateType || types[0]._id,
        certificateName: names.find(n => n.name === 'Xác nhận sinh viên đang học')?._id || names[0]._id,
        semester: 'HK1 2024-2025',
        status: 'ĐANG XỬ LÝ',
        notes: 'Cần để xin việc làm part-time'
      },
      {
        student: student._id,
        certificateType: names.find(n => n.name === 'Bảng điểm học kỳ')?.certificateType || types[1]._id,
        certificateName: names.find(n => n.name === 'Bảng điểm học kỳ')?._id || names[1]._id,
        semester: 'HK2 2023-2024',
        status: 'HỢP LỆ',
        notes: 'Để nộp hồ sơ học bổng',
        responseTime: new Date('2024-09-15'),
        processingInfo: {
          completedDate: new Date('2024-09-15'),
          reviewNotes: 'Hồ sơ đã được xét duyệt và hoàn thành'
        }
      },
      {
        student: student._id,
        certificateType: names.find(n => n.name === 'Xác nhận sinh viên có học bổng')?.certificateType || types[0]._id,
        certificateName: names.find(n => n.name === 'Xác nhận sinh viên có học bổng')?._id || names[0]._id,
        semester: 'HK1 2024-2025',
        status: 'HỢP LỆ',
        notes: 'Để làm thủ tục visa du học',
        responseTime: new Date('2024-08-16'),
        processingInfo: {
          assignedDate: new Date('2024-08-14'),
          completedDate: new Date('2024-08-16'),
          reviewNotes: 'Hồ sơ hợp lệ, đã xác nhận và phê duyệt'
        }
      },
      {
        student: student._id,
        certificateType: names.find(n => n.name === 'Bảng điểm tích lũy')?.certificateType || types[1]._id,
        certificateName: names.find(n => n.name === 'Bảng điểm tích lũy')?._id || names[1]._id,
        semester: 'Tích lũy toàn khóa',
        status: 'KHÔNG HỢP LỆ',
        notes: 'Để nộp hồ sơ xin việc',
        responseTime: new Date('2024-10-10'),
        processingInfo: {
          reviewNotes: 'Chưa đủ điều kiện, cần hoàn thành thêm 2 tín chỉ'
        }
      },
      {
        student: student._id,
        certificateType: names.find(n => n.name === 'Xác nhận sinh viên tạm ngừng học')?.certificateType || types[0]._id,
        certificateName: names.find(n => n.name === 'Xác nhận sinh viên tạm ngừng học')?._id || names[0]._id,
        semester: 'HK1 2024-2025',
        status: 'ĐANG XỬ LÝ',
        notes: 'Hoãn nghĩa vụ quân sự',
        processingInfo: {
          assignedDate: new Date('2024-10-22'),
          estimatedCompletionDate: new Date('2024-10-27'),
          reviewNotes: 'Đang xem xét hồ sơ và thủ tục liên quan'
        }
      }
    ];

    // Tạo requests với requestCode tự động
    const createdRequests = [];
    for (const requestData of requestsData) {
      const request = new CertificateRequest(requestData);
      await request.save();
      createdRequests.push(request);
    }

    console.log('🎉 Certificate requests created successfully:');
    createdRequests.forEach((request, index) => {
      console.log(`   📋 Request ${index + 1}: ${request.requestCode} - ${request.status}`);
    });

    console.log(`\n--- THỐNG KÊ ---`);
    console.log(`📊 Tổng số yêu cầu: ${createdRequests.length}`);
    console.log(`📊 Đang xử lý: ${createdRequests.filter(r => r.status === 'ĐANG XỬ LÝ').length}`);
    console.log(`📊 Hợp lệ: ${createdRequests.filter(r => r.status === 'HỢP LỆ').length}`);
    console.log(`📊 Không hợp lệ: ${createdRequests.filter(r => r.status === 'KHÔNG HỢP LỆ').length}`);

    console.log('\n--- TESTING SUGGESTIONS ---');
    console.log('Bạn có thể test các API sau:');
    console.log('1. GET /api/certificate-requests/my (lấy yêu cầu của sinh viên)');
    console.log('2. GET /api/certificate-requests/stats (thống kê - admin only)');
    console.log('3. GET /api/certificate-requests (tất cả yêu cầu - staff/admin)');

  } catch (error) {
    console.error('❌ Error seeding certificate requests:', error);
    throw error;
  }
};

const runSeed = async () => {
  await connectDB();
  await seedCertificateRequests();
  await mongoose.connection.close();
  console.log('📴 Connection closed');
};

runSeed();
