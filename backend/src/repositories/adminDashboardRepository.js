/**
 * Admin Dashboard Repository
 * 
 * Repository xử lý truy vấn database cho Dashboard Admin
 * 
 * Các đối tượng Admin quản lý:
 * - Sinh viên
 * - Khoa & Chuyên ngành
 * - Học kỳ
 * - Phòng KTX
 * - Yêu cầu CTSV
 * - Danh mục thiết bị KTX
 */

const Student = require('../models/Student');
const Faculty = require('../models/Faculty');
const Major = require('../models/Major');
const Semester = require('../models/Semester');
const Room = require('../models/Room');
const CertificateRequest = require('../models/CertificateRequest');
const CertificateType = require('../models/CertificateType');
const Certificate = require('../models/Certificate');
const EquipmentCategory = require('../models/EquipmentCategory');
const EquipmentItem = require('../models/EquipmentItem');

class AdminDashboardRepository {
  /**
   * Lấy thống kê tổng quan cho Admin Dashboard
   */
  async getStats() {
    const [
      totalStudents,
      totalFaculties,
      totalMajors,
      totalSemesters,
      totalRooms,
      totalCertificateRequests,
      totalCertificateTypes,
      totalCertificates,
      totalEquipmentCategories,
      totalEquipmentItems
    ] = await Promise.all([
      Student.countDocuments(),
      Faculty.countDocuments(),
      Major.countDocuments(),
      Semester.countDocuments(),
      Room.countDocuments(),
      CertificateRequest.countDocuments(),
      CertificateType.countDocuments(),
      Certificate.countDocuments(),
      EquipmentCategory.countDocuments(),
      EquipmentItem.countDocuments()
    ]);

    return {
      students: totalStudents,
      faculties: totalFaculties,
      majors: totalMajors,
      semesters: totalSemesters,
      rooms: totalRooms,
      certificateRequests: totalCertificateRequests,
      certificateTypes: totalCertificateTypes,
      certificates: totalCertificates,
      equipmentCategories: totalEquipmentCategories,
      equipmentItems: totalEquipmentItems
    };
  }

  /**
   * Lấy hoạt động gần đây (các đối tượng mới được thêm vào)
   * @param {number} limit - Số lượng hoạt động tối đa
   */
  async getRecentActivities(limit = 10) {
    const activities = [];

    // Lấy sinh viên mới thêm
    const recentStudents = await Student.find()
      .sort({ createdAt: -1 })
      .limit(3)
      .populate('user', 'fullName email')
      .populate('major', 'name')
      .lean();

    recentStudents.forEach(student => {
      activities.push({
        id: `student_${student._id}`,
        type: 'student',
        action: 'Sinh viên mới',
        details: student.fullName || student.user?.fullName || 'N/A',
        time: student.createdAt,
        icon: '👨‍🎓',
        link: '/admin/students'
      });
    });

    // Lấy khoa mới thêm
    const recentFaculties = await Faculty.find()
      .sort({ createdAt: -1 })
      .limit(2)
      .lean();

    recentFaculties.forEach(faculty => {
      activities.push({
        id: `faculty_${faculty._id}`,
        type: 'faculty',
        action: 'Khoa mới',
        details: faculty.name,
        time: faculty.createdAt,
        icon: '🏛️',
        link: '/admin/faculty-major'
      });
    });

    // Lấy chuyên ngành mới thêm
    const recentMajors = await Major.find()
      .sort({ createdAt: -1 })
      .limit(2)
      .populate('faculty', 'name')
      .lean();

    recentMajors.forEach(major => {
      activities.push({
        id: `major_${major._id}`,
        type: 'major',
        action: 'Chuyên ngành mới',
        details: `${major.name} - ${major.faculty?.name || 'N/A'}`,
        time: major.createdAt,
        icon: '📚',
        link: '/admin/faculty-major'
      });
    });

    // Lấy học kỳ mới thêm
    const recentSemesters = await Semester.find()
      .sort({ createdAt: -1 })
      .limit(2)
      .lean();

    recentSemesters.forEach(semester => {
      activities.push({
        id: `semester_${semester._id}`,
        type: 'semester',
        action: 'Học kỳ mới',
        details: semester.name,
        time: semester.createdAt,
        icon: '📅',
        link: '/admin/semesters'
      });
    });

    // Lấy phòng KTX mới thêm
    const recentRooms = await Room.find()
      .sort({ createdAt: -1 })
      .limit(2)
      .lean();

    recentRooms.forEach(room => {
      activities.push({
        id: `room_${room._id}`,
        type: 'room',
        action: 'Phòng KTX mới',
        details: `Phòng ${room.name} - Sức chứa: ${room.capacity}`,
        time: room.createdAt,
        icon: '🏠',
        link: '/admin/rooms'
      });
    });

    // Lấy loại chứng nhận mới thêm (thay vì yêu cầu CTSV)
    const recentCertTypes = await CertificateType.find()
      .sort({ createdAt: -1 })
      .limit(3)
      .lean();

    recentCertTypes.forEach(certType => {
      activities.push({
        id: `certtype_${certType._id}`,
        type: 'certificate_type',
        action: 'Loại chứng nhận mới',
        details: certType.name,
        time: certType.createdAt,
        icon: '📑',
        link: '/admin/certificate-requests'
      });
    });

    // Lấy tên chứng nhận mới thêm
    const recentCertificates = await Certificate.find()
      .sort({ createdAt: -1 })
      .limit(3)
      .populate('certificateType', 'name')
      .lean();

    recentCertificates.forEach(cert => {
      activities.push({
        id: `certificate_${cert._id}`,
        type: 'certificate',
        action: 'Chứng nhận mới',
        details: `${cert.name} - ${cert.certificateType?.name || 'N/A'}`,
        time: cert.createdAt,
        icon: '📋',
        link: '/admin/certificate-requests'
      });
    });

    // Lấy danh mục thiết bị mới thêm
    const recentCategories = await EquipmentCategory.find()
      .sort({ createdAt: -1 })
      .limit(2)
      .lean();

    recentCategories.forEach(category => {
      activities.push({
        id: `category_${category._id}`,
        type: 'equipment_category',
        action: 'Danh mục thiết bị mới',
        details: category.name,
        time: category.createdAt,
        icon: '🔧',
        link: '/admin/equipment'
      });
    });

    // Lấy thiết bị cụ thể mới thêm
    const recentEquipmentItems = await EquipmentItem.find()
      .sort({ createdAt: -1 })
      .limit(3)
      .populate('category', 'name')
      .lean();

    recentEquipmentItems.forEach(item => {
      activities.push({
        id: `equipmentitem_${item._id}`,
        type: 'equipment_item',
        action: 'Thiết bị mới',
        details: `${item.name} - ${item.category?.name || 'N/A'}`,
        time: item.createdAt,
        icon: '⚙️',
        link: '/admin/equipment'
      });
    });

    // Sắp xếp theo thời gian và giới hạn
    activities.sort((a, b) => new Date(b.time) - new Date(a.time));
    
    return activities.slice(0, limit);
  }
}

module.exports = new AdminDashboardRepository();
