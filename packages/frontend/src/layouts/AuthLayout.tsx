import React from "react"
import { Link } from "react-router-dom"

interface AuthLayoutProps {
  children: React.ReactNode
  title: string
  subtitle?: string
}

export function AuthLayout({ children, title, subtitle }: AuthLayoutProps) {
  return (
    <div className="min-h-screen bg-background flex">
      {/* Left Side - Form */}
      <div className="flex-1 flex flex-col justify-center px-4 sm:px-6 lg:px-8 py-12">
        <div className="w-full max-w-md mx-auto">
          {/* Logo */}
          <Link to="/" className="inline-block mb-8">
            <span className="text-3xl font-bold text-foreground">
              Power<span className="text-primary">Fit</span>
            </span>
          </Link>

          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">{title}</h1>
            {subtitle && (
              <p className="text-muted-foreground">{subtitle}</p>
            )}
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
            <p className="text-2xl font-semibold text-foreground leading-relaxed">
              &ldquo;The only bad workout is the one that didn&apos;t happen. Join PowerFit and start your transformation today.&rdquo;
            </p>
            <footer className="text-primary font-medium">
              - PowerFit Team
            </footer>
          </blockquote>
        </div>
      </div>
    </div>
  )
}
