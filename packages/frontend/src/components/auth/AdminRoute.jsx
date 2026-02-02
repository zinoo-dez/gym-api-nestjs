/**
 * AdminRoute Component
 * Wrapper component that requires admin/superadmin role to access routes
 */

import { Navigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth.js";

/**
 * AdminRoute - Redirects to dashboard if user is not an admin or superadmin
 * @param {Object} props
 * @param {React.ReactNode} props.children - Child components to render if authorized
 */
export function AdminRoute({ children }) {
  const { user, loading } = useAuth();

  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Redirect to dashboard if not admin or superadmin
  if (user.role !== "ADMIN" && user.role !== "SUPERADMIN") {
    return <Navigate to="/dashboard" replace />;
  }

  // Render children if authorized
  return children;
}
