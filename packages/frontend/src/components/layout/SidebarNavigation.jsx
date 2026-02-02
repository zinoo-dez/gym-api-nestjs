import { memo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useLocation } from "react-router-dom";

export const SidebarNavigation = memo(function SidebarNavigation({
  items = [],
  logo,
  footer,
  className = "",
  ...props
}) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const location = useLocation();

  const isActive = (path) => {
    return location.pathname === path || location.pathname.startsWith(path + "/");
  };

  return (
    <motion.aside
      className={`
        bg-dark-800 border-r border-white/5
        flex flex-col h-screen sticky top-0
        transition-all duration-300
        dark:bg-dark-800 dark:border-white/5
        ${isCollapsed ? "w-20" : "w-64"}
        ${className}
      `}
      initial={false}
      animate={{ width: isCollapsed ? 80 : 256 }}
      {...props}
    >
      {/* Header with Logo */}
      <div className="p-6 border-b border-white/5">
        <div className="flex items-center justify-between">
          {logo ? (
            <div className={`transition-opacity ${isCollapsed ? "opacity-0 w-0" : "opacity-100"}`}>
              {logo}
            </div>
          ) : (
            <div className={`flex items-center gap-3 ${isCollapsed ? "justify-center w-full" : ""}`}>
              <div className="w-8 h-8 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center">
                <span className="text-dark-900 font-bold text-lg">G</span>
              </div>
              {!isCollapsed && (
                <span className="text-white font-bold text-xl dark:text-white">
                  Gym Pro
                </span>
              )}
            </div>
          )}
          
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-2 hover:bg-white/5 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-primary"
            aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            aria-expanded={!isCollapsed}
          >
            <svg
              className={`w-5 h-5 text-gray-400 transition-transform ${isCollapsed ? "rotate-180" : ""}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
            </svg>
          </button>
        </div>
      </div>

      {/* Navigation Items */}
      <nav className="flex-1 overflow-y-auto py-6 px-3" role="navigation" aria-label="Main navigation">
        <ul className="space-y-1" role="list">
          {items.map((item, index) => {
            const active = isActive(item.path);
            
            return (
              <li key={item.path || index}>
                <Link
                  to={item.path}
                  className={`
                    flex items-center gap-3 px-3 py-3 rounded-xl
                    transition-all duration-200 group
                    ${active 
                      ? "bg-primary/10 text-primary" 
                      : "text-gray-400 hover:text-white hover:bg-white/5"
                    }
                    ${isCollapsed ? "justify-center" : ""}
                  `}
                  aria-current={active ? "page" : undefined}
                  title={isCollapsed ? item.label : undefined}
                >
                  <span className={`w-5 h-5 flex-shrink-0 ${active ? "text-primary" : "text-gray-400 group-hover:text-white"}`}>
                    {item.icon}
                  </span>
                  
                  <AnimatePresence>
                    {!isCollapsed && (
                      <motion.span
                        className="font-semibold text-sm"
                        initial={{ opacity: 0, width: 0 }}
                        animate={{ opacity: 1, width: "auto" }}
                        exit={{ opacity: 0, width: 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        {item.label}
                      </motion.span>
                    )}
                  </AnimatePresence>

                  {!isCollapsed && item.badge && (
                    <span className="ml-auto px-2 py-0.5 bg-primary/20 text-primary text-xs font-bold rounded-full">
                      {item.badge}
                    </span>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Footer */}
      {footer && (
        <div className="p-4 border-t border-white/5">
          {footer}
        </div>
      )}
    </motion.aside>
  );
});
