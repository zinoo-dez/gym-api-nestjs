import { create } from "zustand";
import { gymSettingsService, type GymSettings } from "@/services";

interface GymSettingsState {
  settings: GymSettings | null;
  isLoading: boolean;
  error: string | null;
  fetchSettings: () => Promise<void>;
  updateSettings: (data: Partial<GymSettings>) => void;
}

export const useGymSettingsStore = create<GymSettingsState>((set, get) => ({
  settings: null,
  isLoading: false,
  error: null,

  fetchSettings: async () => {
    try {
      set({ isLoading: true, error: null });
      const settings = await gymSettingsService.getSettings();
      set({ settings, isLoading: false });

      // Apply theme colors to CSS variables
      if (settings.primaryColor) {
        applyThemeColors(settings.primaryColor, settings.secondaryColor);
      }

      // Update document title and favicon
      if (settings.name) {
        document.title = settings.name;
      }
      if (settings.favicon) {
        updateFavicon(settings.favicon);
      }
    } catch (error) {
      console.error("Failed to fetch gym settings:", error);
      set({ error: "Failed to load gym settings", isLoading: false });
    }
  },

  updateSettings: (data: Partial<GymSettings>) => {
    const currentSettings = get().settings;
    if (currentSettings) {
      const updatedSettings = { ...currentSettings, ...data };
      set({ settings: updatedSettings });

      // Apply theme colors if updated
      if (data.primaryColor || data.secondaryColor) {
        applyThemeColors(
          data.primaryColor || currentSettings.primaryColor,
          data.secondaryColor || currentSettings.secondaryColor,
        );
      }

      // Update document title if changed
      if (data.name) {
        document.title = data.name;
      }

      // Update favicon if changed
      if (data.favicon) {
        updateFavicon(data.favicon);
      }
    }
  },
}));

// Helper function to apply theme colors to all CSS variables
function applyThemeColors(primaryColor: string, secondaryColor: string) {
  const root = document.documentElement;

  // Update primary color and all its variants
  root.style.setProperty("--primary", primaryColor);
  root.style.setProperty("--color-primary", primaryColor);
  root.style.setProperty("--sidebar-primary", primaryColor);
  root.style.setProperty("--color-sidebar-primary", primaryColor);
  root.style.setProperty("--ring", primaryColor);
  root.style.setProperty("--color-ring", primaryColor);
  root.style.setProperty("--sidebar-ring", primaryColor);
  root.style.setProperty("--color-sidebar-ring", primaryColor);
  root.style.setProperty("--chart-1", primaryColor);
  root.style.setProperty("--color-chart-1", primaryColor);

  // Update secondary/accent color
  root.style.setProperty("--accent", secondaryColor);
  root.style.setProperty("--color-accent", secondaryColor);
  root.style.setProperty("--chart-2", secondaryColor);
  root.style.setProperty("--color-chart-2", secondaryColor);

  // Calculate darker shade for primary-dark (approximately 20% darker)
  const primaryDark = adjustColorBrightness(primaryColor, -20);
  root.style.setProperty("--primary-dark", primaryDark);
  root.style.setProperty("--color-primary-dark", primaryDark);
  root.style.setProperty("--chart-3", primaryDark);
  root.style.setProperty("--color-chart-3", primaryDark);

  // Update neon glow effect with primary color
  const rgb = hexToRgb(primaryColor);
  if (rgb) {
    root.style.setProperty(
      "--neon-glow",
      `0 0 20px rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.3)`,
    );
  }
}

// Helper function to update favicon
function updateFavicon(faviconUrl: string) {
  let link = document.querySelector("link[rel*='icon']") as HTMLLinkElement;
  if (!link) {
    link = document.createElement("link");
    link.rel = "shortcut icon";
    document.getElementsByTagName("head")[0].appendChild(link);
  }
  link.type = "image/x-icon";
  link.href = faviconUrl;
}

// Helper function to convert hex to RGB
function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null;
}

// Helper function to adjust color brightness
function adjustColorBrightness(hex: string, percent: number): string {
  const rgb = hexToRgb(hex);
  if (!rgb) return hex;

  const adjust = (value: number) => {
    const adjusted = Math.round(value + (value * percent) / 100);
    return Math.max(0, Math.min(255, adjusted));
  };

  const r = adjust(rgb.r);
  const g = adjust(rgb.g);
  const b = adjust(rgb.b);

  return `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}`;
}
