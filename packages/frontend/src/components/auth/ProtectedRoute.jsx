/**
 * ProtectedRoute Component
 * Wrapper component that requires authentication to access routes
 */

import { Navigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth.js";

/**
 * ProtectedRoute - Redirects to login if user is not authenticated
 * @param {Object} props
 * @param {React.ReactNode} props.children - Child components to render if authenticated
 */
export function ProtectedRoute({ children }) {
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

  // Render children if authenticated
  return children;
}
