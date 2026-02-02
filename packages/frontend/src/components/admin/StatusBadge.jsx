import { memo } from "react";

/**
 * StatusBadge Component
 * Display status with color coding
 */
export const StatusBadge = memo(function StatusBadge({ status, className = "" }) {
  const statusConfig = {
    active: { label: "Active", color: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" },
    inactive: { label: "Inactive", color: "bg-gray-500/10 text-gray-400 border-gray-500/20" },
    expired: { label: "Expired", color: "bg-red-500/10 text-red-400 border-red-500/20" },
    pending: { label: "Pending", color: "bg-amber-500/10 text-amber-400 border-amber-500/20" },
    scheduled: { label: "Scheduled", color: "bg-blue-500/10 text-blue-400 border-blue-500/20" },
    completed: { label: "Completed", color: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" },
    cancelled: { label: "Cancelled", color: "bg-red-500/10 text-red-400 border-red-500/20" },
  };

  const config = statusConfig[status] || statusConfig.inactive;

  return (
    <span
      className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-black uppercase tracking-wider border ${config.color} ${className}`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
      {config.label}
    </span>
  );
});
