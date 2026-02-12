import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { ProtectedRoute } from "../components/ProtectedRoute";

// Public Pages
import HomePage from "../pages/public/HomePage";
import RegisterPage from "../pages/auth/RegisterPage";
import PricingPage from "../pages/public/PricingPage";
import TrainersPage from "../pages/public/TrainersPage";
import WorkoutsPage from "../pages/public/WorkoutsPage";
import ClassesPage from "../pages/public/ClassesPage";
import FeaturesPage from "../pages/public/FeaturesPage";

// Auth Pages
import LoginPage from "../pages/auth/LoginPage";
import ForgotPasswordPage from "../pages/auth/ForgotPasswordPage";

// Admin Pages
import DashboardPage from "../pages/admin/DashboardPage";
import MembersPage from "../pages/admin/MembersPage";
import AdminTrainersPage from "../pages/admin/TrainersPage";
import PlansPage from "../pages/admin/PlansPage";
import AdminClassesPage from "../pages/admin/ClassesPage";
import AdminAttendancePage from "../pages/admin/AttendancePage";
import ReportsPage from "../pages/admin/ReportsPage";
import SettingsPage from "../pages/admin/SettingsPage";
import AdminWorkoutPlansPage from "../pages/admin/WorkoutPlansPage";
import AdminProfilePage from "../pages/admin/ProfilePage";
import DiscountCodesPage from "../pages/admin/DiscountCodesPage";

// Member Pages
import MemberDashboardPage from "../pages/member/MemberDashboardPage";
import MemberBookingsPage from "../pages/member/MemberBookingPage";
import MemberProfilePage from "../pages/member/MemberProfilePage";
import MemberProgressPage from "../pages/member/MemberProgressPage";
import MemberWorkoutsPage from "../pages/member/MemberWorkoutsPage";
import MemberPlansPage from "../pages/member/MemberPlansPage";

const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<HomePage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/pricing" element={<PricingPage />} />
      <Route path="/trainers" element={<TrainersPage />} />
      <Route path="/workouts" element={<WorkoutsPage />} />
      <Route path="/classes" element={<ClassesPage />} />
      <Route path="/features" element={<FeaturesPage />} />

      {/* Auth Routes */}
      <Route path="/auth/login" element={<LoginPage />} />
      <Route path="/auth/forgot-password" element={<ForgotPasswordPage />} />

      {/* Admin Routes - Protected */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute allowedRoles={["ADMIN", "SUPERADMIN"]}>
            <DashboardPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/members"
        element={
          <ProtectedRoute allowedRoles={["ADMIN", "SUPERADMIN"]}>
            <MembersPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/trainers"
        element={
          <ProtectedRoute allowedRoles={["ADMIN", "SUPERADMIN"]}>
            <AdminTrainersPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/plans"
        element={
          <ProtectedRoute allowedRoles={["ADMIN", "SUPERADMIN"]}>
            <PlansPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/discount-codes"
        element={
          <ProtectedRoute allowedRoles={["ADMIN", "SUPERADMIN"]}>
            <DiscountCodesPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/classes"
        element={
          <ProtectedRoute allowedRoles={["ADMIN", "SUPERADMIN"]}>
            <AdminClassesPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/attendance"
        element={
          <ProtectedRoute allowedRoles={["ADMIN", "SUPERADMIN"]}>
            <AdminAttendancePage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/workout-plans"
        element={
          <ProtectedRoute allowedRoles={["ADMIN", "SUPERADMIN"]}>
            <AdminWorkoutPlansPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/workoutplans"
        element={<Navigate to="/admin/workout-plans" replace />}
      />
      <Route
        path="/admin/reports"
        element={
          <ProtectedRoute allowedRoles={["ADMIN", "SUPERADMIN"]}>
            <ReportsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/settings"
        element={
          <ProtectedRoute allowedRoles={["ADMIN", "SUPERADMIN"]}>
            <SettingsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/profile"
        element={
          <ProtectedRoute allowedRoles={["ADMIN", "SUPERADMIN"]}>
            <AdminProfilePage />
          </ProtectedRoute>
        }
      />

      {/* Member Routes - Protected */}
      <Route
        path="/member"
        element={
          <ProtectedRoute allowedRoles={["MEMBER"]}>
            <MemberDashboardPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/member/plans"
        element={
          <ProtectedRoute allowedRoles={["MEMBER"]}>
            <MemberPlansPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/member/classes"
        element={
          <ProtectedRoute allowedRoles={["MEMBER"]}>
            <MemberBookingsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/member/workouts"
        element={
          <ProtectedRoute allowedRoles={["MEMBER"]}>
            <MemberWorkoutsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/member/workoutplans"
        element={<Navigate to="/member/workouts" replace />}
      />
      <Route
        path="/member/progress"
        element={
          <ProtectedRoute allowedRoles={["MEMBER"]}>
            <MemberProgressPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/member/profile"
        element={
          <ProtectedRoute allowedRoles={["MEMBER"]}>
            <MemberProfilePage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/member/membership"
        element={
          <ProtectedRoute allowedRoles={["MEMBER"]}>
            <MemberProfilePage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/member/bookings"
        element={<Navigate to="/member/classes" replace />}
      />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default AppRoutes;
