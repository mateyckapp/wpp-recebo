import { create } from 'zustand';

export interface AppNotification {
  id: string;
  type: 'message' | 'appointment' | 'system';
  title: string;
  body: string;
  href?: string;
  timestamp: Date;
  read: boolean;
}

interface NotificationsStore {
  notifications: AppNotification[];
  add: (n: Omit<AppNotification, 'id' | 'timestamp' | 'read'>) => void;
  markRead: (id: string) => void;
  markAllRead: () => void;
  clear: () => void;
}

export const useNotificationsStore = create<NotificationsStore>((set) => ({
  notifications: [],

  add: (n) =>
    set((state) => ({
      notifications: [
        { ...n, id: `${Date.now()}-${Math.random()}`, timestamp: new Date(), read: false },
        ...state.notifications,
      ].slice(0, 50),
    })),

  markRead: (id) =>
    set((state) => ({
      notifications: state.notifications.map((n) => (n.id === id ? { ...n, read: true } : n)),
    })),

  markAllRead: () =>
    set((state) => ({
      notifications: state.notifications.map((n) => ({ ...n, read: true })),
    })),

  clear: () => set({ notifications: [] }),
}));

export function unreadCount(notifications: AppNotification[]): number {
  return notifications.filter((n) => !n.read).length;
}
