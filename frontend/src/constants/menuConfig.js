/**
 * Menu configurations for different user roles
 * 
 * HỆ THỐNG:
 * - Nhiều tài khoản Student
 * - 2 tài khoản Staff cố định (CTSV & KTX)
 * - 1 tài khoản Admin cố định
 */

export const MENU_CONFIGS = {
  // ============================================
  // STUDENT MENU
  // ============================================
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
      id: 'history',
      icon: '📅',
      label: 'Lịch sử yêu cầu',
      type: 'expandable',
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

  // ============================================
  // STAFF MENU (Chung cho cả CTSV và KTX)
  // Menu sẽ được filter dựa trên staffType khi render
  // ============================================
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
      label: 'Yêu cầu cần xử lý',
      type: 'single',
      path: '/staff/requests',
    },
    {
      id: 'history',
      icon: '🕓',
      label: 'Lịch sử xử lý',
      type: 'single',
      path: '/staff/history',
    },
    {
      id: 'reports',
      icon: '📈',
      label: 'Thống kê',
      type: 'single',
      path: '/staff/reports',
    },
    {
      id: 'settings',
      icon: '⚙️',
      label: 'Cài đặt',
      type: 'single',
      path: '/staff/settings',
    },
  ],

  // ============================================
  // ADMIN MENU
  // Không có quản lý staff vì staff là cố định
  // ============================================
  admin: [
    {
      id: 'dashboard',
      icon: '📊',
      label: 'Dashboard',
      type: 'single',
      path: '/admin/dashboard',
    },
    {
      id: 'students',
      icon: '🎓',
      label: 'Quản lý sinh viên',
      type: 'single',
      path: '/admin/students',
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
  ],
};

// ============================================
// STAFF TYPE LABELS
// ============================================
export const STAFF_TYPE_LABELS = {
  CTSV: 'Công tác Sinh viên',
  KTX: 'Ký túc xá',
};

// ============================================
// FIXED ACCOUNTS INFO (for display)
// ============================================
export const FIXED_ACCOUNTS_INFO = {
  STAFF_CTSV: {
    staffType: 'CTSV',
    label: 'Nhân viên CTSV',
    department: 'Phòng Công tác Sinh viên',
    description: 'Xử lý các yêu cầu liên quan đến công tác sinh viên',
  },
  STAFF_KTX: {
    staffType: 'KTX',
    label: 'Nhân viên KTX',
    department: 'Phòng Ký túc xá',
    description: 'Xử lý các yêu cầu liên quan đến ký túc xá',
  },
  ADMIN: {
    label: 'Quản trị viên',
    description: 'Quản lý toàn bộ hệ thống',
  },
};
