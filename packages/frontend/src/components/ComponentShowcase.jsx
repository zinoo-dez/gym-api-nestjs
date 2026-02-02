import { useState } from "react";
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
} from "./index";

/**
 * Component Showcase - Examples of all reusable components
 * This file demonstrates how to use each component with sample data
 */
export default function ComponentShowcase() {
  const [selectedPlan, setSelectedPlan] = useState(null);

  // Sample data for demonstrations
  const sampleClasses = [
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
    {
      id: 2,
      time: "09:00 AM",
      name: "Yoga Flow",
      type: "Flexibility",
      trainer: "Mike Chen",
      duration: "60 min",
      enrolled: 8,
      capacity: 20,
    },
    {
      id: 3,
      time: "12:00 PM",
      name: "Strength Training",
      type: "Resistance",
      trainer: "Alex Rodriguez",
      duration: "50 min",
      enrolled: 15,
      capacity: 15,
    },
  ];

  const sidebarItems = [
    {
      path: "/dashboard",
      label: "Dashboard",
      icon: (
        <svg fill="currentColor" viewBox="0 0 20 20">
          <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
        </svg>
      ),
    },
    {
      path: "/members",
      label: "Members",
      icon: (
        <svg fill="currentColor" viewBox="0 0 20 20">
          <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
        </svg>
      ),
      badge: "12",
    },
    {
      path: "/classes",
      label: "Classes",
      icon: (
        <svg fill="currentColor" viewBox="0 0 20 20">
          <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z" />
        </svg>
      ),
    },
  ];

  const navItems = [
    { path: "/", label: "Home" },
    { path: "/classes", label: "Classes" },
    { path: "/trainers", label: "Trainers" },
    { path: "/pricing", label: "Pricing" },
    { path: "/about", label: "About" },
  ];

  const user = {
    name: "John Doe",
    role: "Admin",
    menuItems: [
      {
        label: "Profile",
        icon: (
          <svg fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
          </svg>
        ),
        onClick: () => console.log("Profile clicked"),
      },
      {
        label: "Settings",
        icon: (
          <svg fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
          </svg>
        ),
        onClick: () => console.log("Settings clicked"),
      },
      {
        label: "Logout",
        icon: (
          <svg fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z" clipRule="evenodd" />
          </svg>
        ),
        onClick: () => console.log("Logout clicked"),
      },
    ],
  };

  return (
    <div className="min-h-screen bg-dark-900">
      {/* Top Navbar Example */}
      <TopNavbar
        items={navItems}
        user={user}
        actions={
          <>
            <SecondaryButton size="sm">Login</SecondaryButton>
            <PrimaryButton size="sm">Join Now</PrimaryButton>
          </>
        }
      />

      <div className="flex">
        {/* Sidebar Example */}
        <SidebarNavigation items={sidebarItems} />

        {/* Main Content */}
        <main className="flex-1 p-8">
          <div className="max-w-7xl mx-auto space-y-16">
            {/* Buttons Section */}
            <section>
              <h2 className="text-3xl font-bold text-white mb-6">Buttons</h2>
              <div className="flex flex-wrap gap-4">
                <PrimaryButton>Primary Button</PrimaryButton>
                <PrimaryButton size="sm">Small</PrimaryButton>
                <PrimaryButton size="lg">Large</PrimaryButton>
                <PrimaryButton isLoading>Loading</PrimaryButton>
                <PrimaryButton disabled>Disabled</PrimaryButton>
                <SecondaryButton>Secondary Button</SecondaryButton>
              </div>
            </section>

            {/* Stat Cards Section */}
            <section>
              <h2 className="text-3xl font-bold text-white mb-6">Stat Cards</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                  label="Total Members"
                  value="1,234"
                  trend="up"
                  trendValue="+12%"
                  icon={
                    <svg className="w-full h-full" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                    </svg>
                  }
                />
                <StatCard
                  label="Active Classes"
                  value="48"
                  trend="up"
                  trendValue="+5"
                  icon={
                    <svg className="w-full h-full" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3z" />
                    </svg>
                  }
                />
                <StatCard
                  label="Revenue"
                  value="$45.2K"
                  trend="up"
                  trendValue="+23%"
                  icon={
                    <svg className="w-full h-full" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd" />
                    </svg>
                  }
                />
                <StatCard
                  label="Attendance Rate"
                  value="94%"
                  trend="down"
                  trendValue="-2%"
                  icon={
                    <svg className="w-full h-full" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                    </svg>
                  }
                />
              </div>
            </section>

            {/* Pricing Cards Section */}
            <section>
              <h2 className="text-3xl font-bold text-white mb-6">Pricing Cards</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <PricingCard
                  name="Basic"
                  price="29"
                  description="Perfect for beginners"
                  features={[
                    "Access to gym equipment",
                    "2 group classes per week",
                    "Locker room access",
                    "Mobile app access",
                  ]}
                  onSelect={() => setSelectedPlan("basic")}
                />
                <PricingCard
                  name="Pro"
                  price="59"
                  description="Most popular choice"
                  features={[
                    "Everything in Basic",
                    "Unlimited group classes",
                    "1 personal training session/month",
                    "Nutrition consultation",
                    "Priority booking",
                  ]}
                  isPopular
                  isPremium
                  onSelect={() => setSelectedPlan("pro")}
                />
                <PricingCard
                  name="Elite"
                  price="99"
                  description="For serious athletes"
                  features={[
                    "Everything in Pro",
                    "4 personal training sessions/month",
                    "Custom workout plans",
                    "Recovery room access",
                    "Guest passes (2/month)",
                  ]}
                  onSelect={() => setSelectedPlan("elite")}
                />
              </div>
            </section>

            {/* Trainer Cards Section */}
            <section>
              <h2 className="text-3xl font-bold text-white mb-6">Trainer Cards</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <TrainerCard
                  name="Sarah Johnson"
                  title="Strength & Conditioning Coach"
                  specialties={["Strength Training", "HIIT", "Nutrition"]}
                  rating="4.9"
                  experience="8"
                  bio="Certified personal trainer specializing in strength training and body transformation."
                  onViewProfile={() => console.log("View profile")}
                  onBookSession={() => console.log("Book session")}
                />
                <TrainerCard
                  name="Mike Chen"
                  title="Yoga & Flexibility Expert"
                  specialties={["Yoga", "Pilates", "Meditation", "Flexibility"]}
                  rating="5.0"
                  experience="12"
                  bio="Experienced yoga instructor helping clients achieve balance and flexibility."
                  onViewProfile={() => console.log("View profile")}
                  onBookSession={() => console.log("Book session")}
                />
              </div>
            </section>

            {/* Workout Plan Cards Section */}
            <section>
              <h2 className="text-3xl font-bold text-white mb-6">Workout Plan Cards</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <WorkoutPlanCard
                  name="Full Body Blast"
                  description="A comprehensive workout targeting all major muscle groups"
                  duration="45 min"
                  difficulty="Intermediate"
                  exercises={12}
                  trainer="Sarah Johnson"
                  onPreview={() => console.log("Preview plan")}
                  onSelect={() => console.log("Start plan")}
                />
                <WorkoutPlanCard
                  name="Beginner's Guide"
                  description="Perfect introduction to fitness for newcomers"
                  duration="30 min"
                  difficulty="Beginner"
                  exercises={8}
                  trainer="Mike Chen"
                  onPreview={() => console.log("Preview plan")}
                  onSelect={() => console.log("Start plan")}
                />
              </div>
            </section>

            {/* Class Schedule Table Section */}
            <section>
              <h2 className="text-3xl font-bold text-white mb-6">Class Schedule</h2>
              <div className="bg-dark-800 rounded-3xl p-6 border border-white/5">
                <ClassScheduleTable
                  classes={sampleClasses}
                  onBookClass={(classItem) => console.log("Book class:", classItem)}
                  onViewDetails={(classItem) => console.log("View details:", classItem)}
                />
              </div>
            </section>
          </div>
        </main>
      </div>
    </div>
  );
}
