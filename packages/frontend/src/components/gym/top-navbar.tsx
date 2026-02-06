import * as React from "react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useGymSettings } from "@/hooks/use-gym-settings";
import { PrimaryButton } from "./primary-button";
import { SecondaryButton } from "./secondary-button";

interface NavLink {
  label: string;
  href: string;
}

interface User {
  name: string;
  email: string;
  role: string;
}

interface TopNavbarProps {
  links: NavLink[];
  logo?: React.ReactNode;
  showAuthButtons?: boolean;
  onLogin?: () => void;
  onSignUp?: () => void;
  user?: User;
  onLogout?: () => void;
  onDashboard?: () => void;
  className?: string;
}

export function TopNavbar({
  links,
  logo,
  showAuthButtons = true,
  onLogin,
  onSignUp,
  user,
  onLogout,
  onDashboard,
  className,
}: TopNavbarProps) {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const [isScrolled, setIsScrolled] = React.useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = React.useState(false);
  const { gymName, logo: gymLogo } = useGymSettings();

  React.useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Split gym name into words for styling
  const renderGymName = () => {
    if (!gymName) {
      return null;
    }

    const words = gymName.trim().split(/\s+/);

    if (words.length === 0) {
      return null;
    }

    if (words.length === 1) {
      // Single word - show it in primary color
      return (
        <span className="text-2xl font-bold text-primary">{words[0]}</span>
      );
    }

    // Multiple words - first word(s) in foreground, last word in primary
    const lastWord = words[words.length - 1];
    const firstWords = words.slice(0, -1).join(" ");

    return (
      <span className="text-2xl font-bold text-foreground">
        {firstWords}
        <span className="text-primary">{lastWord}</span>
      </span>
    );
  };

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50",
        "transition-all duration-300",
        isScrolled
          ? "bg-background/95 backdrop-blur-md border-b border-border shadow-lg"
          : "bg-transparent",
        className,
      )}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <nav className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            {logo ? (
              logo
            ) : gymLogo ? (
              <img src={gymLogo} alt={gymName} className="h-8 w-auto" />
            ) : (
              renderGymName()
            )}
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-8">
            {links.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                className="text-muted-foreground hover:text-foreground font-medium transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Auth Buttons or User Menu */}
          {showAuthButtons && (
            <div className="hidden lg:flex items-center gap-4">
              {user ? (
                <div className="relative">
                  <button
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    className="flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-sidebar-accent transition-colors"
                  >
                    <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                      <span className="text-primary-foreground text-sm font-semibold">
                        {user.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div className="text-left">
                      <p className="text-sm font-medium text-foreground">
                        {user.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {user.role}
                      </p>
                    </div>
                    <svg
                      className={cn(
                        "w-4 h-4 text-muted-foreground transition-transform",
                        isUserMenuOpen && "rotate-180",
                      )}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </button>

                  {isUserMenuOpen && (
                    <>
                      <div
                        className="fixed inset-0 z-40"
                        onClick={() => setIsUserMenuOpen(false)}
                      />
                      <div className="absolute right-0 mt-2 w-56 bg-card border border-border rounded-lg shadow-lg z-50 py-2">
                        <button
                          onClick={() => {
                            setIsUserMenuOpen(false);
                            onDashboard?.();
                          }}
                          className="w-full flex items-center gap-3 px-4 py-2 text-sm text-foreground hover:bg-sidebar-accent transition-colors"
                        >
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
                            />
                          </svg>
                          Go to Dashboard
                        </button>
                        <div className="my-1 border-t border-border" />
                        <button
                          onClick={() => {
                            setIsUserMenuOpen(false);
                            onLogout?.();
                          }}
                          className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-500 hover:bg-sidebar-accent transition-colors"
                        >
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                            />
                          </svg>
                          Logout
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ) : (
                <>
                  <SecondaryButton variant="ghost" size="sm" onClick={onLogin}>
                    Log In
                  </SecondaryButton>
                  <PrimaryButton size="sm" onClick={onSignUp}>
                    Join Now
                  </PrimaryButton>
                </>
              )}
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
                  to={link.href}
                  className="text-muted-foreground hover:text-foreground font-medium py-2 transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
              {showAuthButtons && (
                <div className="flex flex-col gap-3 pt-4 border-t border-border">
                  {user ? (
                    <>
                      <div className="flex items-center gap-3 px-4 py-3 bg-sidebar-accent rounded-lg">
                        <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
                          <span className="text-primary-foreground text-sm font-semibold">
                            {user.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-foreground">
                            {user.name}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {user.role}
                          </p>
                        </div>
                      </div>
                      <SecondaryButton
                        variant="ghost"
                        onClick={() => {
                          setIsMenuOpen(false);
                          onDashboard?.();
                        }}
                      >
                        Go to Dashboard
                      </SecondaryButton>
                      <SecondaryButton
                        variant="ghost"
                        onClick={() => {
                          setIsMenuOpen(false);
                          onLogout?.();
                        }}
                        className="text-red-500 hover:text-red-600"
                      >
                        Logout
                      </SecondaryButton>
                    </>
                  ) : (
                    <>
                      <SecondaryButton variant="ghost" onClick={onLogin}>
                        Log In
                      </SecondaryButton>
                      <PrimaryButton onClick={onSignUp}>Join Now</PrimaryButton>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
