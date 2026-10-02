/**
 * Dynamic API Base URL resolver.
 * Evaluates dynamically in the browser at request execution time so that:
 * 1. Customers on the public Render web dashboard (https://jj-ai-dashboard.onrender.com)
 *    or custom cloud domains communicate with https://jj-ai-gateway.onrender.com.
 * 2. Standalone backend portal visits (https://jj-ai-gateway.onrender.com) use the origin.
 * 3. Local administrator/developer testing on localhost:3000 connects to http://localhost:3001.
 */
export function getApiBase(): string {
  if (typeof window !== 'undefined') {
    const host = window.location.hostname;
    // Local development or local administrator access
    if (host === 'localhost' || host === '127.0.0.1' || host === '::1' || host.endsWith('.local')) {
      return 'http://localhost:3001';
    }
    // Directly hosted on the Render gateway backend (unified static serving)
    if (host.includes('jj-ai-gateway') || host.includes('gateway')) {
      return window.location.origin;
    }
    // Check if a non-localhost custom API URL was configured in environment
    const customUrl = process.env.NEXT_PUBLIC_API_URL;
    if (customUrl && !customUrl.includes('localhost') && !customUrl.includes('127.0.0.1')) {
      return customUrl;
    }
    // Default public cloud gateway
    return 'https://jj-ai-gateway.onrender.com';
  }
  return 'https://jj-ai-gateway.onrender.com';
}

export interface ApiResponse<T = any> {
  data?: T;
  error?: string;
  status: number;
}

export class ApiClient {
  private static getToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('gw_token');
  }

  public static setToken(token: string) {
    if (typeof window !== 'undefined') {
      localStorage.setItem('gw_token', token);
    }
  }

  public static clearToken() {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('gw_token');
    }
  }

  public static async request<T = any>(
    path: string,
    options: RequestInit = {}
  ): Promise<{ data: T | null; error: string | null; status: number }> {
    const baseUrl = getApiBase();
    const token = this.getToken();
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...((options.headers as Record<string, string>) || {})
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    try {
      const res = await fetch(`${baseUrl}${path}`, {
        ...options,
        headers
      });

      const contentType = res.headers.get('content-type');
      let body: any = null;

      if (contentType && contentType.includes('application/json')) {
        body = await res.json();
      } else {
        body = await res.text();
      }

      if (!res.ok) {
        let errMessage = 'Request failed';
        if (body && typeof body === 'object') {
          if (body.error?.message) {
            errMessage = body.error.message;
            if (body.error.suggestion) {
              errMessage += ` (${body.error.suggestion})`;
            }
          } else if (body.message) {
            errMessage = body.message;
          }
        }
        return { data: null, error: errMessage, status: res.status };
      }

      return { data: body, error: null, status: res.status };
    } catch (err: any) {
      return { data: null, error: err.message || 'Network connection failed', status: 0 };
    }
  }

  // Auth endpoints
  static auth = {
    login: (body: { email: string; password: string }) =>
      ApiClient.request('/api/auth/login', { method: 'POST', body: JSON.stringify(body) }),
    register: (body: { email: string; password: string; name?: string }) =>
      ApiClient.request('/api/auth/register', { method: 'POST', body: JSON.stringify(body) }),
    getMe: () =>
      ApiClient.request('/api/auth/me'),
    getKeys: () =>
      ApiClient.request('/api/auth/keys'),
    createKey: (name: string) =>
      ApiClient.request('/api/auth/keys', { method: 'POST', body: JSON.stringify({ name }) }),
    revokeKey: (id: string) =>
      ApiClient.request(`/api/auth/keys/${id}`, { method: 'DELETE' }),
    changePassword: (body: { currentPassword: string; newPassword: string }) =>
      ApiClient.request('/api/auth/change-password', { method: 'POST', body: JSON.stringify(body) })
  };

  // CDK endpoints
  static cdk = {
    redeem: (code: string) =>
      ApiClient.request('/api/cdk/redeem', { method: 'POST', body: JSON.stringify({ code }) }),
    adminGenerate: (body: { count: number; tokenQuota: number; tier?: string; expiresInDays?: number }) =>
      ApiClient.request('/api/cdk/admin/generate', { method: 'POST', body: JSON.stringify(body) }),
    adminList: () =>
      ApiClient.request('/api/cdk/admin/list'),
    exportCsv: async (): Promise<Blob> => {
      const baseUrl = getApiBase();
      const token = ApiClient.getToken();
      const res = await fetch(`${baseUrl}/api/cdk/admin/export`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      if (!res.ok) {
        throw new Error('Failed to export CSV. Please ensure you are logged in as admin.');
      }
      return res.blob();
    },
    getExportUrl: () => `${getApiBase()}/api/cdk/admin/export`
  };

  // Usage endpoints
  static usage = {
    getDashboard: () =>
      ApiClient.request('/api/usage/dashboard')
  };

  // Admin endpoints
  static admin = {
    getStats: () =>
      ApiClient.request('/api/admin/stats'),
    getUsers: (search?: string) =>
      ApiClient.request('/api/admin/users' + (search ? `?search=${encodeURIComponent(search)}` : '')),
    getUser: (id: string) =>
      ApiClient.request(`/api/admin/users/${id}`),
    updateUserStatus: (id: string, isActive: boolean) =>
      ApiClient.request(`/api/admin/users/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ isActive })
      }),
    addCredits: (id: string, tokens: number) =>
      ApiClient.request(`/api/admin/users/${id}/credits`, {
        method: 'POST',
        body: JSON.stringify({ tokens })
      }),
    deleteUser: (id: string) =>
      ApiClient.request(`/api/admin/users/${id}`, {
        method: 'DELETE'
      }),
    resetUserPassword: (id: string, newPassword: string) =>
      ApiClient.request(`/api/admin/users/${id}/reset-password`, {
        method: 'POST',
        body: JSON.stringify({ newPassword })
      })
  };
}
