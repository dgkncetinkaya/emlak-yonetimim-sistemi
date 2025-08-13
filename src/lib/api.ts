import { useAuth } from '../context/AuthContext';

export const apiFetch = async (url: string, options: RequestInit = {}, token?: string) => {
  const headers = new Headers(options.headers || {});
  headers.set('Content-Type', 'application/json');
  if (token) headers.set('Authorization', `Bearer ${token}`);

  const res = await fetch(url, { ...options, headers });
  if (!res.ok) {
    const data = await res.json().catch(() => ({} as any));
    throw new Error(data.message || 'İstek başarısız');
  }
  return res.json();
};

export const useAuthApi = () => {
  const { user } = useAuth();
  const token = user?.token;
  return {
    get: (url: string) => apiFetch(url, { method: 'GET' }, token),
    post: (url: string, body?: any) => apiFetch(url, { method: 'POST', body: JSON.stringify(body) }, token),
    put: (url: string, body?: any) => apiFetch(url, { method: 'PUT', body: JSON.stringify(body) }, token),
    del: (url: string) => apiFetch(url, { method: 'DELETE' }, token),
  };
};