import { useState, useEffect } from "react";
import type { Notification } from "@/components/gym/NotificationPopup";

// Mock notifications - replace with actual API calls
const mockNotifications: Notification[] = [
  {
    id: "1",
    title: "Welcome!",
    message: "Welcome to your dashboard. Start exploring your features.",
    type: "info",
    read: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 5), // 5 minutes ago
  },
  {
    id: "2",
    title: "Membership Renewed",
    message: "Your membership has been successfully renewed for another month.",
    type: "success",
    read: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
  },
  {
    id: "3",
    title: "Class Reminder",
    message: "Your yoga class starts in 30 minutes. Don't forget!",
    type: "warning",
    read: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
  },
];

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    // Load notifications from localStorage or API
    const stored = localStorage.getItem("notifications");
    if (stored) {
      const parsed = JSON.parse(stored);
      setNotifications(
        parsed.map((n: any) => ({
          ...n,
          createdAt: new Date(n.createdAt),
        })),
      );
    } else {
      setNotifications(mockNotifications);
    }
  }, []);

  useEffect(() => {
    // Save to localStorage whenever notifications change
    if (notifications.length > 0) {
      localStorage.setItem("notifications", JSON.stringify(notifications));
    }
  }, [notifications]);

  const markAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n)),
    );
  };

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const clearNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const clearAll = () => {
    setNotifications([]);
    localStorage.removeItem("notifications");
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
