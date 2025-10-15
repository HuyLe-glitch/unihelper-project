import React, { useState, useMemo } from 'react';
import { Modal } from '../../common';
import './UserManagement.css';

const UserManagement = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');

  // Mock user data
  const users = useMemo(() => [
    {
      id: 'U001',
      name: 'Nguyễn Văn An',
      email: 'an.nguyen@student.unihelper.edu.vn',
      role: 'student',
      status: 'active',
      lastLogin: '2024-10-12 14:30',
      department: 'Computer Science',
      studentId: 'SV2024001'
    },
    {
      id: 'U002',
      name: 'Trần Thị Lan',
      email: 'lan.tran@staff.unihelper.edu.vn',
      role: 'staff',
      status: 'active',
      lastLogin: '2024-10-12 16:45',
      department: 'Student Affairs',
      employeeId: 'NV2024001'
    },
    {
      id: 'U003',
      name: 'Lê Hoàng Minh',
      email: 'minh.le@admin.unihelper.edu.vn',
      role: 'admin',
      status: 'active',
      lastLogin: '2024-10-12 18:20',
      department: 'IT Department',
      employeeId: 'AD2024001'
    },
    {
      id: 'U004',
      name: 'Phạm Thảo Vy',
      email: 'vy.pham@student.unihelper.edu.vn',
      role: 'student',
      status: 'inactive',
      lastLogin: '2024-10-10 09:15',
      department: 'Business Administration',
      studentId: 'SV2024002'
    }
  ], []);

  const getRoleText = (role) => {
    switch (role) {
      case 'student': return 'Sinh viên';
      case 'staff': return 'Nhân viên';
      case 'admin': return 'Quản trị viên';
      default: return role;
    }
  };

  const getStatusClass = (status) => {
    return status === 'active' ? 'status-active' : 'status-inactive';
  };

  const getRoleClass = (role) => {
    switch (role) {
      case 'student': return 'role-student';
      case 'staff': return 'role-staff';
      case 'admin': return 'role-admin';
      default: return '';
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = filterRole === 'all' || user.role === filterRole;
    return matchesSearch && matchesRole;
  });

  const handleUserClick = (user) => {
    setSelectedUser(user);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedUser(null);
  };

  const userStats = {
    total: users.length,
    students: users.filter(u => u.role === 'student').length,
    staff: users.filter(u => u.role === 'staff').length,
    admins: users.filter(u => u.role === 'admin').length,
    active: users.filter(u => u.status === 'active').length,
    inactive: users.filter(u => u.status === 'inactive').length
  };

  return (
    <div className="user-management">
      <div className="user-management__header">
        <div>
          <h1>Quản lý người dùng</h1>
          <p>Quản lý tài khoản sinh viên, nhân viên và quản trị viên</p>
        </div>
        <div className="user-management__header-actions">
          <button type="button" className="btn primary">Thêm người dùng</button>
          <button type="button" className="btn ghost">Xuất danh sách</button>
          <button type="button" className="btn secondary">Cài đặt quyền</button>
        </div>
      </div>

      {/* Stats Cards */}
      <section className="user-stats-grid">
        <div className="stat-card stat-card--primary">
          <div className="stat-icon">👥</div>
          <div className="stat-content">
            <h3>Tổng người dùng</h3>
            <div className="stat-number">{userStats.total}</div>
          </div>
        </div>
        <div className="stat-card stat-card--success">
          <div className="stat-icon">🎓</div>
          <div className="stat-content">
            <h3>Sinh viên</h3>
            <div className="stat-number">{userStats.students}</div>
          </div>
        </div>
        <div className="stat-card stat-card--warning">
          <div className="stat-icon">👨‍💼</div>
          <div className="stat-content">
            <h3>Nhân viên</h3>
            <div className="stat-number">{userStats.staff}</div>
          </div>
        </div>
        <div className="stat-card stat-card--danger">
          <div className="stat-icon">👑</div>
          <div className="stat-content">
            <h3>Quản trị viên</h3>
            <div className="stat-number">{userStats.admins}</div>
          </div>
        </div>
        <div className="stat-card stat-card--info">
          <div className="stat-icon">🟢</div>
          <div className="stat-content">
            <h3>Đang hoạt động</h3>
            <div className="stat-number">{userStats.active}</div>
          </div>
        </div>
        <div className="stat-card stat-card--secondary">
          <div className="stat-icon">🔴</div>
          <div className="stat-content">
            <h3>Không hoạt động</h3>
            <div className="stat-number">{userStats.inactive}</div>
          </div>
        </div>
      </section>

      {/* Filters and Search */}
      <section className="user-filters">
        <div className="search-box">
          <span className="search-icon">🔍</span>
          <input
            type="text"
            placeholder="Tìm kiếm theo tên hoặc email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
        <div className="filter-group">
          <label htmlFor="role-filter">Lọc theo vai trò:</label>
          <select
            id="role-filter"
            value={filterRole}
            onChange={(e) => setFilterRole(e.target.value)}
            className="filter-select"
          >
            <option value="all">Tất cả</option>
            <option value="student">Sinh viên</option>
            <option value="staff">Nhân viên</option>
            <option value="admin">Quản trị viên</option>
          </select>
        </div>
      </section>

      {/* Users Table */}
      <section className="users-table-container">
        <table className="users-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Họ tên</th>
              <th>Email</th>
              <th>Vai trò</th>
              <th>Trạng thái</th>
              <th>Phòng ban/Khoa</th>
              <th>Đăng nhập cuối</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map(user => (
              <tr key={user.id} onClick={() => handleUserClick(user)}>
                <td>{user.id}</td>
                <td>{user.name}</td>
                <td>{user.email}</td>
                <td>
                  <span className={`role-badge ${getRoleClass(user.role)}`}>
                    {getRoleText(user.role)}
                  </span>
                </td>
                <td>
                  <span className={`status ${getStatusClass(user.status)}`}>
                    {user.status === 'active' ? 'Hoạt động' : 'Không hoạt động'}
                  </span>
                </td>
                <td>{user.department}</td>
                <td>{user.lastLogin}</td>
                <td>
                  <button className="btn-small primary">Chỉnh sửa</button>
                  <button className="btn-small danger">Khóa</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {/* User Detail Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={`Chi tiết người dùng - ${selectedUser?.name || ''}`}
        size="large"
      >
        {selectedUser && (
          <div className="user-detail-modal">
            <div className="user-detail-grid">
              <div className="user-detail-section">
                <h3>Thông tin cơ bản</h3>
                <div className="detail-row">
                  <span>ID:</span>
                  <strong>{selectedUser.id}</strong>
                </div>
                <div className="detail-row">
                  <span>Họ tên:</span>
                  <strong>{selectedUser.name}</strong>
                </div>
                <div className="detail-row">
                  <span>Email:</span>
                  <strong>{selectedUser.email}</strong>
                </div>
                <div className="detail-row">
                  <span>Vai trò:</span>
                  <span className={`role-badge ${getRoleClass(selectedUser.role)}`}>
                    {getRoleText(selectedUser.role)}
                  </span>
                </div>
              </div>
              
              <div className="user-detail-section">
                <h3>Thông tin bổ sung</h3>
                <div className="detail-row">
                  <span>Phòng ban/Khoa:</span>
                  <strong>{selectedUser.department}</strong>
                </div>
                <div className="detail-row">
                  <span>Mã số:</span>
                  <strong>{selectedUser.studentId || selectedUser.employeeId}</strong>
                </div>
                <div className="detail-row">
                  <span>Trạng thái:</span>
                  <span className={`status ${getStatusClass(selectedUser.status)}`}>
                    {selectedUser.status === 'active' ? 'Hoạt động' : 'Không hoạt động'}
                  </span>
                </div>
                <div className="detail-row">
                  <span>Đăng nhập cuối:</span>
                  <strong>{selectedUser.lastLogin}</strong>
                </div>
              </div>
            </div>
            
            <div className="user-detail-actions">
              <button className="btn primary">Chỉnh sửa thông tin</button>
              <button className="btn secondary">Đặt lại mật khẩu</button>
              <button className="btn warning">Thay đổi quyền</button>
              <button className="btn danger">Khóa tài khoản</button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default UserManagement;