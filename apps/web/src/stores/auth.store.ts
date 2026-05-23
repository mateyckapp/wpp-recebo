import { create } from 'zustand';
import { api } from '@/lib/api';
import type { UserRole } from '@wpp-recebo/shared';

function setSessionCookie(name: string, slug: string): void {
  if (typeof window === 'undefined') return;
  const value = encodeURIComponent(JSON.stringify({ name, slug }));
  const domain = window.location.hostname.includes('localhost') ? 'localhost' : '.wpprecebo.com';
  const secure = window.location.protocol === 'https:' ? '; Secure' : '';
  document.cookie = `wpp_session=${value}; domain=${domain}; path=/; max-age=${30 * 24 * 60 * 60}; SameSite=Lax${secure}`;
}

function clearSessionCookie(): void {
  if (typeof window === 'undefined') return;
  const domain = window.location.hostname.includes('localhost') ? 'localhost' : '.wpprecebo.com';
  document.cookie = `wpp_session=; domain=${domain}; path=/; max-age=0`;
}

interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  tenantId: string;
  tenantSlug: string;
  emailVerified?: boolean;
}

interface AuthState {
  user: AuthUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;

  login: (email: string, password: string) => Promise<{ tenantSlug: string; accessToken: string }>;
  logout: () => Promise<void>;
  setUser: (user: AuthUser) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoading: false,
  isAuthenticated: false,

  login: async (email, password) => {
    set({ isLoading: true });
    try {
      const { data } = await api.post<{ accessToken: string; user: AuthUser }>('/auth/login', {
        email,
        password,
      });

      sessionStorage.setItem('access_token', data.accessToken);
      set({ user: data.user, isAuthenticated: true });
      setSessionCookie(data.user.name, data.user.tenantSlug);
      return { tenantSlug: data.user.tenantSlug, accessToken: data.accessToken };
    } catch (err) {
      set({ isLoading: false });
      throw err;
    }
  },

  logout: async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' });
    } catch {
      // ignora
    } finally {
      sessionStorage.removeItem('access_token');
      clearSessionCookie();
      set({ user: null, isAuthenticated: false });
      // Remove o subdomínio: demo.localhost → localhost | tenant.wpprecebo.pt → wpprecebo.pt
      const parts = window.location.hostname.split('.');
      const rootDomain = parts.length > 1 ? parts.slice(1).join('.') : window.location.hostname;
      const port = window.location.port ? `:${window.location.port}` : '';
      window.location.href = `${window.location.protocol}//${rootDomain}${port}/login`;
    }
  },

  setUser: (user) => {
    set({ user, isAuthenticated: true });
    setSessionCookie(user.name, user.tenantSlug ?? '');
  },
}));
