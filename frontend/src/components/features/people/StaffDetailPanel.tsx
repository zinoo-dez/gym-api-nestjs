import { useEffect, useMemo, useState } from "react";
import { Edit, Power, ShieldCheck } from "lucide-react";

import { Button } from "@/components/ui/Button";
import { Label } from "@/components/ui/Label";
import { Select } from "@/components/ui/Select";
import { ManagementPanel } from "@/components/features/people/ManagementPanel";
import { StatusBadge } from "@/components/features/people/StatusBadge";
import {
  StaffListRecord,
  StaffProfile,
  formatDisplayDate,
  formatDisplayDateTime,
  toEnumLabel,
} from "@/features/people";

interface StaffDetailPanelProps {
  open: boolean;
  isMobile: boolean;
  onClose: () => void;
  staff: StaffProfile | null;
  staffRow: StaffListRecord | null;
  roleOptions: string[];
  activationSupported: boolean;
  actionSubmitting: boolean;
  onEdit: () => void;
  onChangeRole: (role: string) => void;
  onToggleActive: (shouldActivate: boolean) => void;
}

export function StaffDetailPanel({
  open,
  isMobile,
  onClose,
  staff,
  staffRow,
  roleOptions,
  activationSupported,
  actionSubmitting,
  onEdit,
  onChangeRole,
  onToggleActive,
}: StaffDetailPanelProps) {
  const [roleDraft, setRoleDraft] = useState("");

  useEffect(() => {
    if (!staff) {
      setRoleDraft("");
      return;
    }

    setRoleDraft(staff.staffRole);
  }, [staff]);

  const activityLog = useMemo(() => {
    if (!staff) {
      return [];
    }

    return [
      {
        id: "created",
        title: "Staff profile created",
        date: staff.createdAt,
      },
      {
        id: "updated",
        title: "Profile last updated",
        date: staff.updatedAt,
      },
      {
        id: "status",
        title: `Current status: ${staff.isActive ? "Active" : "Inactive"}`,
        date: staff.updatedAt,
      },
    ];
  }, [staff]);

  if (!staff || !staffRow) {
    return null;
  }

  const footer = (
    <div className="flex flex-wrap justify-end gap-2">
      <Button type="button" variant="secondary" onClick={onEdit}>
        <Edit className="size-4" />
        Edit Staff
      </Button>
      <Button
        type="button"
        variant={staff.isActive ? "danger" : "outline"}
        onClick={() => onToggleActive(!staff.isActive)}
        disabled={actionSubmitting || (!staff.isActive && !activationSupported)}
      >
        <Power className="size-4" />
        {staff.isActive ? "Deactivate" : "Activate"}
      </Button>
    </div>
  );

  return (
    <ManagementPanel
      open={open}
      onClose={onClose}
      isMobile={isMobile}
      title={staffRow.fullName}
      description={staff.email}
      footer={footer}
      className="max-w-4xl"
    >
      <div className="space-y-6">
        {!staff.isActive && !activationSupported ? (
          <div className="rounded-lg border border-warning/40 bg-warning/10 p-4 text-sm text-warning">
            Reactivation is not currently available from the existing staff API contract.
          </div>
        ) : null}

        <section className="rounded-lg border bg-card p-4">
          <h3 className="text-lg font-semibold tracking-tight">Personal Info</h3>

          <div className="mt-4 flex flex-wrap gap-2">
            <StatusBadge value={staff.isActive ? "ACTIVE" : "INACTIVE"} />
            <span className="inline-flex items-center rounded-full bg-secondary px-2.5 py-0.5 text-xs font-semibold text-secondary-foreground">
              {toEnumLabel(staff.staffRole)}
            </span>
          </div>

          <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
            <div>
              <dt className="text-muted-foreground">Contact</dt>
              <dd className="font-medium text-foreground">{staff.phone || staff.email}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Employee ID</dt>
              <dd className="font-medium text-foreground">{staff.employeeId}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Position</dt>
              <dd className="font-medium text-foreground">{staff.position}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Department</dt>
              <dd className="font-medium text-foreground">{staff.department || "-"}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Hire Date</dt>
              <dd className="font-medium text-foreground">{formatDisplayDate(staff.hireDate)}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Emergency Contact</dt>
              <dd className="font-medium text-foreground">{staff.emergencyContact || "-"}</dd>
            </div>
          </dl>
        </section>

        <section className="rounded-lg border bg-card p-4">
          <div className="flex items-center justify-between gap-2">
            <h3 className="text-lg font-semibold tracking-tight">Role & Permissions</h3>
            <ShieldCheck className="size-5 text-muted-foreground" />
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-[1fr_auto]">
            <div className="space-y-2">
              <Label htmlFor="staff-role-draft">Role</Label>
              <Select
                id="staff-role-draft"
                value={roleDraft}
                onChange={(event) => setRoleDraft(event.target.value)}
              >
                <option value="">Select role</option>
                {roleOptions.map((role) => (
                  <option key={role} value={role}>
                    {toEnumLabel(role)}
                  </option>
                ))}
              </Select>
            </div>
            <div className="flex items-end">
              <Button
                type="button"
                onClick={() => onChangeRole(roleDraft)}
                disabled={!roleDraft || roleDraft === staff.staffRole || actionSubmitting}
              >
                Change Role
              </Button>
            </div>
          </div>

          <p className="mt-3 text-sm text-muted-foreground">
            Permissions are controlled by staff role and enforced through backend authorization.
          </p>
        </section>

        <section className="rounded-lg border bg-card p-4">
          <h3 className="text-lg font-semibold tracking-tight">Work Schedule</h3>
          <p className="mt-4 text-sm text-muted-foreground">
            Shift schedule data is not currently exposed by the staff API.
          </p>
        </section>

        <section className="rounded-lg border bg-card p-4">
          <h3 className="text-lg font-semibold tracking-tight">Activity Log</h3>

          <div className="mt-4 space-y-2">
            {activityLog.map((entry) => (
              <div key={entry.id} className="rounded-md border p-3 text-sm">
                <div className="flex items-center justify-between gap-2">
                  <p className="font-medium text-foreground">{entry.title}</p>
                  <p className="text-xs text-muted-foreground">{formatDisplayDateTime(entry.date)}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </ManagementPanel>
  );
}
