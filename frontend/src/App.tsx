import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";

// Layouts
import { PublicLayout } from "@/layouts/PublicLayout";
import { AdminLayout } from "@/layouts/AdminLayout";
import { MemberLayout } from "@/layouts/MemberLayout";
import { TrainerLayout } from "@/layouts/TrainerLayout";
import { StaffLayout } from "@/layouts/StaffLayout";

// Routes
import { AdminRoute } from "@/routes/AdminRoute";
import { MemberRoute } from "@/routes/MemberRoute";
import { TrainerRoute } from "@/routes/TrainerRoute";
import { StaffRoute } from "@/routes/StaffRoute";

// Pages
import LandingPage from "./pages/public/LandingPage";
import Login from "./pages/public/Login";
import NotFound from "./pages/public/NotFound";

import Dashboard from "./pages/admin/Dashboard";
import Members from "./pages/admin/Members";
import Trainers from "./pages/admin/Trainers";
import StaffPage from "./pages/admin/StaffPage";
import MembershipPlans from "./pages/admin/MembershipPlans";
import Discounts from "./pages/admin/Discounts";
import Payments from "./pages/admin/Payments";
import Notifications from "./pages/admin/Notifications";
import Settings from "./pages/admin/Settings";

import MemberDashboard from "./pages/member/MemberDashboard";
import TrainerDashboard from "./pages/trainer/TrainerDashboard";
import StaffDashboard from "./pages/staff/StaffDashboard";

import "@/styles/App.css";

const queryClient = new QueryClient();

const DashboardRedirect = () => {
  const { user, isAuthenticated } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (user?.role === "member") return <Navigate to={`/member/${user.id}`} replace />;
  if (user?.role === "trainer") return <Navigate to={`/trainer/${user.id}`} replace />;
  if (user?.role === "staff") return <Navigate to={`/staff-profile/${user.id}`} replace />;
  return <AdminLayout><Dashboard /></AdminLayout>;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<PublicLayout><LandingPage /></PublicLayout>} />
              <Route path="/login" element={<PublicLayout><Login /></PublicLayout>} />
              
              {/* Admin Routes */}
              <Route path="/dashboard" element={<AdminRoute><DashboardRedirect /></AdminRoute>} />
              <Route path="/members" element={<AdminRoute><AdminLayout><Members /></AdminLayout></AdminRoute>} />
              <Route path="/trainers" element={<AdminRoute><AdminLayout><Trainers /></AdminLayout></AdminRoute>} />
              <Route path="/staff" element={<AdminRoute><AdminLayout><StaffPage /></AdminLayout></AdminRoute>} />
              <Route path="/plans" element={<AdminRoute><AdminLayout><MembershipPlans /></AdminLayout></AdminRoute>} />
              <Route path="/discounts" element={<AdminRoute><AdminLayout><Discounts /></AdminLayout></AdminRoute>} />
              <Route path="/payments" element={<AdminRoute><AdminLayout><Payments /></AdminLayout></AdminRoute>} />
              <Route path="/notifications" element={<AdminRoute><AdminLayout><Notifications /></AdminLayout></AdminRoute>} />
              <Route path="/settings" element={<AdminRoute><AdminLayout><Settings /></AdminLayout></AdminRoute>} />

              {/* Member Routes */}
              <Route path="/member/:id" element={<MemberRoute><MemberLayout><MemberDashboard /></MemberLayout></MemberRoute>} />

              {/* Trainer Routes */}
              <Route path="/trainer/:id" element={<TrainerRoute><TrainerLayout><TrainerDashboard /></TrainerLayout></TrainerRoute>} />

              {/* Staff Routes */}
              <Route path="/staff-profile/:id" element={<StaffRoute><StaffLayout><StaffDashboard /></StaffLayout></StaffRoute>} />

              <Route path="*" element={<PublicLayout><NotFound /></PublicLayout>} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
