import { create } from 'zustand';
import { api } from '@/lib/api';
import type { UserRole } from '@wpp-recebo/shared';

interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  tenantId: string;
  tenantSlug: string;
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
      return { tenantSlug: data.user.tenantSlug, accessToken: data.accessToken };
    } finally {
      set({ isLoading: false });
    }
  },

  logout: async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' });
    } catch {
      // ignora
    } finally {
      sessionStorage.removeItem('access_token');
      set({ user: null, isAuthenticated: false });
      // Remove o subdomínio: demo.localhost → localhost | tenant.wpprecebo.pt → wpprecebo.pt
      const parts = window.location.hostname.split('.');
      const rootDomain = parts.length > 1 ? parts.slice(1).join('.') : window.location.hostname;
      const port = window.location.port ? `:${window.location.port}` : '';
      window.location.href = `${window.location.protocol}//${rootDomain}${port}`;
    }
  },

  setUser: (user) => set({ user, isAuthenticated: true }),
}));
