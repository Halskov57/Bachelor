import React from 'react';
import { debugToken, parseJwt, isAdmin, isSuperAdmin, getUserRole } from '../utils/jwt';

const DebugAuth: React.FC = () => {
  const token = localStorage.getItem('token');
  const payload = token ? parseJwt(token) : null;

  const handleDebug = () => {
    debugToken();
  };

  return (
    <div style={{ 
      padding: '20px', 
      maxWidth: '600px', 
      margin: '0 auto',
      position: 'relative',
      zIndex: 1000,
      backgroundColor: 'rgba(255, 255, 255, 0.95)',
      borderRadius: '8px',
      marginTop: '100px'
    }}>
      <h1>Auth Debug Page</h1>
      
      <button onClick={handleDebug} style={{ marginBottom: '20px', padding: '10px' }}>
        Debug Token (Check Console)
      </button>
      
      <div style={{ backgroundColor: '#f5f5f5', padding: '15px', borderRadius: '5px' }}>
        <h3>Current Auth Status:</h3>
        <p><strong>Token exists:</strong> {token ? 'Yes' : 'No'}</p>
        <p><strong>Token length:</strong> {token?.length || 'N/A'}</p>
        <p><strong>Payload exists:</strong> {payload ? 'Yes' : 'No'}</p>
        <p><strong>Username:</strong> {payload?.sub || 'N/A'}</p>
        <p><strong>Role:</strong> {payload?.role || 'N/A'}</p>
        <p><strong>Expiry:</strong> {payload?.exp ? new Date(payload.exp * 1000).toLocaleString() : 'N/A'}</p>
        
        <hr />
        
        <h4>Role Checks:</h4>
        <p><strong>isAdmin():</strong> {isAdmin() ? 'Yes' : 'No'}</p>
        <p><strong>isSuperAdmin():</strong> {isSuperAdmin() ? 'Yes' : 'No'}</p>
        <p><strong>getUserRole():</strong> {getUserRole() || 'N/A'}</p>
      </div>
      
      {token && (
        <div style={{ backgroundColor: '#e8f5e8', padding: '15px', borderRadius: '5px', marginTop: '10px' }}>
          <h4>Raw Token (first 100 chars):</h4>
          <code style={{ wordBreak: 'break-all', fontSize: '12px' }}>
            {token.substring(0, 100)}...
          </code>
        </div>
      )}
    </div>
  );
};

export default DebugAuth;