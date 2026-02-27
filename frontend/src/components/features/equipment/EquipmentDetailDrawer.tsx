import { AlertTriangle, Ban, Edit, Wrench } from "lucide-react";

import {
  EQUIPMENT_CATEGORY_LABELS,
  MAINTENANCE_FREQUENCY_LABELS,
  EquipmentRecord,
  canRetireEquipment,
  formatCurrency,
  formatDisplayDate,
} from "@/features/equipment";
import { Button } from "@/components/ui/Button";
import { SlidePanel } from "@/components/ui/SlidePanel";
import { EquipmentAlertBadges } from "@/components/features/equipment/EquipmentAlertBadges";
import { EquipmentConditionBadge } from "@/components/features/equipment/EquipmentConditionBadge";
import { EquipmentStatusBadge } from "@/components/features/equipment/EquipmentStatusBadge";
import { MaintenanceLog } from "@/components/features/equipment/MaintenanceLog";

interface EquipmentDetailDrawerProps {
  open: boolean;
  equipment: EquipmentRecord | null;
  isMobile: boolean;
  onClose: () => void;
  onEdit: (equipment: EquipmentRecord) => void;
  onLogMaintenance: (equipment: EquipmentRecord) => void;
  onMarkOutOfOrder: (equipment: EquipmentRecord) => void;
  onRetire: (equipment: EquipmentRecord) => void;
}

export function EquipmentDetailDrawer({
  open,
  equipment,
  isMobile,
  onClose,
  onEdit,
  onLogMaintenance,
  onMarkOutOfOrder,
  onRetire,
}: EquipmentDetailDrawerProps) {
  if (!equipment) {
    return null;
  }

  const footer = (
    <div className="flex flex-wrap justify-end gap-2">
      <Button type="button" variant="outline" onClick={() => onLogMaintenance(equipment)}>
        <Wrench className="size-4" />
        Log Maintenance
      </Button>
      <Button type="button" variant="secondary" onClick={() => onEdit(equipment)}>
        <Edit className="size-4" />
        Edit Equipment
      </Button>
      <Button
        type="button"
        variant="outline"
        onClick={() => onMarkOutOfOrder(equipment)}
        disabled={equipment.condition === "out_of_order"}
      >
        <AlertTriangle className="size-4" />
        Mark Out of Order
      </Button>
      <Button
        type="button"
        variant="danger"
        onClick={() => onRetire(equipment)}
        disabled={!canRetireEquipment(equipment)}
      >
        <Ban className="size-4" />
        Retire Equipment
      </Button>
    </div>
  );

  return (
    <SlidePanel
      open={open}
      onClose={onClose}
      isMobile={isMobile}
      title={equipment.name}
      description={equipment.brandModel}
      footer={footer}
    >
      <div className="space-y-6">
        <section className="rounded-lg border bg-card p-4">
          <h3 className="text-lg font-semibold tracking-tight">Basic Info</h3>
          <div className="mt-4 flex flex-wrap gap-2">
            <EquipmentConditionBadge condition={equipment.condition} />
            <EquipmentStatusBadge isActive={equipment.isActive} />
          </div>
          <div className="mt-3">
            <EquipmentAlertBadges equipment={equipment} />
          </div>
          <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
            <div>
              <dt className="text-muted-foreground">Category</dt>
              <dd className="font-medium text-foreground">
                {EQUIPMENT_CATEGORY_LABELS[equipment.category]}
              </dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Serial Number</dt>
              <dd className="font-medium text-foreground">{equipment.serialNumber ?? "-"}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Assigned Area</dt>
              <dd className="font-medium text-foreground">{equipment.assignedArea}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Brand / Model</dt>
              <dd className="font-medium text-foreground">{equipment.brandModel}</dd>
            </div>
          </dl>
        </section>

        <section className="rounded-lg border bg-card p-4">
          <h3 className="text-lg font-semibold tracking-tight">Maintenance Schedule</h3>
          <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
            <div>
              <dt className="text-muted-foreground">Frequency</dt>
              <dd className="font-medium text-foreground">
                {MAINTENANCE_FREQUENCY_LABELS[equipment.maintenanceFrequency]}
              </dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Last Maintenance</dt>
              <dd className="font-medium text-foreground">
                {formatDisplayDate(equipment.lastMaintenanceDate)}
              </dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Next Maintenance Due</dt>
              <dd className="font-medium text-foreground">
                {formatDisplayDate(equipment.nextMaintenanceDue)}
              </dd>
            </div>
          </dl>
        </section>

        <section className="rounded-lg border bg-card p-4">
          <h3 className="text-lg font-semibold tracking-tight">Cost & Warranty</h3>
          <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
            <div>
              <dt className="text-muted-foreground">Purchase Cost</dt>
              <dd className="font-medium text-foreground">{formatCurrency(equipment.purchaseCost)}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Purchase Date</dt>
              <dd className="font-medium text-foreground">
                {formatDisplayDate(equipment.purchaseDate)}
              </dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Warranty Expiry</dt>
              <dd className="font-medium text-foreground">
                {formatDisplayDate(equipment.warrantyExpiryDate)}
              </dd>
            </div>
          </dl>
        </section>

        <section className="rounded-lg border bg-card p-4">
          <h3 className="text-lg font-semibold tracking-tight">Notes & History</h3>
          <p className="mt-2 text-sm text-foreground">{equipment.notes || "No notes provided."}</p>

          <div className="mt-4 space-y-3">
            <h4 className="text-sm font-semibold text-foreground">Maintenance Log</h4>
            <MaintenanceLog logs={equipment.maintenanceLogs} />
          </div>

          <div className="mt-4 space-y-3">
            <h4 className="text-sm font-semibold text-foreground">Audit Trail</h4>
            <div className="space-y-2">
              {equipment.auditTrail.map((entry) => (
                <div key={entry.id} className="rounded-md border p-3 text-sm">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="font-medium text-foreground">{entry.action}</span>
                    <span className="text-xs text-muted-foreground">
                      {formatDisplayDate(entry.date)}
                    </span>
                  </div>
                  <p className="mt-1 text-muted-foreground">{entry.description}</p>
                  <p className="mt-1 text-xs text-muted-foreground">Performed by {entry.performedBy}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </SlidePanel>
  );
}
