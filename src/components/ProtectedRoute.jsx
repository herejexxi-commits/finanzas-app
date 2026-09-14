import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const ProtectedRoute = ({ children }) => {
  const { user } = useAuth();

  if (!user) {
    // Redirect to the login page if there is no user
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;
