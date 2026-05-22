import { NextRequest, NextResponse } from 'next/server';

const API_URL = process.env['NEXT_PUBLIC_API_URL'] ?? 'http://localhost:3001/api/v1';

export async function GET(request: NextRequest): Promise<NextResponse> {
  const { searchParams } = new URL(request.url);
  const at = searchParams.get('at');
  const next = searchParams.get('next') ?? '/kanban';

  const host = request.headers.get('host') ?? 'localhost:3000';
  const proto = process.env['NODE_ENV'] === 'production' ? 'https' : 'http';
  const baseUrl = `${proto}://${host}`;

  console.log('[auth/sync] host:', host, '| at presente:', !!at, '| next:', next);

  if (!at) {
    return NextResponse.redirect(`${baseUrl}/login`);
  }

  try {
    const res = await fetch(`${API_URL}/auth/issue-refresh`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${at}`,
        'Content-Type': 'application/json',
      },
    });

    console.log('[auth/sync] issue-refresh status:', res.status);

    if (!res.ok) {
      const body = await res.text().catch(() => '');
      console.error(`[auth/sync] issue-refresh falhou: ${res.status}`, body);
      return NextResponse.redirect(`${baseUrl}/login`);
    }

    const { refreshToken } = (await res.json()) as { refreshToken: string };

    // Redireciona para /auth/hydrate que armazena o access token no sessionStorage
    // do subdomínio correto antes de entrar no dashboard — evita token stale de sessões anteriores
    const hydrateUrl = `${baseUrl}/auth/hydrate?at=${encodeURIComponent(at)}&next=${encodeURIComponent(next)}`;
    console.log('[auth/sync] refreshToken obtido, a redirecionar para hydrate:', hydrateUrl);

    const response = NextResponse.redirect(hydrateUrl);
    response.cookies.set('refresh_token', refreshToken, {
      httpOnly: true,
      sameSite: 'lax',
      path: '/',
      maxAge: 30 * 24 * 60 * 60,
      secure: process.env['NODE_ENV'] === 'production',
    });

    return response;
  } catch (err) {
    console.error('[auth/sync] erro no fetch:', err);
    return NextResponse.redirect(`${baseUrl}/login`);
  }
}
