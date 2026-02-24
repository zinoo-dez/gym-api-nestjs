import { useEffect } from "react";

import { useSystemSettingsQuery, useUpdateSecurityMutation } from "@/hooks/useSettings";
import { MaterialIcon } from "@/components/ui/MaterialIcon";

export function ThemeToggle() {
  const settingsQuery = useSystemSettingsQuery();
  const updateSecurity = useUpdateSecurityMutation();

  const theme = settingsQuery.data?.security.theme || "light";

  // Apply theme class when it loads or changes
  useEffect(() => {
    if (settingsQuery.data) {
      document.documentElement.classList.toggle("dark", theme === "dark");
    }
  }, [theme, settingsQuery.data]);

  const toggleTheme = async () => {
    if (!settingsQuery.data) return;
    
    const newTheme = theme === "light" ? "dark" : "light";
    
    // Apply locally instantly for fast feedback
    document.documentElement.classList.toggle("dark", newTheme === "dark");
    
    try {
      await updateSecurity.mutateAsync({
        ...settingsQuery.data.security,
        theme: newTheme,
        currentPassword: "",
        newPassword: "",
        confirmNewPassword: ""
      });
    } catch (error) {
      // Revert if error
      document.documentElement.classList.toggle("dark", theme === "dark");
    }
  };

  if (settingsQuery.isLoading) {
    return (
      <div className="flex size-12 animate-pulse items-center justify-center rounded-full bg-surface-container-highest/50" />
    );
  }

  return (
    <button
      onClick={toggleTheme}
      disabled={updateSecurity.isPending}
      className={`flex h-12 w-12 items-center justify-center rounded-full bg-transparent text-on-surface-variant transition-all hover:bg-on-surface/5 active:bg-on-surface/10 ${
        updateSecurity.isPending ? "opacity-38 cursor-not-allowed" : ""
      }`}
      aria-label="Toggle theme"
      title={theme === "light" ? "Switch to dark mode" : "Switch to light mode"}
    >
      <MaterialIcon icon={theme === "light" ? "dark_mode" : "light_mode"} className="text-2xl" />
    </button>
  );
}
