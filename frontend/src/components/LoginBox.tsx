import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getApiUrl } from '../config/environment';

const LoginBox: React.FC = () => {
  const [mode, setMode] = useState<'login' | 'create'>('login');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [password2, setPassword2] = useState('');
  const [error, setError] = useState('');
  const [isCreatingUser, setIsCreatingUser] = useState(false);
  const [cooldownSeconds, setCooldownSeconds] = useState(0);
  const navigate = useNavigate();

  // Cooldown timer
  useEffect(() => {
    if (cooldownSeconds > 0) {
      const timer = setTimeout(() => {
        setCooldownSeconds(cooldownSeconds - 1);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [cooldownSeconds]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (mode === 'login') {
      try {
        const res = await fetch(getApiUrl('/users/verify'), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username, password }),
        });
        if (res.ok) {
          const data = await res.json();
          if (data.token) {
            localStorage.setItem('token', data.token); // Save JWT for later use
            navigate('/dashboard');
          } else {
            setError('Login failed: No token received');
          }
        } else {
          const data = await res.json();
          setError(data.message || 'Login failed');
        }
      } catch (err) {
        setError('Network error');
      }
    } else {
      // Check if user creation is on cooldown
      if (cooldownSeconds > 0) {
        setError(`Please wait ${cooldownSeconds} seconds before creating another user`);
        return;
      }

      if (password !== password2) {
        setError('Passwords do not match');
        return;
      }

      // Validate password requirements
      if (password.length < 8) {
        setError('Password must be at least 8 characters long');
        return;
      }

      if (!/[A-Z]/.test(password)) {
        setError('Password must contain at least one uppercase letter');
        return;
      }

      if (!/\d/.test(password)) {
        setError('Password must contain at least one number');
        return;
      }

      // Registration logic with cooldown
      try {
        setIsCreatingUser(true);
        const res = await fetch(getApiUrl('/users/create'), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username, password }),
        });
        if (res.ok) {
          setError('Account created successfully!');
          setMode('login');
          setPassword('');
          setPassword2('');
          // Start 10-second cooldown
          setCooldownSeconds(10);
        } else {
          // Try to parse error message from backend
          try {
            const data = await res.json();
            setError(data.message || 'Account creation failed');
          } catch {
            // If parsing fails, show generic error
            setError('Account creation failed');
          }
        }
      } catch (err) {
        setError('Network error: Could not connect to server');
      } finally {
        setIsCreatingUser(false);
      }
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
        <label style={{ display: 'inline-block', position: 'relative', width: '54px', height: '30px' }}>
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
          placeholder="Username"
          value={username}
          onChange={e => setUsername(e.target.value)}
          style={{
            width: '100%',
            marginBottom: '16px',
            paddingLeft: '12px',
            paddingRight: '12px',
            paddingTop: '12px',
            paddingBottom: '12px',
            borderRadius: '8px',
            border: '1px solid #022AFF',
            background: 'rgba(240,240,255,0.95)',
            color: '#222',
            fontSize: '1.05rem',
            boxShadow: '0 2px 8px rgba(2,42,255,0.07)',
            boxSizing: 'border-box', // <-- add this line
          }}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          style={{
            width: '100%',
            marginBottom: mode === 'create' ? '16px' : '28px',
            paddingLeft: '12px',
            paddingRight: '12px',
            paddingTop: '12px',
            paddingBottom: '12px',
            borderRadius: '8px',
            border: '1px solid #022AFF',
            background: 'rgba(240,240,255,0.95)',
            color: '#222',
            fontSize: '1.05rem',
            boxShadow: '0 2px 8px rgba(2,42,255,0.07)',
            boxSizing: 'border-box', // <-- add this line
          }}
        />
        {mode === 'create' && (
          <>
            <input
              type="password"
              placeholder="Repeat Password"
              value={password2}
              onChange={e => setPassword2(e.target.value)}
              style={{
                width: '100%',
                marginBottom: '12px',
                paddingLeft: '12px',
                paddingRight: '12px',
                paddingTop: '12px',
                paddingBottom: '12px',
                borderRadius: '8px',
                border: '1px solid #022AFF',
                background: 'rgba(240,240,255,0.95)',
                color: '#222',
                fontSize: '1.05rem',
                boxShadow: '0 2px 8px rgba(2,42,255,0.07)',
                boxSizing: 'border-box', // <-- add this line
              }}
            />
            <div
              style={{
                fontSize: '0.85rem',
                color: '#666',
                marginBottom: '20px',
                padding: '8px 12px',
                background: 'rgba(2,42,255,0.05)',
                borderRadius: '6px',
                border: '1px solid rgba(2,42,255,0.15)',
              }}
            >
              <strong>Password requirements:</strong>
              <ul style={{ margin: '4px 0 0 0', paddingLeft: '20px' }}>
                <li style={{ color: password.length >= 8 ? '#388e3c' : '#666' }}>
                  At least 8 characters
                </li>
                <li style={{ color: /[A-Z]/.test(password) ? '#388e3c' : '#666' }}>
                  At least one uppercase letter
                </li>
                <li style={{ color: /\d/.test(password) ? '#388e3c' : '#666' }}>
                  At least one number
                </li>
              </ul>
            </div>
          </>
        )}
        {error && (
          <div
            style={{
              color: error.includes('Account created successfully') ? '#388e3c' : '#d32f2f', // green for success, red for error
              marginBottom: '12px',
              textAlign: 'center',
              fontWeight: 600,
            }}
          >
            {error}
          </div>
        )}
        <button
          type="submit"
          disabled={mode === 'create' && (cooldownSeconds > 0 || isCreatingUser)}
          style={{
            width: '100%',
            padding: '12px 0',
            borderRadius: '8px',
            border: 'none',
            background: mode === 'create' && (cooldownSeconds > 0 || isCreatingUser) 
              ? '#ccc' 
              : '#022AFF',
            color: '#fff',
            fontWeight: 700,
            fontSize: '1.1rem',
            boxShadow: '0 2px 8px rgba(2,42,255,0.18)',
            marginTop: '8px',
            cursor: mode === 'create' && (cooldownSeconds > 0 || isCreatingUser) 
              ? 'not-allowed' 
              : 'pointer',
            opacity: mode === 'create' && (cooldownSeconds > 0 || isCreatingUser) 
              ? 0.6 
              : 1,
          }}
        >
          {mode === 'login' 
            ? 'Login' 
            : isCreatingUser 
              ? 'Creating...'
              : cooldownSeconds > 0 
                ? `Wait ${cooldownSeconds}s`
                : 'Create Account'
          }
        </button>
      </form>
    </div>
  );
};

export default LoginBox;