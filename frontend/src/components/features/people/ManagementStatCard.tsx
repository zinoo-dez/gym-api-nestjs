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
  success: "text-on-success-container bg-success-container",
  warning: "text-on-warning-container bg-warning-container",
  danger: "text-on-error-container bg-error-container",
  info: "text-on-primary-container bg-primary-container",
  secondary: "text-on-secondary-container bg-secondary-container",
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
          : "border-outline-variant bg-surface-container-low hover:bg-surface-container hover:shadow-sm"
      )}
    >
      <div className="flex items-start justify-between gap-3 w-full">
        <div className="space-y-2">
          <p className="text-label-medium font-medium text-on-surface-variant group-hover:text-on-surface transition-colors">
            {title}
          </p>
          <p className="text-headline-small font-bold tracking-tight text-on-surface">{value}</p>
          {helperText ? (
            <p className="text-body-small text-on-surface-variant">{helperText}</p>
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
          <MaterialIcon icon="check" className="text-on-primary text-sm" weight={700} opticalSize={16} />
        </div>
      )}
    </button>
  );
}
