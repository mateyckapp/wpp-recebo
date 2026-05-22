import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest): Promise<NextResponse> {
  const body = await request.json() as { password?: string };
  const adminSecret = process.env['ADMIN_SECRET'] ?? '';

  if (!adminSecret || body.password !== adminSecret) {
    return NextResponse.json({ message: 'Senha incorreta' }, { status: 401 });
  }

  const response = NextResponse.json({ success: true });
  response.cookies.set('admin_token', adminSecret, {
    httpOnly: true,
    secure: process.env['NODE_ENV'] === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: '/',
  });

  return response;
}
