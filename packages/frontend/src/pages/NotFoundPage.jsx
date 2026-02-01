/**
 * NotFoundPage Component
 * 404 error page for non-existent routes
 */

import { Link } from "react-router-dom";

/**
 * NotFoundPage - Displays 404 error message with navigation back to home
 */
export function NotFoundPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full text-center">
        <div className="mb-6 sm:mb-8">
          <h1 className="text-6xl sm:text-9xl font-bold text-blue-600">404</h1>
          <h2 className="text-2xl sm:text-3xl font-semibold text-gray-900 mt-3 sm:mt-4">
            Page Not Found
          </h2>
          <p className="text-sm sm:text-base text-gray-600 mt-3 sm:mt-4 px-4">
            The page you're looking for doesn't exist or has been moved.
          </p>
        </div>

        <div className="space-y-3 sm:space-y-4">
          <Link
            to="/"
            className="inline-block px-5 sm:px-6 py-2.5 sm:py-3 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 transition-colors text-sm sm:text-base min-h-[44px] flex items-center justify-center"
          >
            Go to Dashboard
          </Link>
          <div>
            <Link
              to="/login"
              className="text-blue-600 hover:text-blue-700 font-medium text-sm sm:text-base"
            >
              Back to Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
