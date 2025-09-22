import React, { useState } from 'react';

const LoginBox: React.FC = () => {
  const [mode, setMode] = useState<'login' | 'create'>('login');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [password2, setPassword2] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (mode === 'login') {
      alert(`Login: ${username}`);
    } else {
      if (password !== password2) {
        setError('Passwords do not match');
        return;
      }
      alert(`Create Account: ${username}`);
    }
  };

  return (
    <div
      style={{
        background: 'rgba(230,230,240,0.92)',
        borderRadius: '18px',
        padding: '35px',
        maxWidth: '420px',
        minWidth: '340px',
        margin: 'auto',
        boxShadow: '0 8px 32px 0 rgba(2,42,255,0.18), 0 0 32px 8px rgba(255,255,255,0.10)',
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        border: '1px solid rgba(80, 80, 160, 0.12)',
        color: '#222',
        backdropFilter: 'blur(12px)',
      }}
    >
      <h2
        style={{
          textAlign: 'center',
          marginBottom: '32px',
          color: '#022AFF',
          fontWeight: 800,
          letterSpacing: 1,
          fontSize: '2.5rem',
        }}
      >
        {mode === 'login' ? 'Login' : 'Create Account'}
      </h2>
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginBottom: '28px', gap: '18px' }}>
        <span style={{ color: mode === 'login' ? '#022AFF' : '#888', fontWeight: 600, fontSize: '1.1rem' }}>Login</span>
        <label style={{ display: 'inline-block', position: 'relative', width: '54px', height: '28px' }}>
          <input
            type="checkbox"
            checked={mode === 'create'}
            onChange={() => {
              setMode(mode === 'login' ? 'create' : 'login');
              setError('');
              setPassword('');
              setPassword2('');
            }}
            style={{ opacity: 0, width: 0, height: 0 }}
          />
          <span
            style={{
              position: 'absolute',
              cursor: 'pointer',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: mode === 'create' ? '#022AFF' : '#ccc',
              borderRadius: '14px',
              transition: 'background 0.2s',
            }}
          />
          <span
            style={{
              position: 'absolute',
              left: mode === 'create' ? '28px' : '4px',
              top: '4px',
              width: '20px',
              height: '20px',
              background: '#fff',
              borderRadius: '50%',
              boxShadow: '0 2px 6px rgba(2,42,255,0.12)',
              transition: 'left 0.2s',
              border: '1px solid #aaa',
            }}
          />
        </label>
        <span style={{ color: mode === 'create' ? '#022AFF' : '#888', fontWeight: 600, fontSize: '1.1rem' }}>Create</span>
      </div>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder=" Username"
          value={username}
          onChange={e => setUsername(e.target.value)}
          style={{
            width: '100%',
            marginBottom: '16px',
            padding: '12px 0',
            borderRadius: '8px',
            border: '1px solid #022AFF',
            background: 'rgba(240,240,255,0.95)',
            color: '#222',
            fontSize: '1.05rem',
            boxShadow: '0 2px 8px rgba(2,42,255,0.07)',
          }}
        />
        <input
          type="password"
          placeholder=" Password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          style={{
            width: '100%',
            marginBottom: mode === 'create' ? '16px' : '28px',
            padding: '12px 0',
            borderRadius: '8px',
            border: '1px solid #022AFF',
            background: 'rgba(240,240,255,0.95)',
            color: '#222',
            fontSize: '1.05rem',
            boxShadow: '0 2px 8px rgba(2,42,255,0.07)',
          }}
        />
        {mode === 'create' && (
          <input
            type="password"
            placeholder=" Repeat Password"
            value={password2}
            onChange={e => setPassword2(e.target.value)}
            style={{
              width: '100%',
              marginBottom: '28px',
              padding: '12px 0',
              borderRadius: '8px',
              border: '1px solid #022AFF',
              background: 'rgba(240,240,255,0.95)',
              color: '#222',
              fontSize: '1.05rem',
              boxShadow: '0 2px 8px rgba(2,42,255,0.07)',
            }}
          />
        )}
        {error && (
          <div style={{ color: '#d32f2f', marginBottom: '12px', textAlign: 'center', fontWeight: 600 }}>
            {error}
          </div>
        )}
        <button
          type="submit"
          style={{
            width: '100%',
            padding: '12px 0',
            borderRadius: '8px',
            border: 'none',
            background: '#022AFF',
            color: '#fff',
            fontWeight: 700,
            fontSize: '1.1rem',
            boxShadow: '0 2px 8px rgba(2,42,255,0.18)',
            marginTop: '8px',
            cursor: 'pointer',
          }}
        >
          {mode === 'login' ? 'Login' : 'Create Account'}
        </button>
      </form>
    </div>
  );
};

export default LoginBox;