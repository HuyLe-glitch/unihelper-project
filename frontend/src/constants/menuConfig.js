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
  // STAFF CTSV MENU - Nhân viên Công tác Sinh viên
  // ============================================
  staffCTSV: [
    {
      id: 'dashboard',
      icon: '📊',
      label: 'Dashboard CTSV',
      type: 'single',
      path: '/staff/dashboard',
    },
    {
      id: 'requests',
      icon: '📋',
      label: 'Yêu cầu CTSV',
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
  ],

  // ============================================
  // STAFF KTX MENU - Nhân viên Ký túc xá
  // ============================================
  staffKTX: [
    {
      id: 'dashboard',
      icon: '📊',
      label: 'Dashboard KTX',
      type: 'single',
      path: '/staff/dashboard',
    },
    {
      id: 'requests',
      icon: '🏢',
      label: 'Yêu cầu KTX',
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
      id: 'management',
      icon: '⚙️',
      label: 'Quản lý',
      type: 'expandable',
      children: [
        { id: 'students', label: 'Sinh viên', path: '/admin/students' },
        { id: 'faculty-major', label: 'Khoa & Chuyên ngành', path: '/admin/faculty-major' },
        { id: 'semesters', label: 'Học kỳ', path: '/admin/semesters' },
        { id: 'rooms', label: 'Phòng KTX', path: '/admin/rooms' },
      ],
    },
    {
      id: 'requests',
      icon: '📋',
      label: 'Quản lý yêu cầu',
      type: 'expandable',
      children: [
        { id: 'certificate-requests', label: 'Yêu cầu CTSV', path: '/admin/certificate-requests' },
        { id: 'dormitory-requests', label: 'Danh mục thiết bị KTX', path: '/admin/dormitory-requests' },
      ],
    },
    {
      id: 'reports',
      icon: '📈',
      label: 'Báo cáo hệ thống',
      type: 'single',
      path: '/admin/reports',
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
// HELPER FUNCTIONS
// ============================================

/**
 * Get menu config based on user role, staff type, and dormitory status
 * @param {string} role - User role (student, staff, admin)
 * @param {string} staffType - Staff type (CTSV, KTX) - only for staff role
 * @param {boolean} isDormResident - Whether student is a dormitory resident
 * @returns {Array} Menu configuration
 */
export const getMenuConfig = (role, staffType = null, isDormResident = false) => {
  if (role === 'staff' && staffType) {
    // Return specific menu for staff type
    return MENU_CONFIGS[`staff${staffType}`] || MENU_CONFIGS.staffCTSV;
  }
  
  // For students, filter out dormitory-related items if not a dorm resident
  if (role === 'student') {
    const studentMenu = MENU_CONFIGS.student || [];
    
    if (!isDormResident) {
      // Lọc bỏ các menu liên quan đến KTX cho sinh viên ngoại trú
      return studentMenu.map(item => {
        if (item.type === 'expandable' && item.children) {
          // Lọc bỏ các children liên quan đến dormitory/KTX
          const filteredChildren = item.children.filter(child => 
            !child.id.includes('dormitory') && 
            !child.path?.includes('dormitory') &&
            !child.label?.toLowerCase().includes('ktx')
          );
          
          // Nếu không còn children nào, ẩn luôn menu cha
          if (filteredChildren.length === 0) {
            return null;
          }
          
          return { ...item, children: filteredChildren };
        }
        
        // Ẩn single menu liên quan đến dormitory
        if (item.type === 'single' && (
          item.id.includes('dormitory') || 
          item.path?.includes('dormitory') ||
          item.label?.toLowerCase().includes('ktx')
        )) {
          return null;
        }
        
        return item;
      }).filter(Boolean); // Loại bỏ các null items
    }
    
    return studentMenu;
  }
  
  return MENU_CONFIGS[role] || [];
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
