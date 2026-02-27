import { cn } from "@/lib/utils";
import type { StatusTone } from "@/features/people";
import { MaterialIcon } from "@/components/ui/MaterialIcon";

interface ManagementStatCardProps {
  title: string;
  value: string | number;
  helperText?: string;
  tone: StatusTone;
  active: boolean;
  onClick: () => void;
  icon: string;
}

const TONE_CLASS: Record<StatusTone, string> = {
  success: "text-success bg-success/10",
  warning: "text-warning bg-warning/10",
  danger: "text-destructive bg-destructive/10",
  info: "text-primary bg-primary/10",
  secondary: "text-secondary-foreground bg-secondary",
};

export function ManagementStatCard({
  title,
  value,
  helperText,
  tone,
  active,
  onClick,
  icon,
}: ManagementStatCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "group relative flex flex-col rounded-2xl border p-5 text-left transition-all duration-200",
        active 
          ? "border-primary bg-primary/5 shadow-md ring-1 ring-primary" 
          : "border-border bg-card hover:bg-card hover:shadow-sm"
      )}
    >
      <div className="flex items-start justify-between gap-3 w-full">
        <div className="space-y-2">
          <p className="text-xs font-medium text-muted-foreground group-hover:text-foreground transition-colors">
            {title}
          </p>
          <p className="text-xl font-bold tracking-tight text-foreground">{value}</p>
          {helperText ? (
            <p className="text-xs text-muted-foreground">{helperText}</p>
          ) : null}
        </div>
        <span className={cn(
          "flex size-12 shrink-0 items-center justify-center rounded-2xl shadow-sm transition-transform group-hover:scale-105", 
          TONE_CLASS[tone]
        )}>
          <MaterialIcon icon={icon} className="text-2xl" />
        </span>
      </div>
      
      {active && (
        <div className="absolute top-2 right-2 flex size-5 items-center justify-center rounded-full bg-primary shadow-sm">
          <MaterialIcon icon="check" className="text-primary-foreground text-sm" weight={700} opticalSize={16} />
        </div>
      )}
    </button>
  );
}
