import { NextResponse, type NextRequest } from 'next/server';

const PUBLIC_PATHS = ['/login', '/register', '/forgot-password', '/reset-password', '/no-workspace', '/agendar'];
const RESERVED_SLUGS = new Set(['app', 'api', 'docs', 'www', 'staging', 'admin', 'mail']);

function extractTenantSlug(host: string): string | null {
  if (host.includes('localhost')) {
    const parts = host.split('.');
    if (parts.length >= 2 && parts[0] && !RESERVED_SLUGS.has(parts[0])) {
      return parts[0];
    }
    return null;
  }
  const appDomain = process.env['NEXT_PUBLIC_APP_DOMAIN'] ?? 'wpprecebo.pt';
  if (!host.endsWith('.' + appDomain)) return null;
  const subdomain = host.slice(0, host.length - appDomain.length - 1);
  if (!subdomain || RESERVED_SLUGS.has(subdomain)) return null;
  return subdomain;
}

export function middleware(request: NextRequest): NextResponse {
  const { pathname } = request.nextUrl;
  const host = request.headers.get('host') ?? '';

  // ── Admin routes ──────────────────────────────────────────────────────────
  if (pathname.startsWith('/admin')) {
    if (pathname === '/admin/login') return NextResponse.next();
    const adminToken = request.cookies.get('admin_token');
    const adminSecret = process.env['ADMIN_SECRET'] ?? '';
    if (!adminToken || !adminSecret || adminToken.value !== adminSecret) {
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }
    return NextResponse.next();
  }

  const slug = extractTenantSlug(host);

  // Sem subdomínio: permite landing page e todas as rotas de auth
  if (!slug) {
    const allowedWithoutTenant = ['/', '/login', '/register', '/forgot-password', '/reset-password', '/no-workspace', '/lp'];
    if (allowedWithoutTenant.some((p) => pathname === p || pathname.startsWith(p + '/'))) {
      return NextResponse.next();
    }
    return NextResponse.redirect(new URL('/no-workspace', request.url));
  }

  // Com subdomínio: auth guard
  const isPublic = PUBLIC_PATHS.some((p) => pathname.startsWith(p));
  const hasRefreshToken = request.cookies.has('refresh_token');

  if (!isPublic && !hasRefreshToken) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|api).*)'],
};
