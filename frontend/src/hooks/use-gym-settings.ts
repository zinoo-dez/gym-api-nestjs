import { useGymSettingsStore } from "@/store/gym-settings.store";

/**
 * Hook to access gym settings throughout the application
 * @returns Gym settings object with name, colors, contact info, etc.
 */
export const useGymSettings = () => {
  const { settings, operatingHours, isLoading, error } = useGymSettingsStore();

  return {
    settings,
    isLoading,
    error,
    operatingHours,
    // Convenience accessors

    gymName: settings?.name || "",
    tagLine: settings?.tagLine || "",
    logo: settings?.logo || "",
    email: settings?.email || "",
    phone: settings?.phone || "",
    address: settings?.address || "",
    description: settings?.description || "",
  };
};
