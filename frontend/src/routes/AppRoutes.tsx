import React from "react";
import { Routes, Route, Navigate, Outlet } from "react-router-dom";
import { AdminRoute } from "./AdminRoute";
import { MemberRoute } from "./MemberRoute";
import { TrainerRoute } from "./TrainerRoute";
import { StaffRoute } from "./StaffRoute";
import { RouteTransition } from "@/components/motion/RouteTransition";
import { PublicLayout } from "@/layouts/PublicLayout";
import { AdminLayout } from "@/layouts/AdminLayout";
import { MemberLayout } from "@/layouts/MemberLayout";
import { TrainerLayout } from "@/layouts/TrainerLayout";
import { StaffLayout } from "@/layouts/StaffLayout";

// Public Pages
import IndexPage from "../pages/public/Index";
import PublicLogin from "../pages/public/Login";
import NotFound from "../pages/public/NotFound";

// Auth Pages
import LoginPage from "../pages/auth/LoginPage";
import RegisterPage from "../pages/auth/RegisterPage";
import ForgotPasswordPage from "../pages/auth/ForgotPasswordPage";

// Admin Pages
import MembersPage from "../pages/admin/Members";
import AdminTrainersPage from "../pages/admin/Trainers";
import PlansPage from "../pages/admin/MembershipPlans";
import DiscountsPage from "../pages/admin/Discounts";
import PaymentsPage from "../pages/admin/Payments";
import NotificationsPage from "../pages/admin/Notifications";
import MarketingPage from "../pages/admin/Marketing";
import MarketingCampaignsPage from "../pages/admin/MarketingCampaigns";
import MarketingTemplatesPage from "../pages/admin/MarketingTemplates";
import MarketingAutomationsPage from "../pages/admin/MarketingAutomations";
import MarketingAnalyticsPage from "../pages/admin/MarketingAnalytics";
import SettingsPage from "../pages/admin/Settings";
import StaffPage from "../pages/admin/StaffPage";
import RetentionDashboardPage from "../pages/admin/RetentionDashboard";
import RetentionTasksPage from "../pages/admin/RetentionTasks";
import RecoveryPage from "../pages/admin/Recovery";
import SalesDashboardPage from "../pages/admin/SalesDashboard";
import PosSalesPage from "../pages/admin/PosSales";
import InventoryManagementPage from "../pages/admin/InventoryManagement";
// Admin Pages (Converted to TSX)
import GymManagementM3DashboardPage from "../pages/admin/GymManagementM3Dashboard";

// Member/Trainer/Staff Pages
import MemberDashboardPage from "../pages/member/MemberDashboard";
import MemberRenewalPage from "../pages/member/MemberRenewal";
import MemberProgressPage from "../pages/member/MemberProgress";
import MemberShopPage from "../pages/member/MemberShop";
import MemberPurchaseHistoryPage from "../pages/member/MemberPurchaseHistory";
import TrainerDashboardPage from "../pages/trainer/TrainerDashboard";
import TrainerSessionsPage from "../pages/trainer/TrainerSessions";
import StaffDashboardPage from "../pages/staff/StaffDashboard";

const AppRoutes = () => {
  const withTransition = (element: React.ReactElement) => (
    <RouteTransition>{element}</RouteTransition>
  );

  return (
    <Routes>
      {/* Public Routes */}
      <Route
        path="/"
        element={withTransition(
          <PublicLayout>
            <IndexPage />
          </PublicLayout>,
        )}
      />
      <Route
        path="/login"
        element={withTransition(
          <PublicLayout>
            <PublicLogin />
          </PublicLayout>,
        )}
      />
      <Route
        path="/register"
        element={withTransition(<Navigate to="/auth/register" replace />)}
      />
      <Route path="/auth/login" element={withTransition(<LoginPage />)} />
      <Route path="/auth/register" element={withTransition(<RegisterPage />)} />
      <Route
        path="/auth/forgot-password"
        element={withTransition(<ForgotPasswordPage />)}
      />

      {/* Admin Routes - Protected (persistent layout) */}
      <Route
        path="/admin"
        element={
          <AdminRoute>
            <AdminLayout>
              <Outlet />
            </AdminLayout>
          </AdminRoute>
        }
      >
        <Route
          index
          element={withTransition(<GymManagementM3DashboardPage />)}
        />
        <Route path="members" element={withTransition(<MembersPage />)} />
        <Route
          path="trainers"
          element={withTransition(<AdminTrainersPage />)}
        />
        <Route path="plans" element={withTransition(<PlansPage />)} />
        <Route path="discounts" element={withTransition(<DiscountsPage />)} />
        <Route path="payments" element={withTransition(<PaymentsPage />)} />
        <Route path="recovery" element={withTransition(<RecoveryPage />)} />
        <Route
          path="inventory-sales"
          element={withTransition(<SalesDashboardPage />)}
        />
        <Route path="pos-sales" element={withTransition(<PosSalesPage />)} />
        <Route
          path="inventory-management"
          element={withTransition(<InventoryManagementPage />)}
        />
        <Route
          path="notifications"
          element={withTransition(<NotificationsPage />)}
        />
        <Route path="marketing" element={withTransition(<MarketingPage />)} />
        <Route
          path="marketing/campaigns"
          element={withTransition(<MarketingCampaignsPage />)}
        />
        <Route
          path="marketing/templates"
          element={withTransition(<MarketingTemplatesPage />)}
        />
        <Route
          path="marketing/automations"
          element={withTransition(<MarketingAutomationsPage />)}
        />
        <Route
          path="marketing/analytics"
          element={withTransition(<MarketingAnalyticsPage />)}
        />
        <Route path="settings" element={withTransition(<SettingsPage />)} />
        <Route path="staff" element={withTransition(<StaffPage />)} />
        <Route
          path="retention"
          element={withTransition(<RetentionDashboardPage />)}
        />
        <Route
          path="retention/tasks"
          element={withTransition(<RetentionTasksPage />)}
        />
      </Route>

      {/* Member Routes - Protected (persistent layout) */}
      <Route
        path="/member"
        element={
          <MemberRoute>
            <MemberLayout>
              <Outlet />
            </MemberLayout>
          </MemberRoute>
        }
      >
        <Route index element={withTransition(<MemberDashboardPage />)} />
        <Route
          path="renew/:subscriptionId"
          element={withTransition(<MemberRenewalPage />)}
        />
        <Route
          path="progress"
          element={withTransition(<MemberProgressPage />)}
        />
        <Route path="shop" element={withTransition(<MemberShopPage />)} />
        <Route
          path="purchase-history"
          element={withTransition(<MemberPurchaseHistoryPage />)}
        />
      </Route>

      {/* Trainer Routes - Protected (persistent layout) */}
      <Route
        path="/trainer"
        element={
          <TrainerRoute>
            <TrainerLayout>
              <Outlet />
            </TrainerLayout>
          </TrainerRoute>
        }
      >
        <Route index element={withTransition(<TrainerDashboardPage />)} />
        <Route
          path="sessions"
          element={withTransition(<TrainerSessionsPage />)}
        />
      </Route>

      {/* Staff Routes - Protected (persistent layout) */}
      <Route
        path="/staff"
        element={
          <StaffRoute>
            <StaffLayout>
              <Outlet />
            </StaffLayout>
          </StaffRoute>
        }
      >
        <Route index element={withTransition(<StaffDashboardPage />)} />
        <Route
          path="inventory-sales"
          element={withTransition(<SalesDashboardPage />)}
        />
        <Route path="pos-sales" element={withTransition(<PosSalesPage />)} />
        <Route
          path="inventory-management"
          element={withTransition(<InventoryManagementPage />)}
        />
      </Route>

      {/* Fallback */}
      <Route
        path="*"
        element={withTransition(
          <PublicLayout>
            <NotFound />
          </PublicLayout>,
        )}
      />
    </Routes>
  );
};

export default AppRoutes;
