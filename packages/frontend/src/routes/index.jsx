/**
 * Router Configuration
 * Defines all application routes and navigation structure
 * Uses React.lazy for code splitting to optimize bundle size
 */

import { lazy } from "react";
import { createBrowserRouter } from "react-router-dom";
import { ProtectedRoute } from "../components/auth/ProtectedRoute.jsx";
import { MainLayout } from "../components/layout/MainLayout.jsx";

// Auth pages - loaded eagerly as they're the entry point
import { LoginPage } from "../pages/auth/LoginPage.jsx";
import { RegisterPage } from "../pages/auth/RegisterPage.jsx";

// Dashboard - loaded eagerly as it's the default protected route
import { DashboardPage } from "../pages/DashboardPage.jsx";

// Lazy-loaded pages for code splitting
// Member pages
const MembersListPage = lazy(() =>
  import("../pages/members/MembersListPage.jsx").then((module) => ({
    default: module.MembersListPage,
  }))
);
const MemberCreatePage = lazy(() =>
  import("../pages/members/MemberCreatePage.jsx").then((module) => ({
    default: module.MemberCreatePage,
  }))
);
const MemberDetailPage = lazy(() =>
  import("../pages/members/MemberDetailPage.jsx").then((module) => ({
    default: module.MemberDetailPage,
  }))
);
const MemberEditPage = lazy(() =>
  import("../pages/members/MemberEditPage.jsx").then((module) => ({
    default: module.MemberEditPage,
  }))
);

// Trainer pages
const TrainersListPage = lazy(() =>
  import("../pages/trainers/TrainersListPage.jsx").then((module) => ({
    default: module.TrainersListPage,
  }))
);
const TrainerCreatePage = lazy(() =>
  import("../pages/trainers/TrainerCreatePage.jsx").then((module) => ({
    default: module.TrainerCreatePage,
  }))
);
const TrainerDetailPage = lazy(() =>
  import("../pages/trainers/TrainerDetailPage.jsx").then((module) => ({
    default: module.TrainerDetailPage,
  }))
);
const TrainerEditPage = lazy(() =>
  import("../pages/trainers/TrainerEditPage.jsx").then((module) => ({
    default: module.TrainerEditPage,
  }))
);

// Class pages
const ClassSchedulePage = lazy(() =>
  import("../pages/classes/ClassSchedulePage.jsx").then((module) => ({
    default: module.ClassSchedulePage,
  }))
);
const ClassCreatePage = lazy(() =>
  import("../pages/classes/ClassCreatePage.jsx").then((module) => ({
    default: module.ClassCreatePage,
  }))
);
const ClassDetailPage = lazy(() =>
  import("../pages/classes/ClassDetailPage.jsx").then((module) => ({
    default: module.ClassDetailPage,
  }))
);
const ClassEditPage = lazy(() =>
  import("../pages/classes/ClassEditPage.jsx").then((module) => ({
    default: module.ClassEditPage,
  }))
);

// Membership pages
const MembershipsPage = lazy(() =>
  import("../pages/memberships/MembershipsPage.jsx").then((module) => ({
    default: module.MembershipsPage,
  }))
);

// Attendance pages
const AttendancePage = lazy(() =>
  import("../pages/attendance/AttendancePage.jsx").then((module) => ({
    default: module.AttendancePage,
  }))
);

// Workout pages
const WorkoutsListPage = lazy(() =>
  import("../pages/workouts/WorkoutsListPage.jsx").then((module) => ({
    default: module.WorkoutsListPage,
  }))
);
const WorkoutCreatePage = lazy(() =>
  import("../pages/workouts/WorkoutCreatePage.jsx").then((module) => ({
    default: module.WorkoutCreatePage,
  }))
);
const WorkoutDetailPage = lazy(() =>
  import("../pages/workouts/WorkoutDetailPage.jsx").then((module) => ({
    default: module.WorkoutDetailPage,
  }))
);
const WorkoutEditPage = lazy(() =>
  import("../pages/workouts/WorkoutEditPage.jsx").then((module) => ({
    default: module.WorkoutEditPage,
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
  // Public routes (authentication)
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
    path: "/",
    element: (
      <ProtectedRoute>
        <MainLayout />
      </ProtectedRoute>
    ),
    children: [
      // Dashboard
      {
        index: true,
        element: <DashboardPage />,
      },

      // Member routes
      {
        path: "members",
        children: [
          {
            index: true,
            element: <MembersListPage />,
          },
          {
            path: "new",
            element: <MemberCreatePage />,
          },
          {
            path: ":id",
            element: <MemberDetailPage />,
          },
          {
            path: ":id/edit",
            element: <MemberEditPage />,
          },
        ],
      },

      // Trainer routes
      {
        path: "trainers",
        children: [
          {
            index: true,
            element: <TrainersListPage />,
          },
          {
            path: "new",
            element: <TrainerCreatePage />,
          },
          {
            path: ":id",
            element: <TrainerDetailPage />,
          },
          {
            path: ":id/edit",
            element: <TrainerEditPage />,
          },
        ],
      },

      // Class routes
      {
        path: "classes",
        children: [
          {
            index: true,
            element: <ClassSchedulePage />,
          },
          {
            path: "new",
            element: <ClassCreatePage />,
          },
          {
            path: ":id",
            element: <ClassDetailPage />,
          },
          {
            path: ":id/edit",
            element: <ClassEditPage />,
          },
        ],
      },

      // Membership routes
      {
        path: "memberships",
        element: <MembershipsPage />,
      },

      // Attendance routes
      {
        path: "attendance",
        element: <AttendancePage />,
      },

      // Workout routes
      {
        path: "workouts",
        children: [
          {
            index: true,
            element: <WorkoutsListPage />,
          },
          {
            path: "new",
            element: <WorkoutCreatePage />,
          },
          {
            path: ":id",
            element: <WorkoutDetailPage />,
          },
          {
            path: ":id/edit",
            element: <WorkoutEditPage />,
          },
        ],
      },
    ],
  },

  // 404 Not Found - catch all unmatched routes
  {
    path: "*",
    element: <NotFoundPage />,
  },
]);
