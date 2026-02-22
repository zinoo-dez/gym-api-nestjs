import type { LucideIcon } from "lucide-react";

import { Card, CardContent } from "@/components/ui/Card";
import { cn } from "@/lib/utils";

type RibbonTone = "success" | "warning" | "danger" | "info";

const toneStyles: Record<RibbonTone, { icon: string; border: string }> = {
  success: {
    icon: "bg-success/15 text-success",
    border: "border-success/40",
  },
  warning: {
    icon: "bg-warning/20 text-warning",
    border: "border-warning/40",
  },
  danger: {
    icon: "bg-danger/15 text-danger",
    border: "border-danger/40",
  },
  info: {
    icon: "bg-info/15 text-info",
    border: "border-info/40",
  },
};

interface FinancialSummaryRibbonProps {
  title: string;
  value: string;
  subtitle: string;
  icon: LucideIcon;
  tone: RibbonTone;
}

export function FinancialSummaryRibbon({
  title,
  value,
  subtitle,
  icon: Icon,
  tone,
}: FinancialSummaryRibbonProps) {
  const style = toneStyles[tone];

  return (
    <Card className={cn("border-l-4", style.border)}>
      <CardContent className="flex items-start justify-between gap-4 p-4">
        <div className="space-y-1">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className="text-2xl font-semibold tracking-tight text-foreground">{value}</p>
          <p className="text-xs text-muted-foreground">{subtitle}</p>
        </div>

        <div className={cn("flex size-10 items-center justify-center rounded-md", style.icon)}>
          <Icon className="size-5" />
        </div>
      </CardContent>
    </Card>
  );
}
