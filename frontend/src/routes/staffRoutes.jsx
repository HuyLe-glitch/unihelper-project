import React from 'react';
import { StaffLayout } from '../layouts';
import {
  StaffDashboard,
  StaffCtsvRequests,
  StaffTtxRequests,
  StaffHistory,
  StaffDepartment,
} from '../components/staff';

import RequireAuth from './RequireAuth.jsx';

// Placeholder components (will be replaced with actual components)
const Reports = () => <div>Staff Reports</div>;
const Settings = () => <div>Staff Settings</div>;

export const staffRoutes = [
  {
    path: '/staff',
    element: (
      <RequireAuth allowedRoles={['staff']}>
        <StaffLayout />
      </RequireAuth>
    ),
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