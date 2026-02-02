"use client"

import * as React from "react"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { PrimaryButton } from "./primary-button"
import { SecondaryButton } from "./secondary-button"

interface NavLink {
  label: string
  href: string
}

interface TopNavbarProps {
  links: NavLink[]
  logo?: React.ReactNode
  showAuthButtons?: boolean
  onLogin?: () => void
  onSignUp?: () => void
  className?: string
}

export function TopNavbar({
  links,
  logo,
  showAuthButtons = true,
  onLogin,
  onSignUp,
  className,
}: TopNavbarProps) {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false)
  const [isScrolled, setIsScrolled] = React.useState(false)

  React.useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50",
        "transition-all duration-300",
        isScrolled
          ? "bg-background/95 backdrop-blur-md border-b border-border shadow-lg"
          : "bg-transparent",
        className
      )}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <nav className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            {logo || (
              <span className="text-2xl font-bold text-foreground">
                Power<span className="text-primary">Fit</span>
              </span>
            )}
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-8">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-muted-foreground hover:text-foreground font-medium transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Auth Buttons */}
          {showAuthButtons && (
            <div className="hidden lg:flex items-center gap-4">
              <SecondaryButton variant="ghost" size="sm" onClick={onLogin}>
                Log In
              </SecondaryButton>
              <PrimaryButton size="sm" onClick={onSignUp}>
                Join Now
              </PrimaryButton>
            </div>
          )}

          {/* Mobile Menu Button */}
          <button
            className="lg:hidden p-2 text-foreground"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle menu"
            aria-expanded={isMenuOpen}
          >
            {isMenuOpen ? (
              <svg
                className="w-6 h-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            ) : (
              <svg
                className="w-6 h-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            )}
          </button>
        </nav>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="lg:hidden py-4 border-t border-border">
            <div className="flex flex-col gap-4">
              {links.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-muted-foreground hover:text-foreground font-medium py-2 transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
              {showAuthButtons && (
                <div className="flex flex-col gap-3 pt-4 border-t border-border">
                  <SecondaryButton variant="ghost" onClick={onLogin}>
                    Log In
                  </SecondaryButton>
                  <PrimaryButton onClick={onSignUp}>Join Now</PrimaryButton>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  )
}
