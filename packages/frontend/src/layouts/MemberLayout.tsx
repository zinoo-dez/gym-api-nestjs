import { ReactNode } from "react";
import { AdminLayout } from "./AdminLayout";

export const MemberLayout = ({ children }: { children: ReactNode }) => {
  return <AdminLayout>{children}</AdminLayout>;
};
