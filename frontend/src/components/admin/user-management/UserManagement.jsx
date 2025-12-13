import React, { useState, useMemo } from 'react';
import { Modal } from '../../common';
import './UserManagement.css';

/**
 * User Management Component
 * 
 * Lưu ý quan trọng:
 * - Staff và Admin là tài khoản CỐ ĐỊNH, không thể tạo/xóa
 * - Chỉ có thể xem thông tin Staff và Admin
 * - Có thể quản lý (thêm/sửa/xóa) tài khoản Student
 */
const UserManagement = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');

  // Mock user data - Staff và Admin là cố định
  const users = useMemo(() => [
    // FIXED ACCOUNTS - Không thể xóa/tạo mới
    {
      id: 'ADMIN001',
      name: 'System Administrator',
      email: 'admin@university.edu.vn',
      role: 'admin',
      status: 'active',
      lastLogin: '2024-10-12 18:20',
      department: 'IT Department',
      isFixed: true, // Đánh dấu tài khoản cố định
    },
    {
      id: 'CTSV001',
      name: 'Nhân viên Công tác Sinh viên',
      email: 'ctsv@university.edu.vn',
      role: 'staff',
      staffType: 'CTSV',
      status: 'active',
      lastLogin: '2024-10-12 16:45',
      department: 'Phòng Công tác Sinh viên',
      isFixed: true,
    },
    {
      id: 'KTX001',
      name: 'Nhân viên Ký túc xá',
      email: 'ktx@university.edu.vn',
      role: 'staff',
      staffType: 'KTX',
      status: 'active',
      lastLogin: '2024-10-12 15:30',
      department: 'Phòng Ký túc xá',
      isFixed: true,
    },
    // STUDENT ACCOUNTS - Có thể quản lý
    {
      id: 'SV2024001',
      name: 'Nguyễn Văn An',
      email: 'an.nguyen@student.unihelper.edu.vn',
      role: 'student',
      status: 'active',
      lastLogin: '2024-10-12 14:30',
      department: 'Công nghệ thông tin',
      isFixed: false,
    },
    {
      id: 'SV2024002',
      name: 'Phạm Thảo Vy',
      email: 'vy.pham@student.unihelper.edu.vn',
      role: 'student',
      status: 'inactive',
      lastLogin: '2024-10-10 09:15',
      department: 'Quản trị Kinh doanh',
      isFixed: false,
    },
  ], []);

  const getRoleText = (role, staffType) => {
    switch (role) {
      case 'student': return 'Sinh viên';
      case 'staff': return staffType === 'CTSV' ? 'NV CTSV' : 'NV KTX';
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
    inactive: users.filter(u => u.status === 'inactive').length,
    fixed: users.filter(u => u.isFixed).length,
  };

  return (
    <div className="user-management">
      <div className="user-management__header">
        <div>
          <h1>Quản lý người dùng</h1>
          <p>Quản lý tài khoản sinh viên. Staff và Admin là tài khoản cố định.</p>
        </div>
        <div className="user-management__header-actions">
          <button type="button" className="btn primary">➕ Thêm sinh viên</button>
          <button type="button" className="btn ghost">📥 Xuất danh sách</button>
        </div>
      </div>

      {/* Notice về tài khoản cố định */}
      <div className="fixed-accounts-notice">
        <span className="notice-icon">ℹ️</span>
        <div className="notice-content">
          <strong>Lưu ý:</strong> Hệ thống có {userStats.fixed} tài khoản cố định (1 Admin, 2 Staff). 
          Các tài khoản này không thể xóa hoặc thay đổi vai trò.
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
            <h3>Nhân viên (cố định)</h3>
            <div className="stat-number">{userStats.staff}</div>
          </div>
        </div>
        <div className="stat-card stat-card--danger">
          <div className="stat-icon">👑</div>
          <div className="stat-content">
            <h3>Admin (cố định)</h3>
            <div className="stat-number">{userStats.admins}</div>
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
              <tr 
                key={user.id} 
                onClick={() => handleUserClick(user)}
                className={user.isFixed ? 'fixed-user-row' : ''}
              >
                <td>
                  {user.id}
                  {user.isFixed && <span className="fixed-badge" title="Tài khoản cố định">🔒</span>}
                </td>
                <td>{user.name}</td>
                <td>{user.email}</td>
                <td>
                  <span className={`role-badge ${getRoleClass(user.role)}`}>
                    {getRoleText(user.role, user.staffType)}
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
                  {user.isFixed ? (
                    <span className="action-disabled">Không thể chỉnh sửa</span>
                  ) : (
                    <>
                      <button className="btn-small primary">Chỉnh sửa</button>
                      <button className="btn-small danger">Khóa</button>
                    </>
                  )}
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
            {selectedUser.isFixed && (
              <div className="fixed-account-alert">
                🔒 Đây là tài khoản cố định, không thể chỉnh sửa hoặc xóa
              </div>
            )}
            
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
                    {getRoleText(selectedUser.role, selectedUser.staffType)}
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
                  <span>Trạng thái:</span>
                  <span className={`status ${getStatusClass(selectedUser.status)}`}>
                    {selectedUser.status === 'active' ? 'Hoạt động' : 'Không hoạt động'}
                  </span>
                </div>
                <div className="detail-row">
                  <span>Đăng nhập cuối:</span>
                  <strong>{selectedUser.lastLogin}</strong>
                </div>
                <div className="detail-row">
                  <span>Loại tài khoản:</span>
                  <strong>{selectedUser.isFixed ? 'Cố định' : 'Thông thường'}</strong>
                </div>
              </div>
            </div>
            
            <div className="user-detail-actions">
              {selectedUser.isFixed ? (
                <p className="no-actions-text">
                  Tài khoản cố định không thể chỉnh sửa
                </p>
              ) : (
                <>
                  <button className="btn primary">Chỉnh sửa thông tin</button>
                  <button className="btn secondary">Đặt lại mật khẩu</button>
                  <button className="btn danger">Khóa tài khoản</button>
                </>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default UserManagement;
