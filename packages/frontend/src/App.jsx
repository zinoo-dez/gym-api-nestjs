/**
 * App Component
 * Root application component with router and providers
 */

import { useEffect } from "react";
import { RouterProvider } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "./context/AuthContext.jsx";
import { router } from "./routes/index.jsx";
import { ErrorBoundary, NotificationContainer } from "./components/common/index.js";
import { usePreferencesStore } from "./stores/usePreferencesStore.js";
import { useUIStore } from "./stores/useUIStore.js";
import "./App.css";

// Configure TanStack Query client with optimized cache settings
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Default cache settings
      staleTime: 5 * 60 * 1000, // 5 minutes - data is considered fresh for 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes - unused data is garbage collected after 10 minutes
      refetchOnWindowFocus: false, // Don't refetch when window regains focus (reduces unnecessary requests)
      refetchOnReconnect: true, // Refetch when network reconnects
      retry: 1, // Retry failed requests once
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000), // Exponential backoff
    },
    mutations: {
      // Mutation settings
      retry: 0, // Don't retry mutations automatically (user should retry manually)
      onError: (error) => {
        console.error("Mutation error:", error);
      },
    },
  },
});

// Custom query options for specific data types
// These can be used in individual hooks for fine-tuned caching

// Frequently changing data (e.g., attendance, class bookings)
export const frequentQueryOptions = {
  staleTime: 1 * 60 * 1000, // 1 minute
  gcTime: 5 * 60 * 1000, // 5 minutes
};

// Rarely changing data (e.g., membership plans, trainers)
export const rareQueryOptions = {
  staleTime: 15 * 60 * 1000, // 15 minutes
  gcTime: 30 * 60 * 1000, // 30 minutes
};

// Static/reference data (e.g., configuration, constants)
export const staticQueryOptions = {
  staleTime: 60 * 60 * 1000, // 1 hour
  gcTime: 24 * 60 * 60 * 1000, // 24 hours
};

function App() {
  const setPrefersReducedMotion = usePreferencesStore(
    (state) => state.setPrefersReducedMotion,
  );

  // Detect user's motion preference on mount and listen for changes
  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReducedMotion(mediaQuery.matches);

    const handleChange = (e) => setPrefersReducedMotion(e.matches);
    mediaQuery.addEventListener("change", handleChange);

    return () => mediaQuery.removeEventListener("change", handleChange);
  }, [setPrefersReducedMotion]);

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <RouterProvider router={router} />
          <NotificationContainer />
        </AuthProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
