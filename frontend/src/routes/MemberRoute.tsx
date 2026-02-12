import { ReactNode } from "react";
import { ProtectedRoute } from "./ProtectedRoute";

export const MemberRoute = ({ children }: { children: ReactNode }) => {
  return <ProtectedRoute>{children}</ProtectedRoute>;
};
