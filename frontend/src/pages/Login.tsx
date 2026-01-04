import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { getApiUrl } from '../config/environment';
import { fetchWithRetry } from '../utils/fetchWithRetry';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../components/ui/card';

const Login: React.FC = () => {
  const [mode, setMode] = useState<'login' | 'create'>('login');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [password2, setPassword2] = useState('');
  const [error, setError] = useState('');
  const [isCreatingUser, setIsCreatingUser] = useState(false);
  const [cooldownSeconds, setCooldownSeconds] = useState(0);
  const [isRetrying, setIsRetrying] = useState(false);
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
        setIsRetrying(false);
        const res = await fetchWithRetry(
          getApiUrl('/users/verify'),
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password }),
          },
          {
            maxAttempts: 10,
            initialDelay: 1000,
            maxDelay: 30000,
            persistentRetry: true, // Keep retrying every 30s after initial attempts
            onRetry: (attempt, delay, error) => {
              setIsRetrying(true);
              setError(`Connecting to server... (attempt ${attempt})`);
            }
          }
        );
        setIsRetrying(false);
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
        setIsRetrying(false);
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
        setIsRetrying(false);
        const res = await fetchWithRetry(
          getApiUrl('/users/create'),
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password }),
          },
          {
            maxAttempts: 10,
            initialDelay: 1000,
            maxDelay: 30000,
            persistentRetry: true, // Keep retrying every 30s after initial attempts
            onRetry: (attempt, delay, error) => {
              setIsRetrying(true);
              setError(`Connecting to server... (attempt ${attempt})`);
            }
          }
        );
        setIsRetrying(false);
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
        setIsRetrying(false);
        setError('Network error: Could not connect to server');
      } finally {
        setIsCreatingUser(false);
      }
    }
  };

  return (
    <div className="flex min-h-screen">
      {/* Left side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-[#8B7355] via-[#A0826D] to-[#C9B097] p-12 text-white flex-col justify-between">
        <div>
          <h1 className="text-4xl font-bold mb-4">Project Manager</h1>
          <p className="text-xl text-white/90">
            Organize your work. Track your progress. Achieve your goals.
          </p>
        </div>
        
        <div className="space-y-6">
          <div className="rounded-lg bg-white/10 p-6 backdrop-blur-sm border border-white/20">
            <p className="text-lg italic mb-2">
              "Project Management Made Simple"
            </p>
            <p className="text-sm text-white/70">
              Streamline your workflow with intuitive project organization
            </p>
          </div>
          
          {/* Placeholder for logo/image */}
          <div className="rounded-lg bg-white/5 p-12 backdrop-blur-sm border border-white/10 flex items-center justify-center min-h-[200px]">
            <p className="text-white/50 text-center">
              Logo / Image <br /> Placeholder
            </p>
          </div>
        </div>
      </div>

      {/* Right side - Login Form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-[#F5F1E8]">
        <Card className="w-full max-w-md shadow-lg">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-center">
              {mode === 'login' ? 'Welcome back' : 'Create account'}
            </CardTitle>
            <CardDescription className="text-center">
              {mode === 'login'
                ? 'Enter your credentials to access your account'
                : 'Fill in the details to create a new account'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex justify-center items-center gap-4 mb-6">
              <span className={`text-sm font-semibold ${mode === 'login' ? 'text-primary' : 'text-muted-foreground'}`}>
                Login
              </span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={mode === 'create'}
                  onChange={() => {
                    setMode(mode === 'login' ? 'create' : 'login');
                    setError('');
                    setPassword('');
                    setPassword2('');
                  }}
                  className="sr-only peer"
                />
                <div className="w-14 h-7 bg-muted peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-primary"></div>
              </label>
              <span className={`text-sm font-semibold ${mode === 'create' ? 'text-primary' : 'text-muted-foreground'}`}>
                Create
              </span>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  type="text"
                  placeholder="Enter your username"
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                />
              </div>

              {mode === 'create' && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="password2">Repeat Password</Label>
                    <Input
                      id="password2"
                      type="password"
                      placeholder="Repeat your password"
                      value={password2}
                      onChange={e => setPassword2(e.target.value)}
                      required
                    />
                  </div>

                  <div className="rounded-lg bg-muted p-3 text-sm space-y-1">
                    <p className="font-semibold mb-2">Password requirements:</p>
                    <ul className="space-y-1 ml-4">
                      <li className={password.length >= 8 ? 'text-green-600' : 'text-muted-foreground'}>
                        ✓ At least 8 characters
                      </li>
                      <li className={/[A-Z]/.test(password) ? 'text-green-600' : 'text-muted-foreground'}>
                        ✓ At least one uppercase letter
                      </li>
                      <li className={/\d/.test(password) ? 'text-green-600' : 'text-muted-foreground'}>
                        ✓ At least one number
                      </li>
                    </ul>
                  </div>
                </>
              )}

              {error && (
                <div
                  className={`rounded-lg p-3 text-sm font-semibold text-center ${
                    error.includes('Account created successfully')
                      ? 'bg-green-50 text-green-700 border border-green-200'
                      : 'bg-destructive/10 text-destructive border border-destructive/20'
                  }`}
                >
                  {error}
                </div>
              )}

              <Button
                type="submit"
                disabled={mode === 'create' && (cooldownSeconds > 0 || isCreatingUser)}
                className="w-full"
                size="lg"
              >
                {mode === 'login' ? (
                  isRetrying ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Connecting...
                    </>
                  ) : (
                    'Login'
                  )
                ) : isCreatingUser ? (
                  isRetrying ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Connecting...
                    </>
                  ) : (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating...
                    </>
                  )
                ) : cooldownSeconds > 0 ? (
                  `Wait ${cooldownSeconds}s`
                ) : (
                  'Create Account'
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Login;