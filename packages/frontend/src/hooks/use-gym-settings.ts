import { useGymSettingsStore } from "@/store/gym-settings.store";

/**
 * Hook to access gym settings throughout the application
 * @returns Gym settings object with name, colors, contact info, etc.
 */
export const useGymSettings = () => {
  const { settings, isLoading, error } = useGymSettingsStore();

  return {
    settings,
    isLoading,
    error,
    // Convenience accessors
    gymName: settings?.name || "Gym",
    tagLine: settings?.tagLine || "",
    logo: settings?.logo || "/logo.png",
    primaryColor: settings?.primaryColor || "#22c55e",
    secondaryColor: settings?.secondaryColor || "#4ade80",
    email: settings?.email || "",
    phone: settings?.phone || "",
    address: settings?.address || "",
    description: settings?.description || "",
  };
};
