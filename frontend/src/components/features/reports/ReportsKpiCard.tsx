import type { LucideIcon } from "lucide-react";
import { ArrowDownRight, ArrowUpRight, Minus } from "lucide-react";

import type { TrendDirection } from "@/features/reports";
import { Card, CardContent } from "@/components/ui/Card";
import { cn } from "@/lib/utils";

import { KpiCardSkeleton } from "./ReportsSkeleton";

interface ReportsKpiCardProps {
  title: string;
  valueLabel: string;
  trendPercent: number;
  trendDirection: TrendDirection;
  helperText: string;
  icon: LucideIcon;
  loading?: boolean;
}

const formatTrendLabel = (trendPercent: number): string => {
  const absoluteValue = Math.abs(trendPercent);

  if (absoluteValue < 0.01) {
    return "0%";
  }

  return `${absoluteValue.toFixed(1)}%`;
};

export function ReportsKpiCard({
  title,
  valueLabel,
  trendPercent,
  trendDirection,
  helperText,
  icon: Icon,
  loading = false,
}: ReportsKpiCardProps) {
  if (loading) {
    return <KpiCardSkeleton />;
  }

  const TrendIcon = trendDirection === "up" ? ArrowUpRight : trendDirection === "down" ? ArrowDownRight : Minus;

  return (
    <Card className="shadow-sm">
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-3">
            <p className="small-text">{title}</p>
            <p className="text-2xl font-semibold tracking-tight text-foreground md:text-3xl">{valueLabel}</p>
            <div className="flex items-center gap-2">
              <span
                className={cn(
                  "inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-semibold",
                  trendDirection === "up" && "bg-success/15 text-success",
                  trendDirection === "down" && "bg-danger/15 text-danger",
                  trendDirection === "flat" && "bg-muted text-muted-foreground",
                )}
              >
                <TrendIcon className="size-3.5" />
                {formatTrendLabel(trendPercent)}
              </span>
              <span className="meta-text">{helperText}</span>
            </div>
          </div>

          <div className="flex size-11 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Icon className="size-5" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
