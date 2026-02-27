import { Navigate } from "react-router-dom";
import { useAuthStore } from "@/store/auth.store";
import { type AppRole, hasAnyRole, hasManagementAccess } from "@/lib/roles";

interface AdminRouteProps {
  children: React.ReactNode;
  allowedRoles?: readonly AppRole[];
}

export const AdminRoute = ({ children, allowedRoles }: AdminRouteProps) => {
  const user = useAuthStore((state) => state.user);

  const hasAccess = allowedRoles ? hasAnyRole(user?.role, allowedRoles) : hasManagementAccess(user?.role);

  if (!hasAccess) {
    return <Navigate to="/app" replace />;
  }

  return <>{children}</>;
};
