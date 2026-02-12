import { ReactNode } from "react";
import { AdminLayout } from "./AdminLayout";

export const TrainerLayout = ({ children }: { children: ReactNode }) => {
  return <AdminLayout>{children}</AdminLayout>;
};
