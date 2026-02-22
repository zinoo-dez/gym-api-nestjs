import { ArrowUpDown, Eye, PenSquare, Wrench } from "lucide-react";

import {
  EQUIPMENT_CATEGORY_LABELS,
  EquipmentRecord,
  EquipmentSortField,
  SortDirection,
  formatDisplayDate,
} from "@/features/equipment";
import { Button } from "@/components/ui/Button";
import { EquipmentAlertBadges } from "@/components/features/equipment/EquipmentAlertBadges";
import { EquipmentConditionBadge } from "@/components/features/equipment/EquipmentConditionBadge";
import { EquipmentStatusBadge } from "@/components/features/equipment/EquipmentStatusBadge";

interface EquipmentTableProps {
  equipment: EquipmentRecord[];
  sortField: EquipmentSortField;
  sortDirection: SortDirection;
  onSortChange: (field: EquipmentSortField) => void;
  onView: (equipment: EquipmentRecord) => void;
  onEdit: (equipment: EquipmentRecord) => void;
  onLogMaintenance: (equipment: EquipmentRecord) => void;
}

interface SortableHeaderProps {
  field: EquipmentSortField;
  label: string;
  currentField: EquipmentSortField;
  currentDirection: SortDirection;
  onSortChange: (field: EquipmentSortField) => void;
}

function SortableHeader({
  field,
  label,
  currentField,
  currentDirection,
  onSortChange,
}: SortableHeaderProps) {
  const isActive = currentField === field;

  return (
    <button
      type="button"
      className="inline-flex items-center gap-1 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
      onClick={() => onSortChange(field)}
    >
      {label}
      <ArrowUpDown
        className={`size-3.5 ${isActive ? "text-foreground" : "text-muted-foreground"}`}
      />
      {isActive ? (
        <span className="sr-only">Sorted {currentDirection === "asc" ? "ascending" : "descending"}</span>
      ) : null}
    </button>
  );
}

function ActionButtons({
  equipment,
  onView,
  onEdit,
  onLogMaintenance,
}: {
  equipment: EquipmentRecord;
  onView: (equipment: EquipmentRecord) => void;
  onEdit: (equipment: EquipmentRecord) => void;
  onLogMaintenance: (equipment: EquipmentRecord) => void;
}) {
  return (
    <div className="flex items-center justify-end gap-2">
      <Button type="button" variant="ghost" size="sm" onClick={() => onView(equipment)}>
        <Eye className="size-4" />
        View
      </Button>
      <Button type="button" variant="ghost" size="sm" onClick={() => onEdit(equipment)}>
        <PenSquare className="size-4" />
        Edit
      </Button>
      <Button type="button" variant="outline" size="sm" onClick={() => onLogMaintenance(equipment)}>
        <Wrench className="size-4" />
        Log Maintenance
      </Button>
    </div>
  );
}

export function EquipmentTable({
  equipment,
  sortField,
  sortDirection,
  onSortChange,
  onView,
  onEdit,
  onLogMaintenance,
}: EquipmentTableProps) {
  return (
    <>
      <div className="hidden overflow-x-auto rounded-lg border bg-card md:block">
        <table className="min-w-full border-collapse text-sm">
          <thead>
            <tr className="border-b bg-muted/20">
              <th className="px-4 py-3 text-left">
                <SortableHeader
                  field="name"
                  label="Equipment Name"
                  currentField={sortField}
                  currentDirection={sortDirection}
                  onSortChange={onSortChange}
                />
              </th>
              <th className="px-4 py-3 text-left">
                <SortableHeader
                  field="category"
                  label="Category"
                  currentField={sortField}
                  currentDirection={sortDirection}
                  onSortChange={onSortChange}
                />
              </th>
              <th className="px-4 py-3 text-left">Condition</th>
              <th className="px-4 py-3 text-left">
                <SortableHeader
                  field="assignedArea"
                  label="Area"
                  currentField={sortField}
                  currentDirection={sortDirection}
                  onSortChange={onSortChange}
                />
              </th>
              <th className="px-4 py-3 text-left">
                <SortableHeader
                  field="lastMaintenanceDate"
                  label="Last Maintenance"
                  currentField={sortField}
                  currentDirection={sortDirection}
                  onSortChange={onSortChange}
                />
              </th>
              <th className="px-4 py-3 text-left">
                <SortableHeader
                  field="nextMaintenanceDue"
                  label="Next Due"
                  currentField={sortField}
                  currentDirection={sortDirection}
                  onSortChange={onSortChange}
                />
              </th>
              <th className="px-4 py-3 text-left">
                <SortableHeader
                  field="isActive"
                  label="Status"
                  currentField={sortField}
                  currentDirection={sortDirection}
                  onSortChange={onSortChange}
                />
              </th>
              <th className="px-4 py-3 text-right text-sm font-medium text-muted-foreground">Actions</th>
            </tr>
          </thead>
          <tbody>
            {equipment.map((item) => (
              <tr key={item.id} className="border-b last:border-0 hover:bg-muted/50 transition-colors">
                <td className="px-4 py-3 align-top">
                  <div className="space-y-1">
                    <div className="font-medium text-foreground">{item.name}</div>
                    <div className="text-xs text-muted-foreground">{item.brandModel}</div>
                    <EquipmentAlertBadges equipment={item} />
                  </div>
                </td>
                <td className="px-4 py-3 align-top text-foreground">
                  {EQUIPMENT_CATEGORY_LABELS[item.category]}
                </td>
                <td className="px-4 py-3 align-top">
                  <EquipmentConditionBadge condition={item.condition} />
                </td>
                <td className="px-4 py-3 align-top text-foreground">{item.assignedArea}</td>
                <td className="px-4 py-3 align-top text-foreground">
                  {formatDisplayDate(item.lastMaintenanceDate)}
                </td>
                <td className="px-4 py-3 align-top text-foreground">
                  {formatDisplayDate(item.nextMaintenanceDue)}
                </td>
                <td className="px-4 py-3 align-top">
                  <EquipmentStatusBadge isActive={item.isActive} />
                </td>
                <td className="px-4 py-3 align-top">
                  <ActionButtons
                    equipment={item}
                    onView={onView}
                    onEdit={onEdit}
                    onLogMaintenance={onLogMaintenance}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="space-y-3 md:hidden">
        {equipment.map((item) => (
          <article key={item.id} className="rounded-lg border bg-card p-4 shadow-sm">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="text-base font-semibold tracking-tight text-foreground">{item.name}</h3>
                <p className="text-sm text-muted-foreground">{EQUIPMENT_CATEGORY_LABELS[item.category]}</p>
              </div>
              <EquipmentStatusBadge isActive={item.isActive} />
            </div>

            <div className="mt-3 flex flex-wrap gap-2">
              <EquipmentConditionBadge condition={item.condition} />
              <EquipmentAlertBadges equipment={item} />
            </div>

            <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
              <div>
                <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Area</dt>
                <dd className="text-foreground">{item.assignedArea}</dd>
              </div>
              <div>
                <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Last Maint.</dt>
                <dd className="text-foreground">{formatDisplayDate(item.lastMaintenanceDate)}</dd>
              </div>
              <div>
                <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Next Due</dt>
                <dd className="text-foreground">{formatDisplayDate(item.nextMaintenanceDue)}</dd>
              </div>
              <div>
                <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Model</dt>
                <dd className="text-foreground">{item.brandModel}</dd>
              </div>
            </dl>

            <div className="mt-4 flex flex-wrap gap-2">
              <Button type="button" variant="ghost" size="sm" onClick={() => onView(item)}>
                <Eye className="size-4" />
                View
              </Button>
              <Button type="button" variant="ghost" size="sm" onClick={() => onEdit(item)}>
                <PenSquare className="size-4" />
                Edit
              </Button>
              <Button type="button" variant="outline" size="sm" onClick={() => onLogMaintenance(item)}>
                <Wrench className="size-4" />
                Log Maintenance
              </Button>
            </div>
          </article>
        ))}
      </div>
    </>
  );
}
