import { Link, useNavigate } from "react-router-dom";
import { TopNavbar } from "@/components/gym";
import { useGymSettings } from "@/hooks/use-gym-settings";
import { useAuthStore } from "@/store/auth.store";
import { toast } from "sonner";

const navLinks = [
  { label: "Home", href: "/" },
  { label: "Features", href: "/features" },
  { label: "Trainers", href: "/trainers" },
  { label: "Workouts", href: "/workouts" },
  { label: "Classes", href: "/classes" },
  { label: "Pricing", href: "/pricing" },
];

interface PublicLayoutProps {
  children: React.ReactNode;
}

export function PublicLayout({ children }: PublicLayoutProps) {
  const navigate = useNavigate();
  const { 
    gymName, 
    footerTagline, 
    email, 
    phone, 
    address, 
    logo, 
    fontFamily,
    primaryColor,
    secondaryColor,
    backgroundColor,
    textColor
  } = useGymSettings();
  const { user, clearAuth } = useAuthStore();

  const handleLogout = () => {
    clearAuth();
    toast.success("Logged out successfully");
    navigate("/");
  };

  const handleDashboard = () => {
    if (user?.role === "ADMIN" || user?.role === "SUPER_ADMIN") {
      navigate("/admin");
    } else if (user?.role === "MEMBER") {
      navigate("/member");
    } else if (user?.role === "TRAINER") {
      navigate("/trainer");
    }
  };

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
      return (
        <span className="text-2xl font-bold text-primary">{words[0]}</span>
      );
    }

    const lastWord = words[words.length - 1];
    const firstWords = words.slice(0, -1).join(" ");

    return (
      <span className="text-2xl font-bold text-foreground">
        {firstWords}
        <span className="text-primary">{lastWord}</span>
      </span>
    );
  };

  // Google Fonts URL generator
  const getGoogleFontUrl = (font: string) => {
    if (!font || font === "Inter") return null;
    return `https://fonts.googleapis.com/css2?family=${font.replace(/\s+/g, "+")}:wght@400;500;600;700&display=swap`;
  };

  const fontUrl = getGoogleFontUrl(fontFamily);

  return (
    <div className="min-h-screen bg-background" style={{ fontFamily: fontFamily || 'Inter' }}>
      {fontUrl && (
        <link rel="stylesheet" href={fontUrl} />
      )}
      <style dangerouslySetInnerHTML={{ __html: `
        :root {
          ${primaryColor ? `--primary: ${primaryColor};` : ""}
          ${secondaryColor ? `--secondary: ${secondaryColor};` : ""}
          ${backgroundColor ? `--background: ${backgroundColor};` : ""}
          ${textColor ? `--foreground: ${textColor};` : ""}
        }
        
        body {
          font-family: '${fontFamily || "Inter"}', sans-serif;
        }
        
        h1, h2, h3, h4, h5, h6 {
          font-family: '${fontFamily || "Inter"}', sans-serif;
        }
      `}} />
      <TopNavbar
        links={navLinks}
        onLogin={user ? undefined : () => navigate("/auth/login")}
        onSignUp={user ? undefined : () => navigate("/register")}
        user={
          user
            ? {
                name: user.email?.split("@")[0] || "User",
                email: user.email || "",
                role: user.role || "MEMBER",
              }
            : undefined
        }
        onLogout={handleLogout}
        onDashboard={handleDashboard}
      />

      <main>{children}</main>

      {/* Footer */}
      <footer className="bg-card border-t border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Brand */}
            <div className="space-y-4">
              {logo ? (
                <img src={logo} alt={gymName} className="h-10 w-auto" />
              ) : (
                renderGymName()
              )}
              <div
                className="text-muted-foreground text-sm [&_img]:max-w-full [&_img]:rounded-xl"
                dangerouslySetInnerHTML={{ __html: footerTagline || "" }}
              />
              <div className="flex gap-4">
                <a
                  href="#"
                  className="text-muted-foreground hover:text-primary transition-colors"
                  aria-label="Facebook"
                >
                  <svg
                    className="w-5 h-5"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                  </svg>
                </a>
                <a
                  href="#"
                  className="text-muted-foreground hover:text-primary transition-colors"
                  aria-label="Instagram"
                >
                  <svg
                    className="w-5 h-5"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.162-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.663.967-2.911 2.168-2.911 1.024 0 1.518.769 1.518 1.688 0 1.029-.653 2.567-.992 3.992-.285 1.193.6 2.165 1.775 2.165 2.128 0 3.768-2.245 3.768-5.487 0-2.861-2.063-4.869-5.008-4.869-3.41 0-5.409 2.562-5.409 5.199 0 1.033.394 2.143.889 2.741.099.12.112.225.085.345-.09.375-.293 1.199-.334 1.363-.053.225-.172.271-.401.165-1.495-.69-2.433-2.878-2.433-4.646 0-3.776 2.748-7.252 7.92-7.252 4.158 0 7.392 2.967 7.392 6.923 0 4.135-2.607 7.462-6.233 7.462-1.214 0-2.354-.629-2.758-1.379l-.749 2.848c-.269 1.045-1.004 2.352-1.498 3.146 1.123.345 2.306.535 3.55.535 6.607 0 11.985-5.365 11.985-11.987C23.97 5.39 18.592.026 11.985.026L12.017 0z" />
                  </svg>
                </a>
                <a
                  href="#"
                  className="text-muted-foreground hover:text-primary transition-colors"
                  aria-label="Twitter"
                >
                  <svg
                    className="w-5 h-5"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                  </svg>
                </a>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="font-semibold text-foreground mb-4">
                Quick Links
              </h4>
              <ul className="space-y-2" role="list">
                {navLinks.map((link) => (
                  <li key={link.href}>
                    <Link
                      to={link.href}
                      className="text-muted-foreground hover:text-primary text-sm transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h4 className="font-semibold text-foreground mb-4">Contact</h4>
              <ul className="space-y-3 text-sm" role="list">
                <li className="flex items-start gap-3 text-muted-foreground">
                  <svg
                    className="w-5 h-5 text-primary flex-shrink-0"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                  <span>{address}</span>
                </li>
                <li className="flex items-center gap-3 text-muted-foreground">
                  <svg
                    className="w-5 h-5 text-primary flex-shrink-0"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                    />
                  </svg>
                  <a
                    href={email ? `mailto:${email}` : undefined}
                    className="hover:text-primary transition-colors"
                  >
                    {email}
                  </a>
                </li>
                <li className="flex items-center gap-3 text-muted-foreground">
                  <svg
                    className="w-5 h-5 text-primary flex-shrink-0"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                    />
                  </svg>
                  <a
                    href={phone ? `tel:${phone}` : undefined}
                    className="hover:text-primary transition-colors"
                  >
                    {phone}
                  </a>
                </li>
              </ul>
            </div>

            {/* Hours */}
            <div>
              <h4 className="font-semibold text-foreground mb-4">
                Opening Hours
              </h4>
              <ul className="space-y-2 text-sm" role="list">
                <li className="flex justify-between text-muted-foreground">
                  <span>Monday - Friday</span>
                  <span className="text-foreground">5:00 AM - 11:00 PM</span>
                </li>
                <li className="flex justify-between text-muted-foreground">
                  <span>Saturday</span>
                  <span className="text-foreground">6:00 AM - 10:00 PM</span>
                </li>
                <li className="flex justify-between text-muted-foreground">
                  <span>Sunday</span>
                  <span className="text-foreground">7:00 AM - 9:00 PM</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Copyright */}
          <div className="mt-12 pt-8 border-t border-border">
            <p className="text-center text-muted-foreground text-sm">
              &copy; {new Date().getFullYear()} {gymName}. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
