import { ComponentType } from "react";

import { cn } from "@/lib/utils";
import type { StatusTone } from "@/features/people";

interface ManagementStatCardProps {
  title: string;
  value: string | number;
  helperText?: string;
  tone: StatusTone;
  active: boolean;
  onClick: () => void;
  icon: ComponentType<{ className?: string }>;
}

const TONE_CLASS: Record<StatusTone, string> = {
  success: "text-success bg-success/20",
  warning: "text-warning bg-warning/20",
  danger: "text-danger bg-danger/20",
  info: "text-info bg-info/20",
  secondary: "text-secondary-foreground bg-secondary",
};

export function ManagementStatCard({
  title,
  value,
  helperText,
  tone,
  active,
  onClick,
  icon: Icon,
}: ManagementStatCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-lg border bg-card p-4 text-left shadow-sm transition-colors hover:bg-muted/30",
        active ? "border-primary" : "border-border",
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className="text-2xl font-semibold tracking-tight text-foreground">{value}</p>
          {helperText ? <p className="text-xs text-muted-foreground">{helperText}</p> : null}
        </div>
        <span className={cn("rounded-full p-2", TONE_CLASS[tone])}>
          <Icon className="size-5" />
        </span>
      </div>
    </button>
  );
}
