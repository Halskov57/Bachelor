import React from 'react';

const Dashboard: React.FC = () => {
  return (
    <div
      style={{
        margin: 'auto',
        padding: '40px',
        maxWidth: '600px',
        textAlign: 'center',
        background: 'rgba(230,230,240,0.92)',
        borderRadius: '18px',
        boxShadow: '0 8px 32px 0 rgba(2,42,255,0.18), 0 0 32px 8px rgba(255,255,255,0.10)',
        marginTop: '80px',
      }}
    >
      <h1 style={{ color: '#022AFF', fontWeight: 800, fontSize: '2.5rem' }}>Dashboard</h1>
      <p style={{ fontSize: '1.2rem', marginTop: '24px' }}>
        You are logged in! 🎉
      </p>
    </div>
  );
};

export default Dashboard;