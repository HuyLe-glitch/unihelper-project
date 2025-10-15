import React from 'react';
import { StudentLayout } from '../layouts';
import { Dashboard as StudentDashboard, StudentAffairs, ProfilePanel, Schedule, Dormitory } from '../components/student';

import RequireAuth from './RequireAuth.jsx';


//const Dormitory = () => <div>Ký túc xá - nội dung sẽ được cập nhật.</div>;
const Chat = () => <div>Student Chat</div>;
//const Schedule = () => <div>Student Schedule</div>;
const Settings = () => <div>Student Settings</div>;

export const studentRoutes = [
  {
    path: '/student',
    element: (
      <RequireAuth allowedRoles={['student']}>
        <StudentLayout />
      </RequireAuth>
    ),
    children: [
      { path: '', element: <StudentDashboard /> },
      { path: 'dashboard', element: <StudentDashboard /> },
      { path: 'profile', element: <ProfilePanel /> },
      { path: 'student-affairs', element: <StudentAffairs /> },
      { path: 'dormitory', element: <Dormitory /> },
      { path: 'chat', element: <Chat /> },
      { path: 'schedule', element: <Schedule /> },
      { path: 'settings', element: <Settings /> },
    ],
  },
];
