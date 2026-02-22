import { AlertTriangle, ShieldAlert } from "lucide-react";

import { EquipmentRecord, getEquipmentAlertState } from "@/features/equipment";

interface EquipmentAlertBadgesProps {
  equipment: EquipmentRecord;
}

export function EquipmentAlertBadges({ equipment }: EquipmentAlertBadgesProps) {
  const alerts = getEquipmentAlertState(equipment);

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {alerts.isMaintenanceOverdue ? (
        <span className="inline-flex items-center gap-1 rounded-full bg-danger/20 px-2.5 py-0.5 text-xs font-semibold text-danger">
          <AlertTriangle className="size-3.5" />
          Maintenance Overdue
        </span>
      ) : null}

      {!alerts.isMaintenanceOverdue && alerts.isMaintenanceUpcoming ? (
        <span className="inline-flex items-center gap-1 rounded-full bg-warning/20 px-2.5 py-0.5 text-xs font-semibold text-warning">
          <AlertTriangle className="size-3.5" />
          Due in 30 Days
        </span>
      ) : null}

      {alerts.isWarrantyExpiring ? (
        <span className="inline-flex items-center gap-1 rounded-full bg-warning/20 px-2.5 py-0.5 text-xs font-semibold text-warning">
          <ShieldAlert className="size-3.5" />
          Warranty Expiring
        </span>
      ) : null}

      {alerts.isWarrantyExpired ? (
        <span className="inline-flex items-center gap-1 rounded-full bg-danger/20 px-2.5 py-0.5 text-xs font-semibold text-danger">
          <ShieldAlert className="size-3.5" />
          Warranty Expired
        </span>
      ) : null}
    </div>
  );
}
