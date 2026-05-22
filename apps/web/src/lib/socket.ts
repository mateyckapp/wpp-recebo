import { io, type Socket } from 'socket.io-client';

const WS_URL = (process.env['NEXT_PUBLIC_API_URL'] ?? 'http://localhost:3001/api/v1')
  .replace('/api/v1', '');

let socket: Socket | null = null;

export function getSocket(): Socket {
  if (!socket) {
    const token = typeof window !== 'undefined' ? (sessionStorage.getItem('access_token') ?? '') : '';
    socket = io(`${WS_URL}/ws`, {
      auth: { token },
      transports: ['websocket'],
      autoConnect: false,
    });
  }
  return socket;
}

export function connectSocket(token: string): void {
  const s = getSocket();
  (s.auth as Record<string, string>)['token'] = token;
  if (!s.connected) s.connect();
}

export function disconnectSocket(): void {
  if (socket?.connected) socket.disconnect();
  socket = null;
}
