import { ReactNode } from "react";
import { ProtectedRoute } from "./ProtectedRoute";

export const AdminRoute = ({ children }: { children: ReactNode }) => {
  return <ProtectedRoute allowedRoles={["ADMIN", "SUPERADMIN"]}>{children}</ProtectedRoute>;
};
