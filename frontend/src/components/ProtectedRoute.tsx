import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated, userType } = useAuthStore();
  const location = useLocation();

  if (!isAuthenticated) {
    // Redirect to appropriate login based on the path
    if (location.pathname.startsWith('/student')) {
      return <Navigate to="/student/login" replace />;
    }
    return <Navigate to="/login" replace />;
  }

  // Optional: Add type-based route protection
  if (location.pathname.startsWith('/student') && userType !== 'student') {
    return <Navigate to="/professor/dashboard" replace />;
  }
  
  if (location.pathname.startsWith('/professor') && userType !== 'professor') {
    return <Navigate to="/student/dashboard" replace />;
  }

  return <>{children}</>;
};
