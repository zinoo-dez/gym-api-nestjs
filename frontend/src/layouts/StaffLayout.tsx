import { ReactNode } from "react";
import { AdminLayout } from "./AdminLayout";

export const StaffLayout = ({ children }: { children: ReactNode }) => {
  return <AdminLayout>{children}</AdminLayout>;
};
