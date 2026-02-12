import {
  LayoutDashboard, Users, Dumbbell, UserCog, CreditCard, Percent,
  DollarSign, Bell, Settings,
} from "lucide-react";
import { NavLink } from "@/components/NavLink";
import {
  Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent,
  SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem,
} from "@/components/ui/sidebar";

import { useAuth } from "@/contexts/AuthContext";

const adminItems = [
  { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
  { title: "Members", url: "/members", icon: Users },
  { title: "Trainers", url: "/trainers", icon: Dumbbell },
  { title: "Staff", url: "/staff", icon: UserCog },
  { title: "Plans", url: "/plans", icon: CreditCard },
  { title: "Discounts", url: "/discounts", icon: Percent },
  { title: "Payments", url: "/payments", icon: DollarSign },
  { title: "Notifications", url: "/notifications", icon: Bell },
  { title: "Settings", url: "/settings", icon: Settings },
];

export function AppSidebar() {
  const { user } = useAuth();

  const getItems = () => {
    if (!user) return [];
    
    switch (user.role) {
      case "member":
        return [{ title: "Dashboard", url: `/member/${user.id}`, icon: LayoutDashboard }];
      case "trainer":
        return [{ title: "Dashboard", url: `/trainer/${user.id}`, icon: LayoutDashboard }];
      case "staff":
        return [{ title: "Dashboard", url: `/staff-profile/${user.id}`, icon: LayoutDashboard }];
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
          <span className="font-bold text-lg">GymPro</span>
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
