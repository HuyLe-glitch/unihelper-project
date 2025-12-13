import React, { useState, useMemo } from 'react';
import { Search, Plus, Edit2, Users, Eye, EyeOff, GraduationCap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import './MajorList.css';

// Mock data cho Faculty
const mockFaculties = [
  { _id: '1', name: 'Khoa Công nghệ Thông tin', code: 'CNTT' },
  { _id: '2', name: 'Khoa Kinh tế', code: 'KT' },
  { _id: '3', name: 'Khoa Kỹ thuật', code: 'KT' },
  { _id: '4', name: 'Khoa Ngoại ngữ', code: 'NN' },
  { _id: '5', name: 'Khoa Khoa học Tự nhiên', code: 'KHTN' }
];

// Mock data dựa theo Major model
const initialMajors = [
  {
    _id: '1',
    name: 'Công nghệ Phần mềm',
    code: 'CNPM',
    faculty: { _id: '1', name: 'Khoa Công nghệ Thông tin', code: 'CNTT' },
    description: 'Đào tạo kỹ sư phần mềm, phát triển ứng dụng, hệ thống thông tin',
    isActive: true,
    studentCount: 120,
    createdAt: '2024-01-15T08:00:00Z',
    updatedAt: '2024-01-15T08:00:00Z'
  },
  {
    _id: '2',
    name: 'Khoa học Máy tính',
    code: 'KHMT',
    faculty: { _id: '1', name: 'Khoa Công nghệ Thông tin', code: 'CNTT' },
    description: 'Đào tạo về thuật toán, trí tuệ nhân tạo, học máy, khoa học dữ liệu',
    isActive: true,
    studentCount: 95,
    createdAt: '2024-01-16T08:00:00Z',
    updatedAt: '2024-01-16T08:00:00Z'
  },
  {
    _id: '3',
    name: 'Mạng máy tính và Truyền thông',
    code: 'MMT',
    faculty: { _id: '1', name: 'Khoa Công nghệ Thông tin', code: 'CNTT' },
    description: 'Đào tạo về mạng máy tính, an ninh mạng, hệ thống truyền thông',
    isActive: true,
    studentCount: 78,
    createdAt: '2024-01-17T08:00:00Z',
    updatedAt: '2024-01-17T08:00:00Z'
  },
  {
    _id: '4',
    name: 'Quản trị Kinh doanh',
    code: 'QTKD',
    faculty: { _id: '2', name: 'Khoa Kinh tế', code: 'KT' },
    description: 'Đào tạo về quản lý doanh nghiệp, marketing, nguồn nhân lực',
    isActive: true,
    studentCount: 150,
    createdAt: '2024-01-18T08:00:00Z',
    updatedAt: '2024-01-18T08:00:00Z'
  },
  {
    _id: '5',
    name: 'Tài chính - Ngân hàng',
    code: 'TCNH',
    faculty: { _id: '2', name: 'Khoa Kinh tế', code: 'KT' },
    description: 'Đào tạo về tài chính, ngân hàng, đầu tư, chứng khoán',
    isActive: false,
    studentCount: 85,
    createdAt: '2024-01-19T08:00:00Z',
    updatedAt: '2024-01-19T08:00:00Z'
  },
  {
    _id: '6',
    name: 'Kỹ thuật Cơ khí',
    code: 'KTCK',
    faculty: { _id: '3', name: 'Khoa Kỹ thuật', code: 'KT' },
    description: 'Đào tạo về thiết kế, chế tạo máy, công nghệ cơ khí',
    isActive: true,
    studentCount: 110,
    createdAt: '2024-01-20T08:00:00Z',
    updatedAt: '2024-01-20T08:00:00Z'
  },
  {
    _id: '7',
    name: 'Kỹ thuật Điện - Điện tử',
    code: 'KTDDT',
    faculty: { _id: '3', name: 'Khoa Kỹ thuật', code: 'KT' },
    description: 'Đào tạo về điện công nghiệp, điện tử viễn thông, tự động hóa',
    isActive: true,
    studentCount: 92,
    createdAt: '2024-01-21T08:00:00Z',
    updatedAt: '2024-01-21T08:00:00Z'
  },
  {
    _id: '8',
    name: 'Ngôn ngữ Anh',
    code: 'NNA',
    faculty: { _id: '4', name: 'Khoa Ngoại ngữ', code: 'NN' },
    description: 'Đào tạo giáo viên tiếng Anh, biên phiên dịch',
    isActive: false,
    studentCount: 65,
    createdAt: '2024-01-22T08:00:00Z',
    updatedAt: '2024-01-22T08:00:00Z'
  }
];

const MajorList = () => {
  const [majors, setMajors] = useState(initialMajors);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterFaculty, setFilterFaculty] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const navigate = useNavigate(); 

  // Filter và search
  const filteredMajors = useMemo(() => {
    return majors.filter(major => {
      const matchSearch = major.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         major.code.toLowerCase().includes(searchTerm.toLowerCase());
      const matchFaculty = filterFaculty === 'all' || major.faculty._id === filterFaculty;
      const matchStatus = filterStatus === 'all' || 
                         (filterStatus === 'active' && major.isActive) ||
                         (filterStatus === 'inactive' && !major.isActive);
      return matchSearch && matchFaculty && matchStatus;
    });
  }, [majors, searchTerm, filterFaculty, filterStatus]);

  // Statistics
  const stats = useMemo(() => {
    return {
      total: majors.length,
      active: majors.filter(m => m.isActive).length,
      inactive: majors.filter(m => !m.isActive).length,
      totalStudents: majors.reduce((sum, m) => sum + m.studentCount, 0)
    };
  }, [majors]);

  // Handlers
  const handleAddMajor = () => {
    // TODO: Navigate to AddMajor page
    // Example: navigate('/major/add');
    alert('Chuyển đến trang thêm chuyên ngành mới');
    navigate('add');
  };

  const handleEditMajor = (major) => {
    // TODO: Navigate to EditMajor page with major id
    // Example: navigate(`/major/edit/${major._id}`);
    alert(`Chuyển đến trang chỉnh sửa chuyên ngành: ${major.name}`);
    navigate('edit');
  };

  const handleViewStudents = (major) => {
    // TODO: Navigate to Students page filtered by major
    // Example: navigate(`/students?major=${major._id}`);
    alert(`Xem danh sách sinh viên của chuyên ngành: ${major.name}\n(Chức năng liên kết tới trang Students)`);
  };

  const handleToggleStatus = (major) => {
    setMajors(majors.map(m => 
      m._id === major._id 
        ? { ...m, isActive: !m.isActive, updatedAt: new Date().toISOString() }
        : m
    ));
  };

  return (
    <div className="major-container">
      <div className="major-wrapper">
        {/* Header */}
        <div className="major-header">
          <div className="header-content">
            <div className="header-text">
              <h1 className="header-title">Quản lý Chuyên ngành</h1>
              <p className="header-subtitle">Quản lý thông tin các chuyên ngành đào tạo</p>
            </div>
            <button onClick={handleAddMajor} className="btn-add">
              <Plus size={20} />
              Thêm chuyên ngành mới
            </button>
          </div>

          {/* Search and Filter */}
          <div className="search-filter-container">
            <div className="search-box">
              <Search className="search-icon" size={20} />
              <input
                type="text"
                placeholder="Tìm kiếm theo tên hoặc mã chuyên ngành..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
            </div>
            <select
              value={filterFaculty}
              onChange={(e) => setFilterFaculty(e.target.value)}
              className="filter-select"
            >
              <option value="all">Tất cả khoa</option>
              {mockFaculties.map(faculty => (
                <option key={faculty._id} value={faculty._id}>
                  {faculty.name}
                </option>
              ))}
            </select>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="filter-select"
            >
              <option value="all">Tất cả trạng thái</option>
              <option value="active">Đang hoạt động</option>
              <option value="inactive">Ngừng hoạt động</option>
            </select>
          </div>
        </div>

        {/* Statistics */}
        <div className="statistics-grid">
          <div className="stat-card">
            <div className="stat-content">
              <div className="stat-info">
                <p className="stat-label">Tổng chuyên ngành</p>
                <p className="stat-value">{stats.total}</p>
              </div>
              <div className="stat-icon stat-icon-blue">
                <GraduationCap size={24} />
              </div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-content">
              <div className="stat-info">
                <p className="stat-label">Đang hoạt động</p>
                <p className="stat-value stat-value-green">{stats.active}</p>
              </div>
              <div className="stat-icon stat-icon-green">
                <Eye size={24} />
              </div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-content">
              <div className="stat-info">
                <p className="stat-label">Ngừng hoạt động</p>
                <p className="stat-value stat-value-red">{stats.inactive}</p>
              </div>
              <div className="stat-icon stat-icon-red">
                <EyeOff size={24} />
              </div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-content">
              <div className="stat-info">
                <p className="stat-label">Tổng sinh viên</p>
                <p className="stat-value stat-value-purple">{stats.totalStudents}</p>
              </div>
              <div className="stat-icon stat-icon-purple">
                <Users size={24} />
              </div>
            </div>
          </div>
        </div>

        {/* Major List */}
        <div className="major-table-container">
          <div className="table-scroll">
            <table className="major-table">
              <thead className="table-header">
                <tr>
                  <th className="table-th">Mã</th>
                  <th className="table-th">Tên chuyên ngành</th>
                  <th className="table-th">Khoa</th>
                  <th className="table-th">Mô tả</th>
                  <th className="table-th">Sinh viên</th>
                  <th className="table-th">Trạng thái</th>
                  <th className="table-th table-th-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="table-body">
                {filteredMajors.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="table-empty">
                      Không tìm thấy chuyên ngành nào
                    </td>
                  </tr>
                ) : (
                  filteredMajors.map(major => (
                    <tr key={major._id} className="table-row">
                      <td className="table-td">
                        <span className="major-code">{major.code}</span>
                      </td>
                      <td className="table-td">
                        <span className="major-name">{major.name}</span>
                      </td>
                      <td className="table-td">
                        <div className="faculty-badge">
                          <span className="faculty-code">{major.faculty.code}</span>
                          <span className="faculty-name">{major.faculty.name}</span>
                        </div>
                      </td>
                      <td className="table-td">
                        <span className="major-description">
                          {major.description || 'Chưa có mô tả'}
                        </span>
                      </td>
                      <td className="table-td">
                        <button
                          onClick={() => handleViewStudents(major)}
                          className="student-count-btn"
                        >
                          <Users size={16} />
                          {major.studentCount}
                        </button>
                      </td>
                      <td className="table-td">
                        <button
                          onClick={() => handleToggleStatus(major)}
                          className={`status-badge ${major.isActive ? 'status-active' : 'status-inactive'}`}
                        >
                          {major.isActive ? (
                            <>
                              <Eye size={14} />
                              Hoạt động
                            </>
                          ) : (
                            <>
                              <EyeOff size={14} />
                              Ngừng
                            </>
                          )}
                        </button>
                      </td>
                      <td className="table-td">
                        <div className="action-buttons">
                          <button
                            onClick={() => handleEditMajor(major)}
                            className="btn-action btn-edit"
                            title="Chỉnh sửa"
                          >
                            <Edit2 size={18} />
                          </button>
                          <button
                            onClick={() => handleViewStudents(major)}
                            className="btn-action btn-view"
                            title="Xem sinh viên"
                          >
                            <Users size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MajorList;