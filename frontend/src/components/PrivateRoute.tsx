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
    console.log('PrivateRoute: No token found, redirecting to login');
    return <Navigate to="/login" />;
  }
  
  const payload = parseJwt(token);
  if (!payload) {
    console.log('PrivateRoute: Invalid token payload, redirecting to login');
    return <Navigate to="/login" />;
  }
  
  // Check role requirements
  if (requiredRole) {
    if (requiredRole === 'ADMIN') {
      // Allow both ADMIN and SUPERADMIN to access admin routes
      if (payload.role !== 'ADMIN' && payload.role !== 'SUPERADMIN') {
        console.log('PrivateRoute: Access denied. User role:', payload.role, 'Required: ADMIN or SUPERADMIN');
        return <Navigate to="/login" />;
      }
    } else if (payload.role !== requiredRole) {
      console.log('PrivateRoute: Access denied. User role:', payload.role, 'Required:', requiredRole);
      return <Navigate to="/login" />;
    }
  }
  return children;
};

export default PrivateRoute;