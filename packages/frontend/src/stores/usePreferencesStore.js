/**
 * Preferences Store
 * Manages user preferences including pagination, date format, view preferences, and accessibility
 */

import { create } from "zustand";
import { persist } from "zustand/middleware";

export const usePreferencesStore = create(
  persist(
    (set) => ({
      // Pagination preferences
      itemsPerPage: 10,

      /**
       * Set items per page for pagination
       * @param {number} count - Number of items per page
       */
      setItemsPerPage: (count) => set({ itemsPerPage: count }),

      // Date format preference
      dateFormat: "MM/DD/YYYY",

      /**
       * Set date format preference
       * @param {string} format - Date format string (e.g., 'MM/DD/YYYY', 'DD/MM/YYYY', 'YYYY-MM-DD')
       */
      setDateFormat: (format) => set({ dateFormat: format }),

      // Default view preference
      defaultView: "list", // 'list' | 'grid' | 'calendar'

      /**
       * Set default view preference
       * @param {string} view - View type: 'list' | 'grid' | 'calendar'
       */
      setDefaultView: (view) => set({ defaultView: view }),

      // Reduced motion preference (accessibility)
      prefersReducedMotion: false,

      /**
       * Set reduced motion preference
       * @param {boolean} value - Whether user prefers reduced motion
       */
      setPrefersReducedMotion: (value) => set({ prefersReducedMotion: value }),
    }),
    {
      name: "user-preferences", // localStorage key
    },
  ),
);
