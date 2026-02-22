import type { ComponentType } from "react";
import { AlertTriangle, Clock3, HandCoins, Wallet2 } from "lucide-react";

import { CostPaymentMetrics, formatCurrency } from "@/features/costs";

interface CostPaymentHealthCardsProps {
  metrics: CostPaymentMetrics;
}

interface MetricCardProps {
  title: string;
  value: string;
  tone: "success" | "warning" | "danger" | "info";
  icon: ComponentType<{ className?: string }>;
}

const TONE_STYLES: Record<MetricCardProps["tone"], string> = {
  success: "bg-success/15 text-success",
  warning: "bg-warning/15 text-warning",
  danger: "bg-danger/15 text-danger",
  info: "bg-info/15 text-info",
};

function MetricCard({ title, value, tone, icon: Icon }: MetricCardProps) {
  return (
    <div className="rounded-lg border bg-card p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className="text-2xl font-semibold tracking-tight text-foreground">{value}</p>
        </div>
        <div className={`rounded-full p-2 ${TONE_STYLES[tone]}`}>
          <Icon className="size-5" />
        </div>
      </div>
    </div>
  );
}

export function CostPaymentHealthCards({ metrics }: CostPaymentHealthCardsProps) {
  return (
    <section className="space-y-4">
      <h3 className="card-title">Payment Health</h3>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          title="Paid Amount"
          value={formatCurrency(metrics.paidAmount)}
          tone="success"
          icon={HandCoins}
        />
        <MetricCard
          title="Pending Amount"
          value={formatCurrency(metrics.pendingAmount)}
          tone="warning"
          icon={Clock3}
        />
        <MetricCard
          title="Overdue Amount"
          value={formatCurrency(metrics.overdueAmount)}
          tone="danger"
          icon={AlertTriangle}
        />
        <MetricCard
          title="Due in 7 Days"
          value={formatCurrency(metrics.dueSoonAmount)}
          tone="info"
          icon={Wallet2}
        />
      </div>
    </section>
  );
}
