import { NextRequest, NextResponse } from 'next/server';

const API_URL = process.env['NEXT_PUBLIC_API_URL'] ?? 'http://localhost:3001/api/v1';

export async function POST(request: NextRequest): Promise<NextResponse> {
  const refreshToken = request.cookies.get('refresh_token')?.value;

  console.log('[api/auth/refresh] cookie presente:', !!refreshToken);

  if (!refreshToken) {
    return NextResponse.json({ message: 'Sem refresh token' }, { status: 401 });
  }

  try {
    const res = await fetch(`${API_URL}/auth/refresh`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${refreshToken}`,
      },
    });

    console.log('[api/auth/refresh] NestJS status:', res.status);

    if (!res.ok) {
      const body = await res.text().catch(() => '');
      console.error('[api/auth/refresh] NestJS erro:', body);
      return NextResponse.json({ message: 'Sessão expirada' }, { status: 401 });
    }

    const data = (await res.json()) as { accessToken: string };
    return NextResponse.json(data);
  } catch (err) {
    console.error('[api/auth/refresh] fetch erro:', err);
    return NextResponse.json({ message: 'Erro interno' }, { status: 500 });
  }
}
