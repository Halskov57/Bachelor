import React, { ReactElement } from 'react';
import { Navigate } from 'react-router-dom';
import { parseJwt } from '../utils/jwt';

interface PrivateRouteProps {
  children: ReactElement;
  requiredRole?: string;
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({ children, requiredRole }) => {
  const token = localStorage.getItem('token');
  
  if (!token) {
    return <Navigate to="/login" />;
  }
  
  const payload = parseJwt(token);
  if (!payload) {
    return <Navigate to="/login" />;
  }
  
  // Check role requirements
  if (requiredRole) {
    if (requiredRole === 'ADMIN') {
      // Allow both ADMIN and SUPERADMIN to access admin routes
      if (payload.role !== 'ADMIN' && payload.role !== 'SUPERADMIN') {
        return <Navigate to="/login" />;
      }
    } else if (payload.role !== requiredRole) {
      return <Navigate to="/login" />;
    }
  }
  return children;
};

export default PrivateRoute;