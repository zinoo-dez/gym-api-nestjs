import type { ComponentType } from "react";
import { AlertTriangle, BadgeCheck, Snowflake, Wallet, XCircle } from "lucide-react";

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
  icon: ComponentType<{ className?: string }>;
  tone: "primary" | "success" | "warning" | "danger" | "info";
  helperText?: string;
  active: boolean;
  onClick: () => void;
}

const TONE_STYLES: Record<KpiCardProps["tone"], string> = {
  primary: "bg-primary/10 text-primary",
  success: "bg-success/20 text-success",
  warning: "bg-warning/20 text-warning",
  danger: "bg-danger/20 text-danger",
  info: "bg-info/20 text-info",
};

function KpiCard({
  title,
  value,
  icon: Icon,
  tone,
  helperText,
  active,
  onClick,
}: KpiCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-lg border bg-card p-4 text-left shadow-sm transition-colors hover:bg-muted/30 ${
        active ? "border-primary" : "border-border"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className="text-2xl font-semibold tracking-tight text-foreground">{value}</p>
          {helperText ? <p className="text-xs text-muted-foreground">{helperText}</p> : null}
        </div>
        <div className={`rounded-full p-2 ${TONE_STYLES[tone]}`}>
          <Icon className="size-5" />
        </div>
      </div>
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
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
      <KpiCard
        title="Total Active Memberships"
        value={String(metrics.totalActiveMemberships)}
        icon={BadgeCheck}
        tone="success"
        active={activeFilter === "active"}
        onClick={() => onFilterChange("active")}
      />
      <KpiCard
        title="Expiring Soon"
        value={String(metrics.expiringSoon)}
        icon={AlertTriangle}
        tone="warning"
        active={activeFilter === "expiring_soon"}
        onClick={() => onFilterChange("expiring_soon")}
      />
      <KpiCard
        title="Expired"
        value={String(metrics.expired)}
        icon={XCircle}
        tone="danger"
        active={activeFilter === "expired"}
        onClick={() => onFilterChange("expired")}
      />
      <KpiCard
        title="Frozen"
        value={String(metrics.frozen)}
        icon={Snowflake}
        tone="info"
        active={activeFilter === "frozen"}
        onClick={() => onFilterChange("frozen")}
      />
      <KpiCard
        title="Total Membership Revenue"
        value={formatCurrency(metrics.totalMembershipRevenue)}
        helperText={getMembershipRevenuePeriodLabel(revenuePeriodDays)}
        icon={Wallet}
        tone="primary"
        active={activeFilter === "all"}
        onClick={() => onFilterChange("all")}
      />
    </div>
  );
}
