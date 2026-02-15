import { type ReactNode } from "react";
import { type LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

type KpiTone = "primary" | "success" | "warning" | "danger" | "neutral";

interface M3KpiCardProps {
  title: string;
  value: ReactNode;
  subtitle?: string;
  icon?: LucideIcon;
  tone?: KpiTone;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
  valueClassName?: string;
}

const toneStyles: Record<KpiTone, { iconSurface: string; iconColor: string }> = {
  primary: {
    iconSurface: "bg-primary/12",
    iconColor: "text-primary",
  },
  success: {
    iconSurface: "bg-emerald-500/14",
    iconColor: "text-emerald-600",
  },
  warning: {
    iconSurface: "bg-amber-500/14",
    iconColor: "text-amber-600",
  },
  danger: {
    iconSurface: "bg-destructive/14",
    iconColor: "text-destructive",
  },
  neutral: {
    iconSurface: "bg-muted",
    iconColor: "text-muted-foreground",
  },
};

export function M3KpiCard({
  title,
  value,
  subtitle,
  icon: Icon,
  tone = "primary",
  actionLabel,
  onAction,
  className,
  valueClassName,
}: M3KpiCardProps) {
  const canRenderAction = Boolean(actionLabel && onAction);
  const styles = toneStyles[tone];

  return (
    <Card className={cn("h-full", className)}>
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              {title}
            </p>
            <p className={cn("text-2xl font-semibold text-foreground", valueClassName)}>
              {value}
            </p>
            {subtitle ? <p className="text-xs text-muted-foreground">{subtitle}</p> : null}
          </div>
          {Icon ? (
            <span
              className={cn(
                "inline-flex h-10 w-10 items-center justify-center rounded-xl",
                styles.iconSurface,
              )}
            >
              <Icon className={cn("h-5 w-5", styles.iconColor)} />
            </span>
          ) : null}
        </div>
        {canRenderAction ? (
          <div className="mt-4">
            <Button size="sm" variant="outline" onClick={onAction}>
              {actionLabel}
            </Button>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
