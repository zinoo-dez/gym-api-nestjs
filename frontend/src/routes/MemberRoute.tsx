import { ReactNode } from "react";
import { ProtectedRoute } from "./ProtectedRoute";

export const MemberRoute = ({ children }: { children: ReactNode }) => {
  return <ProtectedRoute allowedRoles={["MEMBER"]}>{children}</ProtectedRoute>;
};
