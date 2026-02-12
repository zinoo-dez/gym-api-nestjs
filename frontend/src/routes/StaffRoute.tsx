import { ReactNode } from "react";
import { ProtectedRoute } from "./ProtectedRoute";

export const StaffRoute = ({ children }: { children: ReactNode }) => {
  return <ProtectedRoute>{children}</ProtectedRoute>;
};
