import { ReactNode, useEffect, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { useAuthStore } from "@/store/auth.store";
import { AppSidebar } from "./AppSidebar";
import { SidebarProvider, SidebarTrigger, SidebarInset } from "@/components/ui/sidebar";
import { useTheme } from "@/contexts/ThemeContext";
import { Moon, Sun, LogOut, Bell, Info, CheckCircle2, AlertTriangle, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useGymSettingsStore } from "@/store/gym-settings.store";
import { useNotifications } from "@/hooks/use-notifications";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";

export const AdminLayout = ({ children }: { children: ReactNode }) => {
    const { isAuthenticated, user, clearAuth } = useAuthStore();
    const { theme, toggleTheme } = useTheme();
    const { settings, fetchSettings } = useGymSettingsStore();
    const { notifications, markAsRead, markAllAsRead } = useNotifications();
    const unreadCount = notifications.filter((n) => !n.read).length;
    const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
    const navigate = useNavigate();

    if (!isAuthenticated) return <Navigate to="/auth/login" replace />;

    useEffect(() => {
        fetchSettings();
    }, [fetchSettings]);

    return (
        <SidebarProvider>
            <div className="flex min-h-screen w-full">
                <AppSidebar />
                <SidebarInset className="flex-1">
                    <header className="h-[61px] border-b border-border flex items-center justify-between px-4 bg-card shrink-0">
                        <div className="flex items-center gap-2">
                            <SidebarTrigger />
                            <span className="font-semibold text-sm">
                                {settings?.name ? settings.name : "Admin Console"}
                            </span>
                        </div>
                        <div className="flex items-center gap-3">
                            <Popover open={isNotificationsOpen} onOpenChange={setIsNotificationsOpen}>
                                <PopoverTrigger asChild>
                                    <Button variant="ghost" size="icon" className="relative" aria-label="Notifications">
                                        <Bell className="h-4 w-4" />
                                        {unreadCount > 0 && (
                                            <span className="absolute -top-1 -right-1 h-4 min-w-[1rem] px-1 text-[10px] flex items-center justify-center rounded-full bg-destructive text-destructive-foreground">
                                                {unreadCount > 99 ? "99+" : unreadCount}
                                            </span>
                                        )}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent align="end" className="w-[380px] p-0 rounded-xl shadow-lg">
                                    <div className="flex items-center justify-between border-b border-border px-5 py-4">
                                        <div>
                                            <p className="text-sm font-semibold">Notifications</p>
                                            <p className="text-xs text-muted-foreground">
                                                {unreadCount > 0
                                                    ? `${unreadCount} unread`
                                                    : "All caught up"}
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="h-7 px-2 text-xs"
                                                onClick={() => {
                                                    setIsNotificationsOpen(false);
                                                    navigate("/admin/notifications");
                                                }}
                                            >
                                                View all
                                            </Button>
                                            {unreadCount > 0 && (
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="h-7 px-2 text-xs"
                                                    onClick={markAllAsRead}
                                                >
                                                    Mark all read
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                    <ScrollArea className="h-[420px]">
                                        {notifications.length === 0 ? (
                                            <div className="px-4 py-10 text-center text-sm text-muted-foreground">
                                                No notifications
                                            </div>
                                        ) : (
                                            <div className="divide-y divide-border">
                                                {notifications.map((notification) => (
                                                    <div
                                                        key={notification.id}
                                                        className={cn(
                                                            "px-5 py-4 transition-colors",
                                                            !notification.read && "bg-primary/5",
                                                        )}
                                                    >
                                                        <div className="flex items-start gap-3">
                                                            <div className="mt-0.5">
                                                                {notification.type === "success" && (
                                                                    <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600">
                                                                        <CheckCircle2 className="h-4 w-4" />
                                                                    </span>
                                                                )}
                                                                {notification.type === "warning" && (
                                                                    <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-amber-500/10 text-amber-600">
                                                                        <AlertTriangle className="h-4 w-4" />
                                                                    </span>
                                                                )}
                                                                {notification.type === "error" && (
                                                                    <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-rose-500/10 text-rose-600">
                                                                        <XCircle className="h-4 w-4" />
                                                                    </span>
                                                                )}
                                                                {notification.type === "info" && (
                                                                    <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-sky-500/10 text-sky-600">
                                                                        <Info className="h-4 w-4" />
                                                                    </span>
                                                                )}
                                                            </div>
                                                            <div className="min-w-0 flex-1">
                                                                <div className="flex items-start gap-2">
                                                                    <p className="text-sm font-medium text-foreground truncate">
                                                                        {notification.title}
                                                                    </p>
                                                                    {!notification.read && (
                                                                        <span className="mt-1 h-2 w-2 rounded-full bg-primary" />
                                                                    )}
                                                                </div>
                                                                <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
                                                                    {notification.message}
                                                                </p>
                                                                <p className="text-[11px] text-muted-foreground mt-2">
                                                                    {formatDistanceToNow(
                                                                        notification.createdAt,
                                                                        { addSuffix: true },
                                                                    )}
                                                                </p>
                                                            </div>
                                                            <div className="ml-auto">
                                                                {!notification.read && (
                                                                    <Button
                                                                        variant="ghost"
                                                                        size="sm"
                                                                        className="h-7 px-2 text-xs"
                                                                        onClick={() => markAsRead(notification.id)}
                                                                    >
                                                                        Mark read
                                                                    </Button>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </ScrollArea>
                                </PopoverContent>
                            </Popover>
                            <Button variant="ghost" size="icon" onClick={toggleTheme}>
                                {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                            </Button>
                            <span className="text-sm text-muted-foreground hidden sm:inline">{user?.email}</span>
                            <Button variant="ghost" size="icon" onClick={clearAuth}>
                                <LogOut className="h-4 w-4" />
                            </Button>
                        </div>
                    </header>
                    <main className="flex-1 p-4 md:p-6 overflow-auto">{children}</main>
                </SidebarInset>
            </div>
        </SidebarProvider>
    );
};
