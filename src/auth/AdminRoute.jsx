import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from './useAuth.js';

const AdminRoute = ({ children }) => {
  const { isAdmin, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>; // Or a spinner
  }

  return isAdmin ? children : <Navigate to="/" />;
};

export default AdminRoute;