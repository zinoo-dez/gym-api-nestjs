import { useRef, useEffect, Suspense } from "react";
import { Outlet, NavLink, useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth.js";
import { useUIStore } from "../../stores/useUIStore.js";
import { motion, AnimatePresence } from "framer-motion";
import { LoadingSpinner, SkipNavigation, ThemeSwitcher } from "../common/index.js";

/**
 * AdminLayout - Layout for admin dashboard with full CRUD controls
 */
export function AdminLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { sidebarOpen: isMobileMenuOpen, setSidebarOpen: setIsMobileMenuOpen, activeModal, openModal, closeModal } = useUIStore();
  const dropdownRef = useRef(null);
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

  const adminNavItems = [
    { path: "/admin", label: "Dashboard", icon: "⚡" },
    { path: "/admin/members", label: "Members", icon: "👥" },
    { path: "/admin/trainers", label: "Trainers", icon: "💪" },
    { path: "/admin/classes", label: "Classes", icon: "🎯" },
    { path: "/admin/memberships", label: "Plans", icon: "💎" },
    { path: "/admin/attendance", label: "Attendance", icon: "✓" },
    { path: "/admin/workouts", label: "Workouts", icon: "🔥" },
    { path: "/admin/users", label: "Users", icon: "👤" },
  ];

  return (
    <div className="min-h-screen bg-[#050505] text-white relative overflow-x-hidden">
      {/* Background Elements */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-10%] right-[-5%] w-[600px] h-[600px] bg-blue-600/10 blur-[130px] rounded-full animate-pulse" />
        <div className="absolute bottom-[10%] left-[-10%] w-[700px] h-[700px] bg-indigo-600/5 blur-[150px] rounded-full" />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03]" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:40px_40px]" />
      </div>

      <SkipNavigation />
      
      {/* Header */}
      <header className="fixed top-0 w-full z-50 bg-black/40 backdrop-blur-xl border-b border-white/5" id="navigation">
        <div className="max-w-[1920px] mx-auto px-3 sm:px-4 lg:px-8">
          <div className="flex justify-between items-center h-16 sm:h-20">
            {/* Logo */}
            <Link to="/admin" className="flex items-center gap-3 min-w-0 flex-1 group">
              <div className="w-9 h-9 sm:w-10 sm:h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20 group-hover:scale-110 transition-transform">
                <span className="text-white font-black text-lg sm:text-xl italic">A</span>
              </div>
              <h1 className="text-base sm:text-xl font-black bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent italic tracking-tighter uppercase truncate">
                Admin Control
              </h1>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex space-x-1 xl:space-x-2" aria-label="Main navigation">
              {adminNavItems.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  end={item.path === "/admin"}
                  className={({ isActive }) =>
                    `px-3 xl:px-4 py-2.5 rounded-xl text-[10px] xl:text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap min-h-[44px] flex items-center gap-2 ${
                      isActive
                        ? "bg-blue-600 text-white shadow-lg shadow-blue-500/20"
                        : "text-gray-400 hover:bg-white/5 hover:text-white"
                    }`
                  }
                  aria-label={item.label}
                >
                  <span className="text-base" aria-hidden="true">{item.icon}</span>
                  <span className="hidden xl:inline">{item.label}</span>
                </NavLink>
              ))}
            </nav>

            {/* User Menu */}
            <div className="flex items-center space-x-2 sm:space-x-3">
              {/* Theme Switcher */}
              <div className="hidden sm:block">
                <ThemeSwitcher />
              </div>

              {/* Back to Dashboard Link */}
              <Link
                to="/dashboard"
                className="hidden lg:flex items-center gap-2 px-3 xl:px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest text-gray-400 hover:bg-white/5 hover:text-white transition-all min-h-[44px] border border-white/10"
              >
                <span>←</span>
                <span className="hidden xl:inline">Dashboard</span>
              </Link>

              {/* User Profile Dropdown */}
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={toggleProfileDropdown}
                  className="hidden lg:flex items-center space-x-2 xl:space-x-3 px-3 xl:px-4 py-2.5 rounded-xl text-xs font-bold text-white hover:bg-white/5 transition-all min-h-[44px] border border-white/10"
                  aria-label="User menu"
                >
                  <div className="w-8 h-8 xl:w-9 xl:h-9 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center text-white font-black text-xs shadow-lg shadow-blue-500/20">
                    {user?.firstName?.[0]}{user?.lastName?.[0]}
                  </div>
                  <span className="hidden xl:inline truncate max-w-[120px] text-[10px] uppercase tracking-wider">
                    {user?.firstName} {user?.lastName}
                  </span>
                  <svg
                    className={`w-3 h-3 transition-transform ${isProfileDropdownOpen ? "rotate-180" : ""}`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                <AnimatePresence>
                  {isProfileDropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 mt-3 w-64 bg-black/90 backdrop-blur-xl rounded-2xl shadow-2xl py-2 z-50 border border-white/10"
                    >
                      <div className="px-5 py-4 border-b border-white/10">
                        <p className="text-sm font-black text-white truncate uppercase tracking-wide">
                          {user?.firstName} {user?.lastName}
                        </p>
                        <p className="text-[10px] text-gray-400 truncate mt-1">{user?.email}</p>
                        <p className="text-[10px] text-blue-400 capitalize mt-2 font-bold uppercase tracking-widest">
                          {user?.role}
                        </p>
                      </div>
                      <button
                        onClick={handleLogout}
                        className="w-full text-left px-5 py-4 text-xs font-bold text-red-400 hover:bg-white/5 transition-colors flex items-center min-h-[44px] gap-3 uppercase tracking-wider"
                      >
                        <span className="text-base">🚪</span>
                        Exit System
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Mobile Logout Button */}
              <button
                onClick={handleLogout}
                className="lg:hidden px-4 py-2.5 text-[10px] font-black uppercase tracking-widest text-white bg-red-600/80 rounded-xl hover:bg-red-600 transition-all whitespace-nowrap min-h-[44px] border border-red-500/20"
                aria-label="Logout"
              >
                Exit
              </button>

              {/* Mobile menu button */}
              <button
                onClick={toggleMobileMenu}
                className="lg:hidden p-2.5 rounded-xl text-white hover:bg-white/5 min-h-[44px] min-w-[44px] flex items-center justify-center border border-white/10 transition-all"
                aria-label="Toggle menu"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  {isMobileMenuOpen ? (
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
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
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="fixed inset-0 bg-black/70 backdrop-blur-sm z-30 lg:hidden"
                onClick={closeMobileMenu}
              />
              
              <motion.div
                initial={{ x: "-100%" }}
                animate={{ x: 0 }}
                exit={{ x: "-100%" }}
                transition={{ type: "spring", damping: 25, stiffness: 300 }}
                className="fixed top-0 left-0 bottom-0 w-80 max-w-[85vw] bg-black/95 backdrop-blur-xl shadow-2xl z-40 lg:hidden overflow-y-auto border-r border-white/10"
              >
                <div className="flex items-center justify-between p-5 border-b border-white/10 min-h-[80px]">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
                      <span className="text-white font-black text-lg italic">A</span>
                    </div>
                    <h2 className="text-base font-black text-white uppercase italic tracking-tighter">Admin Control</h2>
                  </div>
                  <button
                    onClick={closeMobileMenu}
                    className="p-2 rounded-xl text-white hover:bg-white/5 min-h-[44px] min-w-[44px] flex items-center justify-center border border-white/10 transition-all"
                    aria-label="Close menu"
                  >
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                <div className="p-5 border-b border-white/10 bg-white/[0.02]">
                  <div className="flex items-center space-x-3">
                    <div className="w-14 h-14 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center text-white font-black text-lg shadow-lg shadow-blue-500/20">
                      {user?.firstName?.[0]}{user?.lastName?.[0]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-black text-white truncate uppercase tracking-wide">
                        {user?.firstName} {user?.lastName}
                      </p>
                      <p className="text-[10px] text-gray-400 truncate mt-1">{user?.email}</p>
                      <p className="text-[10px] text-blue-400 capitalize mt-1.5 font-bold uppercase tracking-widest">
                        {user?.role}
                      </p>
                    </div>
                  </div>
                </div>

                <nav className="p-3" aria-label="Mobile navigation">
                  {adminNavItems.map((item) => (
                    <NavLink
                      key={item.path}
                      to={item.path}
                      end={item.path === "/admin"}
                      onClick={closeMobileMenu}
                      className={({ isActive }) =>
                        `flex items-center px-5 py-4 rounded-xl text-xs font-black uppercase tracking-wider min-h-[52px] mb-2 transition-all ${
                          isActive
                            ? "bg-blue-600 text-white shadow-lg shadow-blue-500/20"
                            : "text-gray-400 hover:bg-white/5 hover:text-white"
                        }`
                      }
                      aria-label={item.label}
                    >
                      <span className="mr-4 text-xl" aria-hidden="true">{item.icon}</span>
                      <span>{item.label}</span>
                    </NavLink>
                  ))}
                </nav>

                <div className="p-5 border-t border-white/10 mt-auto">
                  <Link
                    to="/dashboard"
                    onClick={closeMobileMenu}
                    className="w-full flex items-center justify-center gap-3 px-5 py-4 text-xs font-black uppercase tracking-widest text-white bg-white/5 rounded-xl hover:bg-white/10 transition-all min-h-[52px] border border-white/10 mb-3"
                  >
                    <span className="text-lg">←</span>
                    Back to Dashboard
                  </Link>
                  <button
                    onClick={() => {
                      closeMobileMenu();
                      handleLogout();
                    }}
                    className="w-full flex items-center justify-center gap-3 px-5 py-4 text-xs font-black uppercase tracking-widest text-white bg-red-600/80 rounded-xl hover:bg-red-600 transition-all min-h-[52px] border border-red-500/20"
                  >
                    <span className="text-lg">🚪</span>
                    Exit System
                  </button>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </header>

      {/* Main Content */}
      <main id="main-content" className="relative z-10 max-w-[1920px] mx-auto px-3 sm:px-4 lg:px-8 pt-20 sm:pt-24 pb-8 sm:pb-12 lg:pb-16" tabIndex={-1}>
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
      <footer className="relative z-10 border-t border-white/5 bg-black/40 backdrop-blur-xl mt-auto">
        <div className="max-w-[1920px] mx-auto px-3 sm:px-4 lg:px-8 py-6 sm:py-8">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center shadow-lg shadow-blue-500/20">
                <span className="text-white font-black text-sm italic">A</span>
              </div>
              <span className="text-sm font-black tracking-tighter uppercase italic text-white/80">Admin Control</span>
            </div>
            <p className="text-center text-[10px] sm:text-xs text-gray-600 uppercase tracking-[0.2em] font-bold">
              © 2026 GP Management. All Rights Reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
