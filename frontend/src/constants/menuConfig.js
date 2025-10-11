// Menu configurations for different user roles
export const MENU_CONFIGS = {
  student: [
    {
      id: 'dashboard',
      icon: '📊',
      label: 'Dashboard',
      type: 'single',
      path: '/student/dashboard',
    },
    {
      id: 'requests',
      icon: '📝',
      label: 'Gửi yêu cầu',
      type: 'expandable',
      children: [
        { id: 'student-affairs', label: 'Công tác sinh viên', path: '/student/student-affairs' },
        { id: 'dormitory', label: 'Ký túc xá', path: '/student/dormitory' },
      ],
    },
    {
      id: 'chat',
      icon: '💬',
      label: 'Chat',
      type: 'single',
      path: '/student/chat',
    },
    {
      id: 'schedule',
      icon: '📅',
      label: 'Schedule',
      type: 'single',
      path: '/student/schedule',
    },
    {
      id: 'settings',
      icon: '⚙️',
      label: 'Settings',
      type: 'single',
      path: '/student/settings',
    },
  ],

  staff: [
    {
      id: 'dashboard',
      icon: '📊',
      label: 'Dashboard',
      type: 'single',
      path: '/staff/dashboard',
    },
    {
      id: 'requests',
      icon: '📋',
      label: 'Quản lý yêu cầu',
      type: 'single',
      path: '/staff/requests',
    },
    {
      id: 'students',
      icon: '👥',
      label: 'Quản lý sinh viên',
      type: 'single',
      path: '/staff/students',
    },
    {
      id: 'reports',
      icon: '📈',
      label: 'Báo cáo',
      type: 'single',
      path: '/staff/reports',
    },
    {
      id: 'chat',
      icon: '💬',
      label: 'Chat',
      type: 'single',
      path: '/staff/chat',
    },
    {
      id: 'settings',
      icon: '⚙️',
      label: 'Settings',
      type: 'single',
      path: '/staff/settings',
    },
  ],

  admin: [
    {
      id: 'dashboard',
      icon: '📊',
      label: 'Dashboard',
      type: 'single',
      path: '/admin/dashboard',
    },
    {
      id: 'users',
      icon: '👤',
      label: 'Quản lý người dùng',
      type: 'single',
      path: '/admin/users',
    },
    {
      id: 'requests',
      icon: '📋',
      label: 'Tất cả yêu cầu',
      type: 'single',
      path: '/admin/requests',
    },
    {
      id: 'reports',
      icon: '📈',
      label: 'Báo cáo hệ thống',
      type: 'single',
      path: '/admin/reports',
    },
    {
      id: 'system-settings',
      icon: '🔧',
      label: 'Cài đặt hệ thống',
      type: 'single',
      path: '/admin/system-settings',
    },
    {
      id: 'chat',
      icon: '💬',
      label: 'Chat',
      type: 'single',
      path: '/admin/chat',
    },
  ],
};
