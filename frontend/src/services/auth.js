import { apiClient } from './api';

// Set to false for production or when backend is ready
const AUTH_BYPASS = false;

/*
Set AUTH_BYPASS = true for fake login (no network error).
Set AUTH_BYPASS = false and run your backend for real login.
*/
/*const FAKE_USERS = [
  { email: 'student@tdtu.edu.vn', password: '123456', role: 'student', studentId: '522h0030' },
  { email: 'student2@tdtu.edu.vn', password: '123456', role: 'student', studentId: '2024001' },
  { email: 'staff@tdtu.edu.vn', password: '123456', role: 'staff' },
  { email: 'admin@tdtu.edu.vn', password: '123456', role: 'admin' },
];*/


export const authService = {
  // New Login 
  login: async (credentials) => {
    try {
      // Real API calls - tất cả roles đều dùng /auth/login với email
      const endpoint = '/auth/login';
      const payload = { email: credentials.email, password: credentials.password };

      const response = await apiClient.post(endpoint, payload);
      
      if (response.data.success && response.data.data.token) {
        const user = response.data.data.user;
        // Normalize role to lowercase for frontend
        const normalizedRole = user.role.toLowerCase();
        
        // For staff, determine staffType based on email or department
        let staffType = null;
        if (normalizedRole === 'staff') {
          // Check if backend provides staffType, otherwise determine from email
          if (user.staffType) {
            staffType = user.staffType;
          } else if (user.email) {
            // Determine from email pattern
            if (user.email.toLowerCase().includes('ctsv')) {
              staffType = 'CTSV';
            } else if (user.email.toLowerCase().includes('ktx')) {
              staffType = 'KTX';
            } else if (user.department) {
              // Determine from department field if available
              staffType = user.department.includes('CTSV') || user.department.includes('Công tác') ? 'CTSV' : 'KTX';
            }
          }
        }

        // For students, get isDormResident from profile
        let isDormResident = false;
        if (normalizedRole === 'student' && user.profile) {
          isDormResident = user.profile.isDormResident || false;
        }
        
        localStorage.setItem('authToken', response.data.data.token);
        localStorage.setItem('userRole', normalizedRole);
        if (staffType) {
          localStorage.setItem('staffType', staffType);
        }
        if (normalizedRole === 'student') {
          localStorage.setItem('isDormResident', isDormResident.toString());
        }
        localStorage.setItem('user', JSON.stringify({
          ...user, 
          role: normalizedRole, 
          staffType,
          isDormResident
        }));
        
        return {
          ...response.data.data,
          user: {...user, role: normalizedRole}
        };
      }
      
      throw new Error('Login failed');
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  },

  // Register new user - not available 
  /*register: async (userData) => {
    try {
      if (AUTH_BYPASS) {
        // Simulate successful registration
        return { success: true, message: 'Registration successful' };
      }

      const response = await apiClient.post('/auth/register', userData);
      return response.data;
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  }, */

  // Logout
  logout: () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userRole');
    localStorage.removeItem('staffType');
    localStorage.removeItem('isDormResident');
    localStorage.removeItem('user');
    window.location.href = '/login';
  },

  // Get staff type
  getStaffType: () => {
    return localStorage.getItem('staffType');
  },

  // Get isDormResident status
  getIsDormResident: () => {
    return localStorage.getItem('isDormResident') === 'true';
  },

  // Get current user
  getCurrentUser: async () => {
    try {
      const user = localStorage.getItem('user');
      if (user) {
        return JSON.parse(user);
      }

      const response = await apiClient.get('/auth/me');
      if (response.data.success) {
        const userData = response.data.data;
        const normalizedUser = {...userData, role: userData.role.toLowerCase()};
        localStorage.setItem('user', JSON.stringify(normalizedUser));
        return normalizedUser;
      }
      return null;
    } catch (error) {
      console.error('Error getting current user:', error);
      return null;
    }
  },

  // Verify token is still valid
  verifyToken: async () => {
    try {
      const response = await apiClient.get('/auth/verify');
      return response.data;
    } catch (error) {
      console.error('Token verification failed:', error);
      authService.logout();
      return false;
    }
  },

  // Check if user is authenticated
  isAuthenticated: () => {
    return !!localStorage.getItem('authToken');
  },

  // Get user role
  getUserRole: () => {
    return localStorage.getItem('userRole');
  },

  // Reset password request
  requestPasswordReset: async (email) => {
    try {
      const response = await apiClient.post('/auth/reset-password-request', { email });
      return response.data;
    } catch (error) {
      console.error('Password reset request error:', error);
      throw error;
    }
  },

  // Reset password with token
  resetPassword: async (token, newPassword) => {
    try {
      const response = await apiClient.post('/auth/reset-password', { token, newPassword });
      return response.data;
    } catch (error) {
      console.error('Password reset error:', error);
      throw error;
    }
  }
};