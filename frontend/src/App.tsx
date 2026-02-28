import { Suspense, lazy, useEffect } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";

import { useAuthStore } from "@/store/auth.store";
import { useThemeStore } from "@/store/theme.store";
import LandingPage from "@/pages/public";
import LoginPage from "@/pages/auth/LoginPage";
import RegisterPage from "@/pages/auth/RegisterPage";
import ForgotPasswordPage from "@/pages/auth/ForgotPasswordPage";
import ResetPasswordPage from "@/pages/auth/ResetPasswordPage";
import { AdminLayout } from "@/layouts/AdminLayout";
import { AuthLayout } from "@/layouts/AuthLayout";
import { MemberLayout } from "@/layouts/MemberLayout";
import { PublicLayout } from "@/layouts/PublicLayout";
import { ProtectedRoute } from "@/routes/ProtectedRoute";
import { AdminRoute } from "@/routes/AdminRoute";
import {
    hasAnyRole,
    hasManagementAccess,
    hasOperationsAccess,
    ROLE,
    PAYMENT_ROUTE_ROLES,
    INVENTORY_ROUTE_ROLES,
    CLASS_SCHEDULE_ROUTE_ROLES,
    CLASS_ATTENDANCE_ROUTE_ROLES,
    CLASS_MANAGEMENT_ROUTE_ROLES,
} from "@/lib/roles";
import { AppToaster } from "@/components/ui/AppToaster";

// ---------------------------------------------------------------------------
// Lazy-loaded page components — keeps the initial bundle small.
// ---------------------------------------------------------------------------
const lazyPage = <T extends Record<string, React.ComponentType>>(
    factory: () => Promise<T>,
    exportName: keyof T,
) =>
    lazy(() =>
        factory().then((mod) => ({ default: mod[exportName] as React.ComponentType })),
    );

const AdminDashboard = lazyPage(() => import("@/pages/admin/Dashboard"), "Dashboard");
const MemberDashboard = lazyPage(() => import("@/pages/member/Dashboard"), "Dashboard");
const EquipmentOverviewPage = lazyPage(() => import("@/pages/admin/EquipmentOverviewPage"), "EquipmentOverviewPage");
const EquipmentListPage = lazyPage(() => import("@/pages/admin/EquipmentListPage"), "EquipmentListPage");
const CostManagementPage = lazyPage(() => import("@/pages/admin/CostManagementPage"), "CostManagementPage");
const MembershipPlansManagementPage = lazyPage(() => import("@/pages/admin/MembershipPlansManagementPage"), "MembershipPlansManagementPage");
const MemberMembershipListPage = lazyPage(() => import("@/pages/admin/MemberMembershipListPage"), "MemberMembershipListPage");
const MembershipFeatureLibraryPage = lazyPage(() => import("@/pages/admin/MembershipFeatureLibraryPage"), "MembershipFeatureLibraryPage");
const MembersManagementPage = lazyPage(() => import("@/pages/admin/MembersManagementPage"), "MembersManagementPage");
const TrainersManagementPage = lazyPage(() => import("@/pages/admin/TrainersManagementPage"), "TrainersManagementPage");
const StaffManagementPage = lazyPage(() => import("@/pages/admin/StaffManagementPage"), "StaffManagementPage");
const PaymentsDashboardPage = lazyPage(() => import("@/pages/admin/PaymentsDashboardPage"), "PaymentsDashboardPage");
const ProductManagementPage = lazyPage(() => import("@/pages/admin/ProductManagementPage"), "ProductManagementPage");
const ProductPosPage = lazyPage(() => import("@/pages/admin/ProductPosPage"), "ProductPosPage");
const ProductSalesHistoryPage = lazyPage(() => import("@/pages/admin/ProductSalesHistoryPage"), "ProductSalesHistoryPage");
const ProductSalesOverviewPage = lazyPage(() => import("@/pages/admin/ProductSalesOverviewPage"), "ProductSalesOverviewPage");
const DesignSystemShowcase = lazyPage(() => import("@/pages/admin/DesignSystemShowcase"), "DesignSystemShowcase");
const NotificationsPage = lazyPage(() => import("@/pages/admin/NotificationsPage"), "NotificationsPage");
const SystemSettingsPage = lazyPage(() => import("@/pages/admin/SystemSettingsPage"), "SystemSettingsPage");
const LazyClassSchedulingPage = lazyPage(() => import("@/pages/admin/ClassSchedulingPage"), "ClassSchedulingPage");
const LazyClassAttendancePage = lazyPage(() => import("@/pages/admin/ClassAttendancePage"), "ClassAttendancePage");

const queryClient = new QueryClient();

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

const PageFallback = () => (
    <div className="flex min-h-[260px] items-center justify-center rounded-lg border bg-card p-6 text-sm text-muted-foreground">
        Loading...
    </div>
);

const App = () => {
    const theme = useThemeStore((state) => state.theme);

    useEffect(() => {
        document.documentElement.classList.toggle("dark", theme === "dark");
    }, [theme]);

    return (
        <QueryClientProvider client={queryClient}>
            <BrowserRouter>
                <Suspense fallback={<PageFallback />}>
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
                                        <LazyClassSchedulingPage />
                                    </AdminRoute>
                                }
                            />
                            <Route
                                path="management/classes/attendance"
                                element={
                                    <AdminRoute allowedRoles={CLASS_ATTENDANCE_ROUTE_ROLES}>
                                        <LazyClassAttendancePage />
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
                </Suspense>
            </BrowserRouter>
            <AppToaster />
        </QueryClientProvider>
    );
};

export default App;
