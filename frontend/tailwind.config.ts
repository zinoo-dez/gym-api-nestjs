import type { Config } from "tailwindcss";
import defaultTheme from "tailwindcss/defaultTheme";

export default {
  darkMode: "class",
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx,css,scss}",
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: {
        DEFAULT: "1rem",
        sm: "2rem",
        lg: "4rem",
        xl: "5rem",
        "2xl": "6rem",
      },
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      fontFamily: {
        sans: ["Roboto", ...defaultTheme.fontFamily.sans],
      },
      colors: {
        border: "hsl(var(--outline-variant))",
        input: "hsl(var(--outline))",
        ring: "hsl(var(--primary))",
        background: "hsl(var(--surface))",
        foreground: "hsl(var(--on-surface))",
        "on-primary": "hsl(var(--on-primary))",
        "primary-container": "hsl(var(--primary-container))",
        "on-primary-container": "hsl(var(--on-primary-container))",
        "on-secondary": "hsl(var(--on-secondary))",
        "secondary-container": "hsl(var(--secondary-container))",
        "on-secondary-container": "hsl(var(--on-secondary-container))",
        "on-tertiary": "hsl(var(--on-tertiary))",
        "tertiary-container": "hsl(var(--tertiary-container))",
        "on-tertiary-container": "hsl(var(--on-tertiary-container))",
        "on-error": "hsl(var(--on-error))",
        "error-container": "hsl(var(--error-container))",
        "on-error-container": "hsl(var(--on-error-container))",
        "on-surface": "hsl(var(--on-surface))",
        "surface-variant": "hsl(var(--surface-variant))",
        "on-surface-variant": "hsl(var(--on-surface-variant))",
        "surface-dim": "hsl(var(--surface-dim))",
        "surface-bright": "hsl(var(--surface-bright))",
        "surface-container-lowest": "hsl(var(--surface-container-lowest))",
        "surface-container-low": "hsl(var(--surface-container-low))",
        "surface-container": "hsl(var(--surface-container))",
        "surface-container-high": "hsl(var(--surface-container-high))",
        "surface-container-highest": "hsl(var(--surface-container-highest))",
        "outline-variant": "hsl(var(--outline-variant))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--on-primary))",
          container: "hsl(var(--primary-container))",
          "on-container": "hsl(var(--on-primary-container))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--on-secondary))",
          container: "hsl(var(--secondary-container))",
          "on-container": "hsl(var(--on-secondary-container))",
        },
        tertiary: {
          DEFAULT: "hsl(var(--tertiary))",
          foreground: "hsl(var(--on-tertiary))",
          container: "hsl(var(--tertiary-container))",
          "on-container": "hsl(var(--on-tertiary-container))",
        },
        error: {
          DEFAULT: "hsl(var(--error))",
          foreground: "hsl(var(--on-error))",
          container: "hsl(var(--error-container))",
          "on-container": "hsl(var(--on-error-container))",
        },
        surface: {
          DEFAULT: "hsl(var(--surface))",
          foreground: "hsl(var(--on-surface))",
          dim: "hsl(var(--surface-dim))",
          bright: "hsl(var(--surface-bright))",
          variant: "hsl(var(--surface-variant))",
          "on-variant": "hsl(var(--on-surface-variant))",
          container: {
            lowest: "hsl(var(--surface-container-lowest))",
            low: "hsl(var(--surface-container-low))",
            DEFAULT: "hsl(var(--surface-container))",
            high: "hsl(var(--surface-container-high))",
            highest: "hsl(var(--surface-container-highest))",
          },
        },
        outline: {
          DEFAULT: "hsl(var(--outline))",
          variant: "hsl(var(--outline-variant))",
        },
        scrim: "hsl(var(--scrim))",
        shadow: "hsl(var(--shadow))",
      },
      fontSize: {
        // M3 Typescale
        "display-large": [
          "57px",
          { lineHeight: "64px", letterSpacing: "-0.25px" },
        ],
        "display-medium": [
          "45px",
          { lineHeight: "52px", letterSpacing: "0px" },
        ],
        "display-small": ["36px", { lineHeight: "44px", letterSpacing: "0px" }],
        "headline-large": [
          "32px",
          { lineHeight: "40px", letterSpacing: "0px" },
        ],
        "headline-medium": [
          "28px",
          { lineHeight: "36px", letterSpacing: "0px" },
        ],
        "headline-small": [
          "24px",
          { lineHeight: "32px", letterSpacing: "0px" },
        ],
        "title-large": ["22px", { lineHeight: "28px", letterSpacing: "0px" }],
        "title-medium": [
          "16px",
          { lineHeight: "24px", letterSpacing: "0.15px", fontWeight: "500" },
        ],
        "title-small": [
          "14px",
          { lineHeight: "20px", letterSpacing: "0.1px", fontWeight: "500" },
        ],
        "body-large": ["16px", { lineHeight: "24px", letterSpacing: "0.5px" }],
        "body-medium": [
          "14px",
          { lineHeight: "20px", letterSpacing: "0.25px" },
        ],
        "body-small": ["12px", { lineHeight: "16px", letterSpacing: "0.4px" }],
        "label-large": [
          "14px",
          { lineHeight: "20px", letterSpacing: "0.1px", fontWeight: "500" },
        ],
        "label-medium": [
          "12px",
          { lineHeight: "16px", letterSpacing: "0.5px", fontWeight: "500" },
        ],
        "label-small": [
          "11px",
          { lineHeight: "16px", letterSpacing: "0.5px", fontWeight: "500" },
        ],
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
