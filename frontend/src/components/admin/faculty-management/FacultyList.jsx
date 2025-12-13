import React, { useState, useMemo } from 'react';
import { Search, Plus, Edit2, Trash2, Eye, EyeOff, BookOpen } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import './FacultyList.css';

// Mock data dựa theo Faculty model
const initialFaculties = [
  {
    _id: '1',
    name: 'Khoa Công nghệ Thông tin',
    code: 'CNTT',
    description: 'Đào tạo các chuyên ngành về công nghệ thông tin, phần mềm, mạng máy tính',
    isActive: true,
    majorCount: 5,
    createdAt: '2024-01-15T08:00:00Z',
    updatedAt: '2024-01-15T08:00:00Z'
  },
  {
    _id: '2',
    name: 'Khoa Kinh tế',
    code: 'KT',
    description: 'Đào tạo các chuyên ngành kinh tế, quản trị kinh doanh, tài chính',
    isActive: true,
    majorCount: 4,
    createdAt: '2024-01-16T08:00:00Z',
    updatedAt: '2024-01-16T08:00:00Z'
  },
  {
    _id: '3',
    name: 'Khoa Kỹ thuật',
    code: 'KT',
    description: 'Đào tạo các chuyên ngành kỹ thuật cơ khí, điện, tự động hóa',
    isActive: true,
    majorCount: 6,
    createdAt: '2024-01-17T08:00:00Z',
    updatedAt: '2024-01-17T08:00:00Z'
  },
  {
    _id: '4',
    name: 'Khoa Ngoại ngữ',
    code: 'NN',
    description: 'Đào tạo các chuyên ngành tiếng Anh, tiếng Nhật, tiếng Trung',
    isActive: false,
    majorCount: 3,
    createdAt: '2024-01-18T08:00:00Z',
    updatedAt: '2024-01-18T08:00:00Z'
  },
  {
    _id: '5',
    name: 'Khoa Khoa học Tự nhiên',
    code: 'KHTN',
    description: 'Đào tạo các chuyên ngành toán học, vật lý, hóa học, sinh học',
    isActive: true,
    majorCount: 4,
    createdAt: '2024-01-19T08:00:00Z',
    updatedAt: '2024-01-19T08:00:00Z'
  }
];

const FacultyList = () => {
  const [faculties, setFaculties] = useState(initialFaculties);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const navigate = useNavigate();

  // Filter và search
  const filteredFaculties = useMemo(() => {
    return faculties.filter(faculty => {
      const matchSearch = faculty.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         faculty.code.toLowerCase().includes(searchTerm.toLowerCase());
      const matchStatus = filterStatus === 'all' || 
                         (filterStatus === 'active' && faculty.isActive) ||
                         (filterStatus === 'inactive' && !faculty.isActive);
      return matchSearch && matchStatus;
    });
  }, [faculties, searchTerm, filterStatus]);

  // Handlers
  const handleAddFaculty = () => {
    alert('Chuyển đến trang thêm khoa mới');
    navigate('add');
  };

  const handleEditFaculty = (faculty) => {
    // TODO: Navigate to EditFaculty page with faculty id
    // Example: navigate(`/faculty/edit/${faculty._id}`);
    alert('Chuyển đến trang chỉnh sửa khoa: ${faculty.name}');
    navigate('edit');
  };

  const handleToggleStatus = (faculty) => {
    setFaculties(faculties.map(f => 
      f._id === faculty._id 
        ? { ...f, isActive: !f.isActive, updatedAt: new Date().toISOString() }
        : f
    ));
  };

  const handleViewMajors = (faculty) => {
    // TODO: Navigate to Majors page filtered by faculty
    // Example: navigate(`/majors?faculty=${faculty._id}`);
    alert(`Xem chuyên ngành của khoa: ${faculty.name}\n(Chức năng liên kết tới trang Majors)`);
  };

  return (
    <div className="faculty-container">
      <div className="faculty-wrapper">
        {/* Header */}
        <div className="faculty-header">
          <div className="header-content">
            <div className="header-text">
              <h1 className="header-title">Quản lý Khoa</h1>
              <p className="header-subtitle">Quản lý thông tin các khoa trong trường</p>
            </div>
            <button onClick={handleAddFaculty} className="btn-add">
              <Plus size={20} />
              Thêm khoa mới
            </button>
          </div>

          {/* Search and Filter */}
          <div className="search-filter-container">
            <div className="search-box">
              <Search className="search-icon" size={20} />
              <input
                type="text"
                placeholder="Tìm kiếm theo tên hoặc mã khoa..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
            </div>
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
                <p className="stat-label">Tổng số khoa</p>
                <p className="stat-value">{faculties.length}</p>
              </div>
              <div className="stat-icon stat-icon-blue">
                <BookOpen size={24} />
              </div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-content">
              <div className="stat-info">
                <p className="stat-label">Đang hoạt động</p>
                <p className="stat-value stat-value-green">
                  {faculties.filter(f => f.isActive).length}
                </p>
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
                <p className="stat-value stat-value-red">
                  {faculties.filter(f => !f.isActive).length}
                </p>
              </div>
              <div className="stat-icon stat-icon-red">
                <EyeOff size={24} />
              </div>
            </div>
          </div>
        </div>

        {/* Faculty List */}
        <div className="faculty-table-container">
          <div className="table-scroll">
            <table className="faculty-table">
              <thead className="table-header">
                <tr>
                  <th className="table-th">Mã khoa</th>
                  <th className="table-th">Tên khoa</th>
                  <th className="table-th">Mô tả</th>
                  <th className="table-th">Số chuyên ngành</th>
                  <th className="table-th">Trạng thái</th>
                  <th className="table-th table-th-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="table-body">
                {filteredFaculties.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="table-empty">
                      Không tìm thấy khoa nào
                    </td>
                  </tr>
                ) : (
                  filteredFaculties.map(faculty => (
                    <tr key={faculty._id} className="table-row">
                      <td className="table-td">
                        <span className="faculty-code">{faculty.code}</span>
                      </td>
                      <td className="table-td">
                        <span className="faculty-name">{faculty.name}</span>
                      </td>
                      <td className="table-td">
                        <span className="faculty-description">
                          {faculty.description || 'Chưa có mô tả'}
                        </span>
                      </td>
                      <td className="table-td">
                        <button
                          onClick={() => handleViewMajors(faculty)}
                          className="major-count-btn"
                        >
                          {faculty.majorCount} chuyên ngành
                        </button>
                      </td>
                      <td className="table-td">
                        <button
                          onClick={() => handleToggleStatus(faculty)}
                          className={`status-badge ${faculty.isActive ? 'status-active' : 'status-inactive'}`}
                        >
                          {faculty.isActive ? (
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
                            onClick={() => handleEditFaculty(faculty)}
                            className="btn-action btn-edit"
                            title="Chỉnh sửa"
                          >
                            <Edit2 size={18} />
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

export default FacultyList;