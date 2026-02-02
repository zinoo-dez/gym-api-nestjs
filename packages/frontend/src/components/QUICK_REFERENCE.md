# Component Quick Reference

## 🚀 Quick Start

```jsx
import { PrimaryButton, StatCard, PricingCard } from '@/components';

// Button
<PrimaryButton onClick={handleClick}>Click Me</PrimaryButton>

// Stat Card
<StatCard label="Members" value="1,234" trend="up" trendValue="+12%" />

// Pricing Card
<PricingCard
  name="Pro"
  price="59"
  features={["Feature 1", "Feature 2"]}
  onSelect={handleSelect}
/>
```

## 📋 Component Checklist

### ✅ Buttons

- [x] PrimaryButton - Main CTA with neon green
- [x] SecondaryButton - Outlined transparent button

### ✅ Cards

- [x] StatCard - Display metrics with trends
- [x] PricingCard - Membership pricing tiers
- [x] TrainerCard - Trainer profiles
- [x] WorkoutPlanCard - Workout programs

### ✅ Tables

- [x] ClassScheduleTable - Class schedules with booking

### ✅ Navigation

- [x] SidebarNavigation - Collapsible sidebar
- [x] TopNavbar - Responsive top navigation

## 🎨 Theme Colors

```jsx
// Primary (Neon Green)
className = "bg-primary text-dark-900";

// Accent (Lime)
className = "bg-accent text-dark-900";

// Dark Backgrounds
className = "bg-dark-900"; // Pure black
className = "bg-dark-800"; // Dark gray
className = "bg-dark-700"; // Charcoal
```

## 📐 Common Sizes

```jsx
// Buttons
size = "sm"; // Small
size = "md"; // Medium (default)
size = "lg"; // Large

// Spacing
className = "p-4"; // Padding
className = "gap-6"; // Gap between items
className = "mb-8"; // Margin bottom
```

## 🎯 Common Patterns

### Dashboard Layout

```jsx
<div className="min-h-screen bg-dark-900">
  <TopNavbar items={navItems} user={user} />
  <div className="flex">
    <SidebarNavigation items={sidebarItems} />
    <main className="flex-1 p-8">{/* Content */}</main>
  </div>
</div>
```

### Stats Grid

```jsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
  <StatCard label="Metric 1" value="100" />
  <StatCard label="Metric 2" value="200" />
  <StatCard label="Metric 3" value="300" />
  <StatCard label="Metric 4" value="400" />
</div>
```

### Pricing Section

```jsx
<div className="grid grid-cols-1 md:grid-cols-3 gap-8">
  <PricingCard name="Basic" price="29" features={[...]} />
  <PricingCard name="Pro" price="59" isPremium isPopular features={[...]} />
  <PricingCard name="Elite" price="99" features={[...]} />
</div>
```

### Card Grid

```jsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  <TrainerCard {...trainerData} />
  <WorkoutPlanCard {...planData} />
</div>
```

## ♿ Accessibility Props

```jsx
// Always include aria-label for icon buttons
<button aria-label="Close menu">
  <CloseIcon />
</button>

// Use aria-busy for loading states
<button aria-busy={isLoading}>
  Submit
</button>

// Use aria-disabled for disabled states
<button aria-disabled={disabled}>
  Action
</button>
```

## 🎬 Animation Tips

```jsx
// Disable animations for reduced motion
import { motion } from "framer-motion";

<motion.div
  initial={{ opacity: 0 }}
  animate={{ opacity: 1 }}
  // Animations respect prefers-reduced-motion
/>;
```

## 🐛 Common Issues

### Issue: Components not styled

**Solution:** Ensure Tailwind is configured and imported

### Issue: Icons not showing

**Solution:** Pass icons as React elements, not strings

```jsx
// ❌ Wrong
icon="<svg>...</svg>"

// ✅ Correct
icon={<svg>...</svg>}
```

### Issue: Dark mode not working

**Solution:** Add `dark:` prefix to Tailwind classes

```jsx
className = "bg-white dark:bg-dark-800";
```

## 📱 Responsive Classes

```jsx
// Mobile first approach
className="
  text-sm      // Mobile
  sm:text-base // Small screens (640px+)
  md:text-lg   // Medium screens (768px+)
  lg:text-xl   // Large screens (1024px+)
"

// Grid responsive
className="
  grid-cols-1      // Mobile: 1 column
  md:grid-cols-2   // Tablet: 2 columns
  lg:grid-cols-3   // Desktop: 3 columns
"
```

## 🔗 Useful Links

- [Full Documentation](./README.md)
- [Component Showcase](./ComponentShowcase.jsx)
- [Tailwind Config](../../tailwind.config.js)
- [Design System](../../DESIGN_SYSTEM.md)
