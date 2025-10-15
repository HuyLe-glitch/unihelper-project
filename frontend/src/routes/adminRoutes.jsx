import React from 'react';
import { AdminLayout } from '../layouts';
import AdminDashboard from '../components/admin/dashboard/AdminDashboard';
// Import admin components when they're ready
//import { AdminDashboard, UserManagement, SystemSettings } from '../components/admin';
import RequireAuth from './RequireAuth.jsx';

// Placeholder components (will be replaced with actual components)
// const AdminDashboard = () => <div>Admin Dashboard</div>;
const UserManagement = () => <div>Admin User Management</div>;
const SystemSettings = () => <div>Admin System Settings</div>;
const SystemReports = () => <div>Admin System Reports</div>;
const AllRequests = () => <div>Admin All Requests</div>;

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
      { path: 'users', element: <UserManagement /> },
      { path: 'system-settings', element: <SystemSettings /> },
      { path: 'reports', element: <SystemReports /> },
      { path: 'requests', element: <AllRequests /> },
    ],
  },
];
