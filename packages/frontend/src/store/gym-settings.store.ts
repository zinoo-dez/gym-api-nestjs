import { create } from "zustand";
import {
  gymSettingsService,
  type GymSettings,
  type GymOperatingHours,
  type GymClosure,
} from "@/services";

interface GymSettingsState {
  settings: GymSettings | null;
  operatingHours: GymOperatingHours[];
  closures: GymClosure[];
  isLoading: boolean;
  error: string | null;
  fetchSettings: () => Promise<void>;
  updateSettings: (data: Partial<GymSettings>) => void;
  fetchOperatingHours: () => Promise<void>;
  fetchClosures: () => Promise<void>;
}

export const useGymSettingsStore = create<GymSettingsState>((set, get) => ({
  settings: null,
  operatingHours: [],
  closures: [],
  isLoading: false,
  error: null,

  fetchSettings: async () => {
    try {
      set({ isLoading: true, error: null });
      const settings = await gymSettingsService.getSettings();
      const decodedSettings = decodeRichTextFields(settings);
      set({ settings: decodedSettings, isLoading: false });

      // Apply theme colors to CSS variables
      if (
        decodedSettings.primaryColor ||
        decodedSettings.secondaryColor ||
        decodedSettings.backgroundColor ||
        decodedSettings.textColor
      ) {
        applyThemeColors(
          decodedSettings.primaryColor,
          decodedSettings.secondaryColor,
          decodedSettings.backgroundColor,
          decodedSettings.textColor,
        );
      }

      // Update document title and favicon
      if (decodedSettings.name) {
        document.title = decodedSettings.name;
      }
      if (decodedSettings.favicon) {
        updateFavicon(decodedSettings.favicon);
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
      const decodedSettings = decodeRichTextFields(updatedSettings);
      set({ settings: decodedSettings });

      // Apply theme colors if updated
      if (
        data.primaryColor ||
        data.secondaryColor ||
        data.backgroundColor ||
        data.textColor
      ) {
        applyThemeColors(
          data.primaryColor || currentSettings.primaryColor,
          data.secondaryColor || currentSettings.secondaryColor,
          data.backgroundColor || currentSettings.backgroundColor,
          data.textColor || currentSettings.textColor,
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

  fetchOperatingHours: async () => {
    try {
      const hours = await gymSettingsService.getOperatingHours();
      set({ operatingHours: hours });
    } catch (error) {
      console.error("Failed to fetch operating hours:", error);
    }
  },

  fetchClosures: async () => {
    try {
      const closures = await gymSettingsService.getClosures();
      set({ closures: closures });
    } catch (error) {
      console.error("Failed to fetch closures:", error);
    }
  },
}));

function decodeHtml(input?: string): string | undefined {
  if (!input) return input;
  const textarea = document.createElement("textarea");
  let current = input;
  for (let i = 0; i < 3; i += 1) {
    textarea.innerHTML = current;
    const decoded = textarea.value;
    if (decoded === current) {
      break;
    }
    current = decoded;
  }
  return current;
}

function decodeRichTextFields(settings: GymSettings): GymSettings {
  return {
    ...settings,
    description: decodeHtml(settings.description) || settings.description,
    heroSubtitle: decodeHtml(settings.heroSubtitle) || settings.heroSubtitle,
    featuresSubtitle:
      decodeHtml(settings.featuresSubtitle) || settings.featuresSubtitle,
    classesSubtitle:
      decodeHtml(settings.classesSubtitle) || settings.classesSubtitle,
    trainersSubtitle:
      decodeHtml(settings.trainersSubtitle) || settings.trainersSubtitle,
    workoutsSubtitle:
      decodeHtml(settings.workoutsSubtitle) || settings.workoutsSubtitle,
    pricingSubtitle:
      decodeHtml(settings.pricingSubtitle) || settings.pricingSubtitle,
    appShowcaseSubtitle:
      decodeHtml(settings.appShowcaseSubtitle) || settings.appShowcaseSubtitle,
    ctaSubtitle: decodeHtml(settings.ctaSubtitle) || settings.ctaSubtitle,
    footerTagline: decodeHtml(settings.footerTagline) || settings.footerTagline,
  };
}

// Helper function to apply theme colors to all CSS variables
function applyThemeColors(
  primaryColor?: string,
  secondaryColor?: string,
  backgroundColor?: string,
  textColor?: string,
) {
  const root = document.documentElement;

  // Update primary color and all its variants
  if (primaryColor) {
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
  }

  // Update secondary/accent color
  if (secondaryColor) {
    root.style.setProperty("--accent", secondaryColor);
    root.style.setProperty("--color-accent", secondaryColor);
    root.style.setProperty("--chart-2", secondaryColor);
    root.style.setProperty("--color-chart-2", secondaryColor);
  }

  // Calculate darker shade for primary-dark (approximately 20% darker)
  if (primaryColor) {
    const primaryDark = adjustColorBrightness(primaryColor, -20);
    root.style.setProperty("--primary-dark", primaryDark);
    root.style.setProperty("--color-primary-dark", primaryDark);
    root.style.setProperty("--chart-3", primaryDark);
    root.style.setProperty("--color-chart-3", primaryDark);
  }

  // Update neon glow effect with primary color
  if (primaryColor) {
    const rgb = hexToRgb(primaryColor);
    if (rgb) {
      root.style.setProperty(
        "--neon-glow",
        `0 0 20px rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.3)`,
      );
    }
  }

  if (backgroundColor) {
    root.style.setProperty("--background", backgroundColor);
    root.style.setProperty("--color-background", backgroundColor);
    root.style.setProperty("--card", backgroundColor);
    root.style.setProperty("--popover", backgroundColor);
    root.style.setProperty("--sidebar", backgroundColor);
    root.style.setProperty("--surface", backgroundColor);
  }

  if (textColor) {
    root.style.setProperty("--foreground", textColor);
    root.style.setProperty("--color-foreground", textColor);
    root.style.setProperty("--card-foreground", textColor);
    root.style.setProperty("--popover-foreground", textColor);
    root.style.setProperty("--sidebar-foreground", textColor);
    root.style.setProperty("--text-primary", textColor);
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
