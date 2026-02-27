import type { TrendDirection } from "@/features/reports";
import { Card, CardContent } from "@/components/ui/Card";
import { cn } from "@/lib/utils";
import { MaterialIcon } from "@/components/ui/MaterialIcon";

import { KpiCardSkeleton } from "./ReportsSkeleton";

interface ReportsKpiCardProps {
  title: string;
  valueLabel: string;
  trendPercent: number;
  trendDirection: TrendDirection;
  helperText: string;
  icon: string;
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
  icon,
  loading = false,
}: ReportsKpiCardProps) {
  if (loading) {
    return <KpiCardSkeleton />;
  }

  const trendIcon = trendDirection === "up" ? "arrow_outward" : trendDirection === "down" ? "south_east" : "remove";

  return (
    <Card variant="elevated" className="overflow-hidden">
      <CardContent className="p-6">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-4">
            <p className="text-xs font-medium text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold tracking-tight text-foreground">{valueLabel}</p>
            <div className="flex items-center gap-2">
              <span
                className={cn(
                  "inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-bold",
                  trendDirection === "up" && "bg-success/10 text-success",
                  trendDirection === "down" && "bg-destructive/10 text-destructive",
                  trendDirection === "flat" && "bg-card text-muted-foreground",
                )}
              >
                <MaterialIcon 
                  icon={trendIcon} 
                  className="text-sm" 
                  opticalSize={16} 
                  weight={700}
                />
                {formatTrendLabel(trendPercent)}
              </span>
              <span className="text-xs text-muted-foreground">{helperText}</span>
            </div>
          </div>

          <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary shadow-sm">
            <MaterialIcon icon={icon} className="text-2xl" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
