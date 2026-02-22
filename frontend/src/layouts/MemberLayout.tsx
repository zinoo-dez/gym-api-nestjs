import { Outlet } from "react-router-dom";

export function MemberLayout() {
  return (
    <div className="min-h-screen bg-background">
      {/* Add member-specific navigation/header here later */}
      <main className="container mx-auto p-4 md:p-6 lg:p-8">
        <Outlet />
      </main>
    </div>
  );
}
