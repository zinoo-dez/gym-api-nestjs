import React from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
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
import DashboardPage from "../pages/admin/Dashboard";
import MembersPage from "../pages/admin/Members";
import AdminTrainersPage from "../pages/admin/Trainers";
import PlansPage from "../pages/admin/MembershipPlans";
import DiscountsPage from "../pages/admin/Discounts";
import PaymentsPage from "../pages/admin/Payments";
import NotificationsPage from "../pages/admin/Notifications";
import SettingsPage from "../pages/admin/Settings";
import StaffPage from "../pages/admin/StaffPage";
import RetentionDashboardPage from "../pages/admin/RetentionDashboard";
import RetentionTasksPage from "../pages/admin/RetentionTasks";
import RecoveryPage from "../pages/admin/Recovery";

// Member/Trainer/Staff Pages
import MemberDashboardPage from "../pages/member/MemberDashboard";
import MemberRenewalPage from "../pages/member/MemberRenewal";
import TrainerDashboardPage from "../pages/trainer/TrainerDashboard";
import StaffDashboardPage from "../pages/staff/StaffDashboard";

const AppRoutes = () => {
  const location = useLocation();
  const withTransition = (element: React.ReactElement) => (
    <RouteTransition>{element}</RouteTransition>
  );

  return (
    <AnimatePresence mode="wait" initial={false}>
      <Routes location={location} key={location.pathname}>
        {/* Public Routes */}
        <Route path="/" element={withTransition(<PublicLayout><IndexPage /></PublicLayout>)} />
        <Route path="/login" element={withTransition(<PublicLayout><PublicLogin /></PublicLayout>)} />
        <Route path="/register" element={withTransition(<Navigate to="/auth/register" replace />)} />
        <Route path="/auth/login" element={withTransition(<LoginPage />)} />
        <Route path="/auth/register" element={withTransition(<RegisterPage />)} />
        <Route path="/auth/forgot-password" element={withTransition(<ForgotPasswordPage />)} />

        {/* Admin Routes - Protected */}
        <Route
          path="/admin"
          element={withTransition(
            <AdminRoute>
              <AdminLayout><DashboardPage /></AdminLayout>
            </AdminRoute>,
          )}
        />
        <Route
          path="/admin/members"
          element={withTransition(
            <AdminRoute>
              <AdminLayout><MembersPage /></AdminLayout>
            </AdminRoute>,
          )}
        />
        <Route
          path="/admin/trainers"
          element={withTransition(
            <AdminRoute>
              <AdminLayout><AdminTrainersPage /></AdminLayout>
            </AdminRoute>,
          )}
        />
        <Route
          path="/admin/plans"
          element={withTransition(
            <AdminRoute>
              <AdminLayout><PlansPage /></AdminLayout>
            </AdminRoute>,
          )}
        />
        <Route
          path="/admin/discounts"
          element={withTransition(
            <AdminRoute>
              <AdminLayout><DiscountsPage /></AdminLayout>
            </AdminRoute>,
          )}
        />
        <Route
          path="/admin/payments"
          element={withTransition(
            <AdminRoute>
              <AdminLayout><PaymentsPage /></AdminLayout>
            </AdminRoute>,
          )}
        />
        <Route
          path="/admin/recovery"
          element={withTransition(
            <AdminRoute>
              <AdminLayout><RecoveryPage /></AdminLayout>
            </AdminRoute>,
          )}
        />
        <Route
          path="/admin/notifications"
          element={withTransition(
            <AdminRoute>
              <AdminLayout><NotificationsPage /></AdminLayout>
            </AdminRoute>,
          )}
        />
        <Route
          path="/admin/settings"
          element={withTransition(
            <AdminRoute>
              <AdminLayout><SettingsPage /></AdminLayout>
            </AdminRoute>,
          )}
        />
        <Route
          path="/admin/staff"
          element={withTransition(
            <AdminRoute>
              <AdminLayout><StaffPage /></AdminLayout>
            </AdminRoute>,
          )}
        />
        <Route
          path="/admin/retention"
          element={withTransition(
            <AdminRoute>
              <AdminLayout><RetentionDashboardPage /></AdminLayout>
            </AdminRoute>,
          )}
        />
        <Route
          path="/admin/retention/tasks"
          element={withTransition(
            <AdminRoute>
              <AdminLayout><RetentionTasksPage /></AdminLayout>
            </AdminRoute>,
          )}
        />

        {/* Member Routes - Protected */}
        <Route
          path="/member"
          element={withTransition(
            <MemberRoute>
              <MemberLayout><MemberDashboardPage /></MemberLayout>
            </MemberRoute>,
          )}
        />
        <Route
          path="/member/renew/:subscriptionId"
          element={withTransition(
            <MemberRoute>
              <MemberLayout><MemberRenewalPage /></MemberLayout>
            </MemberRoute>,
          )}
        />

        {/* Trainer Routes - Protected */}
        <Route
          path="/trainer"
          element={withTransition(
            <TrainerRoute>
              <TrainerLayout><TrainerDashboardPage /></TrainerLayout>
            </TrainerRoute>,
          )}
        />

        {/* Staff Routes - Protected */}
        <Route
          path="/staff"
          element={withTransition(
            <StaffRoute>
              <StaffLayout><StaffDashboardPage /></StaffLayout>
            </StaffRoute>,
          )}
        />

        {/* Fallback */}
        <Route path="*" element={withTransition(<PublicLayout><NotFound /></PublicLayout>)} />
      </Routes>
    </AnimatePresence>
  );
};

export default AppRoutes;
