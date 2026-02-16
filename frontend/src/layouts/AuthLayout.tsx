import React from "react";
import { Link } from "react-router-dom";
import { useGymSettings } from "@/hooks/use-gym-settings";
import { ThemeToggle } from "@/components/layout/ThemeToggle";

interface AuthLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
}

export function AuthLayout({ children, title, subtitle }: AuthLayoutProps) {
  const { gymName } = useGymSettings();

  return (
    <div className="min-h-screen bg-background flex relative overflow-hidden transition-colors duration-300">
      <div className="absolute top-4 right-4 z-50">
        <ThemeToggle />
      </div>
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_top_left,hsl(var(--primary)/0.12),transparent_42%),radial-gradient(circle_at_bottom_right,hsl(var(--secondary)/0.08),transparent_38%)]" />

      {/* Left Side - Form */}
      <div className="relative z-[1] flex-1 flex flex-col justify-center px-4 sm:px-6 lg:px-8 py-12">
        <div className="w-full max-w-md mx-auto rounded-xl border border-border/80 bg-card/95 shadow-[var(--surface-shadow-2)] p-6 sm:p-8">
          {/* Logo */}
          <Link to="/" className="inline-block mb-8">
            {gymName ? (
              <span className="text-2xl sm:text-3xl font-semibold tracking-tight text-foreground">
                {gymName.trim().split(/\s+/).map((word, index) => (
                  <React.Fragment key={index}>
                    {index % 2 === 0 ? word : <span className="text-primary">{word}</span>}
                    {index < gymName.trim().split(/\s+/).length - 1 ? " " : ""}
                  </React.Fragment>
                ))}
              </span>
            ) : null}
          </Link>

          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-semibold tracking-tight text-foreground mb-2">{title}</h1>
            {subtitle && <p className="text-muted-foreground">{subtitle}</p>}
          </div>

          {/* Form Content */}
          {children}
        </div>
      </div>

      {/* Right Side - Image (hidden on mobile) */}
      <div className="hidden lg:block lg:w-1/2 relative">
        <img
          src="/images/auth-bg.jpg"
          alt="Fitness motivation"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-primary/35 via-background/5 to-background/75" />

        {/* Overlay Content */}
        <div className="absolute bottom-0 left-0 right-0 p-12">
          <blockquote className="space-y-4">
            {gymName ? (
              <>
                <p className="text-2xl font-semibold text-white leading-relaxed drop-shadow-sm">
                  &ldquo;The only bad workout is the one that didn&apos;t happen.
                  Join {gymName} and start your transformation today.&rdquo;
                </p>
                <footer className="text-primary-foreground/90 font-medium">
                  - {gymName} Team
                </footer>
              </>
            ) : null}
          </blockquote>
        </div>
      </div>
    </div>
  );
}
