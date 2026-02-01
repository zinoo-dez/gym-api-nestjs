/**
 * MainLayout Component
 * Main application layout with navigation and content area
 * Optimized for mobile with hamburger menu, touch-friendly targets, and swipe gestures
 */

import { useRef, useEffect, Suspense } from "react";
import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth.js";
import { useUIStore } from "../../stores/useUIStore.js";
import { motion, AnimatePresence } from "framer-motion";
import { LoadingSpinner, SkipNavigation } from "../common/index.js";

/**
 * MainLayout - Provides navigation and layout structure for authenticated pages
 * Features:
 * - Hamburger menu for mobile devices
 * - Touch-friendly buttons (44x44px minimum)
 * - Swipe gestures to open/close mobile menu
 * - Responsive to orientation changes
 * - Uses Zustand UI store for sidebar state management
 */
export function MainLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  
  // Use Zustand UI store for sidebar state (mobile menu)
  const { sidebarOpen: isMobileMenuOpen, setSidebarOpen: setIsMobileMenuOpen, activeModal, openModal, closeModal } = useUIStore();
  
  const dropdownRef = useRef(null);
  const mobileMenuRef = useRef(null);
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);

  // Profile dropdown is managed locally as it's component-specific UI state
  const isProfileDropdownOpen = activeModal === 'profile-dropdown';

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  const toggleProfileDropdown = () => {
    if (isProfileDropdownOpen) {
      closeModal();
    } else {
      openModal('profile-dropdown');
    }
  };

  // Swipe gesture handlers for mobile menu
  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e) => {
    touchEndX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = () => {
    const swipeDistance = touchEndX.current - touchStartX.current;
    const minSwipeDistance = 50; // Minimum distance for a swipe

    // Swipe right to open menu (from left edge)
    if (swipeDistance > minSwipeDistance && touchStartX.current < 50 && !isMobileMenuOpen) {
      setIsMobileMenuOpen(true);
    }
    
    // Swipe left to close menu
    if (swipeDistance < -minSwipeDistance && isMobileMenuOpen) {
      setIsMobileMenuOpen(false);
    }

    // Reset touch positions
    touchStartX.current = 0;
    touchEndX.current = 0;
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        closeModal();
      }
    };

    if (isProfileDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isProfileDropdownOpen, closeModal]);

  // Add swipe gesture listeners for mobile
  useEffect(() => {
    const element = document.body;
    
    const handleTouchStartWrapper = (e) => handleTouchStart(e);
    const handleTouchMoveWrapper = (e) => handleTouchMove(e);
    const handleTouchEndWrapper = () => handleTouchEnd();
    
    element.addEventListener("touchstart", handleTouchStartWrapper, { passive: true });
    element.addEventListener("touchmove", handleTouchMoveWrapper, { passive: true });
    element.addEventListener("touchend", handleTouchEndWrapper, { passive: true });

    return () => {
      element.removeEventListener("touchstart", handleTouchStartWrapper);
      element.removeEventListener("touchmove", handleTouchMoveWrapper);
      element.removeEventListener("touchend", handleTouchEndWrapper);
    };
  }, [isMobileMenuOpen]); // Re-attach when menu state changes

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isMobileMenuOpen]);

  // Navigation items
  const navItems = [
    { path: "/", label: "Dashboard", icon: "🏠" },
    { path: "/members", label: "Members", icon: "👥" },
    { path: "/trainers", label: "Trainers", icon: "💪" },
    { path: "/classes", label: "Classes", icon: "📅" },
    { path: "/memberships", label: "Memberships", icon: "💳" },
    { path: "/attendance", label: "Attendance", icon: "✓" },
    { path: "/workouts", label: "Workouts", icon: "🏋️" },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Skip Navigation Links */}
      <SkipNavigation />
      
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40" id="navigation">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8">
          <div className="flex justify-between items-center h-14 sm:h-16">
            {/* Logo */}
            <div className="flex items-center min-w-0 flex-1">
              <h1 className="text-base sm:text-xl font-bold text-gray-900 truncate">
                Gym Management
              </h1>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex space-x-2 xl:space-x-4" aria-label="Main navigation">
              {navItems.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  end={item.path === "/"}
                  className={({ isActive }) =>
                    `px-3 xl:px-4 py-2 rounded-md text-xs xl:text-sm font-medium transition-colors whitespace-nowrap min-h-[44px] flex items-center ${
                      isActive
                        ? "bg-blue-100 text-blue-700"
                        : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                    }`
                  }
                  aria-label={item.label}
                >
                  <span className="mr-1.5" aria-hidden="true">{item.icon}</span>
                  <span className="hidden xl:inline">{item.label}</span>
                </NavLink>
              ))}
            </nav>

            {/* User Menu */}
            <div className="flex items-center space-x-2 sm:space-x-4">
              {/* User Profile Dropdown */}
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={toggleProfileDropdown}
                  className="hidden lg:flex items-center space-x-2 px-3 py-2 rounded-md text-xs xl:text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors min-h-[44px]"
                  aria-label="User menu"
                >
                  <div className="w-8 h-8 xl:w-9 xl:h-9 bg-blue-600 rounded-full flex items-center justify-center text-white font-semibold text-xs">
                    {user?.firstName?.[0]}{user?.lastName?.[0]}
                  </div>
                  <span className="hidden xl:inline truncate max-w-[120px]">
                    {user?.firstName} {user?.lastName}
                  </span>
                  <svg
                    className={`w-4 h-4 transition-transform ${isProfileDropdownOpen ? "rotate-180" : ""}`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>

                {/* Dropdown Menu */}
                <AnimatePresence>
                  {isProfileDropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg py-1 z-50 border border-gray-200"
                    >
                      <div className="px-4 py-3 border-b border-gray-200">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {user?.firstName} {user?.lastName}
                        </p>
                        <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                        <p className="text-xs text-gray-500 capitalize mt-1">
                          Role: {user?.role}
                        </p>
                      </div>
                      <button
                        onClick={handleLogout}
                        className="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-gray-100 transition-colors flex items-center min-h-[44px]"
                      >
                        <span className="mr-2">🚪</span>
                        Logout
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Mobile Logout Button */}
              <button
                onClick={handleLogout}
                className="lg:hidden px-3 py-2 text-xs sm:text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors whitespace-nowrap min-h-[44px]"
                aria-label="Logout"
              >
                Logout
              </button>

              {/* Mobile menu button */}
              <button
                onClick={toggleMobileMenu}
                className="lg:hidden p-2 rounded-md text-gray-700 hover:bg-gray-100 min-h-[44px] min-w-[44px] flex items-center justify-center"
                aria-label="Toggle menu"
              >
                <svg
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  {isMobileMenuOpen ? (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  ) : (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 6h16M4 12h16M4 18h16"
                    />
                  )}
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <>
              {/* Backdrop */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="fixed inset-0 bg-black/50 z-30 lg:hidden"
                onClick={closeMobileMenu}
              />
              
              {/* Slide-out Menu */}
              <motion.div
                ref={mobileMenuRef}
                initial={{ x: "-100%" }}
                animate={{ x: 0 }}
                exit={{ x: "-100%" }}
                transition={{ type: "spring", damping: 25, stiffness: 300 }}
                className="fixed top-0 left-0 bottom-0 w-80 max-w-[85vw] bg-white shadow-xl z-40 lg:hidden overflow-y-auto"
              >
                {/* Menu Header */}
                <div className="flex items-center justify-between p-4 border-b border-gray-200 min-h-[64px]">
                  <h2 className="text-lg font-semibold text-gray-900">Menu</h2>
                  <button
                    onClick={closeMobileMenu}
                    className="p-2 rounded-md text-gray-700 hover:bg-gray-100 min-h-[44px] min-w-[44px] flex items-center justify-center"
                    aria-label="Close menu"
                  >
                    <svg
                      className="h-6 w-6"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>

                {/* User Info */}
                <div className="p-4 border-b border-gray-200 bg-gray-50">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white font-semibold text-lg">
                      {user?.firstName?.[0]}{user?.lastName?.[0]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {user?.firstName} {user?.lastName}
                      </p>
                      <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                      <p className="text-xs text-gray-500 capitalize mt-0.5">
                        Role: {user?.role}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Navigation Links */}
                <nav className="p-2" aria-label="Mobile navigation">
                  {navItems.map((item) => (
                    <NavLink
                      key={item.path}
                      to={item.path}
                      end={item.path === "/"}
                      onClick={closeMobileMenu}
                      className={({ isActive }) =>
                        `flex items-center px-4 py-3 rounded-lg text-base font-medium min-h-[48px] mb-1 transition-colors ${
                          isActive
                            ? "bg-blue-100 text-blue-700"
                            : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                        }`
                      }
                      aria-label={item.label}
                    >
                      <span className="mr-3 text-xl" aria-hidden="true">{item.icon}</span>
                      <span>{item.label}</span>
                    </NavLink>
                  ))}
                </nav>

                {/* Logout Button */}
                <div className="p-4 border-t border-gray-200 mt-auto">
                  <button
                    onClick={() => {
                      closeMobileMenu();
                      handleLogout();
                    }}
                    className="w-full flex items-center justify-center px-4 py-3 text-base font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors min-h-[48px]"
                  >
                    <span className="mr-2">🚪</span>
                    Logout
                  </button>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </header>

      {/* Main Content */}
      <main id="main-content" className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-4 sm:py-6 lg:py-8" tabIndex={-1}>
        <Suspense
          fallback={
            <div className="flex items-center justify-center min-h-[400px]">
              <LoadingSpinner size="large" />
            </div>
          }
        >
          <AnimatePresence mode="wait">
            <Outlet />
          </AnimatePresence>
        </Suspense>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-auto">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-3 sm:py-4">
          <p className="text-center text-xs sm:text-sm text-gray-500">
            © 2026 Gym Management System. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
