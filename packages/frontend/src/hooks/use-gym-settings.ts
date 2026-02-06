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
    gymName: settings?.name || "",
    tagLine: settings?.tagLine || "",
    logo: settings?.logo || "",
    primaryColor: settings?.primaryColor || "",
    secondaryColor: settings?.secondaryColor || "",
    backgroundColor: settings?.backgroundColor || "",
    textColor: settings?.textColor || "",
    email: settings?.email || "",
    phone: settings?.phone || "",
    address: settings?.address || "",
    description: settings?.description || "",
  };
};
