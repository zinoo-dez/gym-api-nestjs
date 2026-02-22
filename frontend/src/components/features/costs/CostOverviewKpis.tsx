import type { ComponentType } from "react";
import {
  CalendarRange,
  Layers,
  ListChecks,
  Tags,
  TrendingUp,
} from "lucide-react";

import {
  CostMetrics,
  CostQuickFilter,
  formatCurrency,
  getHighestCostCategoryLabel,
} from "@/features/costs";

interface CostOverviewKpisProps {
  metrics: CostMetrics;
  activeFilter: CostQuickFilter;
  onFilterChange: (filter: CostQuickFilter) => void;
}

interface KpiCardProps {
  title: string;
  value: string;
  icon: ComponentType<{ className?: string }>;
  tone: "primary" | "success" | "warning" | "info" | "secondary";
  active: boolean;
  helperText?: string;
  onClick: () => void;
}

const TONE_STYLES: Record<KpiCardProps["tone"], string> = {
  primary: "bg-primary/10 text-primary",
  success: "bg-success/15 text-success",
  warning: "bg-warning/15 text-warning",
  info: "bg-info/15 text-info",
  secondary: "bg-secondary text-secondary-foreground",
};

function KpiCard({
  title,
  value,
  icon: Icon,
  tone,
  active,
  helperText,
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

export function CostOverviewKpis({ metrics, activeFilter, onFilterChange }: CostOverviewKpisProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
      <KpiCard
        title="Total Costs (Current Month)"
        value={formatCurrency(metrics.totalCurrentMonth)}
        icon={TrendingUp}
        tone="primary"
        active={activeFilter === "current_month"}
        onClick={() => onFilterChange("current_month")}
      />
      <KpiCard
        title="Fixed Costs"
        value={formatCurrency(metrics.fixedCurrentMonth)}
        icon={Layers}
        tone="success"
        active={activeFilter === "fixed"}
        onClick={() => onFilterChange("fixed")}
      />
      <KpiCard
        title="Variable Costs"
        value={formatCurrency(metrics.variableCurrentMonth)}
        icon={ListChecks}
        tone="warning"
        active={activeFilter === "variable"}
        onClick={() => onFilterChange("variable")}
      />
      <KpiCard
        title="Highest Cost Category"
        value={getHighestCostCategoryLabel(metrics)}
        helperText={formatCurrency(metrics.highestCostCategoryTotal)}
        icon={Tags}
        tone="info"
        active={activeFilter === "highest_category"}
        onClick={() => onFilterChange("highest_category")}
      />
      <KpiCard
        title="Year-to-Date Costs"
        value={formatCurrency(metrics.yearToDateTotal)}
        icon={CalendarRange}
        tone="secondary"
        active={activeFilter === "ytd"}
        onClick={() => onFilterChange("ytd")}
      />
    </div>
  );
}
