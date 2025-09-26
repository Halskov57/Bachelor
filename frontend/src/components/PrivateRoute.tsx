import React, { ReactElement } from 'react';
import { Navigate } from 'react-router-dom';
import { parseJwt } from '../utils/jwt';

interface PrivateRouteProps {
  children: ReactElement;
  requiredRole?: string;
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({ children, requiredRole }) => {
  const token = localStorage.getItem('token');
  if (!token) return <Navigate to="/" />;
  const payload = parseJwt(token);
  if (requiredRole && payload?.role !== requiredRole) return <Navigate to="/" />;
  return children;
};

export default PrivateRoute;