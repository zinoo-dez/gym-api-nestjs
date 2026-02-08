import React from "react";
import { Link } from "react-router-dom";
import { useGymSettings } from "@/hooks/use-gym-settings";

interface AuthLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
}

export function AuthLayout({ children, title, subtitle }: AuthLayoutProps) {
  const { gymName } = useGymSettings();

  return (
    <div className="min-h-screen bg-background flex">
      {/* Left Side - Form */}
      <div className="flex-1 flex flex-col justify-center px-4 sm:px-6 lg:px-8 py-12">
        <div className="w-full max-w-md mx-auto">
          {/* Logo */}
          <Link to="/" className="inline-block mb-8">
            {gymName ? (
              <span className="text-3xl font-bold text-foreground">
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
            <h1 className="text-3xl font-bold text-foreground mb-2">{title}</h1>
            {subtitle && <p className="text-muted-foreground">{subtitle}</p>}
          </div>

          {/* Form Content */}
          {children}
        </div>
      </div>

      {/* Right Side - Image (hidden on mobile) */}
      <div className="hidden lg:block lg:w-1/2 relative">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-background" />
        <img
          src="/images/auth-bg.jpg"
          alt="Fitness motivation"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />

        {/* Overlay Content */}
        <div className="absolute bottom-0 left-0 right-0 p-12">
          <blockquote className="space-y-4">
            {gymName ? (
              <>
                <p className="text-2xl font-semibold text-foreground leading-relaxed">
                  &ldquo;The only bad workout is the one that didn&apos;t happen.
                  Join {gymName} and start your transformation today.&rdquo;
                </p>
                <footer className="text-primary font-medium">
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
