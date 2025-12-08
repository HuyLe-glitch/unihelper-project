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
      id: 'faculty-management',
      icon: '👤',
      label: 'Quản lý Khoa và sinh viên',
      type: 'single',
      path: '/admin/faculty-management',
    },
    /*{
      id: 'user-management',
      icon: '👤',
      label: 'Quản lý sinh viên',
      type: 'expandable',
      children:[
        { id: 'add-user', label: 'Thêm người dùng', path: '/admin/user-management/add-user' },
        { id: 'user-settings', label: 'Cài đặt người dùng', path: '/admin/user-management/user-settings' },
      ]
    },*/
    {
      id: 'reports',
      icon: '📈',
      label: 'Báo cáo hệ thống',
      type: 'single',
      path: '/admin/reports/requests',
    },
    /*{
      id: 'reports-requests',
      icon: '📈',
      label: 'Báo cáo hệ thống',
      type: 'expandable',
      children: [
        { id: 'reports-requests', label: 'Báo cáo yêu cầu CTSV KTX', path: '/admin/reports/requests' },
        { id: 'reports-users', label: 'Báo cáo yêu cầu KTX ', path: '/admin/reports/users' },
        { id: 'reports-activities', label: 'Báo cáo hoạt động', path: '/admin/reports/activities' },
      ],
    },*/
    {
      id: 'department-management',
      icon: '🏢',
      label: 'Quản lý phòng ban',
      type: 'single',
      path: '/admin/department-management',
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
