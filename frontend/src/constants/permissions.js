import { ROLES } from './roles';

// Permissions for each role
export const PERMISSIONS = {
  [ROLES.STUDENT]: [
    'view_profile',
    'edit_profile',
    'submit_request',
    'view_requests',
    'chat'
  ],
  [ROLES.STAFF]: [
    'view_profile',
    'edit_profile',
    'process_requests',
    'view_students',
    'chat',
    'view_reports'
  ],
  [ROLES.ADMIN]: [
    'view_profile',
    'edit_profile',
    'manage_users',
    'manage_settings',
    'view_all_requests',
    'system_reports',
    'chat'
  ]
};

// Check if user has permission
export const hasPermission = (userRole, permission) => {
  return PERMISSIONS[userRole]?.includes(permission) || false;
};