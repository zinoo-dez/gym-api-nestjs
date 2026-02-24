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
            <p className="text-label-medium font-medium text-on-surface-variant">{title}</p>
            <p className="text-headline-medium font-bold tracking-tight text-on-surface">{valueLabel}</p>
            <div className="flex items-center gap-2">
              <span
                className={cn(
                  "inline-flex items-center gap-1 rounded-full px-3 py-1 text-label-small font-bold",
                  trendDirection === "up" && "bg-success-container text-on-success-container",
                  trendDirection === "down" && "bg-error-container text-on-error-container",
                  trendDirection === "flat" && "bg-surface-container-highest text-on-surface-variant",
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
              <span className="text-body-small text-on-surface-variant">{helperText}</span>
            </div>
          </div>

          <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-primary-container text-on-primary-container shadow-sm">
            <MaterialIcon icon={icon} className="text-2xl" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
