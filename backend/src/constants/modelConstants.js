/**
 * Model Constants - Định nghĩa các hằng số cho models
 * 
 * HỆ THỐNG GỒM:
 * - Nhiều tài khoản Student (tạo động)
 * - 2 tài khoản Staff CỐ ĐỊNH (CTSV & KTX)
 * - 1 tài khoản Admin CỐ ĐỊNH
 */

// User Roles
const USER_ROLES = {
  STUDENT: 'STUDENT',
  STAFF: 'STAFF',
  ADMIN: 'ADMIN'
};

// User Status
const USER_STATUS = {
  ACTIVE: 'ACTIVE',
  INACTIVE: 'INACTIVE'
};

// Student Status
const STUDENT_STATUS = {
  ACTIVE: 'ACTIVE',
  INACTIVE: 'INACTIVE',
  GRADUATED: 'GRADUATED',
  SUSPENDED: 'SUSPENDED'
};

// Staff Types - CHỈ CÓ 2 LOẠI CỐ ĐỊNH
const STAFF_TYPES = {
  CTSV: 'CTSV',   // Công tác Sinh viên
  KTX: 'KTX'      // Ký túc xá
};

// Staff Status
const STAFF_STATUS = {
  ACTIVE: 'ACTIVE',
  INACTIVE: 'INACTIVE',
  ON_LEAVE: 'ON_LEAVE'
};

// Request Types - Phân loại yêu cầu theo phòng ban
const REQUEST_TYPES = {
  CTSV: 'CTSV',       // Yêu cầu Công tác Sinh viên
  KTX: 'KTX'          // Yêu cầu Ký túc xá
};

// Request Status
const REQUEST_STATUS = {
  PENDING: 'pending',
  PROCESSING: 'processing',
  APPROVED: 'approved',
  REJECTED: 'rejected',
  COMPLETED: 'completed'
};

// Admin Permissions
const ADMIN_PERMISSIONS = {
  USER_MANAGEMENT: 'USER_MANAGEMENT',
  SYSTEM_SETTINGS: 'SYSTEM_SETTINGS',
  CERTIFICATE_MANAGEMENT: 'CERTIFICATE_MANAGEMENT',
  NOTIFICATION_MANAGEMENT: 'NOTIFICATION_MANAGEMENT',
  REPORT_ACCESS: 'REPORT_ACCESS',
  FULL_ACCESS: 'FULL_ACCESS'
};

// Notification Types
const NOTIFICATION_TYPES = {
  INFO: 'INFO',
  WARNING: 'WARNING',
  SUCCESS: 'SUCCESS',
  ERROR: 'ERROR',
  ANNOUNCEMENT: 'ANNOUNCEMENT'
};

// Notification Priority
const NOTIFICATION_PRIORITY = {
  LOW: 'LOW',
  MEDIUM: 'MEDIUM',
  HIGH: 'HIGH',
  URGENT: 'URGENT'
};

// Certificate Template Variable Types
const TEMPLATE_VARIABLE_TYPES = {
  TEXT: 'TEXT',
  DATE: 'DATE',
  NUMBER: 'NUMBER'
};

// Validation Rules
const VALIDATION_RULES = {
  PASSWORD_MIN_LENGTH: 6,
  NAME_MAX_LENGTH: 50,
  EMAIL_REGEX: /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
  PHONE_REGEX: /^[0-9]{10,11}$/,
  STUDENT_ID_REGEX: /^[0-9A-Z]{8,12}$/,
  STAFF_ID_REGEX: /^[A-Z]{3,4}[0-9]{3}$/,  // VD: CTSV001, KTX001
  ADMIN_ID_REGEX: /^ADMIN[0-9]{3}$/        // VD: ADMIN001
};

// =====================================================
// TÀI KHOẢN CỐ ĐỊNH - KHÔNG THAY ĐỔI
// =====================================================
const FIXED_ACCOUNTS = {
  // Staff CTSV - Xử lý yêu cầu Công tác Sinh viên
  STAFF_CTSV: {
    email: 'ctsv@university.edu.vn',
    staffId: 'CTSV001',
    staffType: 'CTSV',
    department: 'Phòng Công tác Sinh viên',
    position: 'Chuyên viên'
  },
  // Staff KTX - Xử lý yêu cầu Ký túc xá
  STAFF_KTX: {
    email: 'ktx@university.edu.vn',
    staffId: 'KTX001',
    staffType: 'KTX',
    department: 'Phòng Ký túc xá',
    position: 'Chuyên viên'
  },
  // Admin - Quản trị hệ thống
  ADMIN: {
    email: 'admin@university.edu.vn',
    adminId: 'ADMIN001'
  }
};

module.exports = {
  USER_ROLES,
  USER_STATUS,
  STUDENT_STATUS,
  STAFF_TYPES,
  STAFF_STATUS,
  REQUEST_TYPES,
  REQUEST_STATUS,
  ADMIN_PERMISSIONS,
  NOTIFICATION_TYPES,
  NOTIFICATION_PRIORITY,
  TEMPLATE_VARIABLE_TYPES,
  VALIDATION_RULES,
  FIXED_ACCOUNTS
};
