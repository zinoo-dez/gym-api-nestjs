import { ReactNode, useEffect, useMemo, useState } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import {
  Activity,
  BarChart3,
  Bell,
  CalendarClock,
  CreditCard,
  DollarSign,
  Dumbbell,
  FileText,
  LayoutDashboard,
  ListChecks,
  LogOut,
  Megaphone,
  Menu,
  PackageSearch,
  Percent,
  RefreshCcw,
  Search,
  Settings,
  ShieldAlert,
  ShoppingBag,
  ShoppingCart,
  Users,
  UserCog,
  Workflow,
  X,
} from "lucide-react";

import { useAuthStore } from "@/store/auth.store";
import { useGymSettingsStore } from "@/store/gym-settings.store";

interface NavItem {
  id: string;
  path: string;
  icon: React.ComponentType<{ className?: string }>;
}

const adminNavItems: NavItem[] = [
  { id: "Dashboard", path: "/admin", icon: LayoutDashboard },
  { id: "Members", path: "/admin/members", icon: Users },
  { id: "Trainers", path: "/admin/trainers", icon: Dumbbell },
  { id: "Payments", path: "/admin/payments", icon: DollarSign },
  { id: "Settings", path: "/admin/settings", icon: Settings },
  { id: "Staff", path: "/admin/staff", icon: UserCog },
  { id: "Retention", path: "/admin/retention", icon: ShieldAlert },
  { id: "Retention Tasks", path: "/admin/retention/tasks", icon: ListChecks },
  { id: "Plans", path: "/admin/plans", icon: CreditCard },
  { id: "Discounts", path: "/admin/discounts", icon: Percent },
  { id: "Recovery Queue", path: "/admin/recovery", icon: RefreshCcw },
  { id: "Sales Dashboard", path: "/admin/inventory-sales", icon: ShoppingBag },
  { id: "POS Interface", path: "/admin/pos-sales", icon: ShoppingCart },
  { id: "Inventory Mgmt", path: "/admin/inventory-management", icon: PackageSearch },
  { id: "Notifications", path: "/admin/notifications", icon: Bell },
  { id: "Marketing", path: "/admin/marketing", icon: Megaphone },
  { id: "Campaigns", path: "/admin/marketing/campaigns", icon: Megaphone },
  { id: "Templates", path: "/admin/marketing/templates", icon: FileText },
  { id: "Automations", path: "/admin/marketing/automations", icon: Workflow },
  { id: "Analytics", path: "/admin/marketing/analytics", icon: BarChart3 },
];

const adminBottomNavItems: NavItem[] = [
  { id: "Dashboard", path: "/admin", icon: LayoutDashboard },
  { id: "Members", path: "/admin/members", icon: Users },
  { id: "Trainers", path: "/admin/trainers", icon: Dumbbell },
  { id: "Payments", path: "/admin/payments", icon: DollarSign },
  { id: "Settings", path: "/admin/settings", icon: Settings },
];

const memberNavItems: NavItem[] = [
  { id: "Dashboard", path: "/member", icon: LayoutDashboard },
  { id: "Progress", path: "/member/progress", icon: Activity },
];

const trainerNavItems: NavItem[] = [
  { id: "Dashboard", path: "/trainer", icon: LayoutDashboard },
  { id: "Sessions", path: "/trainer/sessions", icon: CalendarClock },
];

const staffNavItems: NavItem[] = [
  { id: "Dashboard", path: "/staff", icon: LayoutDashboard },
  { id: "Sales", path: "/staff/inventory-sales", icon: ShoppingBag },
  { id: "POS", path: "/staff/pos-sales", icon: ShoppingCart },
  { id: "Inventory", path: "/staff/inventory-management", icon: PackageSearch },
];

const cn = (...parts: Array<string | false | null | undefined>) => parts.filter(Boolean).join(" ");

const getNavItems = (role?: string) => {
  switch (role) {
    case "MEMBER":
      return memberNavItems;
    case "TRAINER":
      return trainerNavItems;
    case "STAFF":
      return staffNavItems;
    default:
      return adminNavItems;
  }
};

const getBottomNavItems = (role?: string) => {
  switch (role) {
    case "MEMBER":
      return memberNavItems;
    case "TRAINER":
      return trainerNavItems;
    case "STAFF":
      return staffNavItems;
    default:
      return adminBottomNavItems;
  }
};

const isPathActive = (pathname: string, path: string) => {
  if (path === "/admin" || path === "/member" || path === "/trainer" || path === "/staff") {
    return pathname === path;
  }
  return pathname === path || pathname.startsWith(`${path}/`);
};

export const AdminLayout = ({ children }: { children: ReactNode }) => {
  const { isAuthenticated, user, clearAuth } = useAuthStore();
  const { settings, fetchSettings } = useGymSettingsStore();
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = useMemo(() => getNavItems(user?.role), [user?.role]);
  const bottomNavItems = useMemo(() => getBottomNavItems(user?.role), [user?.role]);
  const [collapsedRail, setCollapsedRail] = useState(false);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  useEffect(() => {
    setMobileDrawerOpen(false);
  }, [location.pathname]);

  if (!isAuthenticated) return <Navigate to="/auth/login" replace />;

  const initials = (user?.email?.slice(0, 2) || "GU").toUpperCase();

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <div
        className={cn(
          "fixed inset-0 z-40 bg-slate-900/35 transition md:hidden",
          mobileDrawerOpen ? "opacity-100" : "pointer-events-none opacity-0",
        )}
        onClick={() => setMobileDrawerOpen(false)}
      />

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-72 border-r border-gray-200 bg-white p-4 shadow-xl transition-transform duration-300 md:hidden",
          mobileDrawerOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="mb-6 flex items-center justify-between">
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-gray-900">{settings?.name || "Gym Management"}</p>
            <p className="text-xs text-gray-500">Material 3</p>
          </div>
          <button
            type="button"
            onClick={() => setMobileDrawerOpen(false)}
            className="rounded-lg p-2 text-gray-600 hover:bg-gray-100"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <nav className="max-h-[calc(100vh-13.5rem)] space-y-1 overflow-y-auto pr-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isPathActive(location.pathname, item.path);

            return (
              <button
                key={`mobile-${item.path}`}
                type="button"
                onClick={() => navigate(item.path)}
                className={cn(
                  "flex w-full items-center gap-3 rounded-full px-4 py-2.5 text-sm font-medium transition",
                  active
                    ? "bg-blue-100 text-blue-700"
                    : "text-gray-600 hover:bg-gray-100 hover:text-gray-900",
                )}
              >
                <Icon className="h-4 w-4" />
                {item.id}
              </button>
            );
          })}
        </nav>

        <div className="mt-6 rounded-2xl border border-gray-200 bg-gray-50 p-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Today</p>
          <p className="mt-1 text-sm font-medium text-gray-700">
            {new Intl.DateTimeFormat("en-US", {
              weekday: "long",
              month: "short",
              day: "numeric",
            }).format(new Date())}
          </p>
        </div>
      </aside>

      <div className="flex min-h-screen">
        <aside
          className={cn(
            "sticky top-0 hidden h-screen flex-col border-r border-gray-200 bg-white transition-all duration-300 md:flex",
            collapsedRail ? "w-20" : "w-72",
          )}
        >
          <div className="flex h-16 items-center justify-between border-b border-gray-200 px-4">
            {!collapsedRail && (
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-gray-900">{settings?.name || "Gym Management"}</p>
                <p className="text-xs text-gray-500">Material 3</p>
              </div>
            )}
            <button
              type="button"
              onClick={() => setCollapsedRail((value) => !value)}
              className="rounded-lg p-1.5 text-gray-500 transition hover:bg-gray-100 hover:text-gray-800"
              aria-label={collapsedRail ? "Expand navigation rail" : "Collapse navigation rail"}
            >
              <Menu className="h-4 w-4" />
            </button>
          </div>

          <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = isPathActive(location.pathname, item.path);

              return (
                <button
                  key={item.path}
                  type="button"
                  onClick={() => navigate(item.path)}
                  className={cn(
                    "group flex w-full items-center rounded-full py-2.5 text-sm font-medium transition",
                    collapsedRail ? "justify-center px-0" : "gap-3 px-4",
                    active
                      ? "bg-blue-100 text-blue-700"
                      : "text-gray-600 hover:bg-gray-100 hover:text-gray-900",
                  )}
                  title={collapsedRail ? item.id : undefined}
                >
                  <Icon className="h-4 w-4" />
                  {!collapsedRail && <span>{item.id}</span>}
                </button>
              );
            })}
          </nav>

          {!collapsedRail && (
            <div className="border-t border-gray-200 p-4">
              <div className="rounded-2xl border border-gray-200 bg-gray-50 p-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Today</p>
                <p className="mt-1 text-sm font-medium text-gray-700">
                  {new Intl.DateTimeFormat("en-US", {
                    weekday: "long",
                    month: "short",
                    day: "numeric",
                  }).format(new Date())}
                </p>
              </div>
            </div>
          )}
        </aside>

        <div className="flex min-h-screen min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-30 border-b border-gray-200 bg-white/95 backdrop-blur">
            <div className="flex h-16 items-center gap-3 px-4 md:px-8">
              <button
                type="button"
                onClick={() => setMobileDrawerOpen(true)}
                className="rounded-lg p-2 text-gray-600 hover:bg-gray-100 md:hidden"
              >
                <Menu className="h-5 w-5" />
              </button>

              <div className="flex flex-1 justify-center">
                <label
                  className={cn(
                    "relative w-full transition-all duration-300",
                    searchFocused ? "max-w-3xl" : "max-w-xl",
                  )}
                >
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search members, classes, invoices..."
                    className="h-10 w-full rounded-full border border-gray-200 bg-gray-50 pl-9 pr-4 text-sm text-gray-700 outline-none transition focus:border-blue-300 focus:bg-white"
                    onFocus={() => setSearchFocused(true)}
                    onBlur={() => setSearchFocused(false)}
                  />
                </label>
              </div>

              <button
                type="button"
                className="rounded-full p-2 text-gray-600 transition hover:bg-gray-100 hover:text-gray-900"
                aria-label="Notifications"
              >
                <Bell className="h-5 w-5" />
              </button>

              <button
                type="button"
                className="h-9 w-9 overflow-hidden rounded-full border border-gray-200 bg-gradient-to-br from-blue-500 to-cyan-400 text-sm font-semibold text-white"
                aria-label="Open profile"
              >
                {initials}
              </button>

              <button
                type="button"
                onClick={clearAuth}
                className="rounded-full p-2 text-gray-600 transition hover:bg-gray-100 hover:text-gray-900"
                aria-label="Log out"
              >
                <LogOut className="h-5 w-5" />
              </button>
            </div>
          </header>

          <main className="flex-1 overflow-auto px-4 pb-24 pt-6 md:px-8 md:pb-8">{children}</main>
        </div>
      </div>

      <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-gray-200 bg-white md:hidden">
        <div className={cn("grid", bottomNavItems.length <= 3 ? "grid-cols-3" : bottomNavItems.length === 4 ? "grid-cols-4" : "grid-cols-5")}>
          {bottomNavItems.slice(0, 5).map((item) => {
            const Icon = item.icon;
            const active = isPathActive(location.pathname, item.path);

            return (
              <button
                key={`bottom-${item.path}`}
                type="button"
                onClick={() => navigate(item.path)}
                className={cn(
                  "flex flex-col items-center gap-1 px-2 py-2 text-[11px] font-medium transition",
                  active ? "text-blue-700" : "text-gray-500",
                )}
              >
                <Icon className={cn("h-4 w-4", active && "text-blue-700")} />
                {item.id}
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
};
