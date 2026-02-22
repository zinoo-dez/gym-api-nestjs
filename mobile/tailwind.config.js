/** @type {import('tailwindcss').Config} */
const platformSelect = (ios, android) => {
  return process.env.NATIVEWIND_PLATFORM === "ios" ? ios : android;
};

module.exports = {
  content: ["./App.{js,jsx,ts,tsx}", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // iOS Palette
        ios: {
          primary: "#007AFF",
          background: "#F2F2F7",
          secondary: "#8E8E93",
          surface: "#FFFFFF",
          destructive: "#FF3B30",
          border: "#C6C6C8",
        },
        // Android Palette (Material 3)
        android: {
          primary: "#6750A4",
          background: "#FFFBFE",
          secondary: "#625B71",
          surface: "#FEF7FF",
          destructive: "#B3261E",
          border: "#79747E",
        },
        // Universal Semantic Tokens (Auto-map in components)
        app: {
          primary: "var(--color-primary)",
          background: "var(--color-background)",
          surface: "var(--color-surface)",
          text: "var(--color-text)",
          border: "var(--color-border)",
        },
      },
      fontFamily: {
        ios: ["SF Pro Text", "System"],
        android: ["Roboto", "sans-serif"],
      },
      borderRadius: {
        ios: "10px",
        android: "12px",
        "ios-pill": "999px",
        "android-full": "28px", // Material 3 fab/button
      },
      spacing: {
        "ios-gutter": "16px",
        "android-gutter": "16px",
      },
    },
  },
  plugins: [],
};
