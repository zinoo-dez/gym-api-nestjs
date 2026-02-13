import { ReactNode } from "react";
import { ProtectedRoute } from "./ProtectedRoute";

export const TrainerRoute = ({ children }: { children: ReactNode }) => {
  return <ProtectedRoute allowedRoles={["TRAINER"]}>{children}</ProtectedRoute>;
};
