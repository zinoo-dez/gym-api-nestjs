import { Suspense, lazy } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";

import { useAuthStore } from "@/store/auth.store";
import LandingPage from "@/pages/public/LandingPage";
import LoginPage from "@/pages/auth/LoginPage";
import RegisterPage from "@/pages/auth/RegisterPage";
import ForgotPasswordPage from "@/pages/auth/ForgotPasswordPage";
import ResetPasswordPage from "@/pages/auth/ResetPasswordPage";
import { AdminLayout } from "@/layouts/AdminLayout";
import { AuthLayout } from "@/layouts/AuthLayout";
import { MemberLayout } from "@/layouts/MemberLayout";
import { PublicLayout } from "@/layouts/PublicLayout";
import { Dashboard as AdminDashboard } from "@/pages/admin/Dashboard";
import { Dashboard as MemberDashboard } from "@/pages/member/Dashboard";
import { EquipmentOverviewPage } from "@/pages/admin/EquipmentOverviewPage";
import { EquipmentListPage } from "@/pages/admin/EquipmentListPage";
import { CostManagementPage } from "@/pages/admin/CostManagementPage";
import { MembershipPlansManagementPage } from "@/pages/admin/MembershipPlansManagementPage";
import { MemberMembershipListPage } from "@/pages/admin/MemberMembershipListPage";
import { MembershipFeatureLibraryPage } from "@/pages/admin/MembershipFeatureLibraryPage";
import { MembersManagementPage } from "@/pages/admin/MembersManagementPage";
import { TrainersManagementPage } from "@/pages/admin/TrainersManagementPage";
import { StaffManagementPage } from "@/pages/admin/StaffManagementPage";
import { PaymentsDashboardPage } from "@/pages/admin/PaymentsDashboardPage";
import { ProductManagementPage } from "@/pages/admin/ProductManagementPage";
import { ProductPosPage } from "@/pages/admin/ProductPosPage";
import { ProductSalesHistoryPage } from "@/pages/admin/ProductSalesHistoryPage";
import { ProductSalesOverviewPage } from "@/pages/admin/ProductSalesOverviewPage";
import { DesignSystemShowcase } from "@/pages/admin/DesignSystemShowcase";
import { NotificationsPage } from "@/pages/admin/NotificationsPage";
import { SystemSettingsPage } from "@/pages/admin/SystemSettingsPage";
import { ProtectedRoute } from "@/routes/ProtectedRoute";
import { AdminRoute } from "@/routes/AdminRoute";
import { hasAnyRole, hasManagementAccess, hasOperationsAccess, ROLE } from "@/lib/roles";
import { AppToaster } from "@/components/ui/AppToaster";

const queryClient = new QueryClient();
const PAYMENT_ROUTE_ROLES = [ROLE.ADMIN, ROLE.OWNER, ROLE.STAFF] as const;
const INVENTORY_ROUTE_ROLES = [ROLE.ADMIN, ROLE.OWNER, ROLE.STAFF] as const;
const CLASS_SCHEDULE_ROUTE_ROLES = [ROLE.ADMIN, ROLE.OWNER, ROLE.TRAINER] as const;
const CLASS_ATTENDANCE_ROUTE_ROLES = [ROLE.ADMIN, ROLE.OWNER, ROLE.STAFF] as const;
const CLASS_MANAGEMENT_ROUTE_ROLES = [
  ROLE.ADMIN,
  ROLE.OWNER,
  ROLE.STAFF,
  ROLE.TRAINER,
] as const;

const LazyClassSchedulingPage = lazy(() =>
  import("@/pages/admin/ClassSchedulingPage").then((module) => ({
    default: module.ClassSchedulingPage,
  })),
);
const LazyClassAttendancePage = lazy(() =>
  import("@/pages/admin/ClassAttendancePage").then((module) => ({
    default: module.ClassAttendancePage,
  })),
);

const DashboardRouter = () => {
  const user = useAuthStore((state) => state.user);

  if (hasOperationsAccess(user?.role)) {
    return <AdminLayout />;
  }

  return <MemberLayout />;
};

const DashboardIndex = () => {
  const user = useAuthStore((state) => state.user);
  const role = user?.role;

  if (hasManagementAccess(role)) {
    return <AdminDashboard />;
  }

  if (hasAnyRole(role, [ROLE.STAFF])) {
    return <Navigate to="/app/payments" replace />;
  }

  if (hasAnyRole(role, [ROLE.TRAINER])) {
    return <Navigate to="/app/management/classes/schedule" replace />;
  }

  return <MemberDashboard />;
};

const ClassManagementIndex = () => {
  const role = useAuthStore((state) => state.user?.role);

  if (hasAnyRole(role, CLASS_SCHEDULE_ROUTE_ROLES)) {
    return <Navigate to="/app/management/classes/schedule" replace />;
  }

  if (hasAnyRole(role, CLASS_ATTENDANCE_ROUTE_ROLES)) {
    return <Navigate to="/app/management/classes/attendance" replace />;
  }

  return <Navigate to="/app" replace />;
};

const LegacyAppRedirect = () => {
  const location = useLocation();
  return <Navigate to={`/app${location.pathname}${location.search}${location.hash}`} replace />;
};

const App = () => {
    return (
        <QueryClientProvider client={queryClient}>
            <BrowserRouter>
              <Routes>
                {/* Public Routes */}
                <Route element={<PublicLayout />}>
                  <Route index element={<LandingPage />} />
                  <Route path="landing" element={<Navigate to="/" replace />} />
                </Route>

                {/* Auth Routes */}
                <Route element={<AuthLayout />}>
                  <Route path="/login" element={<LoginPage />} />
                  <Route path="/register" element={<RegisterPage />} />
                  <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                  <Route path="/reset-password" element={<ResetPasswordPage />} />
                </Route>

                {/* Protected Dashboard Routes */}
                <Route
                  path="/app"
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
                    path="payments"
                    element={
                      <AdminRoute allowedRoles={PAYMENT_ROUTE_ROLES}>
                        <PaymentsDashboardPage />
                      </AdminRoute>
                    }
                  />
                  <Route
                    path="management/classes"
                    element={
                      <AdminRoute allowedRoles={CLASS_MANAGEMENT_ROUTE_ROLES}>
                        <ClassManagementIndex />
                      </AdminRoute>
                    }
                  />
                  <Route
                    path="management/classes/schedule"
                    element={
                      <AdminRoute allowedRoles={CLASS_SCHEDULE_ROUTE_ROLES}>
                        <Suspense
                          fallback={
                            <div className="flex min-h-[260px] items-center justify-center rounded-lg border bg-card p-6 text-sm text-muted-foreground">
                              Loading class scheduling module...
                            </div>
                          }
                        >
                          <LazyClassSchedulingPage />
                        </Suspense>
                      </AdminRoute>
                    }
                  />
                  <Route
                    path="management/classes/attendance"
                    element={
                      <AdminRoute allowedRoles={CLASS_ATTENDANCE_ROUTE_ROLES}>
                        <Suspense
                          fallback={
                            <div className="flex min-h-[260px] items-center justify-center rounded-lg border bg-card p-6 text-sm text-muted-foreground">
                              Loading class attendance module...
                            </div>
                          }
                        >
                          <LazyClassAttendancePage />
                        </Suspense>
                      </AdminRoute>
                    }
                  />
                  <Route
                    path="management/classes/:section"
                    element={
                      <AdminRoute allowedRoles={CLASS_MANAGEMENT_ROUTE_ROLES}>
                        <ClassManagementIndex />
                      </AdminRoute>
                    }
                  />
                  <Route
                    path="management/equipment"
                    element={
                      <AdminRoute>
                        <Navigate to="/app/management/equipment/overview" replace />
                      </AdminRoute>
                    }
                  />
                  <Route
                    path="management/equipment/overview"
                    element={
                      <AdminRoute>
                        <EquipmentOverviewPage />
                      </AdminRoute>
                    }
                  />
                  <Route
                    path="management/equipment/list"
                    element={
                      <AdminRoute>
                        <EquipmentListPage />
                      </AdminRoute>
                    }
                  />
                  <Route
                    path="management/equipment/:section"
                    element={
                      <AdminRoute>
                        <Navigate to="/app/management/equipment/overview" replace />
                      </AdminRoute>
                    }
                  />
                  <Route
                    path="management/products"
                    element={
                      <AdminRoute allowedRoles={INVENTORY_ROUTE_ROLES}>
                        <Navigate to="/app/management/products/overview" replace />
                      </AdminRoute>
                    }
                  />
                  <Route
                    path="management/products/overview"
                    element={
                      <AdminRoute allowedRoles={INVENTORY_ROUTE_ROLES}>
                        <ProductSalesOverviewPage />
                      </AdminRoute>
                    }
                  />
                  <Route
                    path="management/products/management"
                    element={
                      <AdminRoute allowedRoles={INVENTORY_ROUTE_ROLES}>
                        <ProductManagementPage />
                      </AdminRoute>
                    }
                  />
                  <Route
                    path="management/products/pos"
                    element={
                      <AdminRoute allowedRoles={INVENTORY_ROUTE_ROLES}>
                        <ProductPosPage />
                      </AdminRoute>
                    }
                  />
                  <Route
                    path="management/products/history"
                    element={
                      <AdminRoute allowedRoles={INVENTORY_ROUTE_ROLES}>
                        <ProductSalesHistoryPage />
                      </AdminRoute>
                    }
                  />
                  <Route
                    path="management/products/:section"
                    element={
                      <AdminRoute allowedRoles={INVENTORY_ROUTE_ROLES}>
                        <Navigate to="/app/management/products/overview" replace />
                      </AdminRoute>
                    }
                  />
                  <Route
                    path="management/memberships"
                    element={
                      <AdminRoute>
                        <Navigate to="/app/management/memberships/plans" replace />
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
                        <Navigate to="/app/finance/costs/overview" replace />
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
                    path="reports"
                    element={
                      <AdminRoute>
                        <AdminDashboard />
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
                  <Route
                    path="admin/notifications"
                    element={
                      <AdminRoute>
                        <NotificationsPage />
                      </AdminRoute>
                    }
                  />
                  <Route
                    path="settings"
                    element={
                      <AdminRoute>
                        <Navigate to="/app/settings/gym-identity" replace />
                      </AdminRoute>
                    }
                  />
                  <Route
                    path="settings/:section"
                    element={
                      <AdminRoute>
                        <SystemSettingsPage />
                      </AdminRoute>
                    }
                  />
                </Route>
                {/* Legacy root path compatibility redirects */}
                <Route path="/management/*" element={<LegacyAppRedirect />} />
                <Route path="/finance/*" element={<LegacyAppRedirect />} />
                <Route path="/payments" element={<LegacyAppRedirect />} />
                <Route path="/reports" element={<LegacyAppRedirect />} />
                <Route path="/design-system" element={<LegacyAppRedirect />} />
                <Route path="/admin/*" element={<LegacyAppRedirect />} />
                <Route path="/settings/*" element={<LegacyAppRedirect />} />

                {/* Catch all redirect */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </BrowserRouter>
            <AppToaster />
        </QueryClientProvider>
    );
};

export default App;
