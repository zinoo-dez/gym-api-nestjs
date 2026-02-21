import { useState, useEffect } from "react";
import { Outlet, Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Menu, X, LayoutDashboard, Users, CreditCard, 
  Settings, LogOut, Activity, BarChart3, Bell
} from "lucide-react";
import { useAuthStore } from "@/stores/auth.store";

const menuItems = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/" },
  { icon: Users, label: "Members", path: "/members" },
  { icon: CreditCard, label: "Payments", path: "/payments" },
  { icon: BarChart3, label: "Reports", path: "/reports" },
  { icon: Settings, label: "Settings", path: "/settings" },
];

export function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const { user, logout } = useAuthStore();
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth >= 768) {
        setSidebarOpen(true);
      } else {
        setSidebarOpen(false);
      }
    };
    checkScreenSize();
    window.addEventListener("resize", checkScreenSize);
    return () => window.removeEventListener("resize", checkScreenSize);
  }, []);

  // Close sidebar on mobile when route changes
  useEffect(() => {
    if (isMobile) {
      setSidebarOpen(false);
    }
  }, [location.pathname, isMobile]);

  return (
    <div className="flex h-screen overflow-hidden bg-background text-foreground">
      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {isMobile && sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSidebarOpen(false)}
            className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.aside
        initial={{ x: isMobile ? "-100%" : 0 }}
        animate={{ x: sidebarOpen ? 0 : isMobile ? "-100%" : 0 }}
        transition={{ type: "spring", damping: 25, stiffness: 200 }}
        className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r bg-card shadow-sm md:static md:translate-x-0`}
      >
        <div className="flex h-16 shrink-0 items-center justify-between border-b px-6">
          <span className="text-xl font-bold tracking-tight text-primary">GymAdmin</span>
          {isMobile && (
            <button onClick={() => setSidebarOpen(false)} className="text-muted-foreground hover:text-foreground">
              <X className="size-5" />
            </button>
          )}
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto p-4">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;
            return (
              <Link key={item.path} to={item.path}>
                <motion.div
                  whileHover={{ x: 4 }}
                  whileTap={{ scale: 0.98 }}
                  className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                  }`}
                >
                  <Icon className={`size-5 ${isActive ? "text-primary" : ""}`} />
                  {item.label}
                </motion.div>
              </Link>
            );
          })}
        </nav>

        <div className="border-t p-4">
          <div className="mb-4 flex items-center gap-3 px-3">
            <div className="flex size-9 items-center justify-center rounded-full bg-primary/20 text-primary">
              <span className="font-semibold uppercase">{user?.firstName?.[0] || 'A'}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-semibold">{user?.firstName || 'Admin'} {user?.lastName || ''}</span>
              <span className="text-xs text-muted-foreground">{user?.email || 'admin@gym.com'}</span>
            </div>
          </div>
          <button
            onClick={() => logout()}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-danger transition-colors hover:bg-danger/10"
          >
            <LogOut className="size-5" />
            Logout
          </button>
        </div>
      </motion.aside>

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top Header */}
        <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center justify-between border-b bg-background/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/60 md:px-6">
          <div className="flex items-center gap-4">
            {isMobile && (
              <button
                onClick={() => setSidebarOpen(true)}
                className="text-muted-foreground hover:text-foreground"
              >
                <Menu className="size-6" />
              </button>
            )}
            <h1 className="text-xl md:text-2xl font-semibold tracking-tight text-foreground hidden sm:block">
              {menuItems.find((m) => m.path === location.pathname)?.label || "Overview"}
            </h1>
          </div>

          <div className="flex items-center gap-4">
            <button className="relative flex size-9 items-center justify-center rounded-full bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors">
              <Bell className="size-5" />
              <span className="absolute right-2 top-2 size-2 rounded-full bg-danger ring-2 ring-background"></span>
            </button>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
