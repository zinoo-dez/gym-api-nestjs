/**
 * Notification Store
 * Manages notification queue for displaying toasts/alerts
 */

import { create } from "zustand";

export const useNotificationStore = create((set) => ({
  notifications: [],

  /**
   * Add a notification to the queue
   * @param {Object} notification - Notification object
   * @param {string} notification.message - Message to display
   * @param {string} notification.type - Type: 'success' | 'error' | 'warning' | 'info'
   * @param {number} notification.duration - Duration in ms (default: 5000)
   * @returns {number} Notification ID
   */
  addNotification: (notification) => {
    const id = Date.now() + Math.random(); // Ensure uniqueness
    const newNotification = {
      id,
      type: "info",
      duration: 5000,
      ...notification,
    };

    set((state) => ({
      notifications: [...state.notifications, newNotification],
    }));

    return id;
  },

  /**
   * Remove a notification by ID
   * @param {number} id - Notification ID
   */
  removeNotification: (id) =>
    set((state) => ({
      notifications: state.notifications.filter((n) => n.id !== id),
    })),

  /**
   * Clear all notifications
   */
  clearNotifications: () => set({ notifications: [] }),
}));
