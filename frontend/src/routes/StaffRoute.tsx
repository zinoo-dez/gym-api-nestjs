import { ReactNode } from "react";
import { ProtectedRoute } from "./ProtectedRoute";

export const StaffRoute = ({ children }: { children: ReactNode }) => {
  return <ProtectedRoute allowedRoles={["STAFF"]}>{children}</ProtectedRoute>;
};
