import { AsyncLocalStorage } from 'async_hooks';

interface TenantStore {
  tenantId: string;
  tenantSlug: string;
}

export const tenantStorage = new AsyncLocalStorage<TenantStore>();

export function getCurrentTenantId(): string | undefined {
  return tenantStorage.getStore()?.tenantId;
}

export function getCurrentTenantSlug(): string | undefined {
  return tenantStorage.getStore()?.tenantSlug;
}
