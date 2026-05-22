'use client';

import { useEffect } from 'react';
import { connectSocket, disconnectSocket, getSocket } from '@/lib/socket';
import { useAuthStore } from '@/stores/auth.store';
import { useNotificationsStore } from '@/stores/notifications.store';

export function SocketProvider(): null {
  const user = useAuthStore((s) => s.user);
  const addNotification = useNotificationsStore((s) => s.add);

  useEffect(() => {
    if (!user) return;
    const token = sessionStorage.getItem('access_token') ?? '';
    if (!token) return;

    connectSocket(token);
    const socket = getSocket();

    const onNewMessage = (data: { direction?: string; contactName?: string; contactPhone?: string; conversationId?: string }) => {
      if (data.direction !== 'INBOUND') return;
      const name = data.contactName ?? data.contactPhone ?? 'Contacto';
      addNotification({
        type: 'message',
        title: 'Nova mensagem',
        body: `Mensagem de ${name}`,
        href: `/conversations?id=${data.conversationId ?? ''}`,
      });
    };

    socket.on('new_message', onNewMessage);

    return () => {
      socket.off('new_message', onNewMessage);
      disconnectSocket();
    };
  }, [user?.id, addNotification]);

  return null;
}
