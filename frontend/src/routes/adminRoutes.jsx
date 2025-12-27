import React from 'react';
import { AdminLayout } from '../layouts';
import { AdminDashboard } from '../components/admin/dashboard';
import { StudentManagement, StudentImportPage } from '../components/admin/student-management';
import { FacultyMajorManagement } from '../components/admin/faculty-major-management';
import { SemesterManagement } from '../components/admin/semester-management';
import { CertificateManagement } from '../components/admin/certificate-management';
import { DormitoryRequestManagement } from '../components/admin/dormitory-request-management';
import { RoomManagement } from '../components/admin/room-management';
import RequireAuth from './RequireAuth.jsx';

/**
 * Admin Routes
 * 
 * Lưu ý: Admin KHÔNG có quyền tạo/xóa staff vì:
 * - Hệ thống chỉ có 2 staff cố định (CTSV & KTX)
 * - Admin chỉ quản lý sinh viên, khoa, chuyên ngành, học kỳ và cài đặt hệ thống
 */

const SystemReports = () => (
  <div className="placeholder-page" style={{ padding: '40px', textAlign: 'center' }}>
    <h2 style={{ fontSize: '24px', marginBottom: '16px', color: '#2c3e50' }}>Báo cáo Hệ thống</h2>
    <p style={{ color: '#6c757d' }}>Thống kê và báo cáo hệ thống</p>
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
      
      // Quản lý sinh viên
      { path: 'students', element: <StudentManagement /> },
      { path: 'students/import', element: <StudentImportPage /> },
      
      // Quản lý Khoa & Chuyên ngành (Unified)
      { path: 'faculty-major', element: <FacultyMajorManagement /> },
      
      // Quản lý Học kỳ
      { path: 'semesters', element: <SemesterManagement /> },
      
      // Quản lý yêu cầu CTSV (Chứng nhận - Loại & Danh sách)
      { path: 'certificate-requests', element: <CertificateManagement /> },
      
      // Quản lý yêu cầu KTX (Ký túc xá)
      { path: 'dormitory-requests', element: <DormitoryRequestManagement /> },
      
      // Quản lý Phòng KTX
      { path: 'rooms', element: <RoomManagement /> },
      
      // Báo cáo
      { path: 'reports', element: <SystemReports /> },
    ],
  },
];


