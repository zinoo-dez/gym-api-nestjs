/**
 * ThemeSwitcher Component
 * Allows users to switch between three theme options
 */

import { motion, AnimatePresence } from "framer-motion";
import { useState, useRef, useEffect } from "react";
import { useUIStore } from "../../stores/useUIStore.js";

const themes = [
  {
    id: "neon-green",
    name: "Neon Green",
    icon: "⚡",
    colors: { primary: "#22c55e", bg: "#0a0a0a" },
  },
  {
    id: "electric-cyan",
    name: "Electric Cyan",
    icon: "💎",
    colors: { primary: "#06b6d4", bg: "#050b1a" },
  },
  {
    id: "energy-red",
    name: "Energy Red",
    icon: "🔥",
    colors: { primary: "#ef4444", bg: "#0f0f0f" },
  },
];

export function ThemeSwitcher() {
  const { theme, setTheme } = useUIStore();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const currentTheme = themes.find((t) => t.id === theme) || themes[0];

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isOpen]);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-3 bg-white/[0.03] border border-white/10 rounded-xl hover:bg-white/[0.06] transition-all flex items-center gap-2"
        aria-label="Switch theme"
      >
        <span className="text-xl">{currentTheme.icon}</span>
        <svg
          className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? "rotate-180" : ""}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 mt-2 w-56 bg-black/95 backdrop-blur-xl rounded-xl shadow-2xl border border-white/10 z-50 overflow-hidden"
          >
            <div className="p-3 border-b border-white/10">
              <h3 className="text-xs font-black uppercase tracking-wider text-white">
                Choose Theme
              </h3>
            </div>
            <div className="p-2">
              {themes.map((themeOption) => (
                <button
                  key={themeOption.id}
                  onClick={() => {
                    setTheme(themeOption.id);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 p-3 rounded-lg transition-all ${
                    theme === themeOption.id
                      ? "bg-white/10 border border-white/20"
                      : "hover:bg-white/[0.03] border border-transparent"
                  }`}
                >
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center text-xl"
                    style={{
                      backgroundColor: `${themeOption.colors.primary}20`,
                      border: `1px solid ${themeOption.colors.primary}40`,
                    }}
                  >
                    {themeOption.icon}
                  </div>
                  <div className="flex-1 text-left">
                    <p className="text-sm font-bold text-white">{themeOption.name}</p>
                    <div className="flex items-center gap-1 mt-1">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: themeOption.colors.primary }}
                      />
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: themeOption.colors.bg }}
                      />
                    </div>
                  </div>
                  {theme === themeOption.id && (
                    <svg
                      className="w-5 h-5 flex-shrink-0"
                      style={{ color: themeOption.colors.primary }}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  )}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
