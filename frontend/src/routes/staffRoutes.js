import React from 'react';
import { StaffLayout } from '../layouts';
// Import staff components when they're ready
// import { Dashboard, RequestManagement } from '../components/staff';

// Placeholder components (will be replaced with actual components)
const Dashboard = () => <div>Staff Dashboard</div>;
const RequestManagement = () => <div>Staff Request Management</div>;
const StudentManagement = () => <div>Staff Student Management</div>;
const Reports = () => <div>Staff Reports</div>;
const Chat = () => <div>Staff Chat</div>;
const Settings = () => <div>Staff Settings</div>;

export const staffRoutes = [
  {
    path: '/staff',
    element: <StaffLayout />,
    children: [
      { path: '', element: <Dashboard /> },
      { path: 'dashboard', element: <Dashboard /> },
      { path: 'requests', element: <RequestManagement /> },
      { path: 'students', element: <StudentManagement /> },
      { path: 'reports', element: <Reports /> },
      { path: 'chat', element: <Chat /> },
      { path: 'settings', element: <Settings /> }
    ]
  }
];