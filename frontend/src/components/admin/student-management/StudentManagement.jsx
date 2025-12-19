import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './StudentManagement.css';

const StudentManagement = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('students'); // 'students' or 'dormitory'

  // Mock data - Replace with actual API calls
  const [students, setStudents] = useState([]);
  const [dormitoryStudents, setDormitoryStudents] = useState([]);
  const [faculties, setFaculties] = useState([]);
  const [majors, setMajors] = useState([]);
  const [rooms, setRooms] = useState([]);

  // Filters and Search
  const [searchTerm, setSearchTerm] = useState('');
  const [filterFaculty, setFilterFaculty] = useState('all');
  const [filterMajor, setFilterMajor] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterYear, setFilterYear] = useState('all');
  const [filterRoom, setFilterRoom] = useState('all'); // For dormitory students

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Student details modal
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  // Multiple selection
  const [selectedStudentIds, setSelectedStudentIds] = useState([]);

  // Load mock data
  useEffect(() => {
    // TODO: Replace with actual API calls
    setTimeout(() => {
      setFaculties([
        { _id: '1', name: 'Khoa Công nghệ Thông tin', code: 'CNTT' },
        { _id: '2', name: 'Khoa Kinh tế', code: 'KT' },
        { _id: '3', name: 'Khoa Kỹ thuật', code: 'KT' }
      ]);

      setMajors([
        { _id: '1', name: 'Công nghệ Phần mềm', code: 'CNPM', faculty: '1' },
        { _id: '2', name: 'Khoa học Máy tính', code: 'KHMT', faculty: '1' },
        { _id: '3', name: 'Quản trị Kinh doanh', code: 'QTKD', faculty: '2' },
        { _id: '4', name: 'Kỹ thuật Cơ khí', code: 'KTCK', faculty: '3' }
      ]);

      setStudents([
        {
          _id: '1',
          studentId: '519H0001',
          fullName: 'Nguyễn Văn A',
          email: '519h0001@student.tdtu.edu.vn',
          phone: '0901234567',
          faculty: { _id: '1', name: 'Khoa Công nghệ Thông tin', code: 'CNTT' },
          major: { _id: '1', name: 'Công nghệ Phần mềm', code: 'CNPM' },
          className: '19DTHB01',
          academicYear: '2019',
          status: 'ACTIVE',
          gpa: 3.45
        },
        {
          _id: '2',
          studentId: '519H0002',
          fullName: 'Trần Thị B',
          email: '519h0002@student.tdtu.edu.vn',
          phone: '0902345678',
          faculty: { _id: '1', name: 'Khoa Công nghệ Thông tin', code: 'CNTT' },
          major: { _id: '2', name: 'Khoa học Máy tính', code: 'KHMT' },
          className: '19DTHB01',
          academicYear: '2019',
          status: 'ACTIVE',
          gpa: 3.78
        },
        {
          _id: '3',
          studentId: '520H0001',
          fullName: 'Lê Văn C',
          email: '520h0001@student.tdtu.edu.vn',
          phone: '0903456789',
          faculty: { _id: '2', name: 'Khoa Kinh tế', code: 'KT' },
          major: { _id: '3', name: 'Quản trị Kinh doanh', code: 'QTKD' },
          className: '20DTHB01',
          academicYear: '2020',
          status: 'ACTIVE',
          gpa: 3.92
        },
        {
          _id: '4',
          studentId: '518H0001',
          fullName: 'Hoàng Văn D',
          email: '518h0001@student.tdtu.edu.vn',
          phone: '0904567890',
          faculty: { _id: '1', name: 'Khoa Công nghệ Thông tin', code: 'CNTT' },
          major: { _id: '1', name: 'Công nghệ Phần mềm', code: 'CNPM' },
          className: '18DTHB01',
          academicYear: '2018',
          status: 'GRADUATED',
          gpa: 3.55
        },
        {
          _id: '5',
          studentId: '519H0003',
          fullName: 'Phạm Thị E',
          email: '519h0003@student.tdtu.edu.vn',
          phone: '0905678901',
          faculty: { _id: '3', name: 'Khoa Kỹ thuật', code: 'KT' },
          major: { _id: '4', name: 'Kỹ thuật Cơ khí', code: 'KTCK' },
          className: '19DTHB02',
          academicYear: '2019',
          status: 'TEMPORARY_LEAVE',
          gpa: 3.20
        }
      ]);

      // Mock dormitory students data
      setDormitoryStudents([
        {
          _id: 'd1',
          studentId: '519H0101',
          fullName: 'Nguyễn Văn F',
          email: '519h0101@student.tdtu.edu.vn',
          phone: '0906789012',
          faculty: { _id: '1', name: 'Khoa Công nghệ Thông tin', code: 'CNTT' },
          major: { _id: '1', name: 'Công nghệ Phần mềm', code: 'CNPM' },
          room: { _id: 'A101', name: 'A101', building: 'Tòa A' },
          academicYear: '2019',
          status: 'ACTIVE'
        },
        {
          _id: 'd2',
          studentId: '520H0102',
          fullName: 'Trần Văn G',
          email: '520h0102@student.tdtu.edu.vn',
          phone: '0907890123',
          faculty: { _id: '1', name: 'Khoa Công nghệ Thông tin', code: 'CNTT' },
          major: { _id: '2', name: 'Khoa học Máy tính', code: 'KHMT' },
          room: { _id: 'A102', name: 'A102', building: 'Tòa A' },
          academicYear: '2020',
          status: 'ACTIVE'
        },
        {
          _id: 'd3',
          studentId: '518H0103',
          fullName: 'Lê Thị H',
          email: '518h0103@student.tdtu.edu.vn',
          phone: '0908901234',
          faculty: { _id: '2', name: 'Khoa Kinh tế', code: 'KT' },
          major: { _id: '3', name: 'Quản trị Kinh doanh', code: 'QTKD' },
          room: { _id: 'B201', name: 'B201', building: 'Tòa B' },
          academicYear: '2018',
          status: 'ACTIVE'
        },
        {
          _id: 'd4',
          studentId: '519H0104',
          fullName: 'Phạm Văn I',
          email: '519h0104@student.tdtu.edu.vn',
          phone: '0909012345',
          faculty: { _id: '3', name: 'Khoa Kỹ thuật', code: 'KT' },
          major: { _id: '4', name: 'Kỹ thuật Cơ khí', code: 'KTCK' },
          room: { _id: 'B202', name: 'B202', building: 'Tòa B' },
          academicYear: '2019',
          status: 'ACTIVE'
        }
      ]);

      // Mock rooms data
      setRooms([
        { _id: 'A101', name: 'A101', building: 'Tòa A' },
        { _id: 'A102', name: 'A102', building: 'Tòa A' },
        { _id: 'B201', name: 'B201', building: 'Tòa B' },
        { _id: 'B202', name: 'B202', building: 'Tòa B' },
        { _id: 'C301', name: 'C301', building: 'Tòa C' },
        { _id: 'C302', name: 'C302', building: 'Tòa C' }
      ]);

      setIsLoading(false);
    }, 500);
  }, []);

  // Student status configuration
  const studentStatuses = [
    { value: 'ACTIVE', label: 'Đang học', color: 'status-active' },
    { value: 'INACTIVE', label: 'Không hoạt động', color: 'status-inactive' },
    { value: 'GRADUATED', label: 'Đã tốt nghiệp', color: 'status-graduated' },
    { value: 'SUSPENDED', label: 'Đình chỉ', color: 'status-suspended' },
    { value: 'DROPPED', label: 'Thôi học', color: 'status-dropped' },
    { value: 'TEMPORARY_LEAVE', label: 'Tạm nghỉ', color: 'status-leave' }
  ];

  // Get status info
  const getStatusInfo = (status) => {
    const statusObj = studentStatuses.find(s => s.value === status);
    return statusObj || { label: status, color: 'status-active' };
  };

  // Filter majors based on selected faculty
  const filteredMajorsByFaculty = useMemo(() => {
    if (filterFaculty === 'all') return majors;
    return majors.filter(major => major.faculty === filterFaculty);
  }, [majors, filterFaculty]);

  // Filter and search students based on active tab
  const filteredStudents = useMemo(() => {
    const dataSource = activeTab === 'students' ? students : dormitoryStudents;
    
    return dataSource.filter(student => {
      const matchesSearch =
        student.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.studentId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.email.toLowerCase().includes(searchTerm.toLowerCase());

      // For dormitory students, filter by room instead of faculty/major
      if (activeTab === 'dormitory') {
        const matchesRoom = filterRoom === 'all' || student.room._id === filterRoom;
        return matchesSearch && matchesRoom;
      }

      // For regular students, use faculty/major/status/year filters
      const matchesFaculty = filterFaculty === 'all' || student.faculty._id === filterFaculty;
      const matchesMajor = filterMajor === 'all' || student.major._id === filterMajor;
      const matchesStatus = filterStatus === 'all' || student.status === filterStatus;
      const matchesYear = filterYear === 'all' || student.academicYear === filterYear;

      return matchesSearch && matchesFaculty && matchesMajor && matchesStatus && matchesYear;
    });
  }, [activeTab, students, dormitoryStudents, searchTerm, filterFaculty, filterMajor, filterStatus, filterYear, filterRoom]);

  // Pagination
  const paginatedStudents = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    return filteredStudents.slice(startIndex, endIndex);
  }, [filteredStudents, currentPage, pageSize]);

  const totalPages = Math.ceil(filteredStudents.length / pageSize);

  // Get unique academic years
  const academicYears = useMemo(() => {
    return [...new Set(students.map(s => s.academicYear))].sort((a, b) => b.localeCompare(a));
  }, [students]);

  // Statistics
  const stats = useMemo(() => {
    return {
      total: filteredStudents.length,
      active: filteredStudents.filter(s => s.status === 'ACTIVE').length,
      graduated: filteredStudents.filter(s => s.status === 'GRADUATED').length,
      avgGpa: filteredStudents.length > 0
        ? (filteredStudents.reduce((sum, s) => sum + s.gpa, 0) / filteredStudents.length).toFixed(2)
        : '0.00'
    };
  }, [filteredStudents]);

  // Handlers
  const handleSearch = (value) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  const handleFilterChange = (filterType, value) => {
    if (filterType === 'faculty') {
      setFilterFaculty(value);
      setFilterMajor('all'); // Reset major filter when faculty changes
    } else if (filterType === 'major') {
      setFilterMajor(value);
    } else if (filterType === 'status') {
      setFilterStatus(value);
    } else if (filterType === 'year') {
      setFilterYear(value);
    }
    setCurrentPage(1);
  };

  const handleViewDetail = (student) => {
    setSelectedStudent(student);
    setShowDetailModal(true);
  };

  const handleAddStudent = () => {
    // TODO: Navigate to add student page or open modal
    alert('Chức năng thêm sinh viên - Sẽ mở form thêm sinh viên');
  };

  const handleEditStudent = (student) => {
    // TODO: Navigate to edit page or open modal
    alert(`Chỉnh sửa sinh viên: ${student.fullName}`);
  };

  const handleImportCSV = () => {
    // TODO: Implement CSV import
    alert('Chức năng Import CSV - Sẽ mở dialog chọn file CSV');
  };

  // Checkbox handlers
  const handleSelectAll = (e) => {
    if (e.target.checked) {
      const allIds = paginatedStudents.map(student => student._id);
      setSelectedStudentIds(allIds);
    } else {
      setSelectedStudentIds([]);
    }
  };

  const handleSelectStudent = (studentId) => {
    setSelectedStudentIds(prev => {
      if (prev.includes(studentId)) {
        return prev.filter(id => id !== studentId);
      } else {
        return [...prev, studentId];
      }
    });
  };

  const handleDeleteSelected = () => {
    if (window.confirm(`Bạn có chắc muốn xóa ${selectedStudentIds.length} sinh viên đã chọn?`)) {
      // TODO: Implement delete API call
      alert(`Xóa ${selectedStudentIds.length} sinh viên`);
      setSelectedStudentIds([]);
    }
  };

  const handleExport = () => {
    // TODO: Implement export functionality
    alert('Xuất danh sách sinh viên ra file Excel/CSV');
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  if (isLoading) {
    return (
      <div className="student-management-loading">
        <div className="loading-spinner"></div>
        <p>Đang tải danh sách sinh viên...</p>
      </div>
    );
  }

  return (
    <div className="student-management">
      {/* Header */}
      <div className="student-header">
        <div className="header-content">
          <div>
            <h1 className="page-title">Quản lý Sinh viên</h1>
            <p className="page-subtitle">Quản lý thông tin và hồ sơ sinh viên</p>
          </div>
          <div className="header-actions">
            <button className="btn btn-outline" onClick={handleImportCSV}>
              <span className="btn-icon">📥</span>
              Import CSV
            </button>
            <button className="btn btn-outline" onClick={handleExport}>
              <span className="btn-icon">📤</span>
              Xuất file
            </button>
            <button className="btn btn-primary" onClick={handleAddStudent}>
              <span className="btn-icon">+</span>
              Thêm sinh viên
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="tabs-container">
        <div className="tabs">
          <button
            className={`tab ${activeTab === 'students' ? 'active' : ''}`}
            onClick={() => {
              setActiveTab('students');
              setSearchTerm('');
              setFilterRoom('all');
              setCurrentPage(1);
              setSelectedStudentIds([]);
            }}
          >
            <span className="tab-icon">👨‍🎓</span>
            <span className="tab-text">Sinh viên</span>
            <span className="tab-badge">{students.length}</span>
          </button>
          <button
            className={`tab ${activeTab === 'dormitory' ? 'active' : ''}`}
            onClick={() => {
              setActiveTab('dormitory');
              setSearchTerm('');
              setFilterFaculty('all');
              setFilterMajor('all');
              setFilterStatus('all');
              setFilterYear('all');
              setCurrentPage(1);
              setSelectedStudentIds([]);
            }}
          >
            <span className="tab-icon">🏢</span>
            <span className="tab-text">Sinh viên KTX</span>
            <span className="tab-badge">{dormitoryStudents.length}</span>
          </button>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="filters-section">
        <div className="search-and-filters">
          <div className="search-box">
            <span className="search-icon">🔍</span>
            <input
              type="text"
              placeholder="Tìm kiếm theo tên, MSSV, email..."
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              className="search-input"
            />
          </div>
          <div className="filters-grid">
            {activeTab === 'students' ? (
              <>
                <select
                  value={filterFaculty}
                  onChange={(e) => handleFilterChange('faculty', e.target.value)}
                  className="filter-select"
                >
                  <option value="all">Tất cả khoa</option>
                  {faculties.map(faculty => (
                    <option key={faculty._id} value={faculty._id}>
                      {faculty.name}
                    </option>
                  ))}
                </select>
                <select
                  value={filterMajor}
                  onChange={(e) => handleFilterChange('major', e.target.value)}
                  className="filter-select"
                  disabled={filterFaculty === 'all'}
                >
                  <option value="all">Tất cả chuyên ngành</option>
                  {filteredMajorsByFaculty.map(major => (
                    <option key={major._id} value={major._id}>
                      {major.name}
                    </option>
                  ))}
                </select>
              </>
            ) : (
              <select
                value={filterRoom}
                onChange={(e) => setFilterRoom(e.target.value)}
                className="filter-select"
              >
                <option value="all">Tất cả phòng</option>
                {rooms.map(room => (
                  <option key={room._id} value={room._id}>
                    Phòng {room.name} - {room.building}
                  </option>
                ))}
              </select>
            )}
          </div>
        </div>
      </div>

      {/* Students Table */}
      <div className="table-section">
        <div className="table-header-row">
          <div className="table-title-wrapper">
            <h3 className="table-title">Danh sách sinh viên</h3>
            {selectedStudentIds.length > 0 && (
              <button 
                className="btn-delete-selected"
                onClick={handleDeleteSelected}
                title={`Xóa ${selectedStudentIds.length} sinh viên đã chọn`}
              >
                <span className="delete-icon">🗑️</span>
                <span className="delete-count">{selectedStudentIds.length}</span>
              </button>
            )}
          </div>
          <div className="table-info">
            Hiển thị {paginatedStudents.length} / {filteredStudents.length} sinh viên
          </div>
        </div>

        <div className="table-container">
          {filteredStudents.length === 0 ? (
            <div className="no-data">
              <div className="no-data-icon">📭</div>
              <p>Không tìm thấy sinh viên nào</p>
            </div>
          ) : (
            <table className="students-table">
              <thead>
                <tr>
                  <th className="checkbox-cell">
                    <input
                      type="checkbox"
                      onChange={handleSelectAll}
                      checked={selectedStudentIds.length === paginatedStudents.length && paginatedStudents.length > 0}
                    />
                  </th>
                  <th>MSSV</th>
                  <th>Họ và tên</th>
                  <th>Email</th>
                  <th>Khoa</th>
                  <th>Chuyên ngành</th>
                  {activeTab === 'dormitory' && <th>Phòng</th>}
                  <th>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {paginatedStudents.map((student) => (
                  <tr key={student._id}>
                    <td className="checkbox-cell">
                      <input
                        type="checkbox"
                        checked={selectedStudentIds.includes(student._id)}
                        onChange={() => handleSelectStudent(student._id)}
                      />
                    </td>
                    <td><strong className="student-id">{student.studentId}</strong></td>
                    <td>{student.fullName}</td>
                    <td className="email-cell">{student.email}</td>
                    <td>
                      <span className="faculty-badge">{student.faculty.code}</span>
                    </td>
                    <td>{student.major.name}</td>
                    {activeTab === 'dormitory' && (
                      <td>
                        <span className="room-badge">{student.room.name}</span>
                      </td>
                    )}
                    <td>
                      <div className="action-buttons">
                        <button
                          className="btn-action btn-view"
                          onClick={() => handleViewDetail(student)}
                          title="Xem chi tiết"
                        >
                          👁️
                        </button>
                        <button
                          className="btn-action btn-edit"
                          onClick={() => handleEditStudent(student)}
                          title="Chỉnh sửa"
                        >
                          ✏️
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="pagination">
            <div className="pagination-info">
              Trang {currentPage} / {totalPages}
            </div>
            <div className="pagination-controls">
              <button
                className="pagination-btn"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
              >
                ← Trước
              </button>
              {[...Array(totalPages)].map((_, index) => {
                const page = index + 1;
                if (
                  page === 1 ||
                  page === totalPages ||
                  (page >= currentPage - 1 && page <= currentPage + 1)
                ) {
                  return (
                    <button
                      key={page}
                      className={`pagination-btn ${page === currentPage ? 'active' : ''}`}
                      onClick={() => handlePageChange(page)}
                    >
                      {page}
                    </button>
                  );
                } else if (page === currentPage - 2 || page === currentPage + 2) {
                  return <span key={page} className="pagination-ellipsis">...</span>;
                }
                return null;
              })}
              <button
                className="pagination-btn"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                Sau →
              </button>
            </div>
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="page-size-select"
            >
              <option value="10">10 / trang</option>
              <option value="25">25 / trang</option>
              <option value="50">50 / trang</option>
              <option value="100">100 / trang</option>
            </select>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {showDetailModal && selectedStudent && (
        <div className="modal-overlay" onClick={() => setShowDetailModal(false)}>
          <div className="modal modal-large" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Thông tin sinh viên</h2>
              <button className="close-btn" onClick={() => setShowDetailModal(false)}>×</button>
            </div>

            <div className="modal-content">
              <div className="student-detail-grid">
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
                    <strong>{selectedStudent.email}</strong>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Số điện thoại:</span>
                    <strong>{selectedStudent.phone}</strong>
                  </div>
                </div>

                <div className="detail-section">
                  <h3 className="section-title">Thông tin học tập</h3>
                  <div className="detail-row">
                    <span className="detail-label">Khoa:</span>
                    <strong>{selectedStudent.faculty.name}</strong>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Chuyên ngành:</span>
                    <strong>{selectedStudent.major.name}</strong>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Lớp:</span>
                    <strong>{selectedStudent.className}</strong>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Khóa học:</span>
                    <strong>{selectedStudent.academicYear}</strong>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">GPA:</span>
                    <strong className="text-primary">{selectedStudent.gpa.toFixed(2)}</strong>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Trạng thái:</span>
                    <span className={`status-badge ${getStatusInfo(selectedStudent.status).color}`}>
                      {getStatusInfo(selectedStudent.status).label}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn btn-outline" onClick={() => setShowDetailModal(false)}>
                Đóng
              </button>
              <button className="btn btn-primary" onClick={() => handleEditStudent(selectedStudent)}>
                Chỉnh sửa
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentManagement;

