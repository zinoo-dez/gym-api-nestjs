import { ReactNode } from "react";
import { ProtectedRoute } from "./ProtectedRoute";

export const AdminRoute = ({ children }: { children: ReactNode }) => {
  // For now, it just uses ProtectedRoute. 
  // You can add role checks here later if user object has a role property.
  return <ProtectedRoute>{children}</ProtectedRoute>;
};
