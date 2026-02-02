import { memo } from "react";
import { motion } from "framer-motion";

/**
 * StatsCard Component
 * Display key metrics with icon and trend
 */
export const StatsCard = memo(function StatsCard({
  title,
  value,
  subtitle,
  icon,
  trend,
  trendValue,
  color = "blue",
  className = "",
}) {
  const colorClasses = {
    blue: "from-blue-600/20 border-blue-500",
    emerald: "from-emerald-600/20 border-emerald-500",
    indigo: "from-indigo-600/20 border-indigo-500",
    violet: "from-violet-600/20 border-violet-500",
    red: "from-red-600/20 border-red-500",
    amber: "from-amber-600/20 border-amber-500",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`glass-morphism rounded-3xl p-6 border-l-4 ${colorClasses[color]} relative overflow-hidden group hover:scale-[1.02] transition-transform duration-300 ${className}`}
    >
      <div className={`absolute inset-0 bg-gradient-to-br ${colorClasses[color].split(" ")[0]} to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
      <div className="absolute -right-8 -top-8 text-[120px] opacity-[0.03] group-hover:scale-110 transition-transform duration-700">
        {icon}
      </div>
      
      <div className="relative z-10">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <p className="text-xs font-black uppercase tracking-wider text-gray-500 mb-2">
              {title}
            </p>
            <p className="text-4xl font-black italic tracking-tighter text-white">
              {value}
            </p>
          </div>
          <div className="text-4xl opacity-20 group-hover:opacity-40 transition-opacity">
            {icon}
          </div>
        </div>
        
        {subtitle && (
          <div className="flex items-center gap-2 mt-3">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">
              {subtitle}
            </p>
          </div>
        )}
        
        {trend && trendValue && (
          <div className={`flex items-center gap-2 mt-3 text-xs font-bold ${trend === "up" ? "text-emerald-400" : "text-red-400"}`}>
            <svg className={`w-4 h-4 ${trend === "down" ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
            </svg>
            <span>{trendValue}</span>
          </div>
        )}
      </div>
    </motion.div>
  );
});
