import React from 'react';
import { AdminLayout } from '../layouts';
import AdminDashboard from '../components/admin/dashboard/AdminDashboard';
import UserManagement from '../components/admin/user-management/UserManagement';
import SystemSettings from '../components/admin/system-settings/SystemSettings';
import RequireAuth from './RequireAuth.jsx';

/**
 * Admin Routes
 * 
 * Lưu ý: Admin KHÔNG có quyền tạo/xóa staff vì:
 * - Hệ thống chỉ có 2 staff cố định (CTSV & KTX)
 * - Admin chỉ quản lý sinh viên và cài đặt hệ thống
 */

// Placeholder components (sẽ được thay thế bằng components thật)
const StudentManagement = () => (
  <div className="placeholder-page">
    <h2>Quản lý Sinh viên</h2>
    <p>Trang quản lý sinh viên sẽ được cập nhật</p>
  </div>
);

const AllRequests = () => (
  <div className="placeholder-page">
    <h2>Tất cả Yêu cầu</h2>
    <p>Xem tất cả yêu cầu từ sinh viên</p>
  </div>
);

const SystemReports = () => (
  <div className="placeholder-page">
    <h2>Báo cáo Hệ thống</h2>
    <p>Thống kê và báo cáo hệ thống</p>
  </div>
);

export const adminRoutes = [
  {
    path: '/admin',
    element: ( 
      <RequireAuth allowedRoles={['admin']}>
        <AdminLayout />
      </RequireAuth>
    ),
    children: [
      // Dashboard
      { path: '', element: <AdminDashboard /> },
      { path: 'dashboard', element: <AdminDashboard /> },
      
      // Quản lý sinh viên (Admin có thể CRUD sinh viên)
      { path: 'students', element: <StudentManagement /> },
      
      // Xem tất cả yêu cầu
      { path: 'requests', element: <AllRequests /> },
      
      // Xem người dùng (read-only, không tạo/xóa staff)
      { path: 'users', element: <UserManagement /> },
      
      // Báo cáo
      { path: 'reports', element: <SystemReports /> },
      
      // Cài đặt hệ thống
      { path: 'system-settings', element: <SystemSettings /> },
    ],
  },
];
