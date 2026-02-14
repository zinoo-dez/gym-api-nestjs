import {
  LayoutDashboard, Users, Dumbbell, UserCog, CreditCard, Percent,
  DollarSign, Bell, Settings, ShieldAlert, ListChecks, RefreshCcw,
} from "lucide-react";
import { NavLink } from "@/components/NavLink";
import {
  Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent,
  SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem,
} from "@/components/ui/sidebar";

import { useAuthStore } from "@/store/auth.store";
import { useGymSettingsStore } from "@/store/gym-settings.store";

const adminItems = [
  { title: "Dashboard", url: "/admin", icon: LayoutDashboard },
  { title: "Retention", url: "/admin/retention", icon: ShieldAlert },
  { title: "Retention Tasks", url: "/admin/retention/tasks", icon: ListChecks },
  { title: "Members", url: "/admin/members", icon: Users },
  { title: "Trainers", url: "/admin/trainers", icon: Dumbbell },
  { title: "Staff", url: "/admin/staff", icon: UserCog },
  { title: "Plans", url: "/admin/plans", icon: CreditCard },
  { title: "Discounts", url: "/admin/discounts", icon: Percent },
  { title: "Payments", url: "/admin/payments", icon: DollarSign },
  { title: "Recovery Queue", url: "/admin/recovery", icon: RefreshCcw },
  { title: "Notifications", url: "/admin/notifications", icon: Bell },
  { title: "Settings", url: "/admin/settings", icon: Settings },
];

export function AppSidebar() {
  const { user } = useAuthStore();
  const { settings } = useGymSettingsStore();

  const getItems = () => {
    if (!user) return [];
    
    switch (user.role) {
      case "MEMBER":
        return [{ title: "Dashboard", url: "/member", icon: LayoutDashboard }];
      case "TRAINER":
        return [{ title: "Dashboard", url: "/trainer", icon: LayoutDashboard }];
      case "STAFF":
        return [{ title: "Dashboard", url: "/staff", icon: LayoutDashboard }];
      default:
        return adminItems;
    }
  };

  const items = getItems();
  return (
    <Sidebar>
      <div className="p-4 border-b border-sidebar-border">
        <div className="flex items-center gap-2">
          <Dumbbell className="h-6 w-6 text-primary" />
          <span className="font-bold text-lg">{settings?.name || "GymPro"}</span>
        </div>
      </div>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Menu</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      end={item.url === "/"}
                      className="flex items-center gap-3 px-3 py-2 rounded-lg transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                      activeClassName="bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                    >
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
