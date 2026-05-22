import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const API_URL = process.env['API_URL'] ?? 'http://localhost:3001/api/v1';
const ADMIN_SECRET = process.env['ADMIN_SECRET'] ?? '';

type RouteContext = { params: Promise<{ path: string[] }> };

async function handler(request: NextRequest, context: RouteContext): Promise<NextResponse> {
  const cookieStore = await cookies();
  const adminToken = cookieStore.get('admin_token');

  if (!ADMIN_SECRET || !adminToken || adminToken.value !== ADMIN_SECRET) {
    return NextResponse.json({ message: 'Não autorizado' }, { status: 401 });
  }

  const { path } = await context.params;
  const pathStr = path.join('/');
  const searchParams = request.nextUrl.searchParams.toString();
  const url = `${API_URL}/admin/${pathStr}${searchParams ? `?${searchParams}` : ''}`;

  const hasBody = request.method !== 'GET' && request.method !== 'HEAD';
  const body = hasBody ? await request.text() : undefined;

  const upstream = await fetch(url, {
    method: request.method,
    headers: {
      'Content-Type': 'application/json',
      'X-Admin-Secret': ADMIN_SECRET,
    },
    body,
  });

  const text = await upstream.text();
  let data: unknown;
  try {
    data = JSON.parse(text);
  } catch {
    data = text;
  }

  return NextResponse.json(data, { status: upstream.status });
}

export { handler as GET, handler as POST, handler as PATCH, handler as DELETE };
