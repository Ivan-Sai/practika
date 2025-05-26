import React, { useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const ProtectedRoute = ({ children, isAdmin = false }) => {
  const { isAuthenticated, user, loading } = useAuth();
  // Add debugging
  useEffect(() => {
    console.log('ProtectedRoute rendered');
    console.log('isAuthenticated:', isAuthenticated);
    console.log('user:', user);
    console.log('isAdmin prop:', isAdmin);
    console.log('user role:', user?.role);
    console.log('admin check:', isAdmin && user?.role !== 'ADMIN');
  }, [isAuthenticated, user, isAdmin]);
  if (loading) {    console.log('ProtectedRoute: Loading...');    return <div>Loading...</div>;
  }

  if (!isAuthenticated) {    console.log('ProtectedRoute: Not authenticated, redirecting to login');    return <Navigate to="/login" />;
  }

  if (isAdmin && user?.role !== 'ADMIN') {    console.log('ProtectedRoute: Not admin, redirecting to home');    return <Navigate to="/" />;
  }
  console.log('ProtectedRoute: Rendering children');  return children;
};

export default ProtectedRoute;