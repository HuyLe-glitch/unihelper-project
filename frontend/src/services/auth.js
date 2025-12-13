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
      // Real API calls
      let endpoint = '/auth/login';
      let payload = { email: credentials.email, password: credentials.password };

      // Use student ID login for students
      if (credentials.role === 'student' && credentials.studentId) {
        endpoint = '/auth/login/student';
        payload = { studentId: credentials.studentId.toLowerCase(), password: credentials.password };
      }

      const response = await apiClient.post(endpoint, payload);
      
      if (response.data.success && response.data.data.token) {
        const user = response.data.data.user;
        // Normalize role to lowercase for frontend
        const normalizedRole = user.role.toLowerCase();
        
        localStorage.setItem('authToken', response.data.data.token);
        localStorage.setItem('userRole', normalizedRole);
        localStorage.setItem('user', JSON.stringify({...user, role: normalizedRole}));
        
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
    localStorage.removeItem('user');
    window.location.href = '/login';
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