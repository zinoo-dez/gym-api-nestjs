import { Navigate } from "react-router-dom";
import { useAuthStore } from "@/store/auth.store";
import { hasManagementAccess } from "@/lib/roles";

interface AdminRouteProps {
  children: React.ReactNode;
}

export const AdminRoute = ({ children }: AdminRouteProps) => {
  const user = useAuthStore((state) => state.user);

  if (!hasManagementAccess(user?.role)) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};
