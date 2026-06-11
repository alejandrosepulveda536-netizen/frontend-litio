const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://wamanager-litioceldas-production.up.railway.app';

function getToken() {
  if (typeof window === 'undefined') return null;
  return sessionStorage.getItem('ltc_token');
}

export async function apiFetch(path: string, options: RequestInit = {}) {
  const token = getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {}),
  };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
  return res.json();
}

export const API_URL = API_BASE;
