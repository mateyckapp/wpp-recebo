import { NextRequest, NextResponse } from 'next/server';

const API_URL = process.env['API_URL'] ?? process.env['NEXT_PUBLIC_API_URL'] ?? 'http://localhost:3001/api/v1';

export async function POST(request: NextRequest): Promise<NextResponse> {
  const refreshToken = request.cookies.get('refresh_token')?.value;

  try {
    if (refreshToken) {
      await fetch(`${API_URL}/auth/logout`, {
        method: 'POST',
        headers: { Cookie: `refresh_token=${refreshToken}` },
      });
    }
  } catch {
    // ignora erro da API — limpa o cookie sempre
  }

  const response = NextResponse.json({});
  response.cookies.delete('refresh_token');
  return response;
}
