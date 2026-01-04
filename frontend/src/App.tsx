import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ApolloProvider } from "@apollo/client/react";
import { client } from './utils/apolloClientSetup';
import { ToastProvider } from './utils/toastContext';
import { connectionMonitor } from './utils/connectionMonitor';
import { MainLayout } from './components/layout/MainLayout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Project from './pages/Project';
import Admin from './pages/Admin';
import PrivateRoute from './components/PrivateRoute';
import './App.css';

const AppContent: React.FC = () => {
  // Start connection monitoring when app loads
  useEffect(() => {
    connectionMonitor.startMonitoring();
    
    return () => {
      connectionMonitor.stopMonitoring();
    };
  }, []);

  return (
    <>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
        
        {/* Routes with MainLayout (sidebar) */}
        <Route
          path="/dashboard"
          element={
            <MainLayout>
              <Dashboard />
            </MainLayout>
          }
        />
        <Route
          path="/admin"
          element={
            <PrivateRoute requiredRole="ADMIN">
              <MainLayout>
                <Admin />
              </MainLayout>
            </PrivateRoute>
          }
        />
        
        {/* Project route with MainLayout */}
        <Route
          path="/project"
          element={
            <PrivateRoute>
              <MainLayout>
                <Project />
              </MainLayout>
            </PrivateRoute>
          }
        />
      </Routes>
    </>
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
