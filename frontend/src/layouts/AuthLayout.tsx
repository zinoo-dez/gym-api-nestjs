import { Outlet } from "react-router-dom";

export function AuthLayout() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-md space-y-8">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-bold tracking-tight text-foreground">
            Gym Management System
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Welcome back to your dashboard
          </p>
        </div>
        <Outlet />
      </div>
    </div>
  );
}
