import { cn } from "@/lib/utils";

interface EquipmentStatusBadgeProps {
  isActive: boolean;
  className?: string;
}

export function EquipmentStatusBadge({
  isActive,
  className,
}: EquipmentStatusBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold",
        isActive ? "bg-success/20 text-success" : "bg-secondary text-secondary-foreground",
        className,
      )}
    >
      {isActive ? "Active" : "Retired"}
    </span>
  );
}
