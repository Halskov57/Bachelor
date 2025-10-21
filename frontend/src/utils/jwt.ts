export function parseJwt(token: string) {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch {
    return null;
  }
}

export function isAdmin(): boolean {
  const token = localStorage.getItem('token');
  if (!token) return false;
  
  const payload = parseJwt(token);
  return payload?.role === 'ADMIN' || payload?.role === 'SUPERADMIN';
}

export function isSuperAdmin(): boolean {
  const token = localStorage.getItem('token');
  if (!token) return false;
  
  const payload = parseJwt(token);
  return payload?.role === 'SUPERADMIN';
}

export function getUserRole(): string | null {
  const token = localStorage.getItem('token');
  if (!token) return null;
  
  const payload = parseJwt(token);
  return payload?.role || null;
}

export function debugToken(): void {
  const token = localStorage.getItem('token');
  if (!token) {
    console.log('No token found in localStorage');
    return;
  }
  
  console.log('Token exists:', token.substring(0, 50) + '...');
  const payload = parseJwt(token);
  console.log('Token payload:', payload);
  console.log('User role:', payload?.role);
  console.log('Token expiry:', payload?.exp ? new Date(payload.exp * 1000) : 'No expiry');
}