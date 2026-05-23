import { NextResponse, type NextRequest } from 'next/server';

// PÃ¡ginas pÃºblicas APENAS no domÃ­nio raiz (sem subdomÃ­nio)
const ROOT_ONLY_PATHS = ['/login', '/register', '/forgot-password', '/reset-password'];

// PÃ¡ginas pÃºblicas em subdomÃ­nios (nÃ£o precisam de refresh_token)
const SUBDOMAIN_PUBLIC_PATHS = ['/agendar', '/auth/hydrate', '/verify-email'];

const RESERVED_SLUGS = new Set(['app', 'api', 'docs', 'www', 'staging', 'admin', 'mail']);

function extractTenantSlug(host: string): string | null {
  if (host.includes('localhost')) {
    const parts = host.split('.');
    if (parts.length >= 2 && parts[0] && !RESERVED_SLUGS.has(parts[0])) {
      return parts[0];
    }
    return null;
  }
  const appDomain = process.env['NEXT_PUBLIC_APP_DOMAIN'] ?? 'wpprecebo.com';
  if (!host.endsWith('.' + appDomain)) return null;
  const subdomain = host.slice(0, host.length - appDomain.length - 1);
  if (!subdomain || RESERVED_SLUGS.has(subdomain)) return null;
  return subdomain;
}

function getRootLoginUrl(host: string, request: NextRequest): URL {
  const proto = process.env['NODE_ENV'] === 'production' ? 'https' : 'http';
  const parts = host.split(':');
  const hostname = parts[0] ?? host;
  const port = parts[1] ?? '';
  const hostnameParts = hostname.split('.');
  // Remove subdomÃ­nio: demo.localhost â†’ localhost | tenant.wpprecebo.com â†’ wpprecebo.com
  const rootHostname = hostnameParts.length > 1 ? hostnameParts.slice(1).join('.') : hostname;
  const rootHost = port ? `${rootHostname}:${port}` : rootHostname;
  return new URL(`${proto}://${rootHost}/login`);
}

export function middleware(request: NextRequest): NextResponse {
  const { pathname } = request.nextUrl;
  const host = request.headers.get('host') ?? '';

  // â”€â”€ Admin routes â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
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

  // â”€â”€ Sem subdomÃ­nio (domÃ­nio raiz) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  if (!slug) {
    const allowedWithoutTenant = ['/', '/login', '/register', '/forgot-password', '/reset-password', '/verify-email', '/no-workspace', '/lp', '/trial-expired', '/produtos', '/docs', '/terms', '/privacy', '/cookies', '/pagar'];
    if (allowedWithoutTenant.some((p) => pathname === p || pathname.startsWith(p + '/'))) {
      return NextResponse.next();
    }
    return NextResponse.redirect(new URL('/no-workspace', request.url));
  }

  // â”€â”€ Com subdomÃ­nio â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  // Login e registo nunca sÃ£o acessÃ­veis em subdomÃ­nios â€” redireciona para o domÃ­nio raiz
  if (ROOT_ONLY_PATHS.some((p) => pathname === p || pathname.startsWith(p + '/'))) {
    return NextResponse.redirect(getRootLoginUrl(host, request));
  }

  // PÃ¡ginas pÃºblicas do subdomÃ­nio (agenda pÃºblica, hydrate de sessÃ£o)
  const isPublic = SUBDOMAIN_PUBLIC_PATHS.some((p) => pathname.startsWith(p));
  if (isPublic) return NextResponse.next();

  // Rotas protegidas â€” exigem refresh_token
  const hasRefreshToken = request.cookies.has('refresh_token');
  if (!hasRefreshToken) {
    return NextResponse.redirect(getRootLoginUrl(host, request));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|api).*)'],
};
