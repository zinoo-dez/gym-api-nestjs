import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate, Outlet } from "react-router-dom";

import { useAuthStore } from "@/stores/auth.store";
import AttractionAuthPage from "@/pages/auth/AttractionAuthPage";
import { AdminLayout } from "@/components/layouts/AdminLayout";
import { AdminDashboard } from "@/pages/dashboard/AdminDashboard";
import { UserDashboard } from "@/pages/dashboard/UserDashboard";

const queryClient = new QueryClient();

// A simple protected route wrapper just in case
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const isAuthenticated = useAuthStore((state) => !!state.accessToken);
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <>{children}</>;
};

const PublicRoute = ({ children }: { children: React.ReactNode }) => {
  const isAuthenticated = useAuthStore((state) => !!state.accessToken);
  if (isAuthenticated) return <Navigate to="/" replace />;
  return <>{children}</>;
};

const DashboardRouter = () => {
  const user = useAuthStore((state) => state.user);
  
  const isAdmin = user?.role?.toLowerCase() === "admin";
  
  if (isAdmin) {
    return <AdminLayout />;
  }
  
  // Standard user layout can just use an empty outlet
  // Later you can add a UserLayout with bottom nav or generic top header
  return <Outlet />;
};

const DashboardIndex = () => {
  const user = useAuthStore((state) => state.user);
  
  const isAdmin = user?.role?.toLowerCase() === "admin";

  if (isAdmin) {
    return <AdminDashboard />;
  }
  
  return <UserDashboard />;
};

const App = () => {
    return (
        <QueryClientProvider client={queryClient}>
            <BrowserRouter>
              <Routes>
                <Route 
                  path="/login" 
                  element={
                    <PublicRoute>
                      <AttractionAuthPage />
                    </PublicRoute>
                  } 
                />
                <Route 
                  path="/register" 
                  element={
                    <PublicRoute>
                      <AttractionAuthPage />
                    </PublicRoute>
                  } 
                />
                <Route
                  path="/"
                  element={
                    <ProtectedRoute>
                      <DashboardRouter />
                    </ProtectedRoute>
                  }
                >
                  <Route index element={<DashboardIndex />} />
                </Route>
              </Routes>
            </BrowserRouter>
        </QueryClientProvider>
    );
};

export default App;
