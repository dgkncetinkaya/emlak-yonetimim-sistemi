import { QueryClient } from '@tanstack/react-query';

// Token management utilities
const getTokenFromStorage = (): string | null => {
  try {
    const authData = localStorage.getItem('emlak_auth_user');
    if (authData) {
      const parsed = JSON.parse(authData);
      return parsed.token || null;
    }
  } catch (error) {
    console.error('Error reading token from localStorage:', error);
  }
  return null;
};

// Global logout function for unauthorized access
let globalLogoutFunction: (() => void) | null = null;

export const setGlobalLogoutFunction = (logoutFn: () => void) => {
  globalLogoutFunction = logoutFn;
};

const handleUnauthorized = () => {
  console.warn('🔒 Unauthorized access detected - logging out user');
  if (globalLogoutFunction) {
    globalLogoutFunction();
  } else {
    // Fallback: clear localStorage and redirect
    localStorage.removeItem('emlak_auth_user');
    window.location.href = '/login';
  }
};

interface ApiResponse<T = any> {
  data?: T;
  error?: string;
  message?: string;
  success?: boolean;
}

interface ApiError extends Error {
  status?: number;
  code?: string;
  details?: unknown;
}

class ApiClient {
  private baseURL: string;
  private defaultHeaders: Record<string, string>;

  constructor(baseURL: string = 'http://localhost:3001/api') {
    this.baseURL = baseURL;
    this.defaultHeaders = {
      'Content-Type': 'application/json',
    };
  }

  private getAuthHeaders(): Record<string, string> {
    const token = getTokenFromStorage();
    return token ? { Authorization: `Bearer ${token}` } : {};
  }

  private async handleResponse<T>(response: Response): Promise<T> {
    const contentType = response.headers.get('content-type');
    const isJson = contentType?.includes('application/json');

    let data: any;
    try {
      data = isJson ? await response.json() : await response.text();
    } catch (error) {
      data = null;
    }

    if (!response.ok) {
      const error: ApiError = new Error(
        data?.message || data?.error || `HTTP ${response.status}: ${response.statusText}`
      );
      error.status = response.status;
      error.details = data;

      // Handle specific status codes
      switch (response.status) {
        case 401:
          console.warn('🔒 401 Unauthorized - logging out user');
          handleUnauthorized();
          break;
        case 403:
          console.warn('🚫 403 Forbidden - access denied');
          error.message = 'Bu işlem için yetkiniz bulunmuyor.';
          break;
        case 404:
          console.warn('🔍 404 Not Found - resource not found');
          error.message = 'İstenen kaynak bulunamadı.';
          break;
        case 500:
          console.error('💥 500 Internal Server Error');
          error.message = 'Sunucu hatası oluştu. Lütfen daha sonra tekrar deneyin.';
          break;
        default:
          console.error(`❌ HTTP ${response.status}:`, error.message);
      }

      throw error;
    }

    return data;
  }

  async get<T = any>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    // GET isteklerinde Content-Type header'ı gönderme
    const headers = {
      ...this.getAuthHeaders(),
      ...options.headers,
    };

    const response = await fetch(url, {
      method: 'GET',
      headers,
      credentials: 'include', // withCredentials: true eşdeğeri
      ...options,
    });

    return this.handleResponse<T>(response);
  }

  async post<T = any>(endpoint: string, data?: any, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    const headers = {
      ...this.defaultHeaders,
      ...this.getAuthHeaders(),
      ...options.headers,
    };

    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: data ? JSON.stringify(data) : undefined,
      credentials: 'include', // withCredentials: true eşdeğeri
      ...options,
    });

    return this.handleResponse<T>(response);
  }

  async put<T = any>(endpoint: string, data?: any, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    const headers = {
      ...this.defaultHeaders,
      ...this.getAuthHeaders(),
      ...options.headers,
    };

    const response = await fetch(url, {
      method: 'PUT',
      headers,
      body: data ? JSON.stringify(data) : undefined,
      credentials: 'include', // withCredentials: true eşdeğeri
      ...options,
    });

    return this.handleResponse<T>(response);
  }

  async delete<T = any>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    // DELETE isteklerinde Content-Type header'ı gönderme
    const headers = {
      ...this.getAuthHeaders(),
      ...options.headers,
    };

    const response = await fetch(url, {
      method: 'DELETE',
      headers,
      credentials: 'include', // withCredentials: true eşdeğeri
      ...options,
    });

    return this.handleResponse<T>(response);
  }

  async patch<T = any>(endpoint: string, data?: any, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    const headers = {
      ...this.defaultHeaders,
      ...this.getAuthHeaders(),
      ...options.headers,
    };

    const response = await fetch(url, {
      method: 'PATCH',
      headers,
      body: data ? JSON.stringify(data) : undefined,
      credentials: 'include', // withCredentials: true eşdeğeri
      ...options,
    });

    return this.handleResponse<T>(response);
  }
}

// Create singleton instance
export const apiClient = new ApiClient();

// TanStack Query client with custom configuration
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (failureCount, error: any) => {
        // 401/403/404 hataları için retry=0
        if (error?.status === 401 || error?.status === 403 || error?.status === 404) {
          return false;
        }
        // Diğer hatalar için 3 kez dene
        return failureCount < 3;
      },
      staleTime: 30 * 1000, // 30 seconds
      gcTime: 5 * 60 * 1000, // 5 minutes (formerly cacheTime)
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
    },
    mutations: {
      retry: (failureCount, error: any) => {
        // Don't retry mutations on client errors (4xx)
        if (error?.status >= 400 && error?.status < 500) {
          return false;
        }
        // Retry up to 2 times for server errors
        return failureCount < 2;
      },
    },
  },
});

export default apiClient;
export type { ApiResponse, ApiError };