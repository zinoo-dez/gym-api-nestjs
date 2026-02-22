import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, Outlet } from "react-router-dom";

import { useAuthStore } from "@/store/auth.store";
import AttractionAuthPage from "@/pages/auth/AttractionAuthPage";
import { AdminLayout } from "@/layouts/AdminLayout";
import { AuthLayout } from "@/layouts/AuthLayout";
import { MemberLayout } from "@/layouts/MemberLayout";
import { PublicLayout } from "@/layouts/PublicLayout";
import { Dashboard as AdminDashboard } from "@/pages/admin/Dashboard";
import { Dashboard as MemberDashboard } from "@/pages/member/Dashboard";
import { EquipmentManagementPage } from "@/pages/admin/EquipmentManagementPage";
import { CostManagementPage } from "@/pages/admin/CostManagementPage";
import { MembershipPlansManagementPage } from "@/pages/admin/MembershipPlansManagementPage";
import { MemberMembershipListPage } from "@/pages/admin/MemberMembershipListPage";
import { MembershipFeatureLibraryPage } from "@/pages/admin/MembershipFeatureLibraryPage";
import { MembersManagementPage } from "@/pages/admin/MembersManagementPage";
import { TrainersManagementPage } from "@/pages/admin/TrainersManagementPage";
import { StaffManagementPage } from "@/pages/admin/StaffManagementPage";
import { DesignSystemShowcase } from "@/pages/admin/DesignSystemShowcase";
import { ProtectedRoute } from "@/routes/ProtectedRoute";
import { AdminRoute } from "@/routes/AdminRoute";
import { hasManagementAccess } from "@/lib/roles";

const queryClient = new QueryClient();

const DashboardRouter = () => {
  const user = useAuthStore((state) => state.user);

  if (hasManagementAccess(user?.role)) {
    return <AdminLayout />;
  }

  return <MemberLayout />;
};

const DashboardIndex = () => {
  const user = useAuthStore((state) => state.user);

  if (hasManagementAccess(user?.role)) {
    return <AdminDashboard />;
  }

  return <MemberDashboard />;
};

const App = () => {
    return (
        <QueryClientProvider client={queryClient}>
            <BrowserRouter>
              <Routes>
                {/* Auth Routes */}
                <Route element={<AuthLayout />}>
                  <Route path="/login" element={<AttractionAuthPage />} />
                  <Route path="/register" element={<AttractionAuthPage />} />
                </Route>

                {/* Protected Dashboard Routes */}
                <Route
                  path="/"
                  element={
                    <ProtectedRoute>
                      <DashboardRouter />
                    </ProtectedRoute>
                  }
                >
                  <Route index element={<DashboardIndex />} />
                  
                  {/* Admin Specific Routes */}
                  <Route
                    path="management/members"
                    element={
                      <AdminRoute>
                        <MembersManagementPage />
                      </AdminRoute>
                    }
                  />
                  <Route
                    path="management/trainers"
                    element={
                      <AdminRoute>
                        <TrainersManagementPage />
                      </AdminRoute>
                    }
                  />
                  <Route
                    path="management/staff"
                    element={
                      <AdminRoute>
                        <StaffManagementPage />
                      </AdminRoute>
                    }
                  />
                  <Route
                    path="management/equipment"
                    element={
                      <AdminRoute>
                        <EquipmentManagementPage />
                      </AdminRoute>
                    }
                  />
                  <Route
                    path="management/memberships"
                    element={
                      <AdminRoute>
                        <Navigate to="/management/memberships/plans" replace />
                      </AdminRoute>
                    }
                  />
                  <Route
                    path="management/memberships/plans"
                    element={
                      <AdminRoute>
                        <MembershipPlansManagementPage />
                      </AdminRoute>
                    }
                  />
                  <Route
                    path="management/memberships/members"
                    element={
                      <AdminRoute>
                        <MemberMembershipListPage />
                      </AdminRoute>
                    }
                  />
                  <Route
                    path="management/memberships/features"
                    element={
                      <AdminRoute>
                        <MembershipFeatureLibraryPage />
                      </AdminRoute>
                    }
                  />
                  <Route
                    path="finance/costs"
                    element={
                      <AdminRoute>
                        <Navigate to="/finance/costs/overview" replace />
                      </AdminRoute>
                    }
                  />
                  <Route
                    path="finance/costs/:section"
                    element={
                      <AdminRoute>
                        <CostManagementPage />
                      </AdminRoute>
                    }
                  />
                  <Route
                    path="design-system"
                    element={
                      <AdminRoute>
                        <DesignSystemShowcase />
                      </AdminRoute>
                    }
                  />
                </Route>

                {/* Catch all redirect */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </BrowserRouter>
        </QueryClientProvider>
    );
};

export default App;
