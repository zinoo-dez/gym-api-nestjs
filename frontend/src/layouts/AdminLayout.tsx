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
} from "lucide-react";

import { useAuthStore } from "@/store/auth.store";
import { NotificationBell } from "@/components/features/notifications";

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
      { icon: Settings, label: "Settings", path: "/settings" },
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

  useEffect(() => {
    if (isMobile) {
      setSidebarOpen(false);
    }
  }, [location.pathname, isMobile]);

  const activeLabel =
    allMenuItems.find((item) => isPathActive(location.pathname, item.path))?.label || "Overview";

  return (
    <div className="flex h-screen overflow-hidden bg-background text-foreground">
      <AnimatePresence>
        {isMobile && sidebarOpen ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSidebarOpen(false)}
            className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm"
          />
        ) : null}
      </AnimatePresence>

      <motion.aside
        initial={{ x: isMobile ? "-100%" : 0 }}
        animate={{ x: sidebarOpen ? 0 : isMobile ? "-100%" : 0 }}
        transition={{ type: "spring", damping: 25, stiffness: 200 }}
        className="fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r bg-card shadow-sm md:static md:translate-x-0"
      >
        <div className="flex h-16 shrink-0 items-center justify-between border-b px-6">
          <span className="text-xl font-bold tracking-tight text-primary">GymAdmin</span>
          {isMobile ? (
            <button
              type="button"
              onClick={() => setSidebarOpen(false)}
              className="text-muted-foreground hover:text-foreground"
            >
              <X className="size-5" />
            </button>
          ) : null}
        </div>

        <nav className="flex-1 space-y-4 overflow-y-auto p-4">
          {menuSections.map((section) => (
            <div key={section.title} className="space-y-1">
              <p className="px-3 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                {section.title}
              </p>
              {section.items.map((item) => {
                const isActive = isPathActive(location.pathname, item.path);
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
            </div>
          ))}
        </nav>

        <div className="border-t p-4">
          <div className="mb-4 flex items-center gap-3 px-3">
            <div className="flex size-9 items-center justify-center rounded-full bg-primary/20 text-primary">
              <span className="font-semibold uppercase">{user?.firstName?.[0] || "A"}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-semibold">
                {user?.firstName || "Admin"} {user?.lastName || ""}
              </span>
              <span className="text-xs text-muted-foreground">{user?.email || "admin@gym.com"}</span>
            </div>
          </div>
          <button
            type="button"
            onClick={() => logout()}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-danger transition-colors hover:bg-danger/10"
          >
            <LogOut className="size-5" />
            Logout
          </button>
        </div>
      </motion.aside>

      <div className="flex flex-1 flex-col overflow-hidden">
        <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center justify-between border-b bg-background/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/60 md:px-6">
          <div className="flex items-center gap-4">
            {isMobile ? (
              <button
                type="button"
                onClick={() => setSidebarOpen(true)}
                className="text-muted-foreground hover:text-foreground"
              >
                <Menu className="size-6" />
              </button>
            ) : null}
            <h1 className="hidden text-xl font-semibold tracking-tight text-foreground sm:block md:text-2xl">
              {activeLabel}
            </h1>
          </div>

          <div className="flex items-center gap-4">
            <NotificationBell />
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
