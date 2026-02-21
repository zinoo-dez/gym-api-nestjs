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
  QrCode,
  RefreshCcw,
  Search,
  Settings,
  ShieldAlert,
  ShoppingBag,
  ShoppingCart,
  Sun,
  Users,
  UserCog,
  Workflow,
  X,
} from "lucide-react";

import { useAuthStore } from "@/store/auth.store";
import { useGymSettingsStore } from "@/store/gym-settings.store";
import { ThemeToggle } from "@/components/layout/ThemeToggle";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { resolveMediaUrl } from "@/lib/media-url";
import { NotificationPopup } from "@/components/gym/NotificationPopup";
import { useNotifications } from "@/hooks/use-notifications";

interface NavItem {
  id: string;
  path: string;
  icon: React.ComponentType<{ className?: string }>;
}
interface NavGroup {
  id: string;
  label: string;
  items: NavItem[];
}

const adminNavGroups: NavGroup[] = [
  {
    id: "overview",
    label: "Overview",
    items: [
      { id: "Dashboard", path: "/admin", icon: LayoutDashboard },
      { id: "QR Scanner", path: "/admin/qr-scanner", icon: QrCode },
      { id: "Notifications", path: "/admin/notifications", icon: Bell },
    ],
  },
  {
    id: "people",
    label: "People",
    items: [
      { id: "Members", path: "/admin/members", icon: Users },
      { id: "Trainers", path: "/admin/trainers", icon: Dumbbell },
      { id: "Staff", path: "/admin/staff", icon: UserCog },
      { id: "Users", path: "/admin/users", icon: Users },
    ],
  },
  {
    id: "growth",
    label: "Growth",
    items: [
      { id: "Retention", path: "/admin/retention", icon: ShieldAlert },
      {
        id: "Retention Tasks",
        path: "/admin/retention/tasks",
        icon: ListChecks,
      },
      { id: "Marketing", path: "/admin/marketing", icon: Megaphone },
      { id: "Campaigns", path: "/admin/marketing/campaigns", icon: Megaphone },
      { id: "Templates", path: "/admin/marketing/templates", icon: FileText },
      {
        id: "Automations",
        path: "/admin/marketing/automations",
        icon: Workflow,
      },
      { id: "Analytics", path: "/admin/marketing/analytics", icon: BarChart3 },
    ],
  },
  {
    id: "commerce",
    label: "Commerce",
    items: [
      { id: "Payments", path: "/admin/payments", icon: DollarSign },
      { id: "Plans", path: "/admin/plans", icon: CreditCard },
      { id: "Pricing", path: "/admin/pricing", icon: CreditCard },
      { id: "Discounts", path: "/admin/discounts", icon: Percent },
      { id: "Recovery Queue", path: "/admin/recovery", icon: RefreshCcw },
      {
        id: "Sales Dashboard",
        path: "/admin/inventory-sales",
        icon: ShoppingBag,
      },
      { id: "Workout Plans", path: "/admin/workout-plans", icon: Dumbbell },
      { id: "Attendance", path: "/admin/attendance", icon: Activity },
      { id: "Classes", path: "/admin/classes", icon: CalendarClock },
      { id: "POS Interface", path: "/admin/pos-sales", icon: ShoppingCart },
      {
        id: "Inventory Mgmt",
        path: "/admin/inventory-management",
        icon: PackageSearch,
      },
    ],
  },
  {
    id: "system",
    label: "System",
    items: [
      { id: "Features", path: "/admin/features", icon: ListChecks },
      { id: "Settings", path: "/admin/settings", icon: Settings },
    ],
  },
];

const adminBottomNavItems: NavItem[] = [
  { id: "Dashboard", path: "/admin", icon: LayoutDashboard },
  { id: "Members", path: "/admin/members", icon: Users },
  { id: "Trainers", path: "/admin/trainers", icon: Dumbbell },
  { id: "Payments", path: "/admin/payments", icon: DollarSign },
  { id: "Settings", path: "/admin/settings", icon: Settings },
];

const memberNavGroups: NavGroup[] = [
  {
    id: "member-main",
    label: "Member",
    items: [
      { id: "Dashboard", path: "/member", icon: LayoutDashboard },
      { id: "Classes", path: "/member/classes", icon: CalendarClock },
      { id: "Progress", path: "/member/progress", icon: Activity },
      { id: "Body Composition", path: "/member/body-composition", icon: Activity },
      { id: "My QR Code", path: "/member/qr-code", icon: QrCode },
      { id: "Shop", path: "/member/shop", icon: ShoppingCart },
      {
        id: "Purchase History",
        path: "/member/purchase-history",
        icon: ShoppingBag,
      },
    ],
  },
];

const trainerNavGroups: NavGroup[] = [
  {
    id: "trainer-main",
    label: "Trainer",
    items: [
      { id: "Dashboard", path: "/trainer", icon: LayoutDashboard },
      { id: "Sessions", path: "/trainer/sessions", icon: CalendarClock },
    ],
  },
];

const staffNavGroups: NavGroup[] = [
  {
    id: "staff-main",
    label: "Staff",
    items: [
      { id: "Dashboard", path: "/staff", icon: LayoutDashboard },
      { id: "QR Scanner", path: "/staff/qr-scanner", icon: QrCode },
    ],
  },
  {
    id: "staff-operations",
    label: "Operations",
    items: [
      { id: "Attendance", path: "/staff/attendance", icon: Activity },
      { id: "Sales", path: "/staff/inventory-sales", icon: ShoppingBag },
      { id: "POS", path: "/staff/pos-sales", icon: ShoppingCart },
      {
        id: "Inventory",
        path: "/staff/inventory-management",
        icon: PackageSearch,
      },
    ],
  },
];

const cn = (...parts: Array<string | false | null | undefined>) =>
  parts.filter(Boolean).join(" ");

const getNavGroups = (role?: string) => {
  switch (role) {
    case "MEMBER":
      return memberNavGroups;
    case "TRAINER":
      return trainerNavGroups;
    case "STAFF":
      return staffNavGroups;
    default:
      return adminNavGroups;
  }
};

const getBottomNavItems = (role?: string) => {
  const flatten = (groups: NavGroup[]) =>
    groups.flatMap((group) => group.items);

  switch (role) {
    case "MEMBER":
      return flatten(memberNavGroups);
    case "TRAINER":
      return flatten(trainerNavGroups);
    case "STAFF":
      return flatten(staffNavGroups);
    default:
      return adminBottomNavItems;
  }
};

const isPathActive = (pathname: string, path: string) => {
  if (
    path === "/admin" ||
    path === "/member" ||
    path === "/trainer" ||
    path === "/staff"
  ) {
    return pathname === path;
  }
  return pathname === path || pathname.startsWith(`${path}/`);
};

const getBestMatchedPath = (
  pathname: string,
  items: NavItem[],
): string | null => {
  const matched = items
    .filter((item) => isPathActive(pathname, item.path))
    .sort((a, b) => b.path.length - a.path.length);
  return matched[0]?.path ?? null;
};

export const AdminLayout = ({ children }: { children: ReactNode }) => {
  const { isAuthenticated, user, clearAuth } = useAuthStore();
  const { settings, fetchSettings } = useGymSettingsStore();
  const {
    notifications,
    markAsRead,
    markAllAsRead,
    clearNotification,
    clearAll,
  } = useNotifications();
  const navigate = useNavigate();
  const location = useLocation();

  const navGroups = useMemo(() => getNavGroups(user?.role), [user?.role]);
  const bottomNavItems = useMemo(
    () => getBottomNavItems(user?.role),
    [user?.role],
  );
  const navItems = useMemo(
    () => navGroups.flatMap((group) => group.items),
    [navGroups],
  );
  const activeNavPath = useMemo(
    () => getBestMatchedPath(location.pathname, navItems),
    [location.pathname, navItems],
  );
  const activeBottomNavPath = useMemo(
    () => getBestMatchedPath(location.pathname, bottomNavItems),
    [location.pathname, bottomNavItems],
  );
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
  const userAvatarSrc = resolveMediaUrl(user?.avatarUrl);

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-300">
      <div
        className={cn(
          "fixed inset-0 z-40 bg-slate-900/35 transition md:hidden",
          mobileDrawerOpen ? "opacity-100" : "pointer-events-none opacity-0",
        )}
        onClick={() => setMobileDrawerOpen(false)}
      />

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-72 border-r border-border bg-card p-4 shadow-xl transition-transform duration-300 md:hidden",
          mobileDrawerOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="mb-6 flex items-center justify-between">
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-foreground">
              {settings?.name || "Gym Management"}
            </p>
            <p className="text-xs text-muted-foreground">Material 3</p>
          </div>
          <button
            type="button"
            onClick={() => setMobileDrawerOpen(false)}
            className="rounded-lg p-2 text-foreground hover:bg-muted/80"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <nav className="max-h-[calc(100vh-13.5rem)] space-y-4 overflow-y-auto pr-1">
          {navGroups.map((group) => (
            <div key={`mobile-group-${group.id}`} className="space-y-1">
              {navGroups.length > 1 && (
                <p className="px-4 pb-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                  {group.label}
                </p>
              )}
              {group.items.map((item) => {
                const Icon = item.icon;
                const active = activeNavPath === item.path;

                return (
                  <button
                    key={`mobile-${item.path}`}
                    type="button"
                    onClick={() => navigate(item.path)}
                    className={cn(
                      "flex w-full items-center gap-3 rounded-full px-4 py-2.5 text-sm font-medium transition",
                      active
                        ? "bg-blue-100 text-blue-700"
                        : "text-foreground hover:bg-muted/80 hover:text-foreground",
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    {item.id}
                  </button>
                );
              })}
            </div>
          ))}
        </nav>

        <div className="mt-6 rounded-2xl border border-border bg-muted/50 p-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Today
          </p>
          <p className="mt-1 text-sm font-medium text-foreground">
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
            "sticky top-0 hidden h-screen flex-col border-r border-border bg-card transition-all duration-300 md:flex",
            collapsedRail ? "w-20" : "w-72",
          )}
        >
          <div className="flex h-16 items-center justify-between border-b border-border px-4">
            {!collapsedRail && (
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-foreground">
                  {settings?.name || "Gym Management"}
                </p>
                <p className="text-xs text-muted-foreground">Material 3</p>
              </div>
            )}
            <button
              type="button"
              onClick={() => setCollapsedRail((value) => !value)}
              className="rounded-lg p-1.5 text-muted-foreground transition hover:bg-muted/80 hover:text-foreground"
              aria-label={
                collapsedRail
                  ? "Expand navigation rail"
                  : "Collapse navigation rail"
              }
            >
              <Menu className="h-4 w-4" />
            </button>
          </div>

          <nav className="flex-1 overflow-y-auto px-3 py-4">
            <div className={cn("space-y-4", collapsedRail && "space-y-2")}>
              {navGroups.map((group) => (
                <div key={`group-${group.id}`} className="space-y-1">
                  {!collapsedRail && navGroups.length > 1 && (
                    <p className="px-4 pb-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                      {group.label}
                    </p>
                  )}
                  {group.items.map((item) => {
                    const Icon = item.icon;
                    const active = activeNavPath === item.path;

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
                            : "text-foreground hover:bg-muted/80 hover:text-foreground",
                        )}
                        title={collapsedRail ? item.id : undefined}
                      >
                        <Icon className="h-4 w-4" />
                        {!collapsedRail && <span>{item.id}</span>}
                      </button>
                    );
                  })}
                </div>
              ))}
            </div>
          </nav>

          {!collapsedRail && (
            <div className="border-t border-border p-4">
              <div className="rounded-2xl border border-border bg-muted/50 p-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Today
                </p>
                <p className="mt-1 text-sm font-medium text-foreground">
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
          <header className="sticky top-0 z-30 border-b border-border bg-background/95 backdrop-blur">
            <div className="flex h-16 items-center gap-3 px-4 md:px-8">
              <button
                type="button"
                onClick={() => setMobileDrawerOpen(true)}
                className="rounded-lg p-2 text-foreground hover:bg-muted/80 md:hidden"
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
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Search members, classes, invoices..."
                    className="h-10 w-full rounded-full border border-border bg-muted/50 pl-9 pr-4 text-sm text-foreground outline-none transition focus:border-blue-300 focus:bg-background"
                    onFocus={() => setSearchFocused(true)}
                    onBlur={() => setSearchFocused(false)}
                  />
                </label>
              </div>

              <NotificationPopup
                notifications={notifications}
                onMarkAsRead={markAsRead}
                onMarkAllAsRead={markAllAsRead}
                onClear={clearNotification}
                onClearAll={clearAll}
              />

              <ThemeToggle />

              <button
                type="button"
                className="h-9 w-9 overflow-hidden rounded-full border border-border bg-gradient-to-br from-blue-500 to-cyan-400 text-sm font-semibold text-white"
                aria-label="Open profile"
              >
                <Avatar className="h-full w-full">
                  <AvatarImage
                    src={userAvatarSrc || undefined}
                    alt={user?.email || "Profile"}
                    className="object-cover"
                  />
                  <AvatarFallback className="bg-gradient-to-br from-blue-500 to-cyan-400 text-sm font-semibold text-white">
                    {initials}
                  </AvatarFallback>
                </Avatar>
              </button>

              <button
                type="button"
                onClick={clearAuth}
                className="rounded-full p-2 text-muted-foreground transition hover:bg-muted hover:text-foreground"
                aria-label="Log out"
              >
                <LogOut className="h-5 w-5" />
              </button>
            </div>
          </header>

          <main className="flex-1 overflow-auto px-4 pb-24 pt-6 md:px-8 md:pb-8">
            {children}
          </main>
        </div>
      </div>

      <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-card md:hidden">
        <div
          className={cn(
            "grid",
            bottomNavItems.length <= 3
              ? "grid-cols-3"
              : bottomNavItems.length === 4
                ? "grid-cols-4"
                : "grid-cols-5",
          )}
        >
          {bottomNavItems.slice(0, 5).map((item) => {
            const Icon = item.icon;
            const active = activeBottomNavPath === item.path;

            return (
              <button
                key={`bottom-${item.path}`}
                type="button"
                onClick={() => navigate(item.path)}
                className={cn(
                  "flex flex-col items-center gap-1 px-2 py-2 text-[11px] font-medium transition",
                  active ? "text-blue-700" : "text-muted-foreground",
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
