// Menu configurations for different user roles
export const MENU_CONFIGS = {
  student: [
    {
      id: 'dashboard',
      icon: '📊',
      label: 'Dashboard',
      type: 'single'
    },
    {
      id: 'requests',
      icon: '📝',
      label: 'Gửi yêu cầu',
      type: 'expandable',
      children: [
        { id: 'student-affairs', label: 'Công tác sinh viên' },
        { id: 'dormitory', label: 'Ký túc xá' }
      ]
    },
    {
      id: 'chat',
      icon: '💬',
      label: 'Chat',
      type: 'single'
    },
    {
      id: 'schedule',
      icon: '📅',
      label: 'Schedule',
      type: 'single'
    },
    {
      id: 'settings',
      icon: '⚙️',
      label: 'Settings',
      type: 'single'
    }
  ],
  
  staff: [
    {
      id: 'dashboard',
      icon: '📊',
      label: 'Dashboard',
      type: 'single'
    },
    {
      id: 'requests',
      icon: '📋',
      label: 'Quản lý yêu cầu',
      type: 'single'
    },
    {
      id: 'students',
      icon: '👥',
      label: 'Quản lý sinh viên',
      type: 'single'
    },
    {
      id: 'reports',
      icon: '📈',
      label: 'Báo cáo',
      type: 'single'
    },
    {
      id: 'chat',
      icon: '💬',
      label: 'Chat',
      type: 'single'
    },
    {
      id: 'settings',
      icon: '⚙️',
      label: 'Settings',
      type: 'single'
    }
  ],

  admin: [
    {
      id: 'dashboard',
      icon: '📊',
      label: 'Dashboard',
      type: 'single'
    },
    {
      id: 'users',
      icon: '👤',
      label: 'Quản lý người dùng',
      type: 'single'
    },
    {
      id: 'requests',
      icon: '📋',
      label: 'Tất cả yêu cầu',
      type: 'single'
    },
    {
      id: 'reports',
      icon: '📈',
      label: 'Báo cáo hệ thống',
      type: 'single'
    },
    {
      id: 'system-settings',
      icon: '🔧',
      label: 'Cài đặt hệ thống',
      type: 'single'
    },
    {
      id: 'chat',
      icon: '💬',
      label: 'Chat',
      type: 'single'
    }
  ]
};