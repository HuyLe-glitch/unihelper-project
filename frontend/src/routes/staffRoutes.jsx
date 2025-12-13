import React from 'react';
import { StaffLayout } from '../layouts';
import {
  StaffDashboard,
  StaffHistory,
} from '../components/staff';
import RequireAuth from './RequireAuth.jsx';

/**
 * Staff Routes
 * 
 * Lưu ý: Hệ thống chỉ có 2 staff cố định:
 * - Staff CTSV: ctsv@university.edu.vn
 * - Staff KTX: ktx@university.edu.vn
 * 
 * Mỗi staff chỉ có thể xem và xử lý yêu cầu thuộc phạm vi của mình.
 * UI sẽ tự động hiển thị yêu cầu phù hợp dựa trên staffType.
 */

// Component xử lý yêu cầu (sẽ tự động filter theo staffType)
const StaffRequests = () => (
  <div className="staff-requests-page">
    <h2>Yêu cầu cần xử lý</h2>
    <p>Danh sách yêu cầu sẽ được hiển thị dựa trên loại staff của bạn.</p>
    {/* TODO: Implement request list component */}
  </div>
);

// Component thống kê
const StaffReports = () => (
  <div className="staff-reports-page">
    <h2>Thống kê</h2>
    <p>Thống kê yêu cầu của phòng ban bạn phụ trách.</p>
    {/* TODO: Implement reports component */}
  </div>
);

// Component cài đặt
const StaffSettings = () => (
  <div className="staff-settings-page">
    <h2>Cài đặt</h2>
    <p>Cài đặt tài khoản và thông báo.</p>
    {/* TODO: Implement settings component */}
  </div>
);

export const staffRoutes = [
  {
    path: '/staff',
    element: (
      <RequireAuth allowedRoles={['staff']}>
        <StaffLayout />
      </RequireAuth>
    ),
    children: [
      // Dashboard - Tự động hiển thị theo staffType
      { path: '', element: <StaffDashboard /> },
      { path: 'dashboard', element: <StaffDashboard /> },
      
      // Yêu cầu cần xử lý - Tự động filter theo staffType
      { path: 'requests', element: <StaffRequests /> },
      
      // Lịch sử xử lý
      { path: 'history', element: <StaffHistory /> },
      
      // Thống kê
      { path: 'reports', element: <StaffReports /> },
      
      // Cài đặt
      { path: 'settings', element: <StaffSettings /> },
    ],
  },
];
