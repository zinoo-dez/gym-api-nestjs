import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { AdminRoute } from "./AdminRoute";
import { MemberRoute } from "./MemberRoute";
import { TrainerRoute } from "./TrainerRoute";
import { StaffRoute } from "./StaffRoute";
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

// Member/Trainer/Staff Pages
import MemberDashboardPage from "../pages/member/MemberDashboard";
import TrainerDashboardPage from "../pages/trainer/TrainerDashboard";
import StaffDashboardPage from "../pages/staff/StaffDashboard";

const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<PublicLayout><IndexPage /></PublicLayout>} />
      <Route path="/login" element={<PublicLayout><PublicLogin /></PublicLayout>} />
      <Route path="/auth/login" element={<LoginPage />} />
      <Route path="/auth/register" element={<RegisterPage />} />
      <Route path="/auth/forgot-password" element={<ForgotPasswordPage />} />

      {/* Admin Routes - Protected */}
      <Route
        path="/admin"
        element={
          <AdminRoute>
            <AdminLayout><DashboardPage /></AdminLayout>
          </AdminRoute>
        }
      />
      <Route
        path="/admin/members"
        element={
          <AdminRoute>
            <AdminLayout><MembersPage /></AdminLayout>
          </AdminRoute>
        }
      />
      <Route
        path="/admin/trainers"
        element={
          <AdminRoute>
            <AdminLayout><AdminTrainersPage /></AdminLayout>
          </AdminRoute>
        }
      />
      <Route
        path="/admin/plans"
        element={
          <AdminRoute>
            <AdminLayout><PlansPage /></AdminLayout>
          </AdminRoute>
        }
      />
      <Route
        path="/admin/discounts"
        element={
          <AdminRoute>
            <AdminLayout><DiscountsPage /></AdminLayout>
          </AdminRoute>
        }
      />
      <Route
        path="/admin/payments"
        element={
          <AdminRoute>
            <AdminLayout><PaymentsPage /></AdminLayout>
          </AdminRoute>
        }
      />
      <Route
        path="/admin/notifications"
        element={
          <AdminRoute>
            <AdminLayout><NotificationsPage /></AdminLayout>
          </AdminRoute>
        }
      />
      <Route
        path="/admin/settings"
        element={
          <AdminRoute>
            <AdminLayout><SettingsPage /></AdminLayout>
          </AdminRoute>
        }
      />
      <Route
        path="/admin/staff"
        element={
          <AdminRoute>
            <AdminLayout><StaffPage /></AdminLayout>
          </AdminRoute>
        }
      />

      {/* Member Routes - Protected */}
      <Route
        path="/member"
        element={
          <MemberRoute>
            <MemberLayout><MemberDashboardPage /></MemberLayout>
          </MemberRoute>
        }
      />

      {/* Trainer Routes - Protected */}
      <Route
        path="/trainer"
        element={
          <TrainerRoute>
            <TrainerLayout><TrainerDashboardPage /></TrainerLayout>
          </TrainerRoute>
        }
      />

      {/* Staff Routes - Protected */}
      <Route
        path="/staff"
        element={
          <StaffRoute>
            <StaffLayout><StaffDashboardPage /></StaffLayout>
          </StaffRoute>
        }
      />

      {/* Fallback */}
      <Route path="*" element={<PublicLayout><NotFound /></PublicLayout>} />
    </Routes>
  );
};

export default AppRoutes;
