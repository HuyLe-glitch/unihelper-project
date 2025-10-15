import { apiClient } from './api';

const AUTH_BYPASS = true; // Set to true to bypass authentication for testing

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
  if (AUTH_BYPASS) {
    // Find a matching fake user
    const user = FAKE_USERS.find(
      u => u.email === credentials.email && u.password === credentials.password && u.role === credentials.role
    );
    if (user) {
      localStorage.setItem('authToken', 'dev-token');
      localStorage.setItem('userRole', user.role);
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
  }
  return response.data;
},

  // Logout
  logout: () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userRole');
    window.location.href = '/login';
  },

  // Get current user
  getCurrentUser: async () => {
    if (AUTH_BYPASS) {
      return { role: localStorage.getItem('userRole') || 'admin', name: 'Dev User' };
    }
    const response = await apiClient.get('/auth/me');
    return response.data;
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
  }
};