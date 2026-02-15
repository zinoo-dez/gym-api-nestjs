export type AppTheme = "light" | "dark";

export const THEME_STORAGE_KEY = "gym-theme";

export const designSystem = {
  fontFamily: '"Inter", "Roboto", system-ui, -apple-system, "Segoe UI", sans-serif',
  spacingUnit: 8,
  radius: {
    sm: "8px",
    md: "10px",
    lg: "12px",
  },
  colors: {
    light: {
      primary: "#1a73e8",
      secondary: "#34a853",
      background: "#f8f9fa",
      surface: "#ffffff",
      text: "#202124",
      textMuted: "#5f6368",
      error: "#d93025",
    },
    dark: {
      primary: "#8ab4f8",
      secondary: "#81c995",
      background: "#121212",
      surface: "#1e1e1e",
      text: "#e8eaed",
      textMuted: "#9aa0a6",
      error: "#f28b82",
    },
  },
  elevation: {
    level1: "0 1px 2px rgba(60, 64, 67, 0.14), 0 1px 3px rgba(60, 64, 67, 0.18)",
    level2: "0 2px 6px rgba(60, 64, 67, 0.16), 0 4px 10px rgba(60, 64, 67, 0.14)",
    level3: "0 6px 18px rgba(60, 64, 67, 0.2)",
  },
} as const;

export function resolveSystemTheme(): AppTheme {
  if (typeof window === "undefined") {
    return "light";
  }

  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}
