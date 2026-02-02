# Reusable React Components

A comprehensive collection of accessible, responsive, and dark-mode-ready React components built with Tailwind CSS for the Gym & Fitness application.

## 🎨 Features

- ✅ **Global Theme Colors** - Uses Tailwind theme colors (primary, accent, dark)
- ✅ **Accessible** - WCAG 2.1 AA compliant with proper ARIA labels
- ✅ **Dark Mode Support** - Full dark mode compatibility
- ✅ **Mobile Responsive** - Optimized for all screen sizes
- ✅ **Framer Motion** - Smooth animations and transitions
- ✅ **TypeScript Ready** - Can be easily converted to TypeScript

## 📦 Components

### Buttons

#### PrimaryButton

Main call-to-action button with neon green styling.

```jsx
import { PrimaryButton } from "@/components";

<PrimaryButton
  onClick={handleClick}
  size="md" // sm, md, lg
  isLoading={false}
  disabled={false}
  fullWidth={false}
  icon={<IconComponent />}
>
  Click Me
</PrimaryButton>;
```

**Props:**

- `children` - Button text/content
- `onClick` - Click handler function
- `type` - Button type (button, submit, reset)
- `size` - Button size (sm, md, lg)
- `isLoading` - Shows loading spinner
- `disabled` - Disables the button
- `fullWidth` - Makes button full width
- `icon` - Optional icon element
- `className` - Additional CSS classes

#### SecondaryButton

Outlined button with transparent background.

```jsx
import { SecondaryButton } from "@/components";

<SecondaryButton onClick={handleClick}>Learn More</SecondaryButton>;
```

Same props as PrimaryButton.

---

### Cards

#### StatCard

Display key metrics and statistics with optional trend indicators.

```jsx
import { StatCard } from "@/components";

<StatCard
  label="Total Members"
  value="1,234"
  trend="up" // up, down, or omit
  trendValue="+12%"
  icon={<IconComponent />}
/>;
```

**Props:**

- `label` - Stat label/title
- `value` - Main stat value
- `icon` - Optional icon element
- `trend` - Trend direction (up/down)
- `trendValue` - Trend percentage/value
- `className` - Additional CSS classes

#### PricingCard

Showcase membership plans and pricing tiers.

```jsx
import { PricingCard } from "@/components";

<PricingCard
  name="Pro Plan"
  price="59"
  period="month"
  description="Most popular choice"
  features={[
    "Unlimited classes",
    "Personal training",
    "Nutrition consultation",
  ]}
  isPopular={true}
  isPremium={true}
  onSelect={handleSelect}
  buttonText="Get Started"
/>;
```

**Props:**

- `name` - Plan name
- `price` - Price amount (without $)
- `period` - Billing period (month, year)
- `description` - Plan description
- `features` - Array of feature strings
- `isPopular` - Shows "Most Popular" badge
- `isPremium` - Uses premium styling
- `onSelect` - Click handler for CTA button
- `buttonText` - Custom button text
- `className` - Additional CSS classes

#### TrainerCard

Display trainer profiles with booking capabilities.

```jsx
import { TrainerCard } from "@/components";

<TrainerCard
  name="Sarah Johnson"
  title="Strength Coach"
  specialties={["HIIT", "Strength", "Nutrition"]}
  image="/path/to/image.jpg"
  bio="Certified trainer..."
  rating="4.9"
  experience="8"
  onViewProfile={handleView}
  onBookSession={handleBook}
/>;
```

**Props:**

- `name` - Trainer name
- `title` - Trainer title/role
- `specialties` - Array of specialty strings
- `image` - Profile image URL
- `bio` - Short biography
- `rating` - Rating score (0-5)
- `experience` - Years of experience
- `onViewProfile` - View profile handler
- `onBookSession` - Book session handler
- `className` - Additional CSS classes

#### WorkoutPlanCard

Showcase workout plans and programs.

```jsx
import { WorkoutPlanCard } from "@/components";

<WorkoutPlanCard
  name="Full Body Blast"
  description="Comprehensive workout..."
  duration="45 min"
  difficulty="Intermediate" // Beginner, Intermediate, Advanced
  exercises={12}
  image="/path/to/image.jpg"
  trainer="Sarah Johnson"
  onSelect={handleStart}
  onPreview={handlePreview}
/>;
```

**Props:**

- `name` - Plan name
- `description` - Plan description
- `duration` - Workout duration
- `difficulty` - Difficulty level
- `exercises` - Number of exercises
- `image` - Plan image URL
- `trainer` - Trainer name
- `onSelect` - Start plan handler
- `onPreview` - Preview plan handler
- `className` - Additional CSS classes

---

### Tables

#### ClassScheduleTable

Display class schedules with booking functionality.

```jsx
import { ClassScheduleTable } from "@/components";

const classes = [
  {
    id: 1,
    time: "06:00 AM",
    name: "Morning HIIT",
    type: "High Intensity",
    trainer: "Sarah Johnson",
    duration: "45 min",
    enrolled: 12,
    capacity: 15,
  },
];

<ClassScheduleTable
  classes={classes}
  onBookClass={handleBook}
  onViewDetails={handleView}
/>;
```

**Props:**

- `classes` - Array of class objects
- `onBookClass` - Book class handler
- `onViewDetails` - View details handler
- `className` - Additional CSS classes

**Class Object Structure:**

```typescript
{
  id: number | string;
  time: string;
  name: string;
  type?: string;
  trainer: string;
  duration: string;
  enrolled: number;
  capacity: number;
}
```

---

### Navigation

#### SidebarNavigation

Collapsible sidebar navigation for dashboard layouts.

```jsx
import { SidebarNavigation } from "@/components";

const items = [
  {
    path: "/dashboard",
    label: "Dashboard",
    icon: <DashboardIcon />,
    badge: "5", // optional
  },
];

<SidebarNavigation
  items={items}
  logo={<LogoComponent />}
  footer={<FooterContent />}
/>;
```

**Props:**

- `items` - Array of navigation items
- `logo` - Optional logo component
- `footer` - Optional footer content
- `className` - Additional CSS classes

**Navigation Item Structure:**

```typescript
{
  path: string;
  label: string;
  icon: ReactNode;
  badge?: string | number;
}
```

#### TopNavbar

Responsive top navigation bar with user menu.

```jsx
import { TopNavbar } from "@/components";

const navItems = [
  { path: "/", label: "Home" },
  { path: "/classes", label: "Classes" },
];

const user = {
  name: "John Doe",
  role: "Admin",
  avatar: "/path/to/avatar.jpg",
  menuItems: [
    {
      label: "Profile",
      icon: <ProfileIcon />,
      onClick: handleProfile,
    },
  ],
};

<TopNavbar
  items={navItems}
  user={user}
  logo={<LogoComponent />}
  actions={<ActionButtons />}
  onMenuToggle={handleToggle}
/>;
```

**Props:**

- `items` - Array of navigation items
- `user` - User object with menu
- `logo` - Optional logo component
- `actions` - Optional action buttons
- `onMenuToggle` - Mobile menu toggle handler
- `className` - Additional CSS classes

---

## 🎯 Usage Examples

### Basic Import

```jsx
import {
  PrimaryButton,
  SecondaryButton,
  StatCard,
  PricingCard,
  TrainerCard,
  WorkoutPlanCard,
  ClassScheduleTable,
  SidebarNavigation,
  TopNavbar,
} from "@/components";
```

### Complete Page Example

```jsx
import { TopNavbar, StatCard, PrimaryButton } from "@/components";

function Dashboard() {
  return (
    <div className="min-h-screen bg-dark-900">
      <TopNavbar items={navItems} user={currentUser} />

      <main className="max-w-7xl mx-auto p-8">
        <h1 className="text-4xl font-bold text-white mb-8">Dashboard</h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <StatCard
            label="Members"
            value="1,234"
            trend="up"
            trendValue="+12%"
          />
          <StatCard label="Classes" value="48" trend="up" trendValue="+5" />
          <StatCard
            label="Revenue"
            value="$45.2K"
            trend="up"
            trendValue="+23%"
          />
        </div>

        <PrimaryButton onClick={handleAction}>Take Action</PrimaryButton>
      </main>
    </div>
  );
}
```

---

## 🎨 Theming

All components use Tailwind theme colors defined in `tailwind.config.js`:

```js
colors: {
  primary: "#22c55e",    // Neon Green
  accent: "#84cc16",     // Lime
  dark: {
    900: "#0a0a0a",      // Pure Black
    800: "#171717",      // Dark Gray
    700: "#262626"       // Charcoal
  }
}
```

---

## ♿ Accessibility

All components include:

- Proper ARIA labels and roles
- Keyboard navigation support
- Focus indicators
- Screen reader support
- Semantic HTML
- Color contrast compliance

---

## 📱 Responsive Design

Components are mobile-first and responsive:

- Mobile: 320px - 767px
- Tablet: 768px - 1023px
- Desktop: 1024px+

---

## 🎬 Animations

Components use Framer Motion for smooth animations:

- Reduced motion support
- Performance optimized
- Configurable transitions

---

## 🧪 Testing

See `ComponentShowcase.jsx` for a complete demo of all components with sample data.

---

## 📝 Notes

- All components are memoized with `React.memo` for performance
- Components support dark mode out of the box
- Tailwind classes can be extended via `className` prop
- Icons are passed as React elements for flexibility

---

## 🚀 Future Enhancements

- TypeScript definitions
- Storybook documentation
- Unit tests
- Additional variants
- More customization options
