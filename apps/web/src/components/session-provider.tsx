'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { useAuthStore } from '@/stores/auth.store';
import type { UserRole } from '@wpp-recebo/shared';

interface MeResponse {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  tenantId: string;
  tenantSlug: string;
  emailVerified: boolean;
}

export function SessionProvider(): null {
  const { user, setUser } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (user) return;
    api.get<MeResponse>('/auth/me')
      .then(({ data }) => setUser(data))
      .catch((err: unknown) => {
        const status = (err as { response?: { status?: number } })?.response?.status;
        if (status === 402) {
          const appDomain = process.env['NEXT_PUBLIC_APP_DOMAIN'] ?? 'wpprecebo.pt';
          const rootUrl = process.env.NODE_ENV === 'development'
            ? 'http://localhost:3000'
            : `https://${appDomain}`;
          window.location.href = `${rootUrl}/trial-expired`;
        }
      });
  }, [user, setUser, router]);

  return null;
}
