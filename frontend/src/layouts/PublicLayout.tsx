import { ReactNode } from "react";

export const PublicLayout = ({ children }: { children: ReactNode }) => {
  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-200">
      {children}
    </div>
  );
};
