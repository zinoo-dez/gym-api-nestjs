import { AlertTriangle, BadgeDollarSign, TrendingUp, type LucideIcon } from "lucide-react";

import { Card, CardContent } from "@/components/ui/Card";
import { formatCurrency } from "@/lib/currency";
import type { TopSellingProduct } from "@/services/product-sales.service";

interface ProductSummaryCardsProps {
  sectionId: string;
  todayRevenueLoading: boolean;
  todayRevenue: number;
  topSellingLoading: boolean;
  topSellingProduct: TopSellingProduct | null;
  lowStockCount: number;
}

interface SummaryCardProps {
  title: string;
  value: string;
  helper?: string;
  icon: LucideIcon;
  tone: "info" | "success" | "warning";
}

const SUMMARY_TONES: Record<SummaryCardProps["tone"], string> = {
  info: "bg-info/15 text-info",
  success: "bg-success/20 text-success",
  warning: "bg-warning/20 text-warning",
};

function SummaryCard({ title, value, helper, icon: Icon, tone }: SummaryCardProps) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-2xl font-semibold tracking-tight text-foreground">{value}</p>
            {helper ? <p className="text-xs text-muted-foreground">{helper}</p> : null}
          </div>
          <div className={`rounded-full p-2 ${SUMMARY_TONES[tone]}`}>
            <Icon className="size-5" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function ProductSummaryCards({
  sectionId,
  todayRevenueLoading,
  todayRevenue,
  topSellingLoading,
  topSellingProduct,
  lowStockCount,
}: ProductSummaryCardsProps) {
  return (
    <section id={sectionId} className="grid gap-4 md:grid-cols-3 scroll-mt-24">
      <SummaryCard
        title="Total Revenue (Today)"
        value={todayRevenueLoading ? "Loading..." : formatCurrency(todayRevenue)}
        helper="Based on today completed sales"
        icon={BadgeDollarSign}
        tone="success"
      />

      <SummaryCard
        title="Top Selling Product"
        value={topSellingLoading ? "Loading..." : topSellingProduct ? topSellingProduct.name : "No sales yet"}
        helper={
          topSellingProduct
            ? `${topSellingProduct.quantitySold} sold in last 30 days`
            : "No transactions in last 30 days"
        }
        icon={TrendingUp}
        tone="info"
      />

      <SummaryCard
        title="Low Stock Alerts"
        value={String(lowStockCount)}
        helper="Products under low-stock threshold"
        icon={AlertTriangle}
        tone="warning"
      />
    </section>
  );
}
