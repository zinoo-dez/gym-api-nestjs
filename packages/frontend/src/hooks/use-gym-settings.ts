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
    heroTitle: settings?.heroTitle || "",
    heroSubtitle: settings?.heroSubtitle || "",
    heroCtaPrimary: settings?.heroCtaPrimary || "",
    heroCtaSecondary: settings?.heroCtaSecondary || "",
    featuresTitle: settings?.featuresTitle || "",
    featuresSubtitle: settings?.featuresSubtitle || "",
    classesTitle: settings?.classesTitle || "",
    classesSubtitle: settings?.classesSubtitle || "",
    trainersTitle: settings?.trainersTitle || "",
    trainersSubtitle: settings?.trainersSubtitle || "",
    workoutsTitle: settings?.workoutsTitle || "",
    workoutsSubtitle: settings?.workoutsSubtitle || "",
    pricingTitle: settings?.pricingTitle || "",
    pricingSubtitle: settings?.pricingSubtitle || "",
    footerTagline: settings?.footerTagline || "",
    appShowcaseTitle: settings?.appShowcaseTitle || "",
    appShowcaseSubtitle: settings?.appShowcaseSubtitle || "",
    ctaTitle: settings?.ctaTitle || "",
    ctaSubtitle: settings?.ctaSubtitle || "",
    ctaButtonLabel: settings?.ctaButtonLabel || "",
    email: settings?.email || "",
    phone: settings?.phone || "",
    address: settings?.address || "",
    description: settings?.description || "",
  };
};
