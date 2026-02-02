import { memo } from "react";
import { motion } from "framer-motion";

export const StatCard = memo(function StatCard({
  label,
  value,
  icon,
  trend,
  trendValue,
  className = "",
  ...props
}) {
  const isPositiveTrend = trend === "up";
  const isNegativeTrend = trend === "down";

  return (
    <motion.div
      className={`
        bg-dark-800 rounded-3xl p-6 sm:p-8
        border border-white/5
        hover:border-primary/20 transition-all duration-300
        shadow-dark
        dark:bg-dark-800 dark:border-white/5
        ${className}
      `}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      {...props}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-xs sm:text-sm font-semibold uppercase tracking-widest text-gray-400 mb-2 dark:text-gray-400">
            {label}
          </p>
          <p className="text-3xl sm:text-4xl lg:text-5xl font-bold text-primary mb-2 dark:text-primary">
            {value}
          </p>
          
          {(trend || trendValue) && (
            <div className="flex items-center gap-2 mt-3">
              {trend && (
                <span
                  className={`
                    flex items-center gap-1 text-sm font-semibold
                    ${isPositiveTrend ? "text-primary" : ""}
                    ${isNegativeTrend ? "text-red-500" : ""}
                    ${!isPositiveTrend && !isNegativeTrend ? "text-gray-400" : ""}
                  `}
                  aria-label={`Trend: ${trend}`}
                >
                  {isPositiveTrend && (
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                      <path fillRule="evenodd" d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
                    </svg>
                  )}
                  {isNegativeTrend && (
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                      <path fillRule="evenodd" d="M14.707 10.293a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L9 12.586V5a1 1 0 012 0v7.586l2.293-2.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  )}
                  {trendValue}
                </span>
              )}
            </div>
          )}
        </div>

        {icon && (
          <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary dark:bg-primary/10 dark:text-primary" aria-hidden="true">
            {icon}
          </div>
        )}
      </div>
    </motion.div>
  );
});
