'use client';

import { useEffect } from 'react';
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
}

export function SessionProvider(): null {
  const { user, setUser } = useAuthStore();

  useEffect(() => {
    if (user) return;
    api.get<MeResponse>('/auth/me')
      .then(({ data }) => setUser(data))
      .catch(() => undefined);
  }, [user, setUser]);

  return null;
}
