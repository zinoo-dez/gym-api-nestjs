import { useState, useEffect } from "react";
import type { Notification } from "@/components/gym/NotificationPopup";
import { notificationsService } from "@/services/notifications.service";
import { useAuthStore } from "@/store/auth.store";

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const user = useAuthStore((state) => state.user);

  useEffect(() => {
    const loadNotifications = async () => {
      if (!user) return;
      try {
        const data =
          user.role === "ADMIN"
            ? await notificationsService.getAdmin()
            : await notificationsService.getMe();
        setNotifications(
          data.map((n: any) => ({
            ...n,
            createdAt: new Date(n.createdAt),
          })),
        );
      } catch (error) {
        console.error("Failed to load notifications:", error);
      }
    };

    loadNotifications();
    const interval = setInterval(loadNotifications, 20000);
    return () => clearInterval(interval);
  }, [user]);

  const markAsRead = (id: string) => {
    notificationsService.markRead(id).catch(() => undefined);
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n)),
    );
  };

  const markAllAsRead = () => {
    if (user?.role === "ADMIN") {
      notificationsService.markAllAdminRead().catch(() => undefined);
    } else if (user) {
      notificationsService.markAllMeRead().catch(() => undefined);
    }
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const clearNotification = (id: string) => {
    notificationsService.delete(id).catch(() => undefined);
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const clearAll = () => {
    setNotifications([]);
  };

  const addNotification = (
    notification: Omit<Notification, "id" | "createdAt">,
  ) => {
    const newNotification: Notification = {
      ...notification,
      id: Date.now().toString(),
      createdAt: new Date(),
    };
    setNotifications((prev) => [newNotification, ...prev]);
  };

  return {
    notifications,
    markAsRead,
    markAllAsRead,
    clearNotification,
    clearAll,
    addNotification,
  };
}
