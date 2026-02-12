import { Navigate, useLocation } from "react-router-dom";
import { useAuthStore } from "@/store/auth.store";
import { useEffect } from "react";

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: string[];
}

export function ProtectedRoute({
  children,
  allowedRoles,
}: ProtectedRouteProps) {
  const { isAuthenticated, isLoading, user, initAuth } = useAuthStore();
  const location = useLocation();

  useEffect(() => {
    initAuth();
  }, [initAuth]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/auth/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-2">
            Access Denied
          </h1>
          <p className="text-muted-foreground">
            You don't have permission to access this page.
          </p>
          <button
            onClick={() => window.history.back()}
            className="mt-4 text-primary hover:underline"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
