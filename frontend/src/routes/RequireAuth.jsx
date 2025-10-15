import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthContext } from '../contexts/AuthContext';

const DEV_AUTH_BYPASS = false; // Set to "true" to bypass auth for development

export default function RequireAuth({ allowedRoles, children }) {
  if (DEV_AUTH_BYPASS) {
    // Optionally, you can set a fake user role in localStorage for testing
    // localStorage.setItem('userRole', allowedRoles?.[0] || 'student');
    return children;
  }

  const { isAuthenticated, loading, user } = useAuthContext();
  const location = useLocation();

  if (loading) return null; // or a loader

  if (!isAuthenticated) {
    return <Navigate to="/choose-role" state={{ from: location }} replace />;
  }

  const userRole = user?.role;
  const userRoles = Array.isArray(user?.roles) ? user.roles : (userRole ? [userRole] : []);

  if (allowedRoles && allowedRoles.length > 0) {
    const hasAccess = userRoles.some(r => allowedRoles.includes(r));
    if (!hasAccess) return <Navigate to="/choose-role" replace />;
  }

  return children;
}