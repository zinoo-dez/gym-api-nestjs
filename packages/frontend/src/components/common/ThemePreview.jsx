/**
 * ThemePreview Component
 * Visual preview of all available themes (for documentation/testing)
 */

import { useUIStore } from "../../stores/useUIStore.js";

const themes = [
  {
    id: "neon-green",
    name: "Neon Green",
    icon: "⚡",
    description: "Classic cyberpunk aesthetic",
    colors: {
      bg: "#0a0a0a",
      surface: "#141414",
      primary: "#22c55e",
      primaryDark: "#16a34a",
      text: "#ffffff",
      textMuted: "#a3a3a3",
    },
  },
  {
    id: "electric-cyan",
    name: "Electric Cyan",
    icon: "💎",
    description: "Cool futuristic vibes",
    colors: {
      bg: "#050b1a",
      surface: "#0b1228",
      primary: "#06b6d4",
      primaryDark: "#0891b2",
      text: "#e5e7eb",
      textMuted: "#94a3b8",
    },
  },
  {
    id: "energy-red",
    name: "Energy Red",
    icon: "🔥",
    description: "Bold and powerful",
    colors: {
      bg: "#0f0f0f",
      surface: "#1c1c1c",
      primary: "#ef4444",
      primaryDark: "#dc2626",
      text: "#ffffff",
      textMuted: "#9ca3af",
    },
  },
];

export function ThemePreview() {
  const { theme, setTheme } = useUIStore();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-black italic uppercase tracking-tighter mb-2">
          Theme Preview
        </h2>
        <p className="text-sm text-text-muted">
          Click any theme card to apply it
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {themes.map((themeOption) => (
          <button
            key={themeOption.id}
            onClick={() => setTheme(themeOption.id)}
            className={`text-left p-6 rounded-2xl transition-all ${
              theme === themeOption.id
                ? "ring-2 ring-primary scale-105"
                : "hover:scale-102"
            }`}
            style={{
              backgroundColor: themeOption.colors.surface,
              border: `1px solid ${themeOption.colors.primary}40`,
            }}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <span className="text-4xl">{themeOption.icon}</span>
              {theme === themeOption.id && (
                <div
                  className="w-6 h-6 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: themeOption.colors.primary }}
                >
                  <svg
                    className="w-4 h-4"
                    style={{ color: themeOption.colors.bg }}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={3}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
              )}
            </div>

            {/* Theme Name */}
            <h3
              className="text-lg font-black uppercase tracking-tight mb-1"
              style={{ color: themeOption.colors.text }}
            >
              {themeOption.name}
            </h3>
            <p
              className="text-xs mb-4"
              style={{ color: themeOption.colors.textMuted }}
            >
              {themeOption.description}
            </p>

            {/* Color Swatches */}
            <div className="flex gap-2">
              <div
                className="w-8 h-8 rounded-lg"
                style={{ backgroundColor: themeOption.colors.bg }}
                title="Background"
              />
              <div
                className="w-8 h-8 rounded-lg"
                style={{ backgroundColor: themeOption.colors.surface }}
                title="Surface"
              />
              <div
                className="w-8 h-8 rounded-lg"
                style={{ backgroundColor: themeOption.colors.primary }}
                title="Primary"
              />
              <div
                className="w-8 h-8 rounded-lg"
                style={{ backgroundColor: themeOption.colors.primaryDark }}
                title="Primary Dark"
              />
            </div>

            {/* Sample Button */}
            <div className="mt-4 pt-4 border-t" style={{ borderColor: `${themeOption.colors.primary}20` }}>
              <div
                className="px-4 py-2 rounded-lg text-xs font-black uppercase tracking-wider text-center"
                style={{
                  backgroundColor: themeOption.colors.primary,
                  color: themeOption.colors.bg,
                }}
              >
                Sample Button
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
