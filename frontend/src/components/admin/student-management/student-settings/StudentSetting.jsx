import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
//import * as XLSX from 'xlsx';
import './StudentSetting.css';

const StudentSetting = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  const students = useMemo(() => [
    { id: 'S001', name: 'Nguyễn Văn An', email: 'an.nguyen@student.unihelper.edu.vn', faculty: 'CNTT', major: 'Kỹ thuật phần mềm', studentId: 'SV2024001', status: 'ACTIVE' },
    { id: 'S002', name: 'Phạm Thảo Vy', email: 'vy.pham@student.unihelper.edu.vn', faculty: 'Kinh tế', major: 'Marketing', studentId: 'SV2024002', status: 'INACTIVE' },
    { id: 'S003', name: 'Lê Minh Hoàng', email: 'minh.le@student.unihelper.edu.vn', faculty: 'CNTT', major: 'Trí tuệ nhân tạo', studentId: 'SV2024003', status: 'GRADUATED' },
    { id: 'S004', name: 'Trần Đức Huy', email: 'huy.tran@student.unihelper.edu.vn', faculty: 'CNTT', major: 'Hệ thống thông tin', studentId: 'SV2024004', status: 'SUSPENDED' },
  ], []);

  const filteredStudents = students.filter(student => {
    const matchesSearch = student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          student.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || student.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  //  Thống kê
  const total = students.length;
  const activeCount = students.filter(s => s.status === 'ACTIVE').length;
  const inactiveCount = students.filter(s => s.status === 'INACTIVE').length;
  const graduatedCount = students.filter(s => s.status === 'GRADUATED').length;
  const suspendedCount = students.filter(s => s.status === 'SUSPENDED').length;

  const getStatusClass = (status) => {
    switch (status) {
      case 'ACTIVE': return 'status-active';
      case 'INACTIVE': return 'status-inactive';
      case 'GRADUATED': return 'status-graduated';
      case 'SUSPENDED': return 'status-suspended';
      default: return '';
    }
  };

  // Xuất Excel
  const handleExportExcel = () => {
    const exportData = students.map(s => ({
      'Mã SV': s.studentId,
      'Họ và tên': s.name,
      'Email': s.email,
      'Khoa': s.faculty,
      'Ngành': s.major,
      'Trạng thái': s.status,
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Danh sách sinh viên');

    XLSX.writeFile(workbook, 'student_list.xlsx');
  };

  return (
    <div className="student-management">
      {/* Header */}
      <div className="header">
        <div className="header-left">
          <h1>Quản lý sinh viên</h1>
          <p>Danh sách sinh viên trong hệ thống</p>
        </div>

        <div className="header-right">
          <button className="btn-export" onClick={handleExportExcel}>📤 Xuất danh sách</button>
          <button className="btn-add" onClick={() => navigate('../student-management/add-student')}>➕ Thêm sinh viên</button>
        </div>
      </div>

      {/* Bộ lọc */}
      <div className="filters">
        <input
          type="text"
          placeholder="Tìm kiếm theo tên hoặc email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="filter-select"
        >
          <option value="all">Tất cả trạng thái</option>
          <option value="ACTIVE">Hoạt động</option>
          <option value="INACTIVE">Không hoạt động</option>
          <option value="GRADUATED">Đã tốt nghiệp</option>
          <option value="SUSPENDED">Đình chỉ</option>
        </select>
      </div>

      {/* Thống kê */}
      <div className="summary-box">
        <div className="summary-item total">👥 Tổng sinh viên: <span>{total}</span></div>
        <div className="summary-item active">🟢 Hoạt động: <span>{activeCount}</span></div>
        <div className="summary-item inactive">🔴 Không hoạt động: <span>{inactiveCount}</span></div>
        <div className="summary-item graduated">🎓 Tốt nghiệp: <span>{graduatedCount}</span></div>
        <div className="summary-item suspended">⛔ Đình chỉ: <span>{suspendedCount}</span></div>
      </div>

      {/* Bảng sinh viên */}
      <div className="table-container">
        <table className="students-table">
          <thead>
            <tr>
              <th>Mã SV</th>
              <th>Họ tên</th>
              <th>Email</th>
              <th>Khoa</th>
              <th>Ngành</th>
              <th>Trạng thái</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {filteredStudents.map(student => (
              <tr key={student.id}>
                <td>{student.studentId}</td>
                <td>{student.name}</td>
                <td>{student.email}</td>
                <td>{student.faculty}</td>
                <td>{student.major}</td>
                <td>
                  <span className={`status-badge ${getStatusClass(student.status)}`}>
                    {student.status}
                  </span>
                </td>
                <td>
                  <button className="btn-small primary">Chỉnh sửa</button>
                  <button className="btn-small danger">🗑️</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default StudentSetting;
