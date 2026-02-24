import { MaterialIcon } from "@/components/ui/MaterialIcon";
import { Card, CardContent } from "@/components/ui/Card";
import { cn } from "@/lib/utils";

type RibbonTone = "success" | "warning" | "danger" | "info";

const toneStyles: Record<RibbonTone, { icon: string; border: string }> = {
  success: {
    icon: "bg-tertiary-container text-on-tertiary-container",
    border: "border-tertiary",
  },
  warning: {
    icon: "bg-error-container text-on-error-container",
    border: "border-error/50",
  },
  danger: {
    icon: "bg-error text-on-error",
    border: "border-error",
  },
  info: {
    icon: "bg-secondary-container text-on-secondary-container",
    border: "border-secondary",
  },
};

interface FinancialSummaryRibbonProps {
  title: string;
  value: string;
  subtitle: string;
  icon: string;
  tone: RibbonTone;
}

export function FinancialSummaryRibbon({
  title,
  value,
  subtitle,
  icon,
  tone,
}: FinancialSummaryRibbonProps) {
  const style = toneStyles[tone];

  return (
    <Card className={cn("border-l-4 overflow-hidden rounded-2xl bg-surface-container-low transition-all hover:bg-surface-container hover:shadow-md", style.border)}>
      <CardContent className="flex items-start justify-between gap-4 p-5">
        <div className="space-y-1.5 min-w-0">
          <p className="text-label-medium font-bold text-on-surface-variant line-clamp-1">{title}</p>
          <p className="text-headline-small font-bold tracking-tight text-on-surface">{value}</p>
          <p className="text-body-small text-on-surface-variant font-medium line-clamp-2">{subtitle}</p>
        </div>

        <div className={cn("flex size-14 shrink-0 items-center justify-center rounded-2xl shadow-sm", style.icon)}>
          <MaterialIcon icon={icon} className="text-2xl" />
        </div>
      </CardContent>
    </Card>
  );
}
