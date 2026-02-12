import { ReactNode } from "react";

export const PublicLayout = ({ children }: { children: ReactNode }) => {
  return <div className="min-h-screen bg-background">{children}</div>;
};
