import { apiClient } from './api';

// Set to false for production or when backend is ready
const AUTH_BYPASS = true; 

/* 
Set AUTH_BYPASS = true for fake login (no network error).
Set AUTH_BYPASS = false and run your backend for real login.
*/
const FAKE_USERS = [
  { email: 'student@tdtu.edu.vn', password: '123456', role: 'student' },
  { email: 'staff@tdtu.edu.vn', password: '123456', role: 'staff' },
  { email: 'admin@tdtu.edu.vn', password: '123456', role: 'admin' },
];

export const authService = {
  // Login
  login: async (credentials) => {
    try {
      if (AUTH_BYPASS) {
        // Find a matching fake user
        const user = FAKE_USERS.find(
          u => u.email === credentials.email && u.password === credentials.password && u.role === credentials.role
        );
        if (user) {
          localStorage.setItem('authToken', 'dev-token');
          localStorage.setItem('userRole', user.role);
          localStorage.setItem('user', JSON.stringify({ role: user.role, email: user.email }));
          return { token: 'dev-token', user: { role: user.role, email: user.email } };
        } else {
          // Simulate API error
          throw new Error('Invalid email, password, or role');
        }
      }
      
      // Real API call
      const response = await apiClient.post('/auth/login', credentials);
      if (response.data.token) {
        localStorage.setItem('authToken', response.data.token);
        localStorage.setItem('userRole', response.data.user.role);
        localStorage.setItem('user', JSON.stringify(response.data.user));
      }
      return response.data;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  },

  // Register new user
  register: async (userData) => {
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
  },

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
      if (AUTH_BYPASS) {
        const userRole = localStorage.getItem('userRole') || 'admin';
        return { role: userRole, name: 'Dev User', email: `${userRole}@tdtu.edu.vn` };
      }
      
      const user = localStorage.getItem('user');
      if (user) {
        return JSON.parse(user);
      }
      
      const response = await apiClient.get('/auth/me');
      localStorage.setItem('user', JSON.stringify(response.data));
      return response.data;
    } catch (error) {
      console.error('Error getting current user:', error);
      return null;
    }
  },

  // Verify token is still valid
  verifyToken: async () => {
    try {
      if (AUTH_BYPASS) return true;
      
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
    if (AUTH_BYPASS) return true;
    return !!localStorage.getItem('authToken');
  },

  // Get user role
  getUserRole: () => {
    if (AUTH_BYPASS) return localStorage.getItem('userRole') || 'admin';
    return localStorage.getItem('userRole');
  },
  
  // Reset password request
  requestPasswordReset: async (email) => {
    try {
      if (AUTH_BYPASS) {
        return { success: true, message: 'Password reset email sent' };
      }
      
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
      if (AUTH_BYPASS) {
        return { success: true, message: 'Password reset successful' };
      }
      
      const response = await apiClient.post('/auth/reset-password', { token, newPassword });
      return response.data;
    } catch (error) {
      console.error('Password reset error:', error);
      throw error;
    }
  }
};