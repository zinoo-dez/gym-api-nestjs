import {
  EquipmentCondition,
  EQUIPMENT_CONDITION_LABELS,
} from "@/features/equipment";
import { cn } from "@/lib/utils";

const CONDITION_STYLES: Record<EquipmentCondition, string> = {
  new: "bg-success/20 text-success",
  good: "bg-info/20 text-info",
  needs_maintenance: "bg-warning/20 text-warning",
  out_of_order: "bg-danger/20 text-destructive",
};

interface EquipmentConditionBadgeProps {
  condition: EquipmentCondition;
  className?: string;
}

export function EquipmentConditionBadge({
  condition,
  className,
}: EquipmentConditionBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold",
        CONDITION_STYLES[condition],
        className,
      )}
    >
      {EQUIPMENT_CONDITION_LABELS[condition]}
    </span>
  );
}
