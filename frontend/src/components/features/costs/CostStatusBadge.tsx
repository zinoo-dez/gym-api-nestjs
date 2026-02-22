import { COST_STATUS_LABELS, CostStatus } from "@/features/costs";

interface CostStatusBadgeProps {
  status: CostStatus;
}

const STATUS_STYLES: Record<CostStatus, string> = {
  active: "bg-success/15 text-success",
  archived: "bg-secondary text-secondary-foreground",
};

export function CostStatusBadge({ status }: CostStatusBadgeProps) {
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${STATUS_STYLES[status]}`}>
      {COST_STATUS_LABELS[status]}
    </span>
  );
}
