import React, { useState } from "react";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import "./StudentManagement.css";

export default function StudentManagement() {
  const navigate = useNavigate();
  const location = useLocation();
  const { majorId } = useParams();
  
  // Lấy thông tin major và faculty từ navigation state
  const { major, faculty } = location.state || {};

  // Fake data danh sách sinh viên (theo Student model)
  const [students, setStudents] = useState([
    {
      id: 1,
      studentId: "519H0001",
      fullName: "Nguyễn Văn A",
      user: { email: "519h0001@student.tdtu.edu.vn" },
      phone: "0901234567",
      className: "19DTHB01",
      address: "123 Nguyễn Văn Linh, Q.7, TP.HCM",
      citizenId: "001203001234",
      dateOfBirth: "2003-05-15",
      enrollmentDate: "2019-09-01",
      status: "ACTIVE",
      gpa: 3.45,
      academicYear: "2019",
      majorId: parseInt(majorId)
    },
    {
      id: 2,
      studentId: "519H0002",
      fullName: "Trần Thị B",
      user: { email: "519h0002@student.tdtu.edu.vn" },
      phone: "0902345678",
      className: "19DTHB01",
      address: "456 Lê Văn Việt, Q.9, TP.HCM",
      citizenId: "001203001235",
      dateOfBirth: "2003-08-20",
      enrollmentDate: "2019-09-01",
      status: "ACTIVE",
      gpa: 3.78,
      academicYear: "2019",
      majorId: parseInt(majorId)
    },
    {
      id: 3,
      studentId: "519H0003",
      fullName: "Lê Văn C",
      user: { email: "519h0003@student.tdtu.edu.vn" },
      phone: "0903456789",
      className: "19DTHB02",
      address: "789 Võ Văn Ngân, Thủ Đức, TP.HCM",
      citizenId: "001203001236",
      dateOfBirth: "2003-02-10",
      enrollmentDate: "2019-09-01",
      status: "TEMPORARY_LEAVE",
      gpa: 3.20,
      academicYear: "2019",
      majorId: parseInt(majorId)
    },
    {
      id: 4,
      studentId: "520H0001",
      fullName: "Phạm Thị D",
      user: { email: "520h0001@student.tdtu.edu.vn" },
      phone: "0904567890",
      className: "20DTHB01",
      address: "321 Quang Trung, Gò Vấp, TP.HCM",
      citizenId: "001203001237",
      dateOfBirth: "2004-11-25",
      enrollmentDate: "2020-09-01",
      status: "ACTIVE",
      gpa: 3.92,
      academicYear: "2020",
      majorId: parseInt(majorId)
    },
    {
      id: 5,
      studentId: "518H0001",
      fullName: "Hoàng Văn E",
      user: { email: "518h0001@student.tdtu.edu.vn" },
      phone: "0905678901",
      className: "18DTHB01",
      address: "654 Phan Văn Trị, Bình Thạnh, TP.HCM",
      citizenId: "001203001238",
      dateOfBirth: "2002-07-18",
      enrollmentDate: "2018-09-01",
      status: "GRADUATED",
      gpa: 3.55,
      academicYear: "2018",
      majorId: parseInt(majorId)
    },
    {
      id: 6,
      studentId: "519H0004",
      fullName: "Võ Thị F",
      user: { email: "519h0004@student.tdtu.edu.vn" },
      phone: "0906789012",
      className: "19DTHB02",
      address: "987 Lý Thường Kiệt, Q.10, TP.HCM",
      citizenId: "001203001239",
      dateOfBirth: "2003-03-22",
      enrollmentDate: "2019-09-01",
      status: "SUSPENDED",
      gpa: 2.15,
      academicYear: "2019",
      majorId: parseInt(majorId)
    },
    {
      id: 7,
      studentId: "519H0005",
      fullName: "Đặng Văn G",
      user: { email: "519h0005@student.tdtu.edu.vn" },
      phone: "0907890123",
      className: "19DTHB03",
      address: "147 Điện Biên Phủ, Q.3, TP.HCM",
      citizenId: "001203001240",
      dateOfBirth: "2003-09-05",
      enrollmentDate: "2019-09-01",
      status: "DROPPED",
      gpa: 1.85,
      academicYear: "2019",
      majorId: parseInt(majorId)
    },
    {
      id: 8,
      studentId: "520H0002",
      fullName: "Bùi Thị H",
      user: { email: "520h0002@student.tdtu.edu.vn" },
      phone: "0908901234",
      className: "20DTHB01",
      address: "258 Nguyễn Thị Minh Khai, Q.1, TP.HCM",
      citizenId: "001203001241",
      dateOfBirth: "2004-12-30",
      enrollmentDate: "2020-09-01",
      status: "INACTIVE",
      gpa: 3.10,
      academicYear: "2020",
      majorId: parseInt(majorId)
    },
  ]);

  // Trạng thái sinh viên theo Student model
  const studentStatuses = [
    { value: 'ACTIVE', label: 'Đang học', color: 'status-active' },
    { value: 'INACTIVE', label: 'Không hoạt động', color: 'status-inactive' },
    { value: 'GRADUATED', label: 'Đã tốt nghiệp', color: 'status-graduated' },
    { value: 'SUSPENDED', label: 'Đình chỉ', color: 'status-suspended' },
    { value: 'DROPPED', label: 'Thôi học', color: 'status-dropped' },
    { value: 'TEMPORARY_LEAVE', label: 'Tạm nghỉ', color: 'status-leave' },
  ];

  // State cho tìm kiếm và lọc
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterYear, setFilterYear] = useState('all');

  // State cho modal xem chi tiết
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);

  // Lọc sinh viên
  const filteredStudents = students.filter(student => {
    const matchesSearch = 
      student.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.studentId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.user.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === 'all' || student.status === filterStatus;
    const matchesYear = filterYear === 'all' || student.academicYear === filterYear;
    
    return matchesSearch && matchesStatus && matchesYear;
  });

  // Get unique academic years
  const academicYears = [...new Set(students.map(s => s.academicYear))].sort((a, b) => b.localeCompare(a));

  // Get status label and class
  const getStatusInfo = (status) => {
    const statusObj = studentStatuses.find(s => s.value === status);
    return statusObj || { label: status, color: 'status-active' };
  };

  // Xem chi tiết sinh viên
  const handleViewDetail = (student) => {
    setSelectedStudent(student);
    setShowDetailModal(true);
  };

  // Navigate to Add Student page
  const handleAddStudent = () => {
    navigate('/admin/faculty-management/add-student', {
      state: { major, faculty }
    });
  };

  // Back to Faculty Management
  const handleBack = () => {
    navigate('/admin/faculty-management');
  };

  // Thống kê
  const stats = {
    total: students.length,
    active: students.filter(s => s.status === 'ACTIVE').length,
    graduated: students.filter(s => s.status === 'GRADUATED').length,
    avgGpa: students.length > 0 
      ? (students.reduce((sum, s) => sum + s.gpa, 0) / students.length).toFixed(2)
      : '0.00'
  };

  return (
    <div className="student-management-container">
      {/* HEADER */}
      <div className="student-header">
        <div className="header-content">
          <button className="back-btn" onClick={handleBack}>
            ← Quay lại
          </button>
          <div className="header-text">
            <h1>Danh sách Sinh viên</h1>
            {major && faculty && (
              <p>
                Chuyên ngành: <strong>{major.name}</strong> ({major.code}) - Khoa: <strong>{faculty.name}</strong>
              </p>
            )}
          </div>
        </div>
        <button className="add-student-btn" onClick={handleAddStudent}>
          + Thêm sinh viên
        </button>
      </div>

      {/* THỐNG KÊ */}
      <div className="stats-grid">
        <div className="stat-card stat-total">
          <div className="stat-icon">👨‍🎓</div>
          <div className="stat-content">
            <h3>Tổng sinh viên</h3>
            <div className="stat-number">{stats.total}</div>
          </div>
        </div>
        <div className="stat-card stat-active">
          <div className="stat-icon">📚</div>
          <div className="stat-content">
            <h3>Đang học</h3>
            <div className="stat-number">{stats.active}</div>
          </div>
        </div>
        <div className="stat-card stat-graduated">
          <div className="stat-icon">🎓</div>
          <div className="stat-content">
            <h3>Đã tốt nghiệp</h3>
            <div className="stat-number">{stats.graduated}</div>
          </div>
        </div>
        <div className="stat-card stat-gpa">
          <div className="stat-icon">📊</div>
          <div className="stat-content">
            <h3>GPA trung bình</h3>
            <div className="stat-number">{stats.avgGpa}</div>
          </div>
        </div>
      </div>

      {/* BỘ LỌC VÀ TÌM KIẾM */}
      <div className="filter-section">
        <div className="search-box">
          <span className="search-icon">🔍</span>
          <input
            type="text"
            placeholder="Tìm kiếm theo tên, MSSV, email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
        <div className="filter-controls">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="filter-select"
          >
            <option value="all">Tất cả trạng thái</option>
            {studentStatuses.map(status => (
              <option key={status.value} value={status.value}>
                {status.label}
              </option>
            ))}
          </select>
          <select
            value={filterYear}
            onChange={(e) => setFilterYear(e.target.value)}
            className="filter-select"
          >
            <option value="all">Tất cả khóa</option>
            {academicYears.map(year => (
              <option key={year} value={year}>
                Khóa {year}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* DANH SÁCH SINH VIÊN */}
      <div className="students-table-container">
        {filteredStudents.length === 0 ? (
          <p className="no-data">Không tìm thấy sinh viên nào.</p>
        ) : (
          <table className="students-table">
            <thead>
              <tr>
                <th>MSSV</th>
                <th>Họ và tên</th>
                <th>Email</th>
                <th>Lớp</th>
                <th>Khóa</th>
                <th>GPA</th>
                <th>Trạng thái</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {filteredStudents.map((student) => (
                <tr key={student.id}>
                  <td><strong>{student.studentId}</strong></td>
                  <td>{student.fullName}</td>
                  <td className="email-cell">{student.user.email}</td>
                  <td>{student.className}</td>
                  <td>{student.academicYear}</td>
                  <td>
                    <span className={`gpa-badge ${student.gpa >= 3.6 ? 'excellent' : student.gpa >= 3.2 ? 'good' : student.gpa >= 2.5 ? 'average' : 'poor'}`}>
                      {student.gpa.toFixed(2)}
                    </span>
                  </td>
                  <td>
                    <span className={`status-badge ${getStatusInfo(student.status).color}`}>
                      {getStatusInfo(student.status).label}
                    </span>
                  </td>
                  <td>
                    <button 
                      className="view-btn"
                      onClick={() => handleViewDetail(student)}
                    >
                      Xem
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        <div className="table-footer">
          <span>Hiển thị {filteredStudents.length} / {students.length} sinh viên</span>
        </div>
      </div>

      {/* MODAL XEM CHI TIẾT */}
      {showDetailModal && selectedStudent && (
        <div className="modal-overlay">
          <div className="modal modal-large">
            <div className="modal-header">
              <h2>Thông tin sinh viên</h2>
              <button className="close-btn" onClick={() => setShowDetailModal(false)}>×</button>
            </div>

            <div className="student-detail">
              <div className="detail-section">
                <h3 className="section-title">Thông tin cá nhân</h3>
                <div className="detail-row">
                  <span className="detail-label">Mã sinh viên:</span>
                  <strong>{selectedStudent.studentId}</strong>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Họ và tên:</span>
                  <strong>{selectedStudent.fullName}</strong>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Email:</span>
                  <strong>{selectedStudent.user.email}</strong>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Số điện thoại:</span>
                  <strong>{selectedStudent.phone}</strong>
                </div>
                <div className="detail-row">
                  <span className="detail-label">CCCD:</span>
                  <strong>{selectedStudent.citizenId}</strong>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Ngày sinh:</span>
                  <strong>{new Date(selectedStudent.dateOfBirth).toLocaleDateString('vi-VN')}</strong>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Địa chỉ:</span>
                  <strong>{selectedStudent.address}</strong>
                </div>
              </div>

              <div className="detail-section">
                <h3 className="section-title">Thông tin học tập</h3>
                <div className="detail-row">
                  <span className="detail-label">Lớp:</span>
                  <strong>{selectedStudent.className}</strong>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Khóa học:</span>
                  <strong>{selectedStudent.academicYear}</strong>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Ngày nhập học:</span>
                  <strong>{new Date(selectedStudent.enrollmentDate).toLocaleDateString('vi-VN')}</strong>
                </div>
                <div className="detail-row">
                  <span className="detail-label">GPA:</span>
                  <strong className={`${selectedStudent.gpa >= 3.6 ? 'text-excellent' : selectedStudent.gpa >= 3.2 ? 'text-good' : ''}`}>
                    {selectedStudent.gpa.toFixed(2)}
                  </strong>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Trạng thái:</span>
                  <span className={`status-badge ${getStatusInfo(selectedStudent.status).color}`}>
                    {getStatusInfo(selectedStudent.status).label}
                  </span>
                </div>
              </div>
            </div>

            <div className="modal-actions">
              <button className="edit-btn-modal">Chỉnh sửa</button>
              <button className="cancel-btn" onClick={() => setShowDetailModal(false)}>
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}