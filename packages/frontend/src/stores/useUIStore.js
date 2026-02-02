/**
 * UI Store
 * Manages UI state including sidebar, theme, and modals
 */

import { create } from "zustand";
import { persist } from "zustand/middleware";

export const useUIStore = create(
  persist(
    (set) => ({
      // Sidebar state
      sidebarOpen: true,

      /**
       * Toggle sidebar open/closed
       */
      toggleSidebar: () =>
        set((state) => ({ sidebarOpen: !state.sidebarOpen })),

      /**
       * Set sidebar open state
       * @param {boolean} open - Whether sidebar should be open
       */
      setSidebarOpen: (open) => set({ sidebarOpen: open }),

      // Theme state - 'neon-green' | 'electric-cyan' | 'energy-red'
      theme: "neon-green",

      /**
       * Set theme
       * @param {string} theme - Theme name: 'neon-green' | 'electric-cyan' | 'energy-red'
       */
      setTheme: (theme) => set({ theme }),

      /**
       * Cycle through available themes
       */
      cycleTheme: () =>
        set((state) => {
          const themes = ["neon-green", "electric-cyan", "energy-red"];
          const currentIndex = themes.indexOf(state.theme);
          const nextIndex = (currentIndex + 1) % themes.length;
          return { theme: themes[nextIndex] };
        }),

      // Modal state
      activeModal: null,
      modalData: null,

      /**
       * Open a modal
       * @param {string} modalId - Unique identifier for the modal
       * @param {*} data - Optional data to pass to the modal
       */
      openModal: (modalId, data = null) =>
        set({ activeModal: modalId, modalData: data }),

      /**
       * Close the active modal
       */
      closeModal: () => set({ activeModal: null, modalData: null }),
    }),
    {
      name: "ui-storage", // localStorage key
      partialize: (state) => ({
        theme: state.theme,
        sidebarOpen: state.sidebarOpen,
      }), // Only persist these fields
    },
  ),
);
