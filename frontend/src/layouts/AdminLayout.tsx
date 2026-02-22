import { useState, useEffect, type ComponentType } from "react";
import { Outlet, Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Building2,
  Bell,
  BarChart3,
  BadgeCheck,
  CalendarClock,
  CreditCard,
  Dumbbell,
  LayoutDashboard,
  LineChart,
  List,
  LogOut,
  Menu,
  Package,
  ReceiptText,
  Repeat2,
  Settings,
  Shield,
  ShoppingCart,
  Sparkles,
  UserCheck,
  UserCog,
  Users,
  Wallet,
  X,
  ChevronLeft,
  ChevronRight,
  Globe,
  Clock,
  Receipt,
  Key,
  Sliders,
  Lock,
} from "lucide-react";

import { useAuthStore } from "@/store/auth.store";
import { NotificationBell } from "@/components/features/notifications";
import { cn } from "@/lib/utils";

interface MenuItem {
  icon: ComponentType<{ className?: string }>;
  label: string;
  path: string;
}

interface MenuSection {
  title: string;
  items: MenuItem[];
}

const menuSections: MenuSection[] = [
  {
    title: "Overview",
    items: [{ icon: LayoutDashboard, label: "Dashboard", path: "/" }],
  },
  {
    title: "Management",
    items: [
      { icon: Users, label: "Members", path: "/management/members" },
      { icon: UserCog, label: "Trainers", path: "/management/trainers" },
      { icon: Shield, label: "Staff", path: "/management/staff" },
      { icon: CreditCard, label: "Payments", path: "/payments" },
    ],
  },
  {
    title: "Classes",
    items: [
      { icon: CalendarClock, label: "Schedule", path: "/management/classes/schedule" },
      { icon: UserCheck, label: "Attendance", path: "/management/classes/attendance" },
    ],
  },
  {
    title: "Equipment",
    items: [
      { icon: Dumbbell, label: "Equipment Overview", path: "/management/equipment/overview" },
      { icon: List, label: "Equipment List", path: "/management/equipment/list" },
    ],
  },
  {
    title: "Inventory & Sales",
    items: [
      { icon: ShoppingCart, label: "Overview", path: "/management/products/overview" },
      { icon: Package, label: "Products", path: "/management/products/management" },
      { icon: CreditCard, label: "POS", path: "/management/products/pos" },
      { icon: ReceiptText, label: "Sales History", path: "/management/products/history" },
    ],
  },
  {
    title: "Memberships",
    items: [
      { icon: BadgeCheck, label: "Plans", path: "/management/memberships/plans" },
      { icon: Users, label: "Member List", path: "/management/memberships/members" },
      { icon: Sparkles, label: "Features", path: "/management/memberships/features" },
    ],
  },
  {
    title: "Finance",
    items: [
      { icon: Wallet, label: "Finance Overview", path: "/finance/costs/overview" },
      { icon: LineChart, label: "Cost Analysis", path: "/finance/costs/analysis" },
      { icon: ReceiptText, label: "Expense Records", path: "/finance/costs/records" },
      { icon: Repeat2, label: "Recurring Tracker", path: "/finance/costs/recurring" },
      { icon: Building2, label: "Vendor Spend", path: "/finance/costs/vendors" },
    ],
  },
  {
    title: "Insights",
    items: [{ icon: BarChart3, label: "Reports", path: "/reports" }],
  },
  {
    title: "System",
    items: [
      { icon: Bell, label: "Notifications", path: "/admin/notifications" },
    ],
  },
  {
    title: "Settings",
    items: [
      { icon: Building2, label: "Gym Identity", path: "/settings/gym-identity" },
      { icon: Globe, label: "Social Media", path: "/settings/social-media" },
      { icon: Clock, label: "Operating Hours", path: "/settings/operating-hours" },
      { icon: Receipt, label: "Billing Defaults", path: "/settings/billing-defaults" },
      { icon: Key, label: "Payment Gateway", path: "/settings/payment-gateway-keys" },
      { icon: Sliders, label: "Preferences", path: "/settings/system-preferences" },
      { icon: Lock, label: "Change Password", path: "/settings/change-password" },
    ],
  },
];

const allMenuItems = menuSections.flatMap((section) => section.items);

const isPathActive = (currentPath: string, itemPath: string): boolean => {
  if (itemPath === "/") {
    return currentPath === "/";
  }
  return currentPath === itemPath || currentPath.startsWith(`${itemPath}/`);
};

export function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [desktopCollapsed, setDesktopCollapsed] = useState(false);
  const location = useLocation();
  const { user, logout } = useAuthStore();
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth >= 768) {
        setSidebarOpen(false); // Mobile sidebar should be closed on desktop
      }
    };

    checkScreenSize();
    window.addEventListener("resize", checkScreenSize);
    return () => window.removeEventListener("resize", checkScreenSize);
  }, []);

  useEffect(() => {
    if (isMobile) {
      setSidebarOpen(false);
    }
  }, [location.pathname, isMobile]);

  const activeLabel =
    allMenuItems.find((item) => isPathActive(location.pathname, item.path))?.label || "Overview";

  const mobileNavItems = [
    { icon: LayoutDashboard, label: "Home", path: "/" },
    { icon: Users, label: "Members", path: "/management/members" },
    { icon: CalendarClock, label: "Classes", path: "/management/classes/schedule" },
    { icon: ShoppingCart, label: "Shop", path: "/management/products/overview" },
  ];

  return (
    <div className="flex h-screen overflow-hidden bg-background text-foreground">
      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {isMobile && sidebarOpen ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSidebarOpen(false)}
            className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm md:hidden"
          />
        ) : null}
      </AnimatePresence>

      {/* Sidebar (Desktop and Mobile) */}
      <motion.aside
        initial={false}
        animate={{ 
          x: isMobile ? (sidebarOpen ? 0 : "-100%") : 0,
          width: isMobile ? 256 : (desktopCollapsed ? 64 : 250)
        }}
        transition={{ type: "spring", damping: 25, stiffness: 200 }}
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex flex-col border-r bg-card shadow-sm",
          "md:static md:translate-x-0 overflow-hidden"
        )}
      >
        <div className={cn("flex h-16 shrink-0 items-center border-b", desktopCollapsed && !isMobile ? "justify-center px-0" : "justify-between px-6")}>
          {!desktopCollapsed || isMobile ? (
            <span className="text-xl font-bold tracking-tight text-primary truncate">GymAdmin</span>
          ) : (
            <span className="text-xl font-bold tracking-tight text-primary">G</span>
          )}
          {isMobile && (
            <button
              type="button"
              onClick={() => setSidebarOpen(false)}
              className="text-muted-foreground hover:text-foreground shrink-0 ml-2"
            >
              <X className="size-5" />
            </button>
          )}
        </div>

        <nav className="flex-1 space-y-4 overflow-y-auto overflow-x-hidden p-4 no-scrollbar">
          {menuSections.map((section) => (
            <div key={section.title} className="space-y-1">
              {!desktopCollapsed || isMobile ? (
                <p className="px-3 text-xs font-medium uppercase tracking-wide text-muted-foreground truncate">
                  {section.title}
                </p>
              ) : (
                <div className="h-4" /> // spacing maintaining consistency when collapsed
              )}
              {section.items.map((item) => {
                const isActive = isPathActive(location.pathname, item.path);
                const Icon = item.icon;

                return (
                  <Link key={item.path} to={item.path} title={desktopCollapsed && !isMobile ? item.label : undefined}>
                    <motion.div
                      whileHover={{ x: desktopCollapsed && !isMobile ? 0 : 4 }}
                      whileTap={{ scale: 0.98 }}
                      className={cn(
                        "flex items-center gap-3 rounded-lg py-2.5 transition-colors text-sm font-medium",
                        desktopCollapsed && !isMobile ? "justify-center px-0" : "px-3",
                        isActive
                          ? "bg-primary text-primary-foreground"
                          : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                      )}
                    >
                      <Icon className={cn("size-5 shrink-0", isActive && "text-primary-foreground")} />
                      {(!desktopCollapsed || isMobile) && (
                        <span className="truncate">{item.label}</span>
                      )}
                    </motion.div>
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>

        <div className="border-t p-4">
          <div className={cn("mb-4 flex items-center gap-3", desktopCollapsed && !isMobile ? "justify-center px-0" : "px-3")}>
            <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary/20 text-primary">
              <span className="font-semibold uppercase">{user?.firstName?.[0] || "A"}</span>
            </div>
            {(!desktopCollapsed || isMobile) && (
              <div className="flex flex-col truncate">
                <span className="text-sm font-semibold truncate">
                  {user?.firstName || "Admin"} {user?.lastName || ""}
                </span>
                <span className="text-xs text-muted-foreground truncate">{user?.email || "admin@gym.com"}</span>
              </div>
            )}
          </div>
          <button
            type="button"
            onClick={() => logout()}
            className={cn(
              "flex w-full items-center gap-3 rounded-lg py-2 text-sm font-medium text-danger transition-colors hover:bg-danger/10",
              desktopCollapsed && !isMobile ? "justify-center px-0" : "px-3"
            )}
            title={desktopCollapsed && !isMobile ? "Logout" : undefined}
          >
            <LogOut className="size-5 shrink-0" />
            {(!desktopCollapsed || isMobile) && <span>Logout</span>}
          </button>
        </div>
      </motion.aside>

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col overflow-hidden relative">
        <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center justify-between border-b bg-background/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/60 md:px-6">
          <div className="flex items-center gap-4">
            {/* Desktop Collapse Toggle */}
            <button
              className="hidden md:flex items-center justify-center text-muted-foreground hover:text-foreground"
              onClick={() => setDesktopCollapsed(!desktopCollapsed)}
            >
              <Menu className="size-6" />
            </button>
            
            <h1 className="text-xl font-semibold tracking-tight text-foreground md:text-2xl">
              {activeLabel}
            </h1>
          </div>

          <div className="flex items-center gap-4">
            <NotificationBell />
          </div>
        </header>

        {/* Content Box */}
        <main className={cn(
          "flex-1 overflow-y-auto p-4 md:p-6 lg:p-8",
          isMobile ? "pb-24" : "" // extra padding for mobile bottom nav
        )}>
          <Outlet />
        </main>

        {/* Mobile Bottom Navigation */}
        {isMobile && (
          <nav className="fixed bottom-0 left-0 right-0 z-40 flex h-16 items-center justify-around border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 md:hidden">
            {mobileNavItems.map((item) => {
              const isActive = isPathActive(location.pathname, item.path);
              const Icon = item.icon;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={cn(
                    "flex flex-1 flex-col items-center justify-center gap-1 h-full",
                    isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  <Icon className={cn("size-5", isActive && "fill-primary/20")} />
                  <span className="text-[10px] font-medium">{item.label}</span>
                </Link>
              );
            })}
            
            <button
              onClick={() => setSidebarOpen(true)}
              className="flex flex-1 flex-col items-center justify-center gap-1 h-full text-muted-foreground hover:text-foreground"
            >
              <Menu className="size-5" />
              <span className="text-[10px] font-medium">More</span>
            </button>
          </nav>
        )}
      </div>
    </div>
  );
}
