import { Outlet } from "react-router-dom";

export function PublicLayout() {
  return (
    <div className="min-h-screen bg-background">
      {/* Add public header/footer if needed */}
      <main>
        <Outlet />
      </main>
    </div>
  );
}
