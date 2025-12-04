import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { ApolloProvider } from "@apollo/client/react";
import { client } from './utils/apolloClientSetup';
import { ToastProvider } from './utils/toastContext';
import Login from './pages/Login';
import Header from './components/Header';
import Dashboard from './pages/Dashboard';
import Project from './pages/Project';
import Admin from './pages/Admin';
import PrivateRoute from './components/PrivateRoute';
import './App.css';

const AppContent: React.FC = () => {
  const location = useLocation();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', width: '100vw' }}>
      <Header />
      <main style={{ flex: 1, position: 'relative', width: '100%' }}>
        {location.pathname !== '/project' && (
          <div style={{
            position: 'fixed',
            zIndex: 0,
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            pointerEvents: 'none',
          }}>
          </div>
        )}
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<Login />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/project" element={
            <PrivateRoute>
              <Project />
            </PrivateRoute>
          } />
          <Route path="/admin" element={
            <PrivateRoute requiredRole="ADMIN">
              <Admin />
            </PrivateRoute>
          } />
        </Routes>
      </main>
    </div>
  );
};

const App: React.FC = () => (
  <ApolloProvider client={client}>
    <ToastProvider>
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </ToastProvider>
  </ApolloProvider>
);

export default App;
