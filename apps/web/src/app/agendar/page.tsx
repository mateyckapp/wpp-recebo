import { headers } from 'next/headers';
import { notFound } from 'next/navigation';
import { BookingFlow } from './booking-flow';

const RESERVED = new Set(['app', 'api', 'docs', 'www', 'staging', 'admin', 'mail']);

function extractSlug(host: string): string | null {
  if (host.includes('localhost')) {
    const parts = host.split('.');
    if (parts.length >= 2 && parts[0] && !RESERVED.has(parts[0])) return parts[0];
    return null;
  }
  const domain = process.env['NEXT_PUBLIC_APP_DOMAIN'] ?? 'wpprecebo.pt';
  if (!host.endsWith('.' + domain)) return null;
  const sub = host.slice(0, -(domain.length + 1));
  return sub && !RESERVED.has(sub) ? sub : null;
}

export interface TenantInfo { name: string; slug: string }
export interface PublicService { id: string; name: string; duration: number; price: number | null; description: string | null }
export interface TenantBranding { logoUrl: string | null; primaryColor: string }

export default async function AgendarPage() {
  const headersList = await headers();
  const host = headersList.get('host') ?? '';
  const slug = extractSlug(host);
  if (!slug) notFound();

  const apiBase = process.env['API_URL'] ?? 'http://localhost:3001/api/v1';

  const [infoRes, servicesRes, brandingRes] = await Promise.all([
    fetch(`${apiBase}/public/agenda/info?slug=${slug}`, { next: { revalidate: 300 } }),
    fetch(`${apiBase}/public/agenda/services?slug=${slug}`, { next: { revalidate: 60 } }),
    fetch(`${apiBase}/public/agenda/branding?slug=${slug}`, { next: { revalidate: 300 } }),
  ]);

  if (!infoRes.ok) notFound();

  const info = (await infoRes.json()) as TenantInfo;
  const services = (servicesRes.ok ? await servicesRes.json() : []) as PublicService[];
  const branding = (brandingRes.ok ? await brandingRes.json() : { logoUrl: null, primaryColor: '#7c3aed' }) as TenantBranding;

  return <BookingFlow slug={slug} info={info} services={services} branding={branding} />;
}
