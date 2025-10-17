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
      label: 'Lịch sử yêu cầu',
      type: 'expandable',   //Change to expandable if children are added
      //path: '/student/schedule',
      children: [
        { id: 'history-affair', label: 'Lịch sử CTSV', path: '/student/history-affair' },
        { id: 'history-dormitory', label: 'Lịch sử KTX', path: '/student/history-dormitory' },
      ],
    },
    {
      id: 'settings',
      icon: '⚙️',
      label: 'Cài đặt',
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
      id: 'cts-requests',
      icon: '📑',
      label: 'Yêu cầu CTSV',
      type: 'single',
      path: '/staff/cts-requests',
    },
    {
      id: 'ktx-requests',
      icon: '🏠',
      label: 'Yêu cầu KTX',
      type: 'single',
      path: '/staff/ktx-requests',
    },
    {
      id: 'history',
      icon: '🕓',
      label: 'Lịch sử xử lý',
      type: 'single',
      path: '/staff/history',
    },
    {
      id: 'department',
      icon: '🏢',
      label: 'Phòng ban',
      type: 'single',
      path: '/staff/department',
    },
    {
      id: 'reports',
      icon: '📈',
      label: 'Báo cáo',
      type: 'single',
      path: '/staff/reports',
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
    /*{
      id: 'chat',
      icon: '💬',
      label: 'Chat',
      type: 'single',
      path: '/admin/chat',
    },*/
  ],
};
