import { cn } from "@/lib/utils";
import { STATUS_BADGE_TONE_STYLES } from "@/features/people";
import { getStatusPresentation } from "@/features/people";
import type { StatusTone } from "@/features/people";

interface StatusBadgeProps {
  value?: string | null;
  label?: string;
  tone?: StatusTone;
  className?: string;
}

export function StatusBadge({ value, label, tone, className }: StatusBadgeProps) {
  const presentation = tone
    ? {
        label: label ?? value ?? "Unknown",
        tone,
      }
    : getStatusPresentation(value, label ?? "Unknown");

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold",
        STATUS_BADGE_TONE_STYLES[presentation.tone],
        className,
      )}
    >
      {presentation.label}
    </span>
  );
}
