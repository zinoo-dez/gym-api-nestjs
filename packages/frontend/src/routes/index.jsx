/**
 * Router Configuration
 * Defines all application routes and navigation structure
 * Uses React.lazy for code splitting to optimize bundle size
 */

import { lazy } from "react";
import { createBrowserRouter } from "react-router-dom";
import { ProtectedRoute } from "../components/auth/ProtectedRoute.jsx";
import { AdminRoute } from "../components/auth/AdminRoute.jsx";
import { MainLayout } from "../components/layout/MainLayout.jsx";
import { AdminLayout } from "../components/layout/AdminLayout.jsx";

// Auth pages - loaded eagerly as they're the entry point
import { LoginPage } from "../pages/auth/LoginPage.jsx";
import { RegisterPage } from "../pages/auth/RegisterPage.jsx";

// Dashboard - loaded eagerly as it's the default protected route
import { DashboardPage } from "../pages/DashboardPage.jsx";

// Public pages - loaded eagerly for better UX
import { HomePage } from "../pages/public/HomePage.jsx";
import { FeaturesPage } from "../pages/public/FeaturesPage.jsx";
import { PublicTrainersPage } from "../pages/public/PublicTrainersPage.jsx";
import { PublicClassesPage } from "../pages/public/PublicClassesPage.jsx";
import { PublicWorkoutPlansPage } from "../pages/public/PublicWorkoutPlansPage.jsx";
import { PublicMembershipsPage } from "../pages/public/PublicMembershipsPage.jsx";

// Lazy-loaded pages for code splitting
// Admin pages
const AdminDashboard = lazy(() =>
  import("../pages/admin/AdminDashboard.jsx").then((module) => ({
    default: module.AdminDashboard,
  }))
);
const AdminMembers = lazy(() =>
  import("../pages/admin/AdminMembers.jsx").then((module) => ({
    default: module.AdminMembers,
  }))
);
const AdminTrainers = lazy(() =>
  import("../pages/admin/AdminTrainers.jsx").then((module) => ({
    default: module.AdminTrainers,
  }))
);
const AdminClasses = lazy(() =>
  import("../pages/admin/AdminClasses.jsx").then((module) => ({
    default: module.AdminClasses,
  }))
);
const AdminMemberships = lazy(() =>
  import("../pages/admin/AdminMemberships.jsx").then((module) => ({
    default: module.AdminMemberships,
  }))
);
const AdminAttendance = lazy(() =>
  import("../pages/admin/AdminAttendance.jsx").then((module) => ({
    default: module.AdminAttendance,
  }))
);
const AdminWorkouts = lazy(() =>
  import("../pages/admin/AdminWorkouts.jsx").then((module) => ({
    default: module.AdminWorkouts,
  }))
);
const AdminUsers = lazy(() =>
  import("../pages/admin/AdminUsers.jsx").then((module) => ({
    default: module.AdminUsers,
  }))
);

// Error pages
const NotFoundPage = lazy(() =>
  import("../pages/NotFoundPage.jsx").then((module) => ({
    default: module.NotFoundPage,
  }))
);

/**
 * Application router configuration
 * Defines all routes with authentication protection and nested layouts
 */
export const router = createBrowserRouter([
  // Public routes
  {
    path: "/",
    element: <HomePage />,
  },
  {
    path: "/features",
    element: <FeaturesPage />,
  },
  {
    path: "/trainers",
    element: <PublicTrainersPage />,
  },
  {
    path: "/classes",
    element: <PublicClassesPage />,
  },
  {
    path: "/workout-plans",
    element: <PublicWorkoutPlansPage />,
  },
  {
    path: "/memberships",
    element: <PublicMembershipsPage />,
  },
  {
    path: "/login",
    element: <LoginPage />,
  },
  {
    path: "/register",
    element: <RegisterPage />,
  },

  // Protected routes (require authentication)
  {
    path: "/dashboard",
    element: (
      <ProtectedRoute>
        <MainLayout />
      </ProtectedRoute>
    ),
    children: [
      // Dashboard Home
      {
        index: true,
        element: <DashboardPage />,
      },
    ],
  },

  // Admin routes (require admin/superadmin role)
  {
    path: "/admin",
    element: (
      <AdminRoute>
        <AdminLayout />
      </AdminRoute>
    ),
    children: [
      {
        index: true,
        element: <AdminDashboard />,
      },
      {
        path: "members",
        element: <AdminMembers />,
      },
      {
        path: "trainers",
        element: <AdminTrainers />,
      },
      {
        path: "classes",
        element: <AdminClasses />,
      },
      {
        path: "memberships",
        element: <AdminMemberships />,
      },
      {
        path: "attendance",
        element: <AdminAttendance />,
      },
      {
        path: "workouts",
        element: <AdminWorkouts />,
      },
      {
        path: "users",
        element: <AdminUsers />,
      },
    ],
  },

  // 404 Not Found - catch all unmatched routes
  {
    path: "*",
    element: <NotFoundPage />,
  },
]);
