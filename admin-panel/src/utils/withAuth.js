// src/utils/withAuth.js
import React from 'react';
import { Navigate } from 'react-router-dom';

const withAuth = (WrappedComponent) => {
  return (props) => {
    const isAuthenticated = !!localStorage.getItem('authToken');

    if (!isAuthenticated) {
      return <Navigate to="/admin/login" />;
    }

    return <WrappedComponent {...props} />;
  };
};

export default withAuth;
