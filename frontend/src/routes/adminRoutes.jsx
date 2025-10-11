import React from 'react';
import { AdminLayout } from '../layouts';
// Import admin components when they're ready
// import { Dashboard, UserManagement, SystemSettings } from '../components/admin';

// Placeholder components (will be replaced with actual components)
const Dashboard = () => <div>Admin Dashboard</div>;
const UserManagement = () => <div>Admin User Management</div>;
const SystemSettings = () => <div>Admin System Settings</div>;
const SystemReports = () => <div>Admin System Reports</div>;
const AllRequests = () => <div>Admin All Requests</div>;
const Chat = () => <div>Admin Chat</div>;

export const adminRoutes = [
  {
    path: '/admin',
    element: <AdminLayout />,
    children: [
      { path: '', element: <Dashboard /> },
      { path: 'dashboard', element: <Dashboard /> },
      { path: 'users', element: <UserManagement /> },
      { path: 'settings', element: <SystemSettings /> },
      { path: 'reports', element: <SystemReports /> },
      { path: 'requests', element: <AllRequests /> },
      { path: 'chat', element: <Chat /> },
    ],
  },
];
