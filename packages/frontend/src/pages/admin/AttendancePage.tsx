import React, { useEffect, useMemo, useState } from "react";
import { AdminLayout } from "@/layouts";
import { PrimaryButton, FormInput } from "@/components/gym";
import { FormSelect } from "@/components/gym/form-select";
import { FormModal } from "@/components/gym/form-modal";
import { attendanceService, type AttendanceRecord, type AttendanceType } from "@/services/attendance.service";
import { toast } from "sonner";

export default function AdminAttendancePage() {
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [typeFilter, setTypeFilter] = useState<"all" | AttendanceType>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [isCheckInOpen, setIsCheckInOpen] = useState(false);
  const [checkingIn, setCheckingIn] = useState(false);
  const [checkingOutId, setCheckingOutId] = useState<string | null>(null);
  const [checkInForm, setCheckInForm] = useState({
    memberId: "",
    type: "GYM_VISIT" as AttendanceType,
    classScheduleId: "",
  });

  useEffect(() => {
    const loadAttendance = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await attendanceService.getAll({ limit: 100 });
        setRecords(Array.isArray(response.data) ? response.data : []);
      } catch (err) {
        console.error("Error loading attendance:", err);
        setError("Failed to load attendance records.");
        setRecords([]);
      } finally {
        setLoading(false);
      }
    };

    loadAttendance();
  }, []);

  const filteredRecords = useMemo(() => {
    const query = searchQuery.toLowerCase();
    return records.filter((record) => {
      const name = record.member
        ? `${record.member.firstName} ${record.member.lastName}`.toLowerCase()
        : "";
      const email = record.member?.email?.toLowerCase() ?? "";
      const matchesSearch =
        name.includes(query) ||
        email.includes(query) ||
        record.memberId.toLowerCase().includes(query);
      const matchesType = typeFilter === "all" || record.type === typeFilter;
      return matchesSearch && matchesType;
    });
  }, [records, searchQuery, typeFilter]);

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Attendance</h1>
            <p className="text-muted-foreground">Track member check-ins and class attendance.</p>
          </div>
          <div className="flex items-center gap-2">
            <PrimaryButton onClick={() => setIsCheckInOpen(true)}>
              Manual Check-In
            </PrimaryButton>
            <PrimaryButton>Export Attendance</PrimaryButton>
          </div>
        </div>

        <div className="flex flex-col gap-4 sm:flex-row">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Search by member name, email, or ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-lg border border-border bg-card py-2 pl-4 pr-4 text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value as "all" | AttendanceType)}
            className="rounded-lg border border-border bg-card px-3 py-2 text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          >
            <option value="all">All Types</option>
            <option value="GYM_VISIT">Gym Visit</option>
            <option value="CLASS_ATTENDANCE">Class Attendance</option>
          </select>
        </div>

        <div className="overflow-hidden rounded-lg border border-border bg-card">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Member</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Type</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Check-in</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Check-out</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Class</th>
                  <th className="px-4 py-3 text-right text-sm font-medium text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">
                      Loading attendance...
                    </td>
                  </tr>
                ) : error ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-destructive">
                      {error}
                    </td>
                  </tr>
                ) : filteredRecords.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">
                      No attendance records found.
                    </td>
                  </tr>
                ) : (
                  filteredRecords.map((record) => (
                    <tr key={record.id} className="transition-colors hover:bg-muted/30">
                      <td className="px-4 py-4">
                        <div>
                          <p className="text-foreground font-medium">
                            {record.member
                              ? `${record.member.firstName} ${record.member.lastName}`
                              : record.memberId}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {record.member?.email ?? "—"}
                          </p>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-muted-foreground">
                        {record.type === "GYM_VISIT" ? "Gym Visit" : "Class Attendance"}
                      </td>
                      <td className="px-4 py-4 text-muted-foreground">
                        {new Date(record.checkInTime).toLocaleString()}
                      </td>
                      <td className="px-4 py-4 text-muted-foreground">
                        {record.checkOutTime ? new Date(record.checkOutTime).toLocaleString() : "—"}
                      </td>
                      <td className="px-4 py-4 text-muted-foreground">
                        {record.classSchedule?.className ?? "—"}
                      </td>
                      <td className="px-4 py-4 text-right">
                        {record.checkOutTime ? (
                          <span className="text-xs text-muted-foreground">Closed</span>
                        ) : (
                          <button
                            type="button"
                            onClick={async () => {
                              setCheckingOutId(record.id);
                              try {
                                const updated = await attendanceService.checkOut(record.id);
                                setRecords((prev) =>
                                  prev.map((item) => (item.id === updated.id ? updated : item)),
                                );
                                toast.success("Checked out");
                              } catch (err: any) {
                                toast.error(
                                  err?.response?.data?.message || "Failed to check out",
                                );
                              } finally {
                                setCheckingOutId(null);
                              }
                            }}
                            className="text-sm text-primary hover:underline"
                            disabled={checkingOutId === record.id}
                          >
                            {checkingOutId === record.id ? "Checking..." : "Check Out"}
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <FormModal
          isOpen={isCheckInOpen}
          onClose={() => setIsCheckInOpen(false)}
          title="Manual Check-In"
          onSubmit={async () => {
            setCheckingIn(true);
            try {
              const record = await attendanceService.checkIn({
                memberId: checkInForm.memberId.trim(),
                type: checkInForm.type,
                classScheduleId:
                  checkInForm.type === "CLASS_ATTENDANCE"
                    ? checkInForm.classScheduleId.trim()
                    : undefined,
              });
              setRecords((prev) => [record, ...prev]);
              toast.success("Check-in recorded");
              setIsCheckInOpen(false);
              setCheckInForm({ memberId: "", type: "GYM_VISIT", classScheduleId: "" });
            } catch (err: any) {
              toast.error(
                err?.response?.data?.message || "Failed to check in",
              );
            } finally {
              setCheckingIn(false);
            }
          }}
          submitText="Check In"
          isLoading={checkingIn}
        >
          <FormInput
            label="Member ID"
            name="memberId"
            value={checkInForm.memberId}
            onChange={(e) =>
              setCheckInForm((prev) => ({ ...prev, memberId: e.target.value }))
            }
            required
          />
          <FormSelect
            label="Type"
            value={checkInForm.type}
            onChange={(e) =>
              setCheckInForm((prev) => ({
                ...prev,
                type: e.target.value as AttendanceType,
              }))
            }
            options={[
              { label: "Gym Visit", value: "GYM_VISIT" },
              { label: "Class Attendance", value: "CLASS_ATTENDANCE" },
            ]}
          />
          {checkInForm.type === "CLASS_ATTENDANCE" && (
            <FormInput
              label="Class Schedule ID"
              name="classScheduleId"
              value={checkInForm.classScheduleId}
              onChange={(e) =>
                setCheckInForm((prev) => ({
                  ...prev,
                  classScheduleId: e.target.value,
                }))
              }
              required
            />
          )}
        </FormModal>
      </div>
    </AdminLayout>
  );
}
