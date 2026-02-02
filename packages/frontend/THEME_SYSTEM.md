# Theme System Documentation

## Overview

The application now supports three dynamic color themes that users can switch between. The theme preference is persisted in localStorage and applies across the entire application.

## Available Themes

### 1. Neon Green (Default)

- **ID**: `neon-green`
- **Icon**: ⚡
- **Colors**:
  - Background: `#0a0a0a`
  - Surface/Card: `#141414`
  - Primary (CTA): `#22c55e` (Neon Green)
  - Primary Dark: `#16a34a`
  - Primary Light: `#4ade80`
  - Text Primary: `#ffffff`
  - Text Muted: `#a3a3a3`
  - Accent: `#4ade80`

### 2. Electric Cyan

- **ID**: `electric-cyan`
- **Icon**: 💎
- **Colors**:
  - Background: `#050b1a`
  - Surface/Card: `#0b1228`
  - Primary (CTA): `#06b6d4` (Cyan)
  - Primary Dark: `#0891b2`
  - Primary Light: `#22d3ee`
  - Text Primary: `#e5e7eb`
  - Text Muted: `#94a3b8`
  - Accent: `#22d3ee`

### 3. Energy Red

- **ID**: `energy-red`
- **Icon**: 🔥
- **Colors**:
  - Background: `#0f0f0f`
  - Surface/Card: `#1c1c1c`
  - Primary (CTA): `#ef4444` (Red)
  - Primary Dark: `#dc2626`
  - Primary Light: `#f87171`
  - Text Primary: `#ffffff`
  - Text Muted: `#9ca3af`
  - Accent: `#f87171`

## Implementation

### CSS Variables

Theme colors are defined as CSS variables in `src/App.css`:

```css
:root[data-theme="neon-green"] {
  --color-bg: #0a0a0a;
  --color-surface: #141414;
  --color-primary: #22c55e;
  --color-primary-dark: #16a34a;
  --color-primary-light: #4ade80;
  --color-text: #ffffff;
  --color-text-muted: #a3a3a3;
  --color-accent: #4ade80;
}
```

### Tailwind Configuration

The Tailwind config (`tailwind.config.js`) uses these CSS variables:

```javascript
colors: {
  primary: {
    DEFAULT: "var(--color-primary)",
    dark: "var(--color-primary-dark)",
    light: "var(--color-primary-light)",
  },
  // ... more colors
}
```

### State Management

Theme state is managed in `src/stores/useUIStore.js`:

```javascript
const { theme, setTheme, cycleTheme } = useUIStore();

// Set specific theme
setTheme("electric-cyan");

// Cycle through themes
cycleTheme();
```

### Theme Switcher Component

The `ThemeSwitcher` component (`src/components/common/ThemeSwitcher.jsx`) provides a dropdown UI for theme selection. It's available in:

- Admin Dashboard page
- Admin Layout header
- Main Layout header

## Usage

### For Users

1. Click the theme switcher button (shows current theme icon)
2. Select desired theme from the dropdown
3. Theme changes immediately and persists across sessions

### For Developers

#### Using Theme Colors in Components

Use Tailwind classes with theme-aware colors:

```jsx
<div className="bg-dark text-text">
  <button className="bg-primary hover:bg-primary-dark">Click me</button>
</div>
```

#### Accessing Theme in JavaScript

```javascript
import { useUIStore } from "../../stores/useUIStore";

function MyComponent() {
  const theme = useUIStore((state) => state.theme);

  // Use theme value for conditional logic
  if (theme === "energy-red") {
    // Special handling for red theme
  }
}
```

#### Adding New Themes

1. Add theme definition to `src/App.css`:

```css
:root[data-theme="new-theme"] {
  --color-bg: #...;
  --color-surface: #...;
  /* ... other variables */
}
```

2. Add theme to `ThemeSwitcher.jsx`:

```javascript
const themes = [
  // ... existing themes
  {
    id: "new-theme",
    name: "New Theme",
    icon: "🎨",
    colors: { primary: "#...", bg: "#..." },
  },
];
```

3. Update `cycleTheme` in `useUIStore.js`:

```javascript
const themes = ["neon-green", "electric-cyan", "energy-red", "new-theme"];
```

## Accessibility

- Theme switcher is keyboard accessible
- Focus states use theme-aware colors
- All themes maintain WCAG contrast ratios
- Theme preference persists in localStorage

## Browser Support

- Modern browsers with CSS custom properties support
- Fallback to default theme if localStorage unavailable
- Smooth transitions between theme changes
