import { MaterialIcon } from "@/components/ui/MaterialIcon";
import {
  MembershipOverviewMetrics,
  MembershipQuickFilter,
  formatCurrency,
  getMembershipRevenuePeriodLabel,
} from "@/features/memberships";

interface MembershipOverviewKpisProps {
  metrics: MembershipOverviewMetrics;
  activeFilter: MembershipQuickFilter;
  onFilterChange: (filter: MembershipQuickFilter) => void;
  revenuePeriodDays: number;
}

interface KpiCardProps {
  title: string;
  value: string;
  icon: string;
  tone: "primary" | "success" | "warning" | "danger" | "info";
  helperText?: string;
  active: boolean;
  onClick: () => void;
}

const TONE_STYLES: Record<KpiCardProps["tone"], string> = {
  primary: "bg-primary-container text-on-primary-container",
  success: "bg-tertiary-container text-on-tertiary-container",
  warning: "bg-error-container text-on-error-container",
  danger: "bg-error text-on-error",
  info: "bg-secondary-container text-on-secondary-container",
};

function KpiCard({
  title,
  value,
  icon,
  tone,
  helperText,
  active,
  onClick,
}: KpiCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`relative flex flex-col items-start justify-between gap-4 rounded-2xl border p-5 text-left transition-all duration-200 hover:shadow-md active:scale-[0.98] ${
        active 
          ? "border-primary bg-primary/5 ring-1 ring-primary shadow-sm" 
          : "border-outline-variant bg-surface-container-low hover:bg-surface-container hover:border-outline"
      }`}
    >
      <div className="flex w-full items-start justify-between gap-3">
        <div className="space-y-1.5 min-w-0">
          <p className="text-label-medium font-bold text-on-surface-variant line-clamp-1">{title}</p>
          <p className="text-headline-small font-bold tracking-tight text-on-surface">{value}</p>
          {helperText ? (
            <p className="text-body-small text-on-surface-variant font-medium">{helperText}</p>
          ) : null}
        </div>
        <div className={`flex size-12 shrink-0 items-center justify-center rounded-2xl shadow-sm transition-transform ${TONE_STYLES[tone]}`}>
          <MaterialIcon icon={icon} className="text-2xl" />
        </div>
      </div>
      
      {active && (
        <div className="absolute top-2 right-2 flex size-5 items-center justify-center rounded-full bg-primary shadow-sm">
          <MaterialIcon icon="check" className="text-on-primary text-sm" weight={700} opticalSize={16} />
        </div>
      )}
    </button>
  );
}

export function MembershipOverviewKpis({
  metrics,
  activeFilter,
  onFilterChange,
  revenuePeriodDays,
}: MembershipOverviewKpisProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
      <KpiCard
        title="Active Members"
        value={String(metrics.totalActiveMemberships)}
        icon="how_to_reg"
        tone="success"
        active={activeFilter === "active"}
        onClick={() => onFilterChange("active")}
      />
      <KpiCard
        title="Expiring Soon"
        value={String(metrics.expiringSoon)}
        icon="notification_important"
        tone="warning"
        active={activeFilter === "expiring_soon"}
        onClick={() => onFilterChange("expiring_soon")}
      />
      <KpiCard
        title="Expired"
        value={String(metrics.expired)}
        icon="history"
        tone="danger"
        active={activeFilter === "expired"}
        onClick={() => onFilterChange("expired")}
      />
      <KpiCard
        title="Frozen"
        value={String(metrics.frozen)}
        icon="ac_unit"
        tone="info"
        active={activeFilter === "frozen"}
        onClick={() => onFilterChange("frozen")}
      />
      <KpiCard
        title="Revenue"
        value={formatCurrency(metrics.totalMembershipRevenue)}
        helperText={getMembershipRevenuePeriodLabel(revenuePeriodDays)}
        icon="payments"
        tone="primary"
        active={activeFilter === "all"}
        onClick={() => onFilterChange("all")}
      />
    </div>
  );
}
