import { useState, useMemo } from "react";
import { Outlet, Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

import { useAuthStore } from "@/store/auth.store";
import { NotificationBell } from "@/components/features/notifications";
import { ThemeToggle } from "@/components/features/settings";
import { cn } from "@/lib/utils";
import { MaterialIcon } from "@/components/ui/MaterialIcon";
import {
    type AppRole,
    hasAnyRole,
    ROLE,
    PAYMENT_ROUTE_ROLES,
    INVENTORY_ROUTE_ROLES,
    CLASS_SCHEDULE_ROUTE_ROLES,
    CLASS_ATTENDANCE_ROUTE_ROLES,
    CLASS_MANAGEMENT_ROUTE_ROLES,
} from "@/lib/roles";
import { useBreakpoint } from "@/hooks/use-breakpoint";

interface MenuItem {
    icon: string;
    label: string;
    path: string;
}

interface MenuSection {
    title: string;
    items: MenuItem[];
}

const ADMIN_ROLES = [ROLE.ADMIN, ROLE.OWNER] as const;
const OPERATIONS_ROLES = [ROLE.ADMIN, ROLE.OWNER, ROLE.STAFF, ROLE.TRAINER] as const;

const resolveAllowedRolesForPath = (path: string): readonly AppRole[] => {
    if (path === "/app" || path === "/app/") {
        return OPERATIONS_ROLES;
    }

    if (path === "/app/payments") {
        return PAYMENT_ROUTE_ROLES;
    }

    if (path.startsWith("/app/management/products")) {
        return INVENTORY_ROUTE_ROLES;
    }

    if (path === "/app/management/classes/schedule") {
        return CLASS_SCHEDULE_ROUTE_ROLES;
    }

    if (path === "/app/management/classes/attendance") {
        return CLASS_ATTENDANCE_ROUTE_ROLES;
    }

    if (path.startsWith("/app/management/classes")) {
        return CLASS_MANAGEMENT_ROUTE_ROLES;
    }

    return ADMIN_ROLES;
};

const canAccessPath = (role: string | null | undefined, path: string): boolean =>
    hasAnyRole(role, resolveAllowedRolesForPath(path));

const menuSections: MenuSection[] = [
    {
        title: "Overview",
        items: [{ icon: "dashboard", label: "Dashboard", path: "/app" }],
    },
    {
        title: "Management",
        items: [
            { icon: "group", label: "Members", path: "/app/management/members" },
            { icon: "support_agent", label: "Trainers", path: "/app/management/trainers" },
            { icon: "badge", label: "Staff", path: "/app/management/staff" },
            { icon: "credit_card", label: "Payments", path: "/app/payments" },
        ],
    },
    {
        title: "Classes",
        items: [
            { icon: "calendar_month", label: "Schedule", path: "/app/management/classes/schedule" },
            { icon: "how_to_reg", label: "Attendance", path: "/app/management/classes/attendance" },
        ],
    },
    {
        title: "Equipment",
        items: [
            { icon: "fitness_center", label: "Overview", path: "/app/management/equipment/overview" },
            { icon: "receipt_long", label: "Equipment List", path: "/app/management/equipment/list" },
        ],
    },
    {
        title: "Inventory",
        items: [
            { icon: "shopping_cart", label: "Overview", path: "/app/management/products/overview" },
            { icon: "package_2", label: "Products", path: "/app/management/products/management" },
            { icon: "point_of_sale", label: "POS", path: "/app/management/products/pos" },
            { icon: "history", label: "Sales History", path: "/app/management/products/history" },
        ],
    },
    {
        title: "Memberships",
        items: [
            { icon: "verified", label: "Plans", path: "/app/management/memberships/plans" },
            { icon: "groups", label: "Member List", path: "/app/management/memberships/members" },
            { icon: "auto_awesome", label: "Features", path: "/app/management/memberships/features" },
        ],
    },
    {
        title: "Finance",
        items: [
            { icon: "account_balance_wallet", label: "Overview", path: "/app/finance/costs/overview" },
            { icon: "monitoring", label: "Analysis", path: "/app/finance/costs/analysis" },
            { icon: "receipt", label: "Records", path: "/app/finance/costs/records" },
            { icon: "event_repeat", label: "Recurring", path: "/app/finance/costs/recurring" },
            { icon: "store", label: "Vendors", path: "/app/finance/costs/vendors" },
        ],
    },
    {
        title: "Settings",
        items: [
            { icon: "settings_account_box", label: "Gym Identity", path: "/app/settings/gym-identity" },
            { icon: "public", label: "Social Media", path: "/app/settings/social-media" },
            { icon: "schedule", label: "Hours", path: "/app/settings/operating-hours" },
            { icon: "payments", label: "Billing", path: "/app/settings/billing-defaults" },
            { icon: "vpn_key", label: "Gateway", path: "/app/settings/payment-gateway-keys" },
            { icon: "tune", label: "Preferences", path: "/app/settings/system-preferences" },
            { icon: "lock", label: "Security", path: "/app/settings/change-password" },
        ],
    },
];

const isPathActive = (currentPath: string, itemPath: string): boolean => {
    if (itemPath === "/app" || itemPath === "/app/") {
        return currentPath === "/app" || currentPath === "/app/";
    }
    return currentPath === itemPath || currentPath.startsWith(`${itemPath}/`);
};

export function AdminLayout() {
    const breakpoint = useBreakpoint();
    const location = useLocation();
    const { user, logout } = useAuthStore();
    const [drawerOpen, setDrawerOpen] = useState(false);

    const isCompact = breakpoint === "compact";
    const isMedium = breakpoint === "medium";
    const isExpanded = breakpoint === "expanded";

    const visibleMenuSections = useMemo(
        () =>
            menuSections
                .map((section) => ({
                    ...section,
                    items: section.items.filter((item) => canAccessPath(user?.role, item.path)),
                }))
                .filter((section) => section.items.length > 0),
        [user?.role],
    );

    const visibleMenuItems = useMemo(
        () => visibleMenuSections.flatMap((section) => section.items),
        [visibleMenuSections],
    );

    const activeLabel =
        visibleMenuItems.find((item) => isPathActive(location.pathname, item.path))?.label || "Overview";

    const mainRoutes = useMemo(
        () =>
            [
                { icon: "dashboard", label: "Home", path: "/app" },
                { icon: "group", label: "Members", path: "/app/management/members" },
                { icon: "calendar_month", label: "Schedule", path: "/app/management/classes/schedule" },
                { icon: "shopping_cart", label: "Shop", path: "/app/management/products/overview" },
                { icon: "credit_card", label: "Payments", path: "/app/payments" },
            ].filter((item) => canAccessPath(user?.role, item.path)),
        [user?.role],
    );

    return (
        <div className="flex h-screen overflow-hidden bg-background text-foreground">
            {/* 1. COMPACT: Navigation Bar (Bottom) */}
            {isCompact && (
                <nav className="fixed bottom-0 left-0 right-0 z-50 flex h-[80px] items-center justify-around border-t border-border bg-card shadow-lg">
                    {mainRoutes.map((item) => {
                        const isActive = isPathActive(location.pathname, item.path);
                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                className={cn(
                                    "flex flex-1 flex-col items-center justify-center gap-1 h-full transition-colors",
                                    isActive ? "text-foreground" : "text-muted-foreground hover:text-foreground"
                                )}
                            >
                                <div className={cn(
                                    "flex items-center justify-center h-8 w-16 rounded-full transition-all duration-200",
                                    isActive ? "bg-primary/10" : "hover:bg-muted"
                                )}>
                                    <MaterialIcon
                                        icon={item.icon}
                                        fill={isActive}
                                        className={cn(isActive ? "text-primary" : "text-muted-foreground")}
                                    />
                                </div>
                                <span className={cn("text-xs", isActive && "font-bold")}>{item.label}</span>
                            </Link>
                        );
                    })}
                    <button
                        onClick={() => setDrawerOpen(true)}
                        className="flex flex-1 flex-col items-center justify-center gap-1 h-full text-muted-foreground hover:text-foreground"
                    >
                        <div className="flex items-center justify-center h-8 w-16 rounded-full hover:bg-muted">
                            <MaterialIcon icon="menu" />
                        </div>
                        <span className="text-xs">More</span>
                    </button>
                </nav>
            )}

            {/* 2. MEDIUM: Navigation Rail */}
            {isMedium && (
                <aside className="fixed inset-y-0 left-0 z-40 flex w-[80px] flex-col items-center border-r border-border bg-card py-4 shadow-sm">
                    <div className="mb-8 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary shadow-sm">
                        <MaterialIcon icon="fitness_center" className="text-primary-foreground text-2xl" />
                    </div>

                    <div className="flex flex-1 flex-col gap-4">
                        {mainRoutes.map((item) => {
                            const isActive = isPathActive(location.pathname, item.path);
                            return (
                                <Link
                                    key={item.path}
                                    to={item.path}
                                    className={cn(
                                        "flex flex-col items-center gap-1 transition-colors",
                                        isActive ? "text-foreground" : "text-muted-foreground hover:text-foreground"
                                    )}
                                >
                                    <div className={cn(
                                        "flex items-center justify-center h-8 w-14 rounded-full transition-all duration-200",
                                        isActive ? "bg-primary/10" : "hover:bg-muted"
                                    )}>
                                        <MaterialIcon icon={item.icon} fill={isActive} className={isActive ? "text-primary" : ""} />
                                    </div>
                                    <span className={cn("text-[11px] font-medium", isActive && "font-bold")}>{item.label}</span>
                                </Link>
                            );
                        })}
                        <button
                            onClick={() => setDrawerOpen(true)}
                            className="flex flex-col items-center gap-1 text-muted-foreground hover:text-foreground"
                        >
                            <div className="flex items-center justify-center h-8 w-14 rounded-full hover:bg-muted">
                                <MaterialIcon icon="menu" />
                            </div>
                            <span className="text-[11px] font-medium">More</span>
                        </button>
                    </div>

                    <div className="mt-auto flex flex-col gap-4">
                        <ThemeToggle />
                        <div className="flex size-10 items-center justify-center rounded-full bg-primary/20 text-primary">
                            <span className="font-semibold">{user?.firstName?.[0] || "A"}</span>
                        </div>
                    </div>
                </aside>
            )}

            {/* 3. EXPANDED: Navigation Drawer (Standard/Persistent) */}
            {isExpanded && (
                <aside className="z-30 flex w-[300px] shrink-0 flex-col border-r border-border bg-card">
                    <div className="flex h-20 items-center px-6">
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary">
                                <MaterialIcon icon="fitness_center" className="text-primary-foreground text-xl" />
                            </div>
                            <span className="text-lg font-bold tracking-tight text-primary">GymAdmin</span>
                        </div>
                    </div>

                    <nav className="flex-1 overflow-y-auto px-3 no-scrollbar space-y-4 py-4">
                        {visibleMenuSections.map((section) => (
                            <div key={section.title} className="space-y-1">
                                <p className="px-3 text-xs font-medium uppercase tracking-wider text-muted-foreground/70">
                                    {section.title}
                                </p>
                                {section.items.map((item) => {
                                    const isActive = isPathActive(location.pathname, item.path);
                                    return (
                                        <Link key={item.path} to={item.path}>
                                            <div className={cn(
                                                "flex h-14 items-center gap-3 rounded-full px-4 text-sm transition-all duration-200",
                                                isActive
                                                    ? "bg-primary/10 text-primary font-bold shadow-sm"
                                                    : "text-muted-foreground hover:bg-muted"
                                            )}>
                                                <MaterialIcon
                                                    icon={item.icon}
                                                    fill={isActive}
                                                    className={cn("text-xl", isActive ? "text-primary" : "text-muted-foreground")}
                                                />
                                                <span className="truncate">{item.label}</span>
                                            </div>
                                        </Link>
                                    );
                                })}
                            </div>
                        ))}
                    </nav>

                    <div className="mt-auto border-t border-border p-4">
                        <div className="mb-4 flex items-center gap-3 px-3">
                            <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/20 text-primary">
                                <span className="font-semibold uppercase">{user?.firstName?.[0] || "A"}</span>
                            </div>
                            <div className="flex flex-col truncate">
                                <span className="text-sm font-bold text-foreground truncate">
                                    {user?.firstName || "Admin"} {user?.lastName || ""}
                                </span>
                                <span className="text-xs text-muted-foreground truncate">{user?.email || "admin@gym.com"}</span>
                            </div>
                        </div>
                        <button
                            type="button"
                            onClick={() => logout()}
                            className="flex w-full items-center gap-3 rounded-full h-12 px-4 text-sm text-destructive transition-colors hover:bg-destructive/10"
                        >
                            <MaterialIcon icon="logout" className="text-xl" />
                            <span>Logout</span>
                        </button>
                    </div>
                </aside>
            )}

            {/* 4. MODAL/DISMISSIBLE DRAWER: For More/Settings on Compact/Medium */}
            <AnimatePresence>
                {drawerOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setDrawerOpen(false)}
                            className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ x: "100%" }}
                            animate={{ x: 0 }}
                            exit={{ x: "100%" }}
                            className="fixed inset-y-0 right-0 z-[70] flex w-full max-w-xs flex-col bg-card shadow-2xl"
                        >
                            <div className="flex h-16 items-center justify-between px-6 border-b border-border">
                                <span className="text-base font-bold">More Options</span>
                                <button onClick={() => setDrawerOpen(false)}>
                                    <MaterialIcon icon="close" />
                                </button>
                            </div>
                            <div className="flex-1 overflow-y-auto py-4">
                                {visibleMenuSections.map((section) => (
                                    <div key={section.title} className="mb-6 px-4">
                                        <h4 className="px-4 text-xs font-bold uppercase text-muted-foreground mb-2">{section.title}</h4>
                                        {section.items.map((item) => (
                                            <Link
                                                key={item.path}
                                                to={item.path}
                                                onClick={() => setDrawerOpen(false)}
                                                className="flex items-center gap-3 h-12 px-4 rounded-full text-sm text-foreground hover:bg-muted"
                                            >
                                                <MaterialIcon icon={item.icon} className="text-muted-foreground" />
                                                <span>{item.label}</span>
                                            </Link>
                                        ))}
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            {/* Main Content Area */}
            <div className={cn(
                "flex flex-1 flex-col overflow-hidden relative",
                isMedium && "pl-[80px]", // adjustment for rail
            )}>
                <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center justify-between border-b border-border bg-background/80 px-4 backdrop-blur-md md:px-6">
                    <div className="flex items-center gap-4">
                        <h1 className="text-xl font-bold text-foreground">
                            {activeLabel}
                        </h1>
                    </div>

                    <div className="flex items-center gap-2 md:gap-4">
                        <ThemeToggle />
                        <NotificationBell />
                    </div>
                </header>

                {/* Content Box */}
                <main className={cn(
                    "flex-1 overflow-y-auto p-4 md:p-6 lg:p-10",
                    isCompact && "pb-24" // extra padding for mobile bottom nav
                )}>
                    <div className="mx-auto max-w-7xl">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={location.pathname}
                                initial={{ opacity: 0, y: 12 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -8 }}
                                transition={{ duration: 0.25, ease: "easeOut" }}
                            >
                                <Outlet />
                            </motion.div>
                        </AnimatePresence>
                    </div>
                </main>
            </div>
        </div>
    );
}
