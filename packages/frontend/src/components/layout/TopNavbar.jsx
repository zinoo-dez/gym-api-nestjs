import { memo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";

export const TopNavbar = memo(function TopNavbar({
  logo,
  items = [],
  actions,
  user,
  onMenuToggle,
  className = "",
  ...props
}) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
    onMenuToggle?.(!isMobileMenuOpen);
  };

  return (
    <>
      <motion.nav
        className={`
          bg-dark-900/95 backdrop-blur-lg border-b border-white/5
          sticky top-0 z-50
          dark:bg-dark-900/95 dark:border-white/5
          ${className}
        `}
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.3 }}
        {...props}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-20">
            {/* Logo */}
            <div className="flex items-center gap-8">
              {logo ? (
                <Link to="/" className="flex-shrink-0">
                  {logo}
                </Link>
              ) : (
                <Link to="/" className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center">
                    <span className="text-dark-900 font-bold text-xl">G</span>
                  </div>
                  <span className="text-white font-bold text-xl hidden sm:block dark:text-white">
                    Gym Pro
                  </span>
                </Link>
              )}

              {/* Desktop Navigation */}
              <ul className="hidden lg:flex items-center gap-1" role="list">
                {items.map((item, index) => (
                  <li key={item.path || index}>
                    <Link
                      to={item.path}
                      className="px-4 py-2 text-gray-300 hover:text-white hover:bg-white/5 rounded-lg transition-colors font-medium text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Actions & User Menu */}
            <div className="flex items-center gap-4">
              {/* Custom Actions */}
              {actions && (
                <div className="hidden sm:flex items-center gap-3">
                  {actions}
                </div>
              )}

              {/* User Menu */}
              {user && (
                <div className="relative">
                  <button
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    className="flex items-center gap-3 p-2 hover:bg-white/5 rounded-xl transition-colors focus:outline-none focus:ring-2 focus:ring-primary"
                    aria-expanded={isUserMenuOpen}
                    aria-haspopup="true"
                    aria-label="User menu"
                  >
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                      {user.avatar ? (
                        <img src={user.avatar} alt={user.name} className="w-full h-full rounded-full object-cover" />
                      ) : (
                        <span className="text-dark-900 font-bold text-sm">
                          {user.name?.charAt(0).toUpperCase()}
                        </span>
                      )}
                    </div>
                    <div className="hidden md:block text-left">
                      <p className="text-white text-sm font-semibold dark:text-white">
                        {user.name}
                      </p>
                      {user.role && (
                        <p className="text-gray-400 text-xs dark:text-gray-400">
                          {user.role}
                        </p>
                      )}
                    </div>
                    <svg
                      className={`w-4 h-4 text-gray-400 transition-transform hidden md:block ${isUserMenuOpen ? "rotate-180" : ""}`}
                      fill="currentColor"
                      viewBox="0 0 20 20"
                      aria-hidden="true"
                    >
                      <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </button>

                  {/* User Dropdown */}
                  <AnimatePresence>
                    {isUserMenuOpen && user.menuItems && (
                      <motion.div
                        className="absolute right-0 mt-2 w-56 bg-dark-800 border border-white/10 rounded-2xl shadow-dark overflow-hidden"
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                      >
                        <ul className="py-2" role="menu">
                          {user.menuItems.map((item, index) => (
                            <li key={index} role="none">
                              <button
                                onClick={() => {
                                  item.onClick?.();
                                  setIsUserMenuOpen(false);
                                }}
                                className="w-full text-left px-4 py-3 text-gray-300 hover:bg-white/5 hover:text-white transition-colors text-sm flex items-center gap-3"
                                role="menuitem"
                              >
                                {item.icon && <span className="w-5 h-5">{item.icon}</span>}
                                {item.label}
                              </button>
                            </li>
                          ))}
                        </ul>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}

              {/* Mobile Menu Button */}
              <button
                onClick={toggleMobileMenu}
                className="lg:hidden p-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-primary"
                aria-expanded={isMobileMenuOpen}
                aria-label="Toggle mobile menu"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  {isMobileMenuOpen ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  )}
                </svg>
              </button>
            </div>
          </div>
        </div>
      </motion.nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            className="lg:hidden fixed inset-0 z-40 bg-dark-900/98 backdrop-blur-lg"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <div className="pt-24 px-4 pb-6">
              <ul className="space-y-2" role="list">
                {items.map((item, index) => (
                  <li key={item.path || index}>
                    <Link
                      to={item.path}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="block px-4 py-3 text-gray-300 hover:text-white hover:bg-white/5 rounded-xl transition-colors font-medium"
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>

              {actions && (
                <div className="mt-6 pt-6 border-t border-white/10 space-y-3">
                  {actions}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
});
