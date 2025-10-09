import React from 'react';
import { StudentLayout } from '../layouts';
// Import student components when they're ready
// import { Dashboard, Profile, StudentAffairs } from '../components/student';

// Placeholder components (will be replaced with actual components)
const Dashboard = () => <div>Student Dashboard</div>;
const Profile = () => <div>Student Profile</div>;
const StudentAffairs = () => <div>Student Affairs</div>;
const Chat = () => <div>Student Chat</div>;
const Schedule = () => <div>Student Schedule</div>;
const Settings = () => <div>Student Settings</div>;

export const studentRoutes = [
  {
    path: '/student',
    element: <StudentLayout />,
    children: [
      { path: '', element: <Dashboard /> },
      { path: 'dashboard', element: <Dashboard /> },
      { path: 'profile', element: <Profile /> },
      { path: 'student-affairs', element: <StudentAffairs /> },
      { path: 'chat', element: <Chat /> },
      { path: 'schedule', element: <Schedule /> },
      { path: 'settings', element: <Settings /> }
    ]
  }
];