import React from 'react';
import { StaffLayout } from '../layouts';
import {
  StaffDashboard,
  StaffCtsvRequests,
  StaffTtxRequests,
  StaffHistory,
  StaffDepartment,
} from '../components/staff';

// Placeholder components (sáº½ thay báº±ng implement thá»±c táº¿)
const Reports = () => <div>Staff Reports</div>;
const Settings = () => <div>Staff Settings</div>;

export const staffRoutes = [
  {
    path: '/staff',
    element: <StaffLayout />,
    children: [
      { path: '', element: <StaffDashboard /> },
      { path: 'dashboard', element: <StaffDashboard /> },
      { path: 'cts-requests', element: <StaffCtsvRequests /> },
      { path: 'ktx-requests', element: <StaffTtxRequests /> },
      { path: 'history', element: <StaffHistory /> },
      { path: 'department', element: <StaffDepartment /> },
      { path: 'reports', element: <Reports /> },
      { path: 'settings', element: <Settings /> },
    ],
  },
];

