import { create } from "zustand";

interface NotificationState {
  unreadCount: number;
  setUnreadCount: (value: number) => void;
}

export const useNotificationStore = create<NotificationState>((set) => ({
  unreadCount: 0,
  setUnreadCount: (value) => {
    const nextValue = Number.isFinite(value) ? Math.max(value, 0) : 0;
    set({ unreadCount: nextValue });
  },
}));
