import { useState } from "react";
import { 
  Activity, 
  CreditCard, 
  Smartphone, 
  LineChart, 
  CheckCircle2
} from "lucide-react";
import { Hero } from "@/components/features/auth/Hero";
import { FeatureCard } from "@/components/features/auth/FeatureCard";
import { AuthModal } from "@/components/features/auth/AuthModal";
import { Button } from "@/components/ui/Button";

export default function AttractionAuthPage() {
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authView, setAuthView] = useState<"login" | "register">("register");

  const openAuth = (view: "login" | "register") => {
    setAuthView(view);
    setAuthModalOpen(true);
  };

  const features = [
    {
      title: "Track Your Workouts",
      description: "Log your sets, reps, and PRs instantly. Watch your progress compound over time.",
      icon: Activity,
    },
    {
      title: "Manage Memberships Easily",
      description: "No more confusing contracts. Upgrade, pause, or renew straight from your phone.",
      icon: CreditCard,
    },
    {
      title: "Smart Alerts",
      description: "Get reminded of upcoming classes, expiring plans, or when it's time to hit the gym.",
      icon: Smartphone,
    },
    {
      title: "Performance Insights",
      description: "Dive deep into your data with detailed analytics maps and body composition trends.",
      icon: LineChart,
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* 1. Hero Section */}
      <Hero onOpenAuth={openAuth} />

      {/* 2. Value Propositions */}
      <section className="container mx-auto px-4 py-24 sm:px-6 lg:px-8">
        <div className="mb-16 text-center">
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Everything you need to succeed
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            A comprehensive suite of tools built specifically for serious modern gym-goers.
          </p>
        </div>
        
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((feature, idx) => (
            <FeatureCard
              key={idx}
              title={feature.title}
              description={feature.description}
              icon={feature.icon}
            />
          ))}
        </div>
      </section>

      {/* 3. Social Proof / Motivation */}
      <section className="bg-muted/50 py-24">
        <div className="container mx-auto px-4 text-center">
          <blockquote className="mx-auto max-w-3xl">
            <p className="text-2xl font-medium italic leading-relaxed text-foreground sm:text-3xl">
              "The discipline you build in the gym ripples into every other aspect of your life. Start building today."
            </p>
          </blockquote>
          <div className="mt-8 flex items-center justify-center gap-2 text-muted-foreground">
            <CheckCircle2 className="size-5 text-success" />
            <span className="font-medium">Trusted by 10,000+ Active Members</span>
          </div>
        </div>
      </section>

      {/* 4. Final Call-To-Action */}
      <section className="container mx-auto px-4 py-24 text-center sm:px-6 lg:px-8">
        <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          Ready to commit to yourself?
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
          Join today to access flexible plans, eliminate paperwork, and focus 100% on your fitness goals.
        </p>
        <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Button size="lg" className="h-14 px-8 text-lg w-full sm:w-auto" onClick={() => openAuth("register")}>
            Start Your Fitness Journey
          </Button>
          <Button variant="text" className="h-14 px-8 text-lg w-full sm:w-auto" onClick={() => openAuth("login")}>
            Login to Your Account
          </Button>
        </div>
      </section>

      {/* 5. Authentication Modal Entry */}
      <AuthModal 
        isOpen={authModalOpen} 
        onOpenChange={setAuthModalOpen} 
        initialView={authView} 
      />
    </div>
  );
}
