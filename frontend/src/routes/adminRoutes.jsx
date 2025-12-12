import React from 'react';
import { AdminLayout } from '../layouts';
//import AdminDashboard from '../components/admin/dashboard/AdminDashboard';
// Import admin components when they're ready
import  { AdminDashboard } from '../components/admin';
import RequireAuth from './RequireAuth.jsx';
import { ReportsRequests } from '../components/admin/reports';

import  { FacultyList, AddFaculty, EditFaculty } from '../components/admin/faculty-management';
import  { MajorList, AddMajor, EditMajor } from '../components/admin/major-management';
import  { StudentList, AddStudent, EditStudent } from '../components/admin/student-management';

import { StaffList, EditStaff, AddStaff } from '../components/admin/staff-management';
import { StaffRoleList, EditStaffRole, AddStaffRole } from '../components/admin/staffrole-management';
import { DepartmentList, EditDepartment, AddDepartment } from '../components/admin/department-management';

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
      // Faculty management
      { path: 'faculty-management', element: <FacultyList /> },
      { path: 'faculty-management/add', element: <AddFaculty /> },
      { path: 'faculty-management/edit', element: <EditFaculty /> },

      // Major mangement
      { path: 'major-management', element: <MajorList /> },
      { path: 'major-management/add', element: <AddMajor /> },
      { path: 'major-management/edit', element: <EditMajor /> },

      // Student management
      { path: 'student-management', element: <StudentList /> },
      { path: 'student-management/add', element: <AddStudent /> },
      { path: 'student-management/edit', element: <EditStudent /> },

      // Staff management
      { path: 'staff-management', element: <StaffList /> },
      { path: 'staff-management/edit', element: <EditStaff /> },
      { path: 'staff-management/add', element: <AddStaff /> },

      // Staff Role management
      { path: 'staffrole-management', element: <StaffRoleList /> },
      { path: 'staffrole-management/edit', element: <EditStaffRole /> },
      { path: 'staffrole-management/add', element: <AddStaffRole /> },

      // Department management
      { path: 'department-management', element: <DepartmentList /> },
      { path: 'department-management/edit', element: <EditDepartment /> },
      { path: 'department-management/add', element: <AddDepartment /> },

      { path: 'system-settings', element: <SystemSettings /> },

      { path: 'reports/requests', element: <ReportsRequests /> },
      //{ path: 'reports/users', element: <ReportsUsers /> },
      //{ path: 'reports/activities', element: <ReportsActivities /> },

    ],
  },
];
