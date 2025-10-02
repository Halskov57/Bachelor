import React from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import Beams from './components/Beams';
import LoginBox from './components/LoginBox';
import Header from './components/Header';
import Dashboard from './pages/Dashboard';
import Project from './pages/Project';
import Admin from './pages/Admin';
import PrivateRoute from './components/PrivateRoute';
import './App.css';

const PageTitle: React.FC = () => {
  const location = useLocation();
  let title = "Welcome to Aarhus university's project management system";
  if (location.pathname === '/dashboard') title = 'Select a project';
  else if (location.pathname === '/project') title = 'Projects';
  else if (location.pathname === '/admin') title = 'Admin';
  return <h1 className="page-title">{title}</h1>;
};

const AppContent: React.FC = () => {
  const location = useLocation();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', width: '100vw' }}>
      <Header />
      <main style={{ flex: 1, position: 'relative', width: '100%' }}>
        {/* Only show Beams if not on /project */}
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
            <Beams
              beamWidth={0.1}
              beamHeight={25}
              beamNumber={200}
              lightColor="#022AFF"
              speed={2}
              noiseIntensity={1.75}
              scale={0.5}
              rotation={55}
            />
          </div>
        )}
        {/* Main content below */}
        <PageTitle />
        <Routes>
          <Route path="/" element={<LoginBox />} />
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
  <BrowserRouter>
    <AppContent />
  </BrowserRouter>
);



export default App;