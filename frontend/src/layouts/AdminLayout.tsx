import { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { AppSidebar } from "./AppSidebar";
import { SidebarProvider, SidebarTrigger, SidebarInset } from "@/components/ui/sidebar";
import { useTheme } from "@/contexts/ThemeContext";
import { Moon, Sun, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";

export const AdminLayout = ({ children }: { children: ReactNode }) => {
    const { isAuthenticated, user, logout } = useAuth();
    const { theme, toggleTheme } = useTheme();

    if (!isAuthenticated) return <Navigate to="/login" replace />;

    return (
        <SidebarProvider>
            <div className="flex min-h-screen w-full">
                <AppSidebar />
                <SidebarInset className="flex-1">
                    <header className="h-[61px] border-b border-border flex items-center justify-between px-4 bg-card shrink-0">
                        <div className="flex items-center gap-2">
                            <SidebarTrigger />
                            <span className="font-semibold text-sm">
                                {user?.role !== "admin" ? `${user?.role?.charAt(0).toUpperCase()}${user?.role?.slice(1)} Portal` : "Admin Console"}
                            </span>
                        </div>
                        <div className="flex items-center gap-3">
                            <Button variant="ghost" size="icon" onClick={toggleTheme}>
                                {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                            </Button>
                            <span className="text-sm text-muted-foreground hidden sm:inline">{user?.email}</span>
                            <Button variant="ghost" size="icon" onClick={logout}>
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
