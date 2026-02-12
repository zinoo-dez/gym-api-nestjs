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
    primaryColor: settings?.primaryColor || "",
    secondaryColor: settings?.secondaryColor || "",
    backgroundColor: settings?.backgroundColor || "",
    textColor: settings?.textColor || "",
    heroTitle: settings?.heroTitle || "",
    heroSubtitle: settings?.heroSubtitle || "",
    heroCtaPrimary: settings?.heroCtaPrimary || "",
    heroCtaSecondary: settings?.heroCtaSecondary || "",
    heroBadgeText: settings?.heroBadgeText || "",
    heroBackgroundImage: settings?.heroBgImage || "",
    featuresTitle: settings?.featuresTitle || "",
    featuresSubtitle: settings?.featuresSubtitle || "",
    features: settings?.features || [],
    classesTitle: settings?.classesTitle || "",
    classesSubtitle: settings?.classesSubtitle || "",
    trainersTitle: settings?.trainersTitle || "",
    trainersSubtitle: settings?.trainersSubtitle || "",
    trainersCtaLabel: settings?.trainersCtaLabel || "",
    workoutsTitle: settings?.workoutsTitle || "",
    workoutsSubtitle: settings?.workoutsSubtitle || "",
    workoutsCtaLabel: settings?.workoutsCtaLabel || "",
    pricingTitle: settings?.pricingTitle || "",
    pricingSubtitle: settings?.pricingSubtitle || "",
    footerTagline: settings?.footerTagline || "",
    appShowcaseTitle: settings?.appShowcaseTitle || "",
    appShowcaseSubtitle: settings?.appShowcaseSubtitle || "",
    ctaTitle: settings?.ctaTitle || "",
    ctaSubtitle: settings?.ctaSubtitle || "",
    ctaButtonLabel: settings?.ctaButtonLabel || "",
    fontFamily: settings?.fontFamily || "Inter",
    heroBgImage: settings?.heroBgImage || "",
    featuresBgImage: settings?.featuresBgImage || "",
    classesBgImage: settings?.classesBgImage || "",
    trainersBgImage: settings?.trainersBgImage || "",
    workoutsBgImage: settings?.workoutsBgImage || "",
    pricingBgImage: settings?.pricingBgImage || "",
    ctaBgImage: settings?.ctaBgImage || "",
    email: settings?.email || "",
    phone: settings?.phone || "",
    address: settings?.address || "",
    description: settings?.description || "",
  };
};
