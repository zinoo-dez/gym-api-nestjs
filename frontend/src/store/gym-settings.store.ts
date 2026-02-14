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

      // Fetch operating hours as well
      get().fetchOperatingHours();

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
  };
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
