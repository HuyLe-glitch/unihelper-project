import React from 'react';
import { AdminLayout } from '../layouts';
//import AdminDashboard from '../components/admin/dashboard/AdminDashboard';
// Import admin components when they're ready
import  { AdminDashboard } from '../components/admin';
import RequireAuth from './RequireAuth.jsx';
import { ReportsRequests } from '../components/admin/reports';
import  { FacultyManagement, StudentManagement, AddStudent } from '../components/admin/faculty-management';
import { DepartmentManagement, StaffManagement, AddStaff } from '../components/admin/department-management';
//import { StaffManagement } from '../components/admin/department-management'; 

// Placeholder components (will be replaced with actual components)
// const AdminDashboard = () => <div>Admin Dashboard</div>;
//const UserManagement = () => <div>Admin User Management</div>;
const SystemSettings = () => <div>Admin System Settings</div>;

//const AddUser = () => <div>Thêm người dùng mới</div>;
//const SystemReports = () => <div>Admin System Reports</div>;
//const ReportsRequests = () => <div>Thống kê các yêu cầu</div>;
//const ReportsUsers = () => <div>Thống kê hoạt động người dùng</div>;
//const ReportsActivities = () => <div>Thống kê hoạt động</div>;


const AllRequests = () => <div>Xử lý các yêu cầu</div>;

export const adminRoutes = [
  {
    path: '/admin',
    element: ( 
      <RequireAuth allowedRoles={['admin']}>
        <AdminLayout />
      </RequireAuth>
    ),
    children: [
      { path: '', element: <AdminDashboard /> },
      { path: 'dashboard', element: <AdminDashboard /> },

      //{ path: 'user-management', element: <UserManagement /> },
      { path: 'faculty-management', element: <FacultyManagement /> },
      { path: 'faculty-management/student-management/:majorId', element: <StudentManagement /> },
      { path: 'faculty-management/add-student', element: <AddStudent /> },

      { path: 'department-management', element: <DepartmentManagement /> },
      { path: 'department-management/staff-management', element: <StaffManagement /> },
      { path: 'department-management/add-staff', element: <AddStaff /> },

      { path: 'system-settings', element: <SystemSettings /> },

      { path: 'reports/requests', element: <ReportsRequests /> },
      //{ path: 'reports/users', element: <ReportsUsers /> },
      //{ path: 'reports/activities', element: <ReportsActivities /> },

    ],
  },
];
